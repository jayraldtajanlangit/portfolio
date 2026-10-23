import 'package:flutter/material.dart';

class MessageComposer extends StatefulWidget {
  const MessageComposer({
    super.key,
    required this.onSendText,
    required this.onPickImage,
  });

  /// Invoked when the user submits a non-empty body.
  final ValueChanged<String> onSendText;

  /// Invoked when the user taps the image-picker button.
  final VoidCallback onPickImage;

  @override
  State<MessageComposer> createState() => _MessageComposerState();
}

class _MessageComposerState extends State<MessageComposer> {
  final _controller = TextEditingController();
  bool _hasText = false;

  @override
  void initState() {
    super.initState();
    _controller.addListener(() {
      final has = _controller.text.trim().isNotEmpty;
      if (has != _hasText) setState(() => _hasText = has);
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _send() {
    final body = _controller.text.trim();
    if (body.isEmpty) return;
    widget.onSendText(body);
    _controller.clear();
  }

  @override
  Widget build(BuildContext context) {
    final primary = Theme.of(context).colorScheme.primary;
    return SafeArea(
      top: false,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: Color(0xFFE5E7EB))),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            IconButton(
              icon: const Icon(Icons.image_outlined),
              color: primary,
              onPressed: widget.onPickImage,
            ),
            Expanded(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFFF2F3F5),
                  borderRadius: BorderRadius.circular(24),
                ),
                child: TextField(
                  controller: _controller,
                  minLines: 1,
                  maxLines: 5,
                  textInputAction: TextInputAction.newline,
                  decoration: const InputDecoration(
                    hintText: 'Message…',
                    border: InputBorder.none,
                    isCollapsed: true,
                  ),
                ),
              ),
            ),
            IconButton(
              icon: const Icon(Icons.send_rounded),
              color: _hasText ? primary : Colors.grey,
              onPressed: _hasText ? _send : null,
            ),
          ],
        ),
      ),
    );
  }
}
