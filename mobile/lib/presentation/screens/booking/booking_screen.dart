import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import '../../../logic/booking/booking_bloc.dart';
import '../../../logic/booking/booking_event.dart';
import '../../../logic/booking/booking_state.dart';
import '../../../data/models/timeslot_model.dart';
import '../../../utils/responsive_helper.dart';
import '../../../utils/price_utils.dart';
import 'widgets/branch_selector.dart';
import 'widgets/court_selector.dart';
import 'widgets/date_selector.dart';
import 'widgets/time_slot_grid.dart';
import 'booking_checkout_screen.dart';

class BookingScreen extends StatefulWidget {
  const BookingScreen({super.key});

  @override
  State<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  @override
  void initState() {
    super.initState();
    // Load branches first, then time slots
    context.read<BookingBloc>().add(LoadBranches());
    // We'll load time slots after branches are loaded
  }

  void _navigateToCheckout() {
    try {
      final bookingBloc = context.read<BookingBloc>();
      Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => BlocProvider<BookingBloc>.value(
            value: bookingBloc,
            child: const BookingCheckoutScreen(),
          ),
        ),
      );
    } catch (e) {
      debugPrint('Error navigating to checkout: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Có lỗi xảy ra khi chuyển trang'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Đặt Sân',
          style: TextStyle(
            fontSize: ResponsiveHelper.responsiveFontSize(context, 18),
          ),
        ),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 1,
      ),
      body: SafeArea(
        child: BlocConsumer<BookingBloc, BookingState>(
          listener: (context, state) {
            if (state is BookingError) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(state.message),
                  backgroundColor: Colors.red,
                ),
              );
            }
            if (state is BookingSuccess) {
              // Reload data after successful booking
              context.read<BookingBloc>().add(LoadBranches());
            }
            // Load time slots after branches are loaded
            if (state is BookingLoaded &&
                state.branches.isNotEmpty &&
                state.timeSlots.isEmpty) {
              context.read<BookingBloc>().add(LoadTimeSlots());
            }
          },
          builder: (context, state) {
            if (state is BookingLoading) {
              return const Center(child: CircularProgressIndicator());
            }

            if (state is BookingLoaded) {
              return SingleChildScrollView(
                padding: EdgeInsets.symmetric(
                  horizontal: ResponsiveHelper.isSmallPhone(context) ? 12 : 16,
                  vertical: ResponsiveHelper.isSmallPhone(context) ? 8 : 16,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Branch Selector
                    BranchSelector(
                      branches: state.branches,
                      selectedBranch: state.selectedBranch,
                      onBranchSelected: (branch) {
                        context.read<BookingBloc>().add(SelectBranch(branch));
                      },
                    ),
                    ResponsiveHelper.verticalSpace(context, 2),

                    // Court Selector
                    if (state.selectedBranch != null) ...[
                      CourtSelector(
                        courts: state.courts,
                        selectedCourt: state.selectedCourt,
                        onCourtSelected: (court) {
                          context.read<BookingBloc>().add(SelectCourt(court));
                        },
                      ),
                      SizedBox(
                        height: ResponsiveHelper.responsiveHeight(context, 2),
                      ),
                    ],

                    // Date Selector
                    if (state.selectedCourt != null) ...[
                      DateSelector(
                        selectedDate: state.selectedDate,
                        onDateSelected: (date) {
                          context.read<BookingBloc>().add(SelectDate(date));
                        },
                      ),
                      SizedBox(
                        height: ResponsiveHelper.responsiveHeight(context, 2),
                      ),
                    ],

                    // Time Slot Grid
                    if (state.selectedDate != null &&
                        state.selectedCourt != null) ...[
                      Text(
                        'Chọn Khung Giờ',
                        style: TextStyle(
                          fontSize: ResponsiveHelper.responsiveFontSize(
                            context,
                            18,
                          ),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      SizedBox(
                        height: ResponsiveHelper.responsiveHeight(context, 1),
                      ),
                      Text(
                        'Có thể chọn tối đa 6 giờ liên tiếp',
                        style: TextStyle(
                          fontSize: ResponsiveHelper.responsiveFontSize(
                            context,
                            14,
                          ),
                          color: Colors.grey[600],
                        ),
                      ),
                      SizedBox(
                        height: ResponsiveHelper.responsiveHeight(context, 1.5),
                      ),
                      TimeSlotGrid(
                        timeSlots: state.timeSlots,
                        selectedTimeSlots: state.selectedTimeSlots,
                        bookedSlots: state.bookedSlots,
                        selectedDate: state.selectedDate!,
                        selectedCourt: state.selectedCourt!,
                        onTimeSlotToggle: (timeSlot) {
                          context.read<BookingBloc>().add(
                            ToggleTimeSlot(timeSlot),
                          );
                        },
                      ),
                      SizedBox(
                        height: ResponsiveHelper.responsiveHeight(context, 2),
                      ),
                    ],

                    // Selected Info
                    if (state.selectedTimeSlots.isNotEmpty) ...[
                      _buildSelectedInfo(context, state),
                      SizedBox(
                        height: ResponsiveHelper.responsiveHeight(context, 2),
                      ),
                    ],

                    // Book Button
                    if (state.canBookSlots) ...[
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: _navigateToCheckout,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.blue,
                            padding: ResponsiveHelper.responsivePadding(
                              context,
                              vertical: 16,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          child: Text(
                            'Tiến Hành Đặt Sân',
                            style: TextStyle(
                              fontSize: ResponsiveHelper.responsiveFontSize(
                                context,
                                16,
                              ),
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              );
            }

            // Handle other states (BookingSuccess, BookingError, etc.)
            if (state is BookingSuccess) {
              return const Center(child: CircularProgressIndicator());
            }

            return const Center(
              child: Text('Có lỗi xảy ra. Vui lòng thử lại.'),
            );
          },
        ),
      ),
    );
  }

  Widget _buildSelectedInfo(BuildContext context, BookingLoaded state) {
    final dateFormat = DateFormat('dd/MM/yyyy');
    final sortedSlots = List<TimeSlotModel>.from(state.selectedTimeSlots)
      ..sort((a, b) => a.timeSlotId.compareTo(b.timeSlotId));

    return Container(
      padding: ResponsiveHelper.responsivePadding(context, all: 16),
      decoration: BoxDecoration(
        color: Colors.blue.shade50,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.blue.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Thông Tin Đặt Sân',
            style: TextStyle(
              fontSize: ResponsiveHelper.responsiveFontSize(context, 16),
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: ResponsiveHelper.responsiveHeight(context, 1)),
          Text(
            'Chi nhánh: ${state.selectedBranch!.branchName}',
            style: TextStyle(
              fontSize: ResponsiveHelper.responsiveFontSize(context, 14),
            ),
          ),
          Text(
            'Sân: ${state.selectedCourt!.courtName}',
            style: TextStyle(
              fontSize: ResponsiveHelper.responsiveFontSize(context, 14),
            ),
          ),
          Text(
            'Ngày: ${dateFormat.format(state.selectedDate!)}',
            style: TextStyle(
              fontSize: ResponsiveHelper.responsiveFontSize(context, 14),
            ),
          ),
          Text(
            'Số giờ: ${state.selectedTimeSlots.length} giờ',
            style: TextStyle(
              fontSize: ResponsiveHelper.responsiveFontSize(context, 14),
            ),
          ),
          Text(
            'Khung giờ: ${sortedSlots.first.displayTime} - ${sortedSlots.last.endTime}',
            style: TextStyle(
              fontSize: ResponsiveHelper.responsiveFontSize(context, 14),
            ),
          ),
          SizedBox(height: ResponsiveHelper.responsiveHeight(context, 1)),
          Text(
            'Tổng tiền: ${PriceUtils.formatPrice(state.totalPrice)}',
            style: TextStyle(
              fontSize: ResponsiveHelper.responsiveFontSize(context, 16),
              fontWeight: FontWeight.bold,
              color: Colors.blue,
            ),
          ),
        ],
      ),
    );
  }
}
