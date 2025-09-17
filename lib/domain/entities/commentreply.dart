class CommentReply {
  final int id;
  final int commentId;
  final int customerId;
  final String content;
  final DateTime createdAt;
  CommentReply({
    required this.id,
    required this.commentId,
    required this.customerId,
    required this.content,
    required this.createdAt,
  });
}
