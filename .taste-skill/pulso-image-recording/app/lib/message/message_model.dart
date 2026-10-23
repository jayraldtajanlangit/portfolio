class MessageModel {
  const MessageModel({
    required this.id,
    required this.threadId,
    required this.senderId,
    this.body,
    this.imageUrl,
    this.deletedAt,
    required this.createdAt,
    this.status = MessageStatus.sent,
    this.localImageBytes,
  });

  final String id;
  final String threadId;
  final String senderId;
  final String? body;
  final String? imageUrl;
  final DateTime? deletedAt;
  final DateTime createdAt;

  /// Client-side state for optimistic-send rendering. Not persisted.
  final MessageStatus status;

  /// Bytes for an in-flight image upload, used to render via Image.memory
  /// before the public URL is known. Not persisted.
  final List<int>? localImageBytes;

  bool get isText => body != null;
  bool get isImage => imageUrl != null || localImageBytes != null;
  bool get isUnsent => deletedAt != null;

  factory MessageModel.fromMap(Map<String, dynamic> map) {
    return MessageModel(
      id: map['id'] as String,
      threadId: map['thread_id'] as String,
      senderId: map['sender_id'] as String,
      body: map['body'] as String?,
      imageUrl: map['image_url'] as String?,
      deletedAt: _parseNullableDate(map['deleted_at']),
      createdAt: _parseDate(map['created_at']),
    );
  }

  MessageModel copyWith({
    String? id,
    String? body,
    String? imageUrl,
    DateTime? deletedAt,
    DateTime? createdAt,
    MessageStatus? status,
    List<int>? localImageBytes,
  }) {
    return MessageModel(
      id: id ?? this.id,
      threadId: threadId,
      senderId: senderId,
      body: body ?? this.body,
      imageUrl: imageUrl ?? this.imageUrl,
      deletedAt: deletedAt ?? this.deletedAt,
      createdAt: createdAt ?? this.createdAt,
      status: status ?? this.status,
      localImageBytes: localImageBytes ?? this.localImageBytes,
    );
  }

  static DateTime _parseDate(Object? raw) {
    if (raw is String && raw.isNotEmpty) {
      final parsed = DateTime.tryParse(raw);
      if (parsed != null) return parsed;
    }
    return DateTime.now();
  }

  static DateTime? _parseNullableDate(Object? raw) {
    if (raw is String && raw.isNotEmpty) {
      return DateTime.tryParse(raw);
    }
    return null;
  }
}

enum MessageStatus { sent, pending, failed }
