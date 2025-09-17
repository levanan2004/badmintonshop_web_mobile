import 'package:flutter/material.dart';
import '../../../../data/models/specification_model.dart';

class SpecificationTable extends StatelessWidget {
  final List<SpecificationModel> specifications;
  const SpecificationTable({super.key, required this.specifications});

  @override
  Widget build(BuildContext context) {
    if (specifications.isEmpty) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 12),
        child: Text('Không có thông số kỹ thuật.'),
      );
    }
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: specifications.map((spec) => Row(
          children: [
            Expanded(
              flex: 2,
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                decoration: const BoxDecoration(
                  border: Border(
                    right: BorderSide(color: Color(0xffe0e0e0)),
                    bottom: BorderSide(color: Color(0xffe0e0e0)),
                  ),
                ),
                child: Text(spec.name, style: const TextStyle(fontWeight: FontWeight.w600)),
              ),
            ),
            Expanded(
              flex: 3,
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                decoration: const BoxDecoration(
                  border: Border(
                    bottom: BorderSide(color: Color(0xffe0e0e0)),
                  ),
                ),
                child: Text(spec.value),
              ),
            ),
          ],
        )).toList(),
      ),
    );
  }
}
