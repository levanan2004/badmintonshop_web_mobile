import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

class SearchWidget extends StatelessWidget {
  final TextEditingController? controller;
  final VoidCallback? onSearch;
  final String? hintText;

  const SearchWidget({
    super.key,
    this.controller,
    this.onSearch,
    this.hintText,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        border: Border.all(color: AppColors.primary, width: 2),
        borderRadius: BorderRadius.circular(12),
        color: Colors.white,
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: controller,
              onSubmitted: (_) => onSearch?.call(),
              decoration: InputDecoration(
                hintText: hintText ?? 'Tìm kiếm sản phẩm...',
                border: InputBorder.none,
                isDense: true,
              ),
            ),
          ),
          SizedBox(
            height: 36,
            child: ElevatedButton(
              onPressed: onSearch,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 16),
                elevation: 0,
              ),
              child: const Text(
                'Tìm',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
