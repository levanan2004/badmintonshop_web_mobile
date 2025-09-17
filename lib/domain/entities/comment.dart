class Comment {
  final int id;
  final int productId;
  final int customerId;
  final String content;
  final DateTime createdAt;
  Comment({
    required this.id,
    required this.productId,
    required this.customerId,
    required this.content,
    required this.createdAt,
  });
}
