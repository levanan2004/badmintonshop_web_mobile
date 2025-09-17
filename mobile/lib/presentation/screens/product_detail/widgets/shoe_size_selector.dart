import 'package:flutter/material.dart';
import '../../../../data/models/shoe_size_model.dart';
import '../../../../data/services/shoe_size_service.dart';

class ShoeSizeSelector extends StatefulWidget {
  final int productId;
  final Function(String?) onSizeSelected;
  final String? initialSelectedSize;

  const ShoeSizeSelector({
    super.key,
    required this.productId,
    required this.onSizeSelected,
    this.initialSelectedSize,
  });

  @override
  State<ShoeSizeSelector> createState() => _ShoeSizeSelectorState();
}

class _ShoeSizeSelectorState extends State<ShoeSizeSelector> {
  List<ShoeSizeModel> shoeSizes = [];
  String? selectedSize;
  bool isLoading = true;
  final ShoeSizeService _shoeSizeService = ShoeSizeService();

  @override
  void initState() {
    super.initState();
    selectedSize = widget.initialSelectedSize;
    _loadShoeSizes();
  }

  Future<void> _loadShoeSizes() async {
    try {
      final sizes = await _shoeSizeService.getShoeSizesByProductId(
        widget.productId,
      );
      final availableSizes = _shoeSizeService.getAvailableSizes(
        widget.productId,
        sizes,
      );

      if (mounted) {
        setState(() {
          shoeSizes = availableSizes;
          isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Chọn size:',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 12),

        if (isLoading)
          const Center(
            child: Padding(
              padding: EdgeInsets.all(20),
              child: CircularProgressIndicator(),
            ),
          )
        else if (shoeSizes.isEmpty)
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.grey[100],
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Text(
              'Không có size nào có sẵn',
              style: TextStyle(color: Colors.grey),
            ),
          )
        else
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: shoeSizes.map((sizeModel) {
              final isSelected = selectedSize == sizeModel.size;
              final isAvailable = sizeModel.quantity > 0;

              return GestureDetector(
                onTap: isAvailable
                    ? () {
                        setState(() {
                          selectedSize = sizeModel.size;
                        });
                        widget.onSizeSelected(sizeModel.size);
                      }
                    : null,
                child: Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    color: !isAvailable
                        ? Colors.grey[200]
                        : isSelected
                        ? Colors.blue
                        : Colors.white,
                    border: Border.all(
                      color: !isAvailable
                          ? Colors.grey[300]!
                          : isSelected
                          ? Colors.blue
                          : Colors.grey[400]!,
                      width: isSelected ? 2 : 1,
                    ),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        sizeModel.size,
                        style: TextStyle(
                          color: !isAvailable
                              ? Colors.grey[400]
                              : isSelected
                              ? Colors.white
                              : Colors.black,
                          fontWeight: isSelected
                              ? FontWeight.bold
                              : FontWeight.normal,
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '(${sizeModel.quantity})',
                        style: TextStyle(
                          color: !isAvailable
                              ? Colors.grey[400]
                              : isSelected
                              ? Colors.white70
                              : Colors.grey[600],
                          fontSize: 10,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),

        const SizedBox(height: 8),

        if (selectedSize != null)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.green[50],
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: Colors.green[200]!),
            ),
            child: Text(
              'Đã chọn size: $selectedSize',
              style: TextStyle(
                color: Colors.green[700],
                fontSize: 12,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
      ],
    );
  }
}
