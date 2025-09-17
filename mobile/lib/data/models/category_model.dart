class CategoryModel {
  final int? categoryId;
  final String categoryName;

  CategoryModel({this.categoryId, required this.categoryName});

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(
      categoryId: json['CategoryId'] as int?,
      categoryName: json['CategoryName'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {'CategoryId': categoryId, 'CategoryName': categoryName};
  }

  @override
  String toString() {
    return 'CategoryModel(categoryId: $categoryId, categoryName: $categoryName)';
  }
}
