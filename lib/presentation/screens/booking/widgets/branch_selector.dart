import 'package:flutter/material.dart';
import '../../../../data/models/branch_model.dart';
import '../../../../utils/responsive_helper.dart';

class BranchSelector extends StatelessWidget {
  final List<BranchModel> branches;
  final BranchModel? selectedBranch;
  final Function(BranchModel) onBranchSelected;

  const BranchSelector({
    super.key,
    required this.branches,
    required this.selectedBranch,
    required this.onBranchSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Chọn Chi Nhánh',
          style: TextStyle(
            fontSize: ResponsiveHelper.responsiveFontSize(context, 18),
            fontWeight: FontWeight.bold,
          ),
        ),
        SizedBox(height: ResponsiveHelper.responsiveHeight(context, 1)),
        Container(
          width: double.infinity,
          padding: ResponsiveHelper.responsivePadding(context, horizontal: 12),
          decoration: BoxDecoration(
            border: Border.all(color: Colors.grey.shade300),
            borderRadius: BorderRadius.circular(8),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<BranchModel>(
              value: selectedBranch,
              hint: Text(
                'Chọn chi nhánh',
                style: TextStyle(
                  fontSize: ResponsiveHelper.responsiveFontSize(context, 14),
                ),
              ),
              isExpanded: true,
              items: branches.map((branch) {
                return DropdownMenuItem<BranchModel>(
                  value: branch,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        branch.branchName,
                        style: TextStyle(
                          fontWeight: FontWeight.w500,
                          fontSize: ResponsiveHelper.responsiveFontSize(
                            context,
                            14,
                          ),
                        ),
                      ),
                      Text(
                        branch.location,
                        style: TextStyle(
                          fontSize: ResponsiveHelper.responsiveFontSize(
                            context,
                            12,
                          ),
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
              onChanged: (branch) {
                if (branch != null) {
                  onBranchSelected(branch);
                }
              },
            ),
          ),
        ),
      ],
    );
  }
}
