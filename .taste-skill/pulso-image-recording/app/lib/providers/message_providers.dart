import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../message/message_controller.dart';
import '../message/message_model.dart';
import '../message/message_repository.dart';
import '../message/thread_model.dart';
import 'supabase_providers.dart';

final messageRepositoryProvider = Provider<MessageRepository>((ref) {
  final client = ref.watch(supabaseClientProvider);
  if (client == null) throw StateError('Supabase client not initialized');
  return SupabaseMessageRepository(client);
});

final messageControllerProvider =
    NotifierProvider<MessageController, MessageState>(MessageController.new);

/// True if the current user has any thread with unread messages.
final hasUnreadMessagesProvider = Provider<bool>((ref) {
  final state = ref.watch(messageControllerProvider);
  return state.threads.any((t) => state.myUserId != null &&
      t.hasUnreadFor(state.myUserId!));
});

/// Messages currently cached for a thread. UI watches this provider.
final threadMessagesProvider =
    Provider.family<List<MessageModel>, String>((ref, threadId) {
  final state = ref.watch(messageControllerProvider);
  return state.messagesByThread[threadId] ?? const [];
});

/// Single thread by ID (or null if not loaded).
final threadByIdProvider =
    Provider.family<ThreadModel?, String>((ref, threadId) {
  final state = ref.watch(messageControllerProvider);
  try {
    return state.threads.firstWhere((t) => t.id == threadId);
  } catch (_) {
    return null;
  }
});
