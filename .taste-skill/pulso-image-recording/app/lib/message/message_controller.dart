import 'dart:async';
import 'dart:typed_data';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../providers/message_providers.dart';
import 'message_model.dart';
import 'message_repository.dart';
import 'thread_model.dart';

class MessageState {
  const MessageState({
    required this.threads,
    required this.messagesByThread,
    this.myUserId,
    this.isLoading = false,
  });

  const MessageState.initial()
      : threads = const [],
        messagesByThread = const {},
        myUserId = null,
        isLoading = false;

  final List<ThreadModel> threads;
  final Map<String, List<MessageModel>> messagesByThread;
  final String? myUserId;
  final bool isLoading;

  MessageState copyWith({
    List<ThreadModel>? threads,
    Map<String, List<MessageModel>>? messagesByThread,
    String? myUserId,
    bool? isLoading,
  }) {
    return MessageState(
      threads: threads ?? this.threads,
      messagesByThread: messagesByThread ?? this.messagesByThread,
      myUserId: myUserId ?? this.myUserId,
      isLoading: isLoading ?? this.isLoading,
    );
  }
}

class MessageController extends Notifier<MessageState> {
  RealtimeChannel? _messagesChannel;
  RealtimeChannel? _threadsChannel;
  final Map<String, DateTime> _lastMarkRead = {};
  final Map<String, Timer> _markReadTimers = {};

  MessageRepository get _repo => ref.read(messageRepositoryProvider);

  @override
  MessageState build() {
    ref.onDispose(() {
      _markReadTimers.values.forEach((t) => t.cancel());
      _markReadTimers.clear();
      _disposeChannel(_messagesChannel);
      _disposeChannel(_threadsChannel);
      _messagesChannel = null;
      _threadsChannel = null;
    });
    return const MessageState.initial();
  }

  Future<void> load(String myUserId) async {
    state = state.copyWith(isLoading: true, myUserId: myUserId);
    try {
      final threads = await _repo.fetchThreads(myUserId);
      state = state.copyWith(threads: threads, isLoading: false);
      _subscribe(myUserId);
    } catch (_) {
      state = state.copyWith(isLoading: false);
    }
  }

  Future<void> loadMessages(String threadId, {DateTime? before}) async {
    final newest = await _repo.fetchMessages(threadId, before: before);
    final existing = state.messagesByThread[threadId] ?? const [];
    final merged = _mergeById([...existing, ...newest]);
    merged.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    state = state.copyWith(
      messagesByThread: {
        ...state.messagesByThread,
        threadId: merged,
      },
    );
  }

  Future<void> sendText({
    required String threadId,
    required String body,
  }) async {
    final me = state.myUserId;
    if (me == null || body.isEmpty) return;
    final clientId = 'cli-${DateTime.now().microsecondsSinceEpoch}';
    final pending = MessageModel(
      id: clientId,
      threadId: threadId,
      senderId: me,
      body: body,
      createdAt: DateTime.now(),
      status: MessageStatus.pending,
    );
    _insertLocal(threadId, pending);

    try {
      final saved = await _repo.sendTextMessage(
        threadId: threadId, senderId: me,
        clientMessageId: clientId, body: body,
      );
      _replaceLocal(threadId, clientId, saved.copyWith(status: MessageStatus.sent));
    } catch (_) {
      _replaceLocal(threadId, clientId, pending.copyWith(status: MessageStatus.failed));
    }
  }

  Future<void> sendImage({
    required String threadId,
    required Uint8List bytes,
    required String mimeType,
  }) async {
    final me = state.myUserId;
    if (me == null) return;
    final clientId = 'cli-${DateTime.now().microsecondsSinceEpoch}';
    final pending = MessageModel(
      id: clientId,
      threadId: threadId,
      senderId: me,
      localImageBytes: bytes,
      createdAt: DateTime.now(),
      status: MessageStatus.pending,
    );
    _insertLocal(threadId, pending);

    try {
      final saved = await _repo.sendImageMessage(
        threadId: threadId, senderId: me,
        clientMessageId: clientId, bytes: bytes, mimeType: mimeType,
      );
      _replaceLocal(threadId, clientId, saved.copyWith(status: MessageStatus.sent));
    } catch (_) {
      _replaceLocal(threadId, clientId, pending.copyWith(status: MessageStatus.failed));
    }
  }

  Future<void> unsend(String messageId) async {
    // Find the thread + message for optimistic patch.
    String? threadId;
    MessageModel? snapshot;
    for (final entry in state.messagesByThread.entries) {
      final i = entry.value.indexWhere((m) => m.id == messageId);
      if (i != -1) {
        threadId = entry.key;
        snapshot = entry.value[i];
        break;
      }
    }
    if (threadId == null || snapshot == null) return;

    _replaceLocal(threadId, messageId, snapshot.copyWith(deletedAt: DateTime.now()));

    try {
      final saved = await _repo.unsendMessage(messageId);
      _replaceLocal(threadId, messageId, saved);
    } catch (_) {
      // Revert.
      _replaceLocal(threadId, messageId, snapshot);
    }
  }

  /// Debounced — at most one network call per thread per 2 seconds.
  void markRead(String threadId) {
    final me = state.myUserId;
    if (me == null) return;
    final last = _lastMarkRead[threadId];
    final now = DateTime.now();
    if (last != null && now.difference(last) < const Duration(seconds: 2)) {
      // Schedule a trailing call once the window elapses.
      _markReadTimers[threadId]?.cancel();
      _markReadTimers[threadId] = Timer(
        const Duration(seconds: 2) - now.difference(last),
        () => _doMarkRead(threadId, me),
      );
      return;
    }
    _doMarkRead(threadId, me);
  }

  void _doMarkRead(String threadId, String me) {
    _lastMarkRead[threadId] = DateTime.now();
    _repo.markRead(threadId: threadId, myUserId: me).catchError((_) {});
  }

  Future<ThreadModel> acceptRequest(String threadId) async {
    final updated = await _repo.acceptRequest(threadId);
    _replaceThread(updated);
    return updated;
  }

  Future<void> declineRequest(String threadId) async {
    await _repo.declineRequest(threadId);
    state = state.copyWith(
      threads: state.threads.where((t) => t.id != threadId).toList(),
      messagesByThread: {...state.messagesByThread}..remove(threadId),
    );
  }

  /// Find or create a thread with [otherUserId], deciding [autoAccept]
  /// based on whether either side already follows the other.
  Future<ThreadModel> openThreadWith({
    required String otherUserId,
    required bool autoAccept,
  }) async {
    final me = state.myUserId;
    if (me == null) throw StateError('Not signed in');
    final t = await _repo.findOrCreateThread(
      myUserId: me, otherUserId: otherUserId, autoAccept: autoAccept,
    );
    if (!state.threads.any((x) => x.id == t.id)) {
      state = state.copyWith(threads: [t, ...state.threads]);
    }
    return t;
  }

  // ───── realtime handlers (public for testability) ─────

  void onRealtimeMessageInsert(MessageModel m) {
    final list = state.messagesByThread[m.threadId];
    if (list != null && list.any((x) => x.id == m.id)) return; // dedupe
    _insertLocal(m.threadId, m);
    _bumpThreadPreview(m.threadId, m);
  }

  void onRealtimeMessageUpdate(MessageModel m) {
    final list = state.messagesByThread[m.threadId];
    if (list == null) return;
    _replaceLocal(m.threadId, m.id, m);
  }

  void onRealtimeThreadChange(ThreadModel t) {
    if (state.threads.any((x) => x.id == t.id)) {
      _replaceThread(t);
    } else {
      state = state.copyWith(threads: [t, ...state.threads]);
    }
  }

  // ───── private helpers ─────

  void _insertLocal(String threadId, MessageModel m) {
    final existing = state.messagesByThread[threadId] ?? const [];
    final next = [m, ...existing.where((x) => x.id != m.id)];
    state = state.copyWith(
      messagesByThread: {...state.messagesByThread, threadId: next},
    );
  }

  void _replaceLocal(String threadId, String messageId, MessageModel updated) {
    final existing = state.messagesByThread[threadId] ?? const [];
    final next = existing
        .map((x) => x.id == messageId ? updated : x)
        .toList();
    state = state.copyWith(
      messagesByThread: {...state.messagesByThread, threadId: next},
    );
  }

  void _replaceThread(ThreadModel t) {
    state = state.copyWith(
      threads: state.threads.map((x) => x.id == t.id ? t : x).toList(),
    );
  }

  void _bumpThreadPreview(String threadId, MessageModel m) {
    final i = state.threads.indexWhere((t) => t.id == threadId);
    if (i == -1) return;
    final updated = state.threads[i].copyWith(
      lastMessageAt: m.createdAt,
      lastMessage: m,
    );
    final reordered = [updated, ...state.threads.where((t) => t.id != threadId)];
    state = state.copyWith(threads: reordered);
  }

  List<MessageModel> _mergeById(List<MessageModel> list) {
    final seen = <String>{};
    final out = <MessageModel>[];
    for (final m in list) {
      if (seen.add(m.id)) out.add(m);
    }
    return out;
  }

  void _subscribe(String myUserId) {
    _messagesChannel ??= _repo.subscribeToMessages(
      onInsert: onRealtimeMessageInsert,
      onUpdate: onRealtimeMessageUpdate,
    );
    _threadsChannel ??= _repo.subscribeToThreads(
      myUserId: myUserId,
      onChange: onRealtimeThreadChange,
    );
  }

  void _disposeChannel(RealtimeChannel? ch) {
    if (ch == null) return;
    try {
      Supabase.instance.client.removeChannel(ch);
    } catch (_) {}
  }
}
