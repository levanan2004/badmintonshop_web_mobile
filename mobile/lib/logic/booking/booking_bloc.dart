import 'package:flutter_bloc/flutter_bloc.dart';
import '../../data/services/booking_service.dart';
import '../../data/models/booking_model.dart';
import '../../data/models/timeslot_model.dart';
import 'booking_event.dart';
import 'booking_state.dart';

class BookingBloc extends Bloc<BookingEvent, BookingState> {
  final BookingService _bookingService = BookingService();

  BookingBloc() : super(BookingInitial()) {
    on<LoadBranches>(_onLoadBranches);
    on<LoadCourtsByBranch>(_onLoadCourtsByBranch);
    on<LoadTimeSlots>(_onLoadTimeSlots);
    on<LoadBookedSlots>(_onLoadBookedSlots);
    on<SelectBranch>(_onSelectBranch);
    on<SelectCourt>(_onSelectCourt);
    on<SelectDate>(_onSelectDate);
    on<ToggleTimeSlot>(_onToggleTimeSlot);
    on<CreateBooking>(_onCreateBooking);
    on<LoadBookingHistory>(_onLoadBookingHistory);
    on<CancelBookings>(_onCancelBookings);
    on<ResetBooking>(_onResetBooking);
  }

  Future<void> _onLoadBranches(
    LoadBranches event,
    Emitter<BookingState> emit,
  ) async {
    try {
      print('🔄 [BookingBloc] Loading branches...');
      emit(BookingLoading());
      final branches = await _bookingService.getBranches();
      print('✅ [BookingBloc] Loaded ${branches.length} branches');
      emit(BookingLoaded(branches: branches));
    } catch (e) {
      print('❌ [BookingBloc] Failed to load branches: $e');
      emit(BookingError(e.toString()));
    }
  }

  Future<void> _onLoadCourtsByBranch(
    LoadCourtsByBranch event,
    Emitter<BookingState> emit,
  ) async {
    if (state is BookingLoaded) {
      final currentState = state as BookingLoaded;
      try {
        print(
          '🔄 [BookingBloc] Loading courts for branch ${event.branchId}...',
        );
        final courts = await _bookingService.getCourtsByBranch(event.branchId);
        print('✅ [BookingBloc] Loaded ${courts.length} courts');
        emit(
          currentState.copyWith(
            courts: courts,
            selectedCourt: null,
            selectedTimeSlots: [],
            bookedSlots: [],
          ),
        );
      } catch (e) {
        print('❌ [BookingBloc] Failed to load courts: $e');
        emit(BookingError(e.toString()));
      }
    }
  }

  Future<void> _onLoadTimeSlots(
    LoadTimeSlots event,
    Emitter<BookingState> emit,
  ) async {
    try {
      print(
        '🔄 [BookingBloc] Loading time slots... Current state: ${state.runtimeType}',
      );
      final timeSlots = await _bookingService.getTimeSlots();
      print('✅ [BookingBloc] Loaded ${timeSlots.length} time slots');
      print(
        '🔍 [BookingBloc] TimeSlots: ${timeSlots.map((ts) => '${ts.timeSlotId}: ${ts.displayTime}').join(', ')}',
      );

      if (state is BookingLoaded) {
        final currentState = state as BookingLoaded;
        emit(currentState.copyWith(timeSlots: timeSlots));
      } else {
        // If state is not BookingLoaded yet, create a new one
        emit(BookingLoaded(timeSlots: timeSlots));
      }
    } catch (e) {
      print('❌ [BookingBloc] Failed to load time slots: $e');
      emit(BookingError(e.toString()));
    }
  }

  Future<void> _onLoadBookedSlots(
    LoadBookedSlots event,
    Emitter<BookingState> emit,
  ) async {
    if (state is BookingLoaded) {
      final currentState = state as BookingLoaded;
      try {
        final bookedSlots = await _bookingService.getBookedSlots(
          event.courtId,
          event.date,
        );
        emit(
          currentState.copyWith(
            bookedSlots: bookedSlots,
            selectedTimeSlots: [],
          ),
        );
      } catch (e) {
        emit(BookingError(e.toString()));
      }
    }
  }

  void _onSelectBranch(SelectBranch event, Emitter<BookingState> emit) {
    if (state is BookingLoaded) {
      final currentState = state as BookingLoaded;
      emit(
        currentState.copyWith(
          selectedBranch: event.branch,
          selectedCourt: null,
          courts: [],
          selectedTimeSlots: [],
          bookedSlots: [],
        ),
      );
      add(LoadCourtsByBranch(event.branch.branchId));
    }
  }

  void _onSelectCourt(SelectCourt event, Emitter<BookingState> emit) {
    if (state is BookingLoaded) {
      final currentState = state as BookingLoaded;
      emit(
        currentState.copyWith(
          selectedCourt: event.court,
          selectedTimeSlots: [],
          bookedSlots: [],
        ),
      );

      if (currentState.selectedDate != null) {
        final dateString = currentState.selectedDate!.toIso8601String().split(
          'T',
        )[0];
        print(
          '🔍 [BookingBloc] Loading booked slots for court: ${event.court.courtId}, date: $dateString',
        );
        add(LoadBookedSlots(event.court.courtId, dateString));
      }
    }
  }

  void _onSelectDate(SelectDate event, Emitter<BookingState> emit) {
    if (state is BookingLoaded) {
      final currentState = state as BookingLoaded;
      emit(
        currentState.copyWith(
          selectedDate: event.date,
          selectedTimeSlots: [],
          bookedSlots: [],
        ),
      );

      if (currentState.selectedCourt != null) {
        final dateString = event.date.toIso8601String().split('T')[0];
        print(
          '🔍 [BookingBloc] Loading booked slots for court: ${currentState.selectedCourt!.courtId}, date: $dateString',
        );
        add(LoadBookedSlots(currentState.selectedCourt!.courtId, dateString));
      }
    }
  }

  void _onToggleTimeSlot(ToggleTimeSlot event, Emitter<BookingState> emit) {
    if (state is BookingLoaded) {
      final currentState = state as BookingLoaded;
      final selectedSlots = List<TimeSlotModel>.from(
        currentState.selectedTimeSlots,
      );

      if (selectedSlots.contains(event.timeSlot)) {
        selectedSlots.remove(event.timeSlot);
      } else {
        if (selectedSlots.length < 6) {
          selectedSlots.add(event.timeSlot);
        }
      }

      emit(currentState.copyWith(selectedTimeSlots: selectedSlots));
    }
  }

  Future<void> _onCreateBooking(
    CreateBooking event,
    Emitter<BookingState> emit,
  ) async {
    if (state is BookingLoaded) {
      final currentState = state as BookingLoaded;

      if (!currentState.canBookSlots) {
        emit(const BookingError('Invalid booking selection'));
        return;
      }

      try {
        emit(currentState.copyWith(isCreatingBooking: true));

        final slots = currentState.selectedTimeSlots.map((timeSlot) {
          return BookingSlot(
            courtId: currentState.selectedCourt!.courtId,
            timeSlotId: timeSlot.timeSlotId,
            date: currentState.selectedDate!,
          );
        }).toList();

        final result = await _bookingService.createBooking(
          customerName: event.customerName,
          customerEmail: event.customerEmail,
          customerPhone: event.customerPhone,
          slots: slots,
        );

        if (result['success'] == true) {
          // Reset to loaded state with cleared selections
          emit(
            currentState.copyWith(
              selectedTimeSlots: [],
              isCreatingBooking: false,
            ),
          );

          // Emit success message for UI to show snackbar
          emit(
            BookingSuccess(result['message'] ?? 'Booking created successfully'),
          );
        } else if (result['tokenExpired'] == true) {
          emit(BookingError('${result['message']} - TOKEN_EXPIRED'));
        } else {
          emit(BookingError(result['message'] ?? 'Failed to create booking'));
        }
      } catch (e) {
        emit(BookingError(e.toString()));
      }
    }
  }

  Future<void> _onLoadBookingHistory(
    LoadBookingHistory event,
    Emitter<BookingState> emit,
  ) async {
    try {
      print('🔄 [BookingBloc] Loading booking history...');
      emit(BookingLoading());

      final bookingHistory = await _bookingService.getBookingHistory();
      print('✅ [BookingBloc] Loaded ${bookingHistory.length} bookings');

      if (state is BookingLoaded) {
        final currentState = state as BookingLoaded;
        emit(currentState.copyWith(bookingHistory: bookingHistory));
      } else {
        // Create new BookingLoaded state with booking history
        emit(BookingLoaded(bookingHistory: bookingHistory));
      }
    } catch (e) {
      print('❌ [BookingBloc] Failed to load booking history: $e');
      emit(BookingError(e.toString()));
    }
  }

  Future<void> _onCancelBookings(
    CancelBookings event,
    Emitter<BookingState> emit,
  ) async {
    try {
      print('🔄 [BookingBloc] Cancelling bookings: ${event.bookingIds}');
      final success = await _bookingService.cancelBookings(event.bookingIds);

      if (success) {
        print('✅ [BookingBloc] Bookings cancelled successfully');
        emit(const BookingSuccess('Bookings cancelled successfully'));
        // Reload booking history after success
        add(LoadBookingHistory());
      } else {
        print('❌ [BookingBloc] Failed to cancel bookings');
        emit(const BookingError('Failed to cancel bookings'));
      }
    } catch (e) {
      print('❌ [BookingBloc] Cancel bookings error: $e');
      emit(BookingError(e.toString()));
    }
  }

  void _onResetBooking(ResetBooking event, Emitter<BookingState> emit) {
    emit(BookingInitial());
  }
}
