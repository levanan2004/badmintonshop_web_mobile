import 'package:intl/intl.dart';

class PriceUtils {
  // Format giá từ double sang string với định dạng VND
  static String formatPrice(double price) {
    final formatter = NumberFormat('#,###', 'vi_VN');
    return '${formatter.format(price)} VNĐ';
  }

  // Format giá từ int sang string với định dạng VND  
  static String formatPriceFromInt(int price) {
    final formatter = NumberFormat('#,###', 'vi_VN');
    return '${formatter.format(price)} VNĐ';
  }

  // Format giá với ký hiệu đ thay vì VNĐ
  static String formatPriceShort(double price) {
    final formatter = NumberFormat('#,###', 'vi_VN');
    return '${formatter.format(price)} đ';
  }

  // Format giá từ int với ký hiệu đ
  static String formatPriceShortFromInt(int price) {
    final formatter = NumberFormat('#,###', 'vi_VN');
    return '${formatter.format(price)} đ';
  }

  // Format giá cho display với độ chính xác decimal
  static String formatPriceWithDecimals(double price) {
    final formatter = NumberFormat('#,##0.00', 'vi_VN');
    return '${formatter.format(price)} VNĐ';
  }

  // Parse string price về double (loại bỏ dấu phân cách và ký hiệu)
  static double parsePrice(String priceString) {
    // Loại bỏ tất cả ký tự không phải số và dấu thập phân
    String cleanPrice = priceString.replaceAll(RegExp(r'[^\d.]'), '');
    return double.tryParse(cleanPrice) ?? 0.0;
  }

  // Kiểm tra xem giá có hợp lệ không
  static bool isValidPrice(double price) {
    return price > 0 && price.isFinite;
  }

  // Format giá cho discount/sale
  static String formatDiscountPrice(double originalPrice, double discountedPrice) {
    final formatter = NumberFormat('#,###', 'vi_VN');
    return '${formatter.format(discountedPrice)} đ (Giảm từ ${formatter.format(originalPrice)} đ)';
  }

  // Tính phần trăm giảm giá
  static String calculateDiscountPercentage(double originalPrice, double discountedPrice) {
    if (originalPrice <= 0) return '0%';
    double discountPercent = ((originalPrice - discountedPrice) / originalPrice) * 100;
    return '${discountPercent.toStringAsFixed(0)}%';
  }

  // Format giá cho total trong cart
  static String formatTotal(double total) {
    final formatter = NumberFormat('#,###', 'vi_VN');
    return 'Tổng cộng: ${formatter.format(total)} VNĐ';
  }

  // Format giá ngắn gọn cho hiển thị trong list
  static String formatCompactPrice(double price) {
    final formatter = NumberFormat.compact(locale: 'vi_VN');
    return '${formatter.format(price)} đ';
  }
}
