class BrandModel {
  final int? brandId;
  final String brandName;
  final int? categoryId;

  BrandModel({this.brandId, required this.brandName, this.categoryId});

  factory BrandModel.fromJson(Map<String, dynamic> json) {
    return BrandModel(
      brandId: json['BrandId'] as int?,
      brandName: json['BrandName'] as String? ?? '',
      categoryId: json['CategoryId'] as int?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'BrandId': brandId,
      'BrandName': brandName,
      'CategoryId': categoryId,
    };
  }

  @override
  String toString() {
    return 'BrandModel(brandId: $brandId, brandName: $brandName, categoryId: $categoryId)';
  }
}
