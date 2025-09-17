class ShoeSizeModel {
  final int? shoeSizeId;
  final int? productId;
  final String size;
  final int quantity;

  ShoeSizeModel({
    this.shoeSizeId,
    this.productId,
    required this.size,
    required this.quantity,
  });

  factory ShoeSizeModel.fromJson(Map<String, dynamic> json) {
    return ShoeSizeModel(
      shoeSizeId: json['ShoeSizeId'] as int?,
      productId: json['ProductId'] as int?,
      size: json['Size'] as String? ?? '',
      quantity: json['Quantity'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'ShoeSizeId': shoeSizeId,
      'ProductId': productId,
      'Size': size,
      'Quantity': quantity,
    };
  }

  @override
  String toString() {
    return 'ShoeSizeModel(shoeSizeId: $shoeSizeId, productId: $productId, size: $size, quantity: $quantity)';
  }
}
