class Product {
  final int id;
  final String name;
  final String? description;
  final String? summaryDescription;
  final int? discount;
  final int brandId;
  final int categoryId;
  final double price;
  final String? avatar;
  Product({
    required this.id,
    required this.name,
    this.description,
    this.summaryDescription,
    this.discount,
    required this.brandId,
    required this.categoryId,
    required this.price,
    this.avatar,
  });
}
