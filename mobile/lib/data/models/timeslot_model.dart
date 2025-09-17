class TimeSlotModel {
  final int timeSlotId;
  final String startTime;
  final String endTime;

  TimeSlotModel({
    required this.timeSlotId,
    required this.startTime,
    required this.endTime,
  });

  factory TimeSlotModel.fromJson(Map<String, dynamic> json) {
    return TimeSlotModel(
      timeSlotId: json['TimeSlotId'] is String
          ? int.parse(json['TimeSlotId'])
          : json['TimeSlotId'] ?? 0,
      startTime: json['StartTime'] ?? '',
      endTime: json['EndTime'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'TimeSlotId': timeSlotId,
      'StartTime': startTime,
      'EndTime': endTime,
    };
  }

  String get displayTime => '$startTime - $endTime';
}
