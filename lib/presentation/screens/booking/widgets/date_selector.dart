import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../../utils/responsive_helper.dart';

class DateSelector extends StatelessWidget {
  final DateTime? selectedDate;
  final Function(DateTime) onDateSelected;

  const DateSelector({
    super.key,
    required this.selectedDate,
    required this.onDateSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Chọn Ngày',
          style: TextStyle(
            fontSize: ResponsiveHelper.responsiveFontSize(context, 18),
            fontWeight: FontWeight.bold,
          ),
        ),
        SizedBox(height: ResponsiveHelper.responsiveHeight(context, 1)),
        SizedBox(
          height: ResponsiveHelper.responsiveHeight(context, 12),
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: 7, // Show next 7 days
            itemBuilder: (context, index) {
              final date = DateTime.now().add(Duration(days: index));
              final isSelected =
                  selectedDate != null &&
                  selectedDate!.year == date.year &&
                  selectedDate!.month == date.month &&
                  selectedDate!.day == date.day;

              return GestureDetector(
                onTap: () => onDateSelected(date),
                child: Container(
                  width: ResponsiveHelper.responsiveWidth(context, 18),
                  margin: EdgeInsets.only(
                    right: ResponsiveHelper.responsiveWidth(context, 2),
                  ),
                  padding: ResponsiveHelper.responsivePadding(
                    context,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: isSelected ? Colors.blue : Colors.white,
                    border: Border.all(
                      color: isSelected ? Colors.blue : Colors.grey.shade300,
                      width: isSelected ? 2 : 1,
                    ),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        _getWeekdayText(date),
                        style: TextStyle(
                          fontSize: ResponsiveHelper.responsiveFontSize(
                            context,
                            12,
                          ),
                          color: isSelected ? Colors.white : Colors.grey[600],
                        ),
                      ),
                      SizedBox(
                        height: ResponsiveHelper.responsiveHeight(context, 0.5),
                      ),
                      Text(
                        DateFormat('dd').format(date),
                        style: TextStyle(
                          fontSize: ResponsiveHelper.responsiveFontSize(
                            context,
                            20,
                          ),
                          fontWeight: FontWeight.bold,
                          color: isSelected ? Colors.white : Colors.black,
                        ),
                      ),
                      SizedBox(
                        height: ResponsiveHelper.responsiveHeight(context, 0.5),
                      ),
                      Text(
                        _getMonthText(date),
                        style: TextStyle(
                          fontSize: ResponsiveHelper.responsiveFontSize(
                            context,
                            12,
                          ),
                          color: isSelected ? Colors.white : Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  String _getWeekdayText(DateTime date) {
    const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return weekdays[date.weekday % 7];
  }

  String _getMonthText(DateTime date) {
    const months = [
      'Th1',
      'Th2',
      'Th3',
      'Th4',
      'Th5',
      'Th6',
      'Th7',
      'Th8',
      'Th9',
      'Th10',
      'Th11',
      'Th12',
    ];
    return months[date.month - 1];
  }
}
