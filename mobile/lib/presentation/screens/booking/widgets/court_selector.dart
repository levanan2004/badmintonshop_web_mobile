import 'package:flutter/material.dart';
import '../../../../data/models/court_model.dart';
import '../../../../utils/responsive_helper.dart';
import '../../../../utils/price_utils.dart';

class CourtSelector extends StatelessWidget {
  final List<CourtModel> courts;
  final CourtModel? selectedCourt;
  final Function(CourtModel) onCourtSelected;

  const CourtSelector({
    super.key,
    required this.courts,
    required this.selectedCourt,
    required this.onCourtSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Chọn Sân',
          style: TextStyle(
            fontSize: ResponsiveHelper.responsiveFontSize(context, 18),
            fontWeight: FontWeight.bold,
          ),
        ),
        SizedBox(height: ResponsiveHelper.responsiveHeight(context, 1)),
        if (courts.isEmpty)
          Container(
            width: double.infinity,
            padding: ResponsiveHelper.responsivePadding(context, all: 16),
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              'Vui lòng chọn chi nhánh trước',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.grey,
                fontSize: ResponsiveHelper.responsiveFontSize(context, 14),
              ),
            ),
          )
        else
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: ResponsiveHelper.getOptimalGridCount(
                context,
                minItemWidth: 140,
                maxColumns: 3,
                minColumns: 2,
              ),
              crossAxisSpacing: 8,
              mainAxisSpacing: 8,
              childAspectRatio: ResponsiveHelper.isSmallPhone(context)
                  ? 2.0
                  : 2.5,
            ),
            itemCount: courts.length,
            itemBuilder: (context, index) {
              final court = courts[index];
              final isSelected = selectedCourt?.courtId == court.courtId;

              return GestureDetector(
                onTap: () => onCourtSelected(court),
                child: Container(
                  constraints: ResponsiveHelper.safeContainerConstraints(
                    context,
                    maxWidthPercentage: 45,
                    maxHeightPercentage: 12,
                  ),
                  padding: EdgeInsets.all(
                    ResponsiveHelper.isSmallPhone(context) ? 8 : 12,
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
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Flexible(
                        child: Text(
                          court.courtName,
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: isSelected ? Colors.white : Colors.black,
                            fontSize: ResponsiveHelper.responsiveFontSize(
                              context,
                              ResponsiveHelper.isSmallPhone(context) ? 12 : 14,
                            ),
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      SizedBox(
                        height: ResponsiveHelper.isSmallPhone(context) ? 2 : 4,
                      ),
                      Flexible(
                        child: Text(
                          '${PriceUtils.formatPrice(court.pricePerHour)}/giờ',
                          style: TextStyle(
                            fontSize: ResponsiveHelper.responsiveFontSize(
                              context,
                              ResponsiveHelper.isSmallPhone(context) ? 10 : 12,
                            ),
                            color: isSelected
                                ? Colors.white70
                                : Colors.grey[600],
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
      ],
    );
  }
}
