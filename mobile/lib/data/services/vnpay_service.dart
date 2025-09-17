import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mobile/core/constants/app_api.dart';

class VNPayService {
  // Tạo link thanh toán VNPay cho mobile
  static Future<Map<String, dynamic>> createPaymentUrl({
    required double amount,
    required String orderInfo,
    List<Map<String, dynamic>>? cart,
    String? address,
    String? mobile,
    String? email,
    String? firstname,
    String? lastname,
    int? orderId,
  }) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token == null) {
        return {'success': false, 'message': 'Bạn chưa đăng nhập'};
      }

      final response = await http.post(
        Uri.parse(AppAPI.createVNPayPaymentUrlMobile),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'amount': amount,
          'orderInfo': orderInfo,
          if (cart != null) 'cart': cart,
          if (address != null) 'address': address,
          if (mobile != null) 'mobile': mobile,
          if (email != null) 'email': email,
          if (firstname != null) 'firstname': firstname,
          if (lastname != null) 'lastname': lastname,
          if (orderId != null) 'orderId': orderId,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        return {
          'success': true,
          'paymentUrl': data['paymentUrl'],
          'orderId': data['orderId'],
          'message': data['message'],
        };
      } else {
        return {
          'success': false,
          'message': data['message'] ?? 'Không thể tạo link thanh toán',
        };
      }
    } catch (e) {
      return {'success': false, 'message': 'Lỗi kết nối: $e'};
    }
  }

  // Cập nhật trạng thái thanh toán
  static Future<Map<String, dynamic>> updatePaymentStatus({
    required int orderId,
    required String paymentStatus,
  }) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token == null) {
        return {'success': false, 'message': 'Bạn chưa đăng nhập'};
      }

      final response = await http.put(
        Uri.parse(AppAPI.updatePaymentStatus(orderId)),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({'paymentStatus': paymentStatus}),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        return {
          'success': true,
          'message': data['message'],
          'orderId': data['orderId'],
          'paymentStatus': data['paymentStatus'],
        };
      } else {
        return {
          'success': false,
          'message':
              data['message'] ?? 'Không thể cập nhật trạng thái thanh toán',
        };
      }
    } catch (e) {
      return {'success': false, 'message': 'Lỗi kết nối: $e'};
    }
  }
}
