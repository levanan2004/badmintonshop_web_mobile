class CourtModel {
  final int courtId;
  final String courtName;
  final int branchId;
  final double pricePerHour;

  CourtModel({
    required this.courtId,
    required this.courtName,
    required this.branchId,
    required this.pricePerHour,
  });

  factory CourtModel.fromJson(Map<String, dynamic> json) {
    return CourtModel(
      courtId: json['CourtId'] is String
          ? int.parse(json['CourtId'])
          : json['CourtId'] ?? 0,
      courtName: json['CourtName'] ?? '',
      branchId: json['BranchId'] is String
          ? int.parse(json['BranchId'])
          : json['BranchId'] ?? 0,
      pricePerHour: (json['PricePerHour'] ?? 0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'CourtId': courtId,
      'CourtName': courtName,
      'BranchId': branchId,
      'PricePerHour': pricePerHour,
    };
  }
}
