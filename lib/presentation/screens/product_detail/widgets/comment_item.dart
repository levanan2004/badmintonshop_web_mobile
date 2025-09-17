import 'package:flutter/material.dart';
import 'reply_list.dart';

class CommentItem extends StatelessWidget {
  final dynamic comment;
  final bool openReplies;
  final List<dynamic> replies;
  final bool loadingReplies;
  final TextEditingController replyController;
  final bool isReplying;
  final bool sendingReply;
  final VoidCallback onReplyPressed;
  final VoidCallback onSendReply;
  final VoidCallback onToggleReplies;

  const CommentItem({
    super.key,
    required this.comment,
    required this.openReplies,
    required this.replies,
    required this.loadingReplies,
    required this.replyController,
    required this.isReplying,
    required this.sendingReply,
    required this.onReplyPressed,
    required this.onSendReply,
    required this.onToggleReplies,
  });

  @override
  Widget build(BuildContext context) {
    final acc = comment['Account'] ?? {};
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            backgroundColor: Colors.blue[100],
            child: const Icon(Icons.person, color: Colors.blue),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      acc['Firstname'] != null
                          ? '${acc['Firstname']} ${acc['Lastname'] ?? ''}'
                          : acc['Username'] ?? 'Ẩn danh',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Colors.blue,
                        fontSize: 15,
                      ),
                    ),
                    const SizedBox(width: 8),
                    if (comment['createdAt'] != null)
                      Text(
                        comment['createdAt']
                            .toString()
                            .substring(0, 16)
                            .replaceAll('T', ' '),
                        style: const TextStyle(
                          color: Colors.grey,
                          fontSize: 12,
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  comment['Content'] ?? '',
                  style: const TextStyle(fontSize: 15),
                ),
                Row(
                  children: [
                    TextButton.icon(
                      onPressed: onReplyPressed,
                      icon: const Icon(
                        Icons.reply,
                        size: 18,
                        color: Colors.blue,
                      ),
                      label: const Text(
                        'Trả lời',
                        style: TextStyle(color: Colors.blue),
                      ),
                      style: TextButton.styleFrom(
                        padding: EdgeInsets.zero,
                        minimumSize: const Size(40, 30),
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                    ),
                    if (replies.isNotEmpty)
                      TextButton.icon(
                        onPressed: onToggleReplies,
                        icon: Icon(
                          openReplies ? Icons.expand_less : Icons.expand_more,
                          color: Colors.green,
                          size: 18,
                        ),
                        label: Text(
                          openReplies
                              ? 'Ẩn phản hồi'
                              : 'Xem ${replies.length} phản hồi',
                          style: const TextStyle(color: Colors.green),
                        ),
                        style: TextButton.styleFrom(
                          padding: EdgeInsets.zero,
                          minimumSize: const Size(40, 30),
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                      ),
                  ],
                ),
                if (isReplying)
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: replyController,
                            decoration: InputDecoration(
                              hintText: 'Nhập trả lời...',
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                              contentPadding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 8,
                              ),
                              filled: true,
                              fillColor: Colors.grey[100],
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        ElevatedButton(
                          onPressed: sendingReply ? null : onSendReply,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.blue,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 12,
                            ),
                          ),
                          child: sendingReply
                              ? const SizedBox(
                                  width: 16,
                                  height: 16,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.white,
                                  ),
                                )
                              : const Text(
                                  'Gửi',
                                  style: TextStyle(color: Colors.white),
                                ),
                        ),
                      ],
                    ),
                  ),
                if (openReplies)
                  ReplyList(replies: replies, loading: loadingReplies),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
