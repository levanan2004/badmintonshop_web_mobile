import 'package:flutter/material.dart';
import '../../../../data/models/brand_model.dart';
import '../../../../data/models/category_model.dart';

class ProductFilterWidget extends StatefulWidget {
  final List<BrandModel> brands;
  final List<CategoryModel> categories;
  final List<int> selectedBrands;
  final List<int> selectedCategories;
  final RangeValues priceRange;
  final double minPrice;
  final double maxPrice;
  final Function(List<int>) onBrandChanged;
  final Function(List<int>) onCategoryChanged;
  final Function(RangeValues) onPriceChanged;
  final VoidCallback onReset;

  const ProductFilterWidget({
    super.key,
    required this.brands,
    required this.categories,
    required this.selectedBrands,
    required this.selectedCategories,
    required this.priceRange,
    required this.minPrice,
    required this.maxPrice,
    required this.onBrandChanged,
    required this.onCategoryChanged,
    required this.onPriceChanged,
    required this.onReset,
  });

  @override
  State<ProductFilterWidget> createState() => _ProductFilterWidgetState();
}

class _ProductFilterWidgetState extends State<ProductFilterWidget> {
  bool _isExpanded = false;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          // Header
          InkWell(
            onTap: () => setState(() => _isExpanded = !_isExpanded),
            child: Container(
              padding: const EdgeInsets.all(16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Bộ lọc',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  Row(
                    children: [
                      if (_hasActiveFilters())
                        GestureDetector(
                          onTap: widget.onReset,
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.red.shade100,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Text(
                              'Xóa bộ lọc',
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.red,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ),
                      const SizedBox(width: 8),
                      Icon(
                        _isExpanded
                            ? Icons.keyboard_arrow_up
                            : Icons.keyboard_arrow_down,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          // Filter Content
          if (_isExpanded)
            Container(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Divider(height: 1),
                  const SizedBox(height: 16),

                  // Categories Filter
                  _buildSectionTitle('Loại sản phẩm'),
                  const SizedBox(height: 8),
                  _buildCategoryFilters(),
                  const SizedBox(height: 16),

                  // Brands Filter
                  _buildSectionTitle('Thương hiệu'),
                  const SizedBox(height: 8),
                  _buildBrandFilters(),
                  const SizedBox(height: 16),

                  // Price Filter
                  _buildSectionTitle('Khoảng giá'),
                  const SizedBox(height: 8),
                  _buildPriceFilter(),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        color: Colors.black87,
      ),
    );
  }

  Widget _buildCategoryFilters() {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: widget.categories.map((category) {
        final isSelected = widget.selectedCategories.contains(
          category.categoryId,
        );
        return FilterChip(
          label: Text(category.categoryName),
          selected: isSelected,
          onSelected: (selected) {
            List<int> newSelected = List.from(widget.selectedCategories);
            if (selected) {
              newSelected.add(category.categoryId!);
            } else {
              newSelected.remove(category.categoryId);
            }
            widget.onCategoryChanged(newSelected);
          },
          selectedColor: Colors.blue.shade100,
          checkmarkColor: Colors.blue,
        );
      }).toList(),
    );
  }

  Widget _buildBrandFilters() {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: widget.brands.map((brand) {
        final isSelected = widget.selectedBrands.contains(brand.brandId);
        return FilterChip(
          label: Text(brand.brandName),
          selected: isSelected,
          onSelected: (selected) {
            List<int> newSelected = List.from(widget.selectedBrands);
            if (selected) {
              newSelected.add(brand.brandId!);
            } else {
              newSelected.remove(brand.brandId);
            }
            widget.onBrandChanged(newSelected);
          },
          selectedColor: Colors.green.shade100,
          checkmarkColor: Colors.green,
        );
      }).toList(),
    );
  }

  Widget _buildPriceFilter() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        RangeSlider(
          values: widget.priceRange,
          min: widget.minPrice,
          max: widget.maxPrice,
          divisions: 20,
          labels: RangeLabels(
            _formatPrice(widget.priceRange.start),
            _formatPrice(widget.priceRange.end),
          ),
          onChanged: widget.onPriceChanged,
        ),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Từ: ${_formatPrice(widget.priceRange.start)}',
              style: const TextStyle(fontSize: 12, color: Colors.grey),
            ),
            Text(
              'Đến: ${_formatPrice(widget.priceRange.end)}',
              style: const TextStyle(fontSize: 12, color: Colors.grey),
            ),
          ],
        ),
      ],
    );
  }

  String _formatPrice(double price) {
    if (price >= 1000000) {
      return '${(price / 1000000).toStringAsFixed(1)}M';
    } else if (price >= 1000) {
      return '${(price / 1000).toStringAsFixed(0)}K';
    }
    return price.toStringAsFixed(0);
  }

  bool _hasActiveFilters() {
    return widget.selectedBrands.isNotEmpty ||
        widget.selectedCategories.isNotEmpty ||
        (widget.priceRange.start > widget.minPrice ||
            widget.priceRange.end < widget.maxPrice);
  }
}
