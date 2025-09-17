class Order {
  final int id;
  final int? customerId;
  final String? paymentMethod;
  final double? subPrice;
  final double? totalPrice;
  final int? discount;
  final DateTime? createAt;
  final int? orderStatusId;
  Order({
    required this.id,
    this.customerId,
    this.paymentMethod,
    this.subPrice,
    this.totalPrice,
    this.discount,
    this.createAt,
    this.orderStatusId,
  });
}
