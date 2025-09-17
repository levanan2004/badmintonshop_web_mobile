class BranchModel {
  final int branchId;
  final String branchName;
  final String location;
  final String phoneNumber;

  BranchModel({
    required this.branchId,
    required this.branchName,
    required this.location,
    required this.phoneNumber,
  });

  factory BranchModel.fromJson(Map<String, dynamic> json) {
    return BranchModel(
      branchId: json['BranchId'] is String
          ? int.parse(json['BranchId'])
          : json['BranchId'] ?? 0,
      branchName: json['BranchName'] ?? '',
      location: json['Location'] ?? '',
      phoneNumber: json['PhoneNumber'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'BranchId': branchId,
      'BranchName': branchName,
      'Location': location,
      'PhoneNumber': phoneNumber,
    };
  }
}
