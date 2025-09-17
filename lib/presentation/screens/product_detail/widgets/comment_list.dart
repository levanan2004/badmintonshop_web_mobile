import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'comment_item.dart';

class CommentList extends StatelessWidget {
  final List<dynamic> comments;
  final Map<int, bool> openReplies;
  final Map<int, List<dynamic>> replies;
  final Map<int, bool> loadingReplies;
  final Map<int, TextEditingController> replyControllers;
  final int? replyingTo;
  final bool sendingReply;
  final void Function(int commentId) onReplyPressed;
  final void Function(int commentId) onSendReply;
  final void Function(int commentId) onToggleReplies;
  final VoidCallback onAddComment;
  final TextEditingController commentController;

  const CommentList({
    super.key,
    required this.comments,
    required this.openReplies,
    required this.replies,
    required this.loadingReplies,
    required this.replyControllers,
    required this.replyingTo,
    required this.sendingReply,
    required this.onReplyPressed,
    required this.onSendReply,
    required this.onToggleReplies,
    required this.onAddComment,
    required this.commentController,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Hiển thị comments nếu có
        if (comments.isNotEmpty)
          ...comments.map(
            (c) => CommentItem(
              comment: c,
              openReplies: openReplies[c['CommentId']] ?? false,
              replies: replies[c['CommentId']] ?? [],
              loadingReplies: loadingReplies[c['CommentId']] ?? false,
              replyController:
                  replyControllers[c['CommentId']] ?? TextEditingController(),
              isReplying: replyingTo == c['CommentId'],
              sendingReply: sendingReply,
              onReplyPressed: () => onReplyPressed(c['CommentId']),
              onSendReply: () => onSendReply(c['CommentId']),
              onToggleReplies: () => onToggleReplies(c['CommentId']),
            ),
          )
        else
          // Hiển thị thông báo nếu chưa có comment
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 16),
            child: Text(
              'Chưa có bình luận nào. Hãy là người đầu tiên bình luận!',
              style: TextStyle(color: Colors.grey, fontSize: 14),
              textAlign: TextAlign.center,
            ),
          ),

        // Form nhập bình luận mới - luôn hiển thị
        Container(
          margin: const EdgeInsets.only(top: 16, bottom: 8),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 6,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: commentController,
                  decoration: InputDecoration(
                    hintText: 'Nhập bình luận...',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 10,
                    ),
                    filled: true,
                    fillColor: Colors.grey[100],
                  ),
                ),
              ),
              const SizedBox(width: 8),
              ElevatedButton(
                onPressed: onAddComment,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 18,
                    vertical: 12,
                  ),
                ),
                child: const Text('Gửi', style: TextStyle(color: Colors.white)),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
