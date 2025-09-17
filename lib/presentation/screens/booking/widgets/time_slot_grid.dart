import 'package:flutter/material.dart';
import '../../../../data/models/timeslot_model.dart';
import '../../../../data/models/court_model.dart';
import '../../../../utils/responsive_helper.dart';

class TimeSlotGrid extends StatelessWidget {
  final List<TimeSlotModel> timeSlots;
  final List<TimeSlotModel> selectedTimeSlots;
  final List<Map<String, dynamic>> bookedSlots;
  final Function(TimeSlotModel) onTimeSlotToggle;
  final DateTime selectedDate;
  final CourtModel selectedCourt;

  const TimeSlotGrid({
    super.key,
    required this.timeSlots,
    required this.selectedTimeSlots,
    required this.bookedSlots,
    required this.onTimeSlotToggle,
    required this.selectedDate,
    required this.selectedCourt,
  });

  bool _isSlotBooked(TimeSlotModel timeSlot) {
    // Web client logic: Check CourtId, BookingDate, AND TimeSlotId
    final currentDate = selectedDate.toIso8601String().split('T')[0];
    final currentCourtId = selectedCourt.courtId;

    final isBooked = bookedSlots.any((slot) {
      final timeSlotIdFromApi = slot['TimeSlotId'];
      final courtIdFromApi = slot['CourtId'];
      final bookingDateFromApi = slot['BookingDate'];

      print(
        '🔍 [TimeSlotGrid] Checking slot ${timeSlot.timeSlotId} against booked slot: '
        'CourtId=$courtIdFromApi, TimeSlotId=$timeSlotIdFromApi, BookingDate=$bookingDateFromApi '
        'vs Current: CourtId=$currentCourtId, Date=$currentDate',
      );

      // Check all 3 conditions like web client
      bool courtMatch = courtIdFromApi == currentCourtId;
      bool dateMatch = bookingDateFromApi == currentDate;
      bool timeSlotMatch = false;

      if (timeSlotIdFromApi is String) {
        timeSlotMatch = int.tryParse(timeSlotIdFromApi) == timeSlot.timeSlotId;
      } else {
        timeSlotMatch = timeSlotIdFromApi == timeSlot.timeSlotId;
      }

      final matches = courtMatch && dateMatch && timeSlotMatch;

      if (matches) {
        print(
          '✅ [TimeSlotGrid] MATCH FOUND - Slot ${timeSlot.timeSlotId} is BOOKED',
        );
      }

      return matches;
    });

    return isBooked;
  }

  bool _isSlotSelected(TimeSlotModel timeSlot) {
    return selectedTimeSlots.any(
      (slot) => slot.timeSlotId == timeSlot.timeSlotId,
    );
  }

  @override
  Widget build(BuildContext context) {
    if (timeSlots.isEmpty) {
      return Container(
        padding: ResponsiveHelper.responsivePadding(context, all: 16),
        child: Text(
          'Đang tải khung giờ...',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: ResponsiveHelper.responsiveFontSize(context, 14),
          ),
        ),
      );
    }

    return LayoutBuilder(
      builder: (context, constraints) {
        // Calculate optimal grid parameters based on available space
        final availableWidth = constraints.maxWidth;
        final itemMinWidth = ResponsiveHelper.isSmallPhone(context) ? 80 : 100;
        final crossAxisCount = (availableWidth / itemMinWidth).floor().clamp(
          2,
          4,
        );
        final aspectRatio = ResponsiveHelper.isSmallPhone(context) ? 1.8 : 2.2;

        return GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: crossAxisCount,
            crossAxisSpacing: 6,
            mainAxisSpacing: 6,
            childAspectRatio: aspectRatio,
          ),
          itemCount: timeSlots.length,
          itemBuilder: (context, index) {
            final timeSlot = timeSlots[index];
            final isBooked = _isSlotBooked(timeSlot);
            final isSelected = _isSlotSelected(timeSlot);
            final canSelect = !isBooked && selectedTimeSlots.length < 6;

            Color backgroundColor;
            Color textColor;
            Color borderColor;

            if (isBooked) {
              backgroundColor = Colors.red.shade100;
              textColor = Colors.red.shade700;
              borderColor = Colors.red.shade300;
            } else if (isSelected) {
              backgroundColor = Colors.blue;
              textColor = Colors.white;
              borderColor = Colors.blue;
            } else {
              backgroundColor = Colors.white;
              textColor = Colors.black;
              borderColor = Colors.grey.shade300;
            }

            return GestureDetector(
              onTap: isBooked
                  ? null
                  : () {
                      if (isSelected || canSelect) {
                        onTimeSlotToggle(timeSlot);
                      }
                    },
              child: Container(
                constraints: ResponsiveHelper.safeContainerConstraints(
                  context,
                  maxWidthPercentage: 30,
                  maxHeightPercentage: 8,
                ),
                padding: EdgeInsets.symmetric(
                  horizontal: ResponsiveHelper.isSmallPhone(context) ? 4 : 8,
                  vertical: ResponsiveHelper.isSmallPhone(context) ? 6 : 8,
                ),
                decoration: BoxDecoration(
                  color: backgroundColor,
                  border: Border.all(color: borderColor),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Expanded(
                      flex: 3,
                      child: Center(
                        child: Text(
                          timeSlot.startTime,
                          style: TextStyle(
                            fontSize: ResponsiveHelper.responsiveFontSize(
                              context,
                              ResponsiveHelper.isSmallPhone(context) ? 9 : 11,
                            ),
                            fontWeight: FontWeight.bold,
                            color: textColor,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                    Expanded(
                      flex: 2,
                      child: Center(
                        child: Text(
                          timeSlot.endTime,
                          style: TextStyle(
                            fontSize: ResponsiveHelper.responsiveFontSize(
                              context,
                              ResponsiveHelper.isSmallPhone(context) ? 8 : 9,
                            ),
                            color: textColor,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                    if (isBooked)
                      Expanded(
                        flex: 2,
                        child: Center(
                          child: Text(
                            'Đã đặt',
                            style: TextStyle(
                              fontSize: ResponsiveHelper.responsiveFontSize(
                                context,
                                ResponsiveHelper.isSmallPhone(context) ? 7 : 8,
                              ),
                              color: textColor,
                              fontWeight: FontWeight.w600,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            textAlign: TextAlign.center,
                          ),
                        ),
                      )
                    else
                      Expanded(flex: 2, child: SizedBox()),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }
}
