class ProductModel {
  final int id;
  final String name;
  final String? avatar;
  final double price;
  final String? brand;
  final int? brandId;
  final int? categoryId;
  final String? description;
  final List<String> images;
  final String? status;

  ProductModel({
    required this.id,
    required this.name,
    this.avatar,
    required this.price,
    this.brand,
    this.brandId,
    this.categoryId,
    this.description,
    this.images = const [],
    this.status,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: json['ProductId'],
      name: json['ProductName'],
      avatar: json['Avatar'],
      price: (json['Price'] as num).toDouble(),
      brand: json['Brand']?['BrandName'] ?? json['BrandName'],
      brandId: json['IdBrand'] ?? json['Brand']?['BrandId'],
      categoryId: json['CategoryId'],
      description: json['Description'],
      images:
          (json['Images'] as List?)?.map((e) => e.toString()).toList() ?? [],
      status: json['Status'],
    );
  }
}
