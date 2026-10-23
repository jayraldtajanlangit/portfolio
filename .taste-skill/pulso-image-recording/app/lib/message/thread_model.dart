import 'message_model.dart';

class ThreadModel {
  const ThreadModel({
    required this.id,
    required this.userAId,
    required this.userBId,
    required this.initiatorId,
    this.acceptedAt,
    required this.lastMessageAt,
    required this.userALastReadAt,
    required this.userBLastReadAt,
    required this.createdAt,
    this.otherUsername,
    this.otherDisplayName,
    this.otherAvatarUrl,
    this.lastMessage,
  });

  final String id;
  final String userAId;
  final String userBId;
  final String initiatorId;
  final DateTime? acceptedAt;
  final DateTime lastMessageAt;
  final DateTime userALastReadAt;
  final DateTime userBLastReadAt;
  final DateTime createdAt;

  /// Populated when joined via Supabase select; null in tests/in-memory.
  final String? otherUsername;
  final String? otherDisplayName;
  final String? otherAvatarUrl;

  /// The most recent message in this thread, if fetched alongside.
  final MessageModel? lastMessage;

  bool get isAccepted => acceptedAt != null;

  /// True if this thread should land in [myUserId]'s "Requests" tab.
  /// A request is a non-accepted thread where the initiator is the *other* user.
  bool isRequestForMe(String myUserId) =>
      !isAccepted && initiatorId != myUserId;

  String otherUserIdFor(String myUserId) =>
      myUserId == userAId ? userBId : userAId;

  DateTime lastReadAtFor(String myUserId) =>
      myUserId == userAId ? userALastReadAt : userBLastReadAt;

  bool hasUnreadFor(String myUserId) =>
      lastMessageAt.isAfter(lastReadAtFor(myUserId));

  /// Canonical (user_a, user_b) tuple — smaller ID lexicographically first.
  /// MUST be the only way to construct a thread tuple.
  static (String, String) canonicalPair(String x, String y) {
    if (x == y) {
      throw ArgumentError('Cannot create a thread between a user and themself');
    }
    return x.compareTo(y) < 0 ? (x, y) : (y, x);
  }

  factory ThreadModel.fromMap(
    Map<String, dynamic> map, {
    String? myUserId,
  }) {
    final lastMessageRow = map['last_message'] as Map<String, dynamic>?;

    // Determine which joined profile is the "other" user, given me.
    final userAId = map['user_a_id'] as String;
    final userBId = map['user_b_id'] as String;
    Map<String, dynamic>? other;
    if (myUserId != null) {
      other = (myUserId == userAId)
          ? map['user_b'] as Map<String, dynamic>?
          : map['user_a'] as Map<String, dynamic>?;
    }

    return ThreadModel(
      id: map['id'] as String,
      userAId: userAId,
      userBId: userBId,
      initiatorId: map['initiator_id'] as String,
      acceptedAt: _parseNullable(map['accepted_at']),
      lastMessageAt: _parse(map['last_message_at']),
      userALastReadAt: _parse(map['user_a_last_read_at']),
      userBLastReadAt: _parse(map['user_b_last_read_at']),
      createdAt: _parse(map['created_at']),
      otherUsername: other?['username'] as String?,
      otherDisplayName: other?['display_name'] as String?,
      otherAvatarUrl: other?['avatar_url'] as String?,
      lastMessage: lastMessageRow == null
          ? null
          : MessageModel.fromMap(lastMessageRow),
    );
  }

  ThreadModel copyWith({
    DateTime? acceptedAt,
    DateTime? lastMessageAt,
    DateTime? userALastReadAt,
    DateTime? userBLastReadAt,
    MessageModel? lastMessage,
  }) {
    return ThreadModel(
      id: id,
      userAId: userAId,
      userBId: userBId,
      initiatorId: initiatorId,
      acceptedAt: acceptedAt ?? this.acceptedAt,
      lastMessageAt: lastMessageAt ?? this.lastMessageAt,
      userALastReadAt: userALastReadAt ?? this.userALastReadAt,
      userBLastReadAt: userBLastReadAt ?? this.userBLastReadAt,
      createdAt: createdAt,
      otherUsername: otherUsername,
      otherDisplayName: otherDisplayName,
      otherAvatarUrl: otherAvatarUrl,
      lastMessage: lastMessage ?? this.lastMessage,
    );
  }

  static DateTime _parse(Object? raw) {
    if (raw is String && raw.isNotEmpty) {
      final p = DateTime.tryParse(raw);
      if (p != null) return p;
    }
    return DateTime.now();
  }

  static DateTime? _parseNullable(Object? raw) {
    if (raw is String && raw.isNotEmpty) return DateTime.tryParse(raw);
    return null;
  }
}
