import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

class FilterKeywordsWidget extends StatelessWidget {
  final List<String> keywords;
  final void Function(String) onKeywordTap;
  final String? selected;

  const FilterKeywordsWidget({
    super.key,
    required this.keywords,
    required this.onKeywordTap,
    this.selected,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: keywords.map((keyword) {
          final bool isSelected = keyword == selected;
          return Padding(
            padding: const EdgeInsets.only(right: 8.0),
            child: ChoiceChip(
              label: Text(
                keyword,
                style: TextStyle(
                  color: isSelected ? Colors.white : AppColors.primary,
                  fontWeight: FontWeight.w600,
                ),
              ),
              selected: isSelected,
              selectedColor: AppColors.primary,
              backgroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: BorderSide(color: AppColors.primary, width: 1.5),
              ),
              onSelected: (_) => onKeywordTap(keyword),
            ),
          );
        }).toList(),
      ),
    );
  }
}
