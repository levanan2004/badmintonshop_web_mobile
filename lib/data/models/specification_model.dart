import '../../domain/entities/specification.dart';

class SpecificationModel extends Specification {
  SpecificationModel({
    required super.id,
    required super.name,
    required super.value,
  });

  factory SpecificationModel.fromJson(Map<String, dynamic> json) {
    return SpecificationModel(
      id: json['SpecificationId'] ?? json['id'],
      name: json['SpecificationName'] ?? json['name'],
      value: json['SpecificationContent'] ?? json['value'],
    );
  }
}
