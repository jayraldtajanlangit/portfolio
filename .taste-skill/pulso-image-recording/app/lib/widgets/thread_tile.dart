import 'package:flutter/material.dart';

import '../message/message_model.dart';
import '../message/thread_model.dart';
import 'profile_avatar.dart';

class ThreadTile extends StatelessWidget {
  const ThreadTile({
    super.key,
    required this.thread,
    required this.myUserId,
    required this.onTap,
  });

  final ThreadModel thread;
  final String myUserId;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final unread = thread.hasUnreadFor(myUserId);
    final preview = _previewFor(thread.lastMessage, myUserId);

    return ListTile(
      onTap: onTap,
      leading: ProfileAvatar(
        avatarUrl: thread.otherAvatarUrl,
        radius: 24,
      ),
      title: Text(
        thread.otherUsername ?? thread.otherUserIdFor(myUserId),
        style: TextStyle(
          fontWeight: unread ? FontWeight.w700 : FontWeight.w500,
        ),
      ),
      subtitle: Text(
        preview,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: TextStyle(
          fontWeight: unread ? FontWeight.w600 : FontWeight.w400,
          color: unread ? Colors.black : Colors.grey,
        ),
      ),
      trailing: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Text(
            _relativeTime(thread.lastMessageAt),
            style: const TextStyle(fontSize: 11, color: Colors.grey),
          ),
          const SizedBox(height: 6),
          if (unread)
            Container(
              key: const ValueKey('thread-tile-unread-dot'),
              width: 10, height: 10,
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primary,
                shape: BoxShape.circle,
              ),
            ),
        ],
      ),
    );
  }

  static String _previewFor(MessageModel? m, String myUserId) {
    if (m == null) return '';
    if (m.isUnsent) return 'Message unsent';
    final prefix = m.senderId == myUserId ? 'You: ' : '';
    if (m.isImage) return '${prefix}Sent a photo';
    return '$prefix${m.body ?? ''}';
  }

  static String _relativeTime(DateTime t) {
    final diff = DateTime.now().difference(t);
    if (diff.inMinutes < 1) return 'now';
    if (diff.inHours < 1) return '${diff.inMinutes}m';
    if (diff.inDays < 1) return '${diff.inHours}h';
    if (diff.inDays < 7) return '${diff.inDays}d';
    return '${(diff.inDays / 7).floor()}w';
  }
}
