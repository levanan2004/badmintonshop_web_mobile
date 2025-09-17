class OrderDetail {
  final int id;
  final int orderId;
  final int productId;
  final int quantity;
  final double price;
  OrderDetail({
    required this.id,
    required this.orderId,
    required this.productId,
    required this.quantity,
    required this.price,
  });
}
