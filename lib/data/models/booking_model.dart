class BookingModel {
  final int? bookingId;
  final int customerId;
  final int courtId;
  final int timeSlotId;
  final DateTime bookingDate;
  final String status;
  final String? customerName;
  final String? courtName;
  final String? timeSlot;

  BookingModel({
    this.bookingId,
    required this.customerId,
    required this.courtId,
    required this.timeSlotId,
    required this.bookingDate,
    required this.status,
    this.customerName,
    this.courtName,
    this.timeSlot,
  });

  factory BookingModel.fromJson(Map<String, dynamic> json) {
    return BookingModel(
      bookingId: json['BookingId'],
      customerId: json['CustomerId'] ?? json['customerid'] ?? 0,
      courtId: json['CourtId'] ?? 0,
      timeSlotId: json['TimeSlotId'] ?? 0,
      bookingDate: DateTime.parse(
        json['BookingDate'] ?? DateTime.now().toString(),
      ),
      status: json['Status'] ?? 'confirmed',
      customerName: json['CustomerName'],
      courtName: json['CourtName'],
      timeSlot: json['TimeSlot'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'BookingId': bookingId,
      'CustomerId': customerId,
      'CourtId': courtId,
      'TimeSlotId': timeSlotId,
      'BookingDate': bookingDate.toIso8601String(),
      'Status': status,
    };
  }
}

class BookingSlot {
  final int courtId;
  final int timeSlotId;
  final DateTime date;

  BookingSlot({
    required this.courtId,
    required this.timeSlotId,
    required this.date,
  });

  Map<String, dynamic> toJson() {
    return {
      'CourtId': courtId,
      'TimeSlotId': timeSlotId,
      'BookingDate': date.toIso8601String().split('T')[0], // YYYY-MM-DD format
    };
  }
}
