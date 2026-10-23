import 'dart:typed_data';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import '../message/message_model.dart';

class MessageBubble extends StatelessWidget {
  const MessageBubble({
    super.key,
    required this.message,
    required this.isMine,
    this.onRetry,
    this.onLongPress,
    this.onImageTap,
  });

  final MessageModel message;
  final bool isMine;
  final VoidCallback? onRetry;
  final VoidCallback? onLongPress;
  final VoidCallback? onImageTap;

  @override
  Widget build(BuildContext context) {
    final align = isMine ? Alignment.centerRight : Alignment.centerLeft;
    final theme = Theme.of(context);

    if (message.isUnsent) {
      return Align(
        alignment: align,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          child: Text(
            'Message unsent',
            style: theme.textTheme.bodySmall?.copyWith(
              fontStyle: FontStyle.italic,
              color: Colors.grey,
            ),
          ),
        ),
      );
    }

    final bubbleColor = isMine ? theme.colorScheme.primary : const Color(0xFFF2F3F5);
    final textColor = isMine ? Colors.white : const Color(0xFF111827);

    final body = message.isImage
        ? _ImageContent(
            message: message,
            onTap: onImageTap,
          )
        : Container(
            constraints: const BoxConstraints(maxWidth: 280),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: bubbleColor,
              borderRadius: BorderRadius.circular(18),
            ),
            child: Text(
              message.body ?? '',
              style: TextStyle(color: textColor, fontSize: 15),
            ),
          );

    final children = <Widget>[
      GestureDetector(onLongPress: onLongPress, child: body),
    ];

    if (message.status == MessageStatus.failed && onRetry != null) {
      children.add(
        Padding(
          padding: const EdgeInsets.only(top: 2, right: 4, left: 4),
          child: GestureDetector(
            onTap: onRetry,
            child: const Text(
              'Failed — tap to retry',
              style: TextStyle(color: Colors.red, fontSize: 11),
            ),
          ),
        ),
      );
    } else if (message.status == MessageStatus.pending) {
      children.add(
        const Padding(
          padding: EdgeInsets.only(top: 2),
          child: Text(
            'Sending…',
            style: TextStyle(color: Colors.grey, fontSize: 11),
          ),
        ),
      );
    }

    return Align(
      alignment: align,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        child: Column(
          crossAxisAlignment:
              isMine ? CrossAxisAlignment.end : CrossAxisAlignment.start,
          children: children,
        ),
      ),
    );
  }
}

class _ImageContent extends StatelessWidget {
  const _ImageContent({required this.message, this.onTap});
  final MessageModel message;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    Widget img;
    if (message.localImageBytes != null) {
      img = Image.memory(
        Uint8List.fromList(message.localImageBytes!),
        fit: BoxFit.cover,
      );
    } else if (message.imageUrl != null) {
      img = CachedNetworkImage(
        imageUrl: message.imageUrl!,
        fit: BoxFit.cover,
        placeholder: (_, __) => Container(
          color: const Color(0xFFE5E7EB),
          height: 220, width: 220,
        ),
      );
    } else {
      img = const SizedBox(height: 220, width: 220);
    }

    return GestureDetector(
      onTap: onTap,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 240, maxHeight: 280),
          child: img,
        ),
      ),
    );
  }
}
