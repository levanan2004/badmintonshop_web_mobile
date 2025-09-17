import 'package:flutter/material.dart';

class ResponsiveHelper {
  // Get device info
  static Size getScreenSize(BuildContext context) {
    return MediaQuery.of(context).size;
  }

  static double screenWidth(BuildContext context) {
    return MediaQuery.of(context).size.width;
  }

  static double screenHeight(BuildContext context) {
    return MediaQuery.of(context).size.height;
  }

  // Safe area dimensions
  static double safeAreaWidth(BuildContext context) {
    final mediaQuery = MediaQuery.of(context);
    return mediaQuery.size.width -
        mediaQuery.padding.left -
        mediaQuery.padding.right;
  }

  static double safeAreaHeight(BuildContext context) {
    final mediaQuery = MediaQuery.of(context);
    return mediaQuery.size.height -
        mediaQuery.padding.top -
        mediaQuery.padding.bottom;
  }

  // Responsive dimensions with constraints
  static double responsiveWidth(BuildContext context, double percentage) {
    final width = safeAreaWidth(context) * percentage / 100;
    return width.clamp(0.0, safeAreaWidth(context));
  }

  static double responsiveHeight(BuildContext context, double percentage) {
    final height = safeAreaHeight(context) * percentage / 100;
    return height.clamp(0.0, safeAreaHeight(context));
  }

  // Improved font sizing with min/max constraints
  static double responsiveFontSize(BuildContext context, double size) {
    final screenWidth = safeAreaWidth(context);
    const baseWidth = 375.0;
    final scaledSize = size * (screenWidth / baseWidth);

    // Apply min/max constraints to prevent too small or too large fonts
    return scaledSize.clamp(size * 0.8, size * 1.3);
  }

  // Better padding calculation
  static EdgeInsets responsivePadding(
    BuildContext context, {
    double? horizontal,
    double? vertical,
    double? all,
    double? left,
    double? right,
    double? top,
    double? bottom,
  }) {
    final screenWidth = safeAreaWidth(context);
    final scaleFactor = (screenWidth / 375.0).clamp(0.8, 1.2);

    return EdgeInsets.only(
      left: (left ?? horizontal ?? all ?? 0) * scaleFactor,
      right: (right ?? horizontal ?? all ?? 0) * scaleFactor,
      top: (top ?? vertical ?? all ?? 0) * scaleFactor,
      bottom: (bottom ?? vertical ?? all ?? 0) * scaleFactor,
    );
  }

  // Device type detection
  static bool isSmallPhone(BuildContext context) {
    return screenWidth(context) < 360;
  }

  static bool isTablet(BuildContext context) {
    return screenWidth(context) >= 600;
  }

  static bool isDesktop(BuildContext context) {
    return screenWidth(context) >= 1200;
  }

  // Grid calculations with safety
  static int getOptimalGridCount(
    BuildContext context, {
    double minItemWidth = 120,
    int maxColumns = 4,
    int minColumns = 2,
  }) {
    final availableWidth = safeAreaWidth(context) - 32; // Account for padding
    final columns = (availableWidth / minItemWidth).floor();
    return columns.clamp(minColumns, maxColumns);
  }

  // Safe container sizing
  static BoxConstraints safeContainerConstraints(
    BuildContext context, {
    double? maxWidthPercentage,
    double? maxHeightPercentage,
  }) {
    return BoxConstraints(
      maxWidth: maxWidthPercentage != null
          ? responsiveWidth(context, maxWidthPercentage)
          : double.infinity,
      maxHeight: maxHeightPercentage != null
          ? responsiveHeight(context, maxHeightPercentage)
          : double.infinity,
    );
  }

  // Spacing utilities
  static SizedBox verticalSpace(BuildContext context, double percentage) {
    return SizedBox(height: responsiveHeight(context, percentage));
  }

  static SizedBox horizontalSpace(BuildContext context, double percentage) {
    return SizedBox(width: responsiveWidth(context, percentage));
  }
}
