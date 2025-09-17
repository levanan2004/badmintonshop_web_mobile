import 'package:equatable/equatable.dart';
import '../../data/models/branch_model.dart';
import '../../data/models/court_model.dart';
import '../../data/models/timeslot_model.dart';
import '../../data/models/booking_model.dart';

abstract class BookingState extends Equatable {
  const BookingState();

  @override
  List<Object?> get props => [];
}

class BookingInitial extends BookingState {}

class BookingLoading extends BookingState {}

class BookingLoaded extends BookingState {
  final List<BranchModel> branches;
  final List<CourtModel> courts;
  final List<TimeSlotModel> timeSlots;
  final List<Map<String, dynamic>> bookedSlots;
  final BranchModel? selectedBranch;
  final CourtModel? selectedCourt;
  final DateTime? selectedDate;
  final List<TimeSlotModel> selectedTimeSlots;
  final List<BookingModel> bookingHistory;
  final bool isCreatingBooking;

  const BookingLoaded({
    this.branches = const [],
    this.courts = const [],
    this.timeSlots = const [],
    this.bookedSlots = const [],
    this.selectedBranch,
    this.selectedCourt,
    this.selectedDate,
    this.selectedTimeSlots = const [],
    this.bookingHistory = const [],
    this.isCreatingBooking = false,
  });

  BookingLoaded copyWith({
    List<BranchModel>? branches,
    List<CourtModel>? courts,
    List<TimeSlotModel>? timeSlots,
    List<Map<String, dynamic>>? bookedSlots,
    BranchModel? selectedBranch,
    CourtModel? selectedCourt,
    DateTime? selectedDate,
    List<TimeSlotModel>? selectedTimeSlots,
    List<BookingModel>? bookingHistory,
    bool? isCreatingBooking,
  }) {
    return BookingLoaded(
      branches: branches ?? this.branches,
      courts: courts ?? this.courts,
      timeSlots: timeSlots ?? this.timeSlots,
      bookedSlots: bookedSlots ?? this.bookedSlots,
      selectedBranch: selectedBranch ?? this.selectedBranch,
      selectedCourt: selectedCourt ?? this.selectedCourt,
      selectedDate: selectedDate ?? this.selectedDate,
      selectedTimeSlots: selectedTimeSlots ?? this.selectedTimeSlots,
      bookingHistory: bookingHistory ?? this.bookingHistory,
      isCreatingBooking: isCreatingBooking ?? this.isCreatingBooking,
    );
  }

  @override
  List<Object?> get props => [
        branches,
        courts,
        timeSlots,
        bookedSlots,
        selectedBranch,
        selectedCourt,
        selectedDate,
        selectedTimeSlots,
        bookingHistory,
        isCreatingBooking,
      ];

  bool get canBookSlots {
    return selectedCourt != null &&
        selectedDate != null &&
        selectedTimeSlots.isNotEmpty &&
        selectedTimeSlots.length <= 6 &&
        _areConsecutiveSlots();
  }

  bool _areConsecutiveSlots() {
    if (selectedTimeSlots.length <= 1) return true;
    
    final sortedSlots = List<TimeSlotModel>.from(selectedTimeSlots)
      ..sort((a, b) => a.timeSlotId.compareTo(b.timeSlotId));
    
    for (int i = 1; i < sortedSlots.length; i++) {
      if (sortedSlots[i].timeSlotId != sortedSlots[i - 1].timeSlotId + 1) {
        return false;
      }
    }
    return true;
  }

  double get totalPrice {
    if (selectedCourt == null) return 0;
    return selectedTimeSlots.length * selectedCourt!.pricePerHour;
  }
}

class BookingError extends BookingState {
  final String message;

  const BookingError(this.message);

  @override
  List<Object?> get props => [message];
}

class BookingSuccess extends BookingState {
  final String message;

  const BookingSuccess(this.message);

  @override
  List<Object?> get props => [message];
}
