import 'dart:typed_data';

import 'package:supabase_flutter/supabase_flutter.dart';

import 'message_model.dart';
import 'thread_model.dart';

abstract class MessageRepository {
  /// Fetch all threads visible to [myUserId], newest activity first.
  Future<List<ThreadModel>> fetchThreads(String myUserId);

  /// Look up the existing thread between two users, or insert and return one.
  /// [autoAccept] is true if either side already follows the other.
  Future<ThreadModel> findOrCreateThread({
    required String myUserId,
    required String otherUserId,
    required bool autoAccept,
  });

  /// Fetch a page of messages in [threadId]. Newest first.
  Future<List<MessageModel>> fetchMessages(
    String threadId, {
    int limit = 50,
    DateTime? before,
  });

  Future<MessageModel> sendTextMessage({
    required String threadId,
    required String senderId,
    required String clientMessageId,
    required String body,
  });

  /// Uploads the image bytes to the `messages` storage bucket under the
  /// sender's folder, then inserts the message row.
  Future<MessageModel> sendImageMessage({
    required String threadId,
    required String senderId,
    required String clientMessageId,
    required Uint8List bytes,
    required String mimeType,
  });

  /// Soft-deletes the message by setting `deleted_at`. Only the sender may call.
  Future<MessageModel> unsendMessage(String messageId);

  /// Update the caller's side of `last_read_at` to NOW().
  Future<void> markRead({
    required String threadId,
    required String myUserId,
  });

  /// Flip `accepted_at` to NOW() on a request. Caller MUST be the non-initiator.
  Future<ThreadModel> acceptRequest(String threadId);

  /// Hard-delete a request thread (cascades to messages). Caller MUST be the
  /// non-initiator.
  Future<void> declineRequest(String threadId);

  /// Find candidate users by username substring.
  Future<List<UserSearchResult>> searchUsers(String query, {int limit = 10});

  /// Subscribe to all `messages` inserts/updates; the handler decides what to
  /// keep based on its own thread set.
  RealtimeChannel subscribeToMessages({
    required void Function(MessageModel) onInsert,
    required void Function(MessageModel) onUpdate,
  });

  /// Subscribe to all `threads` inserts/updates for the current user.
  RealtimeChannel subscribeToThreads({
    required String myUserId,
    required void Function(ThreadModel) onChange,
  });
}

class UserSearchResult {
  const UserSearchResult({
    required this.id,
    required this.username,
    this.displayName,
    this.avatarUrl,
  });
  final String id;
  final String username;
  final String? displayName;
  final String? avatarUrl;
}

class SupabaseMessageRepository implements MessageRepository {
  SupabaseMessageRepository(this._client);

  final SupabaseClient _client;

  static const _threadSelectFor =
      '*, user_a:profiles!user_a_id(username, display_name, avatar_url), '
      'user_b:profiles!user_b_id(username, display_name, avatar_url)';

  @override
  Future<List<ThreadModel>> fetchThreads(String myUserId) async {
    final rows = await _client
        .from('threads')
        .select(_threadSelectFor)
        .or('user_a_id.eq.$myUserId,user_b_id.eq.$myUserId')
        .order('last_message_at', ascending: false)
        .limit(30);
    return (rows as List)
        .map((r) =>
            ThreadModel.fromMap(r as Map<String, dynamic>, myUserId: myUserId))
        .toList();
  }

  @override
  Future<ThreadModel> findOrCreateThread({
    required String myUserId,
    required String otherUserId,
    required bool autoAccept,
  }) async {
    final (a, b) = ThreadModel.canonicalPair(myUserId, otherUserId);

    final existing = await _client
        .from('threads')
        .select(_threadSelectFor)
        .eq('user_a_id', a)
        .eq('user_b_id', b)
        .maybeSingle();
    if (existing != null) {
      return ThreadModel.fromMap(
        existing,
        myUserId: myUserId,
      );
    }

    final inserted = await _client
        .from('threads')
        .insert({
          'user_a_id': a,
          'user_b_id': b,
          'initiator_id': myUserId,
          if (autoAccept) 'accepted_at': DateTime.now().toIso8601String(),
        })
        .select(_threadSelectFor)
        .single();
    return ThreadModel.fromMap(inserted, myUserId: myUserId);
  }

  @override
  Future<List<MessageModel>> fetchMessages(
    String threadId, {
    int limit = 50,
    DateTime? before,
  }) async {
    var query = _client
        .from('messages')
        .select()
        .eq('thread_id', threadId);
    if (before != null) {
      query = query.lt('created_at', before.toIso8601String());
    }
    final rows = await query
        .order('created_at', ascending: false)
        .limit(limit);
    return (rows as List)
        .map((r) => MessageModel.fromMap(r as Map<String, dynamic>))
        .toList();
  }

  @override
  Future<MessageModel> sendTextMessage({
    required String threadId,
    required String senderId,
    required String clientMessageId,
    required String body,
  }) async {
    if (body.isEmpty) throw ArgumentError('Message body cannot be empty');
    final inserted = await _client
        .from('messages')
        .insert({
          'id': clientMessageId,
          'thread_id': threadId,
          'sender_id': senderId,
          'body': body,
        })
        .select()
        .single();
    await _bumpThread(threadId);
    return MessageModel.fromMap(inserted);
  }

  @override
  Future<MessageModel> sendImageMessage({
    required String threadId,
    required String senderId,
    required String clientMessageId,
    required Uint8List bytes,
    required String mimeType,
  }) async {
    final ext = mimeType == 'image/png' ? 'png' : 'jpg';
    final path = '$senderId/$clientMessageId.$ext';
    await _client.storage.from('messages').uploadBinary(
      path,
      bytes,
      fileOptions: FileOptions(contentType: mimeType, upsert: false),
    );
    final url = _client.storage.from('messages').getPublicUrl(path);

    final inserted = await _client
        .from('messages')
        .insert({
          'id': clientMessageId,
          'thread_id': threadId,
          'sender_id': senderId,
          'image_url': url,
        })
        .select()
        .single();
    await _bumpThread(threadId);
    return MessageModel.fromMap(inserted);
  }

  @override
  Future<MessageModel> unsendMessage(String messageId) async {
    final updated = await _client
        .from('messages')
        .update({'deleted_at': DateTime.now().toIso8601String()})
        .eq('id', messageId)
        .select()
        .single();
    return MessageModel.fromMap(updated);
  }

  @override
  Future<void> markRead({
    required String threadId,
    required String myUserId,
  }) async {
    final thread = await _client
        .from('threads')
        .select('user_a_id, user_b_id')
        .eq('id', threadId)
        .single();
    final column = (thread['user_a_id'] == myUserId)
        ? 'user_a_last_read_at'
        : 'user_b_last_read_at';
    await _client.from('threads').update({
      column: DateTime.now().toIso8601String(),
    }).eq('id', threadId);
  }

  @override
  Future<ThreadModel> acceptRequest(String threadId) async {
    final updated = await _client
        .from('threads')
        .update({'accepted_at': DateTime.now().toIso8601String()})
        .eq('id', threadId)
        .select(_threadSelectFor)
        .single();
    return ThreadModel.fromMap(updated);
  }

  @override
  Future<void> declineRequest(String threadId) async {
    await _client.from('threads').delete().eq('id', threadId);
  }

  @override
  Future<List<UserSearchResult>> searchUsers(String query, {int limit = 10}) async {
    if (query.trim().isEmpty) return const [];
    final me = _client.auth.currentUser?.id;
    var q = _client
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .ilike('username', '%$query%');
    if (me != null) q = q.neq('id', me);
    final rows = await q.limit(limit);
    return (rows as List)
        .map((r) {
          final m = r as Map<String, dynamic>;
          return UserSearchResult(
            id: m['id'] as String,
            username: m['username'] as String,
            displayName: m['display_name'] as String?,
            avatarUrl: m['avatar_url'] as String?,
          );
        })
        .toList();
  }

  @override
  RealtimeChannel subscribeToMessages({
    required void Function(MessageModel) onInsert,
    required void Function(MessageModel) onUpdate,
  }) {
    return _client
        .channel('messages_all')
        .onPostgresChanges(
          event: PostgresChangeEvent.insert,
          schema: 'public',
          table: 'messages',
          callback: (payload) {
            onInsert(MessageModel.fromMap(payload.newRecord));
          },
        )
        .onPostgresChanges(
          event: PostgresChangeEvent.update,
          schema: 'public',
          table: 'messages',
          callback: (payload) {
            onUpdate(MessageModel.fromMap(payload.newRecord));
          },
        )
        .subscribe();
  }

  @override
  RealtimeChannel subscribeToThreads({
    required String myUserId,
    required void Function(ThreadModel) onChange,
  }) {
    void handle(PostgresChangePayload payload) {
      final row = payload.newRecord;
      if (row['user_a_id'] != myUserId && row['user_b_id'] != myUserId) return;
      onChange(ThreadModel.fromMap(row, myUserId: myUserId));
    }

    return _client
        .channel('threads_all')
        .onPostgresChanges(
          event: PostgresChangeEvent.insert,
          schema: 'public',
          table: 'threads',
          callback: handle,
        )
        .onPostgresChanges(
          event: PostgresChangeEvent.update,
          schema: 'public',
          table: 'threads',
          callback: handle,
        )
        .subscribe();
  }

  Future<void> _bumpThread(String threadId) async {
    await _client.from('threads').update({
      'last_message_at': DateTime.now().toIso8601String(),
    }).eq('id', threadId);
  }
}
