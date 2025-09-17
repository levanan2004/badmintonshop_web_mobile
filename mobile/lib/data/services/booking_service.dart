import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/branch_model.dart';
import '../models/court_model.dart';
import '../models/timeslot_model.dart';
import '../models/booking_model.dart';
import '../../core/constants/app_api.dart';

class BookingService {
  static String get baseUrl => AppAPI.baseUrl;

  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    print(
      '🔍 [BookingService] Current token: ${token != null ? '***EXISTS***' : 'NULL'}',
    );
    return token;
  }

  Future<bool> _isTokenValid() async {
    final token = await _getToken();
    if (token == null) {
      print('❌ [BookingService] No token found');
      return false;
    }

    // Add basic token validation here if needed
    // For now, just check if token exists
    return true;
  }

  Future<Map<String, String>> _getHeaders() async {
    final token = await _getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // Helper method to handle API responses and token expiration
  Future<Map<String, dynamic>> _handleResponse(http.Response response) async {
    final data = json.decode(response.body);

    if (response.statusCode == 401) {
      print('❌ [BookingService] Token expired or invalid');
      // Clear the token
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('token');
      return {
        'success': false,
        'message': 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
        'tokenExpired': true,
      };
    }

    return data;
  }

  // Lấy danh sách chi nhánh
  Future<List<BranchModel>> getBranches() async {
    try {
      print('🔄 [BookingService] Calling getBranches API...');
      final headers = await _getHeaders();
      print('📤 [BookingService] Headers: $headers');

      final response = await http.get(
        Uri.parse(AppAPI.branches),
        headers: headers,
      );

      print(
        '📥 [BookingService] getBranches Response Status: ${response.statusCode}',
      );
      print('📥 [BookingService] getBranches Response Body: ${response.body}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        print('🔍 [BookingService] Parsed data type: ${data.runtimeType}');
        print('🔍 [BookingService] Parsed data: $data');

        // Server trả về array trực tiếp, không wrap trong object
        if (data is List) {
          print('✅ [BookingService] Branches data: $data');
          final result = data
              .map((json) => BranchModel.fromJson(json))
              .toList();
          print('✅ [BookingService] Parsed ${result.length} branches');
          return result;
        }
      }
      throw Exception(
        'Failed to load branches - Status: ${response.statusCode}',
      );
    } catch (e) {
      print('❌ [BookingService] getBranches Error: $e');
      throw Exception('Error: $e');
    }
  }

  // Lấy danh sách sân theo chi nhánh
  Future<List<CourtModel>> getCourtsByBranch(int branchId) async {
    try {
      print(
        '🔄 [BookingService] Calling getCourtsByBranch API with branchId: $branchId',
      );
      final headers = await _getHeaders();
      final response = await http.get(
        Uri.parse('$baseUrl/courts?branchId=$branchId'),
        headers: headers,
      );

      print(
        '📥 [BookingService] getCourtsByBranch Response Status: ${response.statusCode}',
      );
      print(
        '📥 [BookingService] getCourtsByBranch Response Body: ${response.body}',
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        print('🔍 [BookingService] Courts data type: ${data.runtimeType}');
        print('🔍 [BookingService] Courts data: $data');

        // Server trả về array trực tiếp, không wrap trong object
        if (data is List) {
          final result = data.map((json) => CourtModel.fromJson(json)).toList();
          print('✅ [BookingService] Parsed ${result.length} courts');
          return result;
        }
      }
      throw Exception('Failed to load courts - Status: ${response.statusCode}');
    } catch (e) {
      print('❌ [BookingService] getCourtsByBranch Error: $e');
      throw Exception('Error: $e');
    }
  }

  // Lấy danh sách khung giờ
  Future<List<TimeSlotModel>> getTimeSlots() async {
    try {
      print('🔄 [BookingService] Calling getTimeSlots API...');
      final headers = await _getHeaders();
      final response = await http.get(
        Uri.parse(AppAPI.timeSlots),
        headers: headers,
      );

      print(
        '📥 [BookingService] getTimeSlots Response Status: ${response.statusCode}',
      );
      print('📥 [BookingService] getTimeSlots Response Body: ${response.body}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        print('🔍 [BookingService] TimeSlots data type: ${data.runtimeType}');
        print('🔍 [BookingService] TimeSlots data: $data');

        // Server trả về array trực tiếp, không wrap trong object
        if (data is List) {
          final result = data
              .map((json) => TimeSlotModel.fromJson(json))
              .toList();
          print('✅ [BookingService] Parsed ${result.length} time slots');
          return result;
        }
      }
      throw Exception(
        'Failed to load time slots - Status: ${response.statusCode}',
      );
    } catch (e) {
      print('❌ [BookingService] getTimeSlots Error: $e');
      throw Exception('Error: $e');
    }
  }

  // Lấy danh sách slot đã được đặt
  Future<List<Map<String, dynamic>>> getBookedSlots(
    int courtId,
    String date,
  ) async {
    try {
      print(
        '🔄 [BookingService] Calling getBookedSlots API with courtId: $courtId, date: $date',
      );
      final headers = await _getHeaders();
      final response = await http.get(
        Uri.parse('$baseUrl/booked-slots?courtId=$courtId&date=$date'),
        headers: headers,
      );

      print(
        '📥 [BookingService] getBookedSlots Response Status: ${response.statusCode}',
      );
      print(
        '📥 [BookingService] getBookedSlots Response Body: ${response.body}',
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        print('🔍 [BookingService] BookedSlots data type: ${data.runtimeType}');
        print('🔍 [BookingService] BookedSlots data: $data');

        // Server trả về array trực tiếp, không wrap trong object
        if (data is List) {
          final result = List<Map<String, dynamic>>.from(data);
          print('✅ [BookingService] Found ${result.length} booked slots');
          return result;
        }
      }
      print('⚠️ [BookingService] No booked slots found, returning empty list');
      return [];
    } catch (e) {
      print('❌ [BookingService] getBookedSlots Error: $e');
      return [];
    }
  }

  // Tạo booking
  Future<Map<String, dynamic>> createBooking({
    required String customerName,
    required String customerEmail,
    required String customerPhone,
    required List<BookingSlot> slots,
  }) async {
    try {
      print('🔄 [BookingService] Calling createBooking API...');

      // Check if token is valid first
      if (!await _isTokenValid()) {
        return {
          'success': false,
          'message': 'Vui lòng đăng nhập để đặt sân.',
          'tokenExpired': true,
        };
      }

      final headers = await _getHeaders();
      print('📤 [BookingService] Headers: $headers');

      // Parse name to firstname and lastname
      final nameParts = customerName.trim().split(' ');
      final firstname = nameParts.first;
      final lastname = nameParts.length > 1
          ? nameParts.sublist(1).join(' ')
          : '';

      // Convert slots to server format
      final bookings = slots
          .map(
            (slot) => {
              'CourtId': slot.courtId,
              'TimeSlotId': slot.timeSlotId,
              'BookingDate': slot.date.toIso8601String().split(
                'T',
              )[0], // YYYY-MM-DD format
            },
          )
          .toList();

      final requestBody = {
        'bookings': bookings,
        'firstname': firstname,
        'lastname': lastname,
        'mobile': customerPhone,
        'email': customerEmail,
      };

      print('📤 [BookingService] Request body: ${json.encode(requestBody)}');

      final response = await http.post(
        Uri.parse('$baseUrl/booking'),
        headers: headers,
        body: json.encode(requestBody),
      );

      print(
        '📥 [BookingService] createBooking Response Status: ${response.statusCode}',
      );
      print(
        '📥 [BookingService] createBooking Response Body: ${response.body}',
      );

      final data = await _handleResponse(response);
      print('🔍 [BookingService] Parsed response data: $data');

      // Check if token expired
      if (data['tokenExpired'] == true) {
        return data;
      }

      if (response.statusCode == 201 || response.statusCode == 200) {
        print('✅ [BookingService] Booking created successfully');
        return {
          'success': true,
          'message': data['message'] ?? 'Booking created successfully',
          'data': data['data'],
        };
      } else {
        print(
          '❌ [BookingService] Booking creation failed with status: ${response.statusCode}',
        );
        return {
          'success': false,
          'message': data['message'] ?? 'Failed to create booking',
        };
      }
    } catch (e) {
      print('❌ [BookingService] createBooking Error: $e');
      return {'success': false, 'message': 'Error: $e'};
    }
  }

  // Lấy lịch sử đặt sân
  Future<List<BookingModel>> getBookingHistory() async {
    try {
      print('🔄 [BookingService] Calling getBookingHistory API...');
      final headers = await _getHeaders();
      final response = await http.get(
        Uri.parse('$baseUrl/booking-history'),
        headers: headers,
      );

      print(
        '📥 [BookingService] getBookingHistory Response Status: ${response.statusCode}',
      );
      print(
        '📥 [BookingService] getBookingHistory Response Body: ${response.body}',
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        print(
          '🔍 [BookingService] BookingHistory data type: ${data.runtimeType}',
        );
        print('🔍 [BookingService] BookingHistory data: $data');

        // Server returns { "bookings": [...] } format
        if (data['bookings'] != null) {
          final List<dynamic> bookingsJson = data['bookings'];
          final result = bookingsJson
              .map((json) => BookingModel.fromJson(json))
              .toList();
          print(
            '✅ [BookingService] Parsed ${result.length} booking history items',
          );
          return result;
        }
      }
      print(
        '⚠️ [BookingService] No booking history found, returning empty list',
      );
      return [];
    } catch (e) {
      print('❌ [BookingService] getBookingHistory Error: $e');
      return [];
    }
  }

  // Hủy booking
  Future<bool> cancelBookings(List<int> bookingIds) async {
    try {
      print('🔄 [BookingService] Cancelling bookings: $bookingIds');
      final headers = await _getHeaders();
      final response = await http.put(
        Uri.parse('$baseUrl/booking/cancel-many'),
        headers: headers,
        body: json.encode({'bookingIds': bookingIds}),
      );

      print(
        '📥 [BookingService] Cancel response status: ${response.statusCode}',
      );
      print('📥 [BookingService] Cancel response body: ${response.body}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        print('🔍 [BookingService] Cancel response data: $data');

        // Kiểm tra các format response có thể có
        if (data is Map<String, dynamic>) {
          if (data.containsKey('success')) {
            final success = data['success'] == true;
            print(
              '✅ [BookingService] Cancel success (from success field): $success',
            );
            return success;
          } else if (data.containsKey('message')) {
            // Nếu có message mà không có success, coi như thành công
            print(
              '✅ [BookingService] Cancel success (from message field): true',
            );
            return true;
          }
        }

        // Nếu status 200 nhưng không có success field, coi như thành công
        print('✅ [BookingService] Cancel success (status 200): true');
        return true;
      }

      print(
        '❌ [BookingService] Cancel failed with status: ${response.statusCode}',
      );
      return false;
    } catch (e) {
      print('❌ [BookingService] Error canceling bookings: $e');
      return false;
    }
  }
}
