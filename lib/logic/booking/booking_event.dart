import 'package:equatable/equatable.dart';
import '../../data/models/branch_model.dart';
import '../../data/models/court_model.dart';
import '../../data/models/timeslot_model.dart';

abstract class BookingEvent extends Equatable {
  const BookingEvent();

  @override
  List<Object?> get props => [];
}

class LoadBranches extends BookingEvent {}

class LoadCourtsByBranch extends BookingEvent {
  final int branchId;

  const LoadCourtsByBranch(this.branchId);

  @override
  List<Object?> get props => [branchId];
}

class LoadTimeSlots extends BookingEvent {}

class LoadBookedSlots extends BookingEvent {
  final int courtId;
  final String date;

  const LoadBookedSlots(this.courtId, this.date);

  @override
  List<Object?> get props => [courtId, date];
}

class SelectBranch extends BookingEvent {
  final BranchModel branch;

  const SelectBranch(this.branch);

  @override
  List<Object?> get props => [branch];
}

class SelectCourt extends BookingEvent {
  final CourtModel court;

  const SelectCourt(this.court);

  @override
  List<Object?> get props => [court];
}

class SelectDate extends BookingEvent {
  final DateTime date;

  const SelectDate(this.date);

  @override
  List<Object?> get props => [date];
}

class ToggleTimeSlot extends BookingEvent {
  final TimeSlotModel timeSlot;

  const ToggleTimeSlot(this.timeSlot);

  @override
  List<Object?> get props => [timeSlot];
}

class CreateBooking extends BookingEvent {
  final String customerName;
  final String customerEmail;
  final String customerPhone;

  const CreateBooking({
    required this.customerName,
    required this.customerEmail,
    required this.customerPhone,
  });

  @override
  List<Object?> get props => [customerName, customerEmail, customerPhone];
}

class LoadBookingHistory extends BookingEvent {}

class CancelBookings extends BookingEvent {
  final List<int> bookingIds;

  const CancelBookings(this.bookingIds);

  @override
  List<Object?> get props => [bookingIds];
}

class ResetBooking extends BookingEvent {}
