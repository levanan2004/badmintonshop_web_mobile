import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../core/constants/app_api.dart';
import '../models/shoe_size_model.dart';

class ShoeSizeService {
  // Fetch shoe sizes for a specific product
  Future<List<ShoeSizeModel>> getShoeSizesByProductId(int productId) async {
    try {
      final response = await http.get(
        Uri.parse('${AppAPI.baseUrl}/shoesize/product/$productId'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => ShoeSizeModel.fromJson(json)).toList();
      } else {
        // Fallback to mock data if API fails
        return getMockShoeSizes(productId);
      }
    } catch (e) {
      // Fallback to mock data if connection fails
      return getMockShoeSizes(productId);
    }
  }

  // Fetch all shoe sizes
  Future<List<ShoeSizeModel>> getAllShoeSizes() async {
    try {
      final response = await http.get(
        Uri.parse('${AppAPI.baseUrl}/shoesize'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => ShoeSizeModel.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load shoe sizes: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching shoe sizes: $e');
    }
  }

  // Mock data cho shoe sizes - fallback khi server không hoạt động
  List<ShoeSizeModel> getMockShoeSizes(int productId) {
    // Chỉ productId = 9 mới có size data (như trong database thật)
    if (productId == 9) {
      return [
        ShoeSizeModel(
          shoeSizeId: 7,
          productId: productId,
          size: '40',
          quantity: 2,
        ),
        ShoeSizeModel(
          shoeSizeId: 8,
          productId: productId,
          size: '44',
          quantity: 4,
        ),
        ShoeSizeModel(
          shoeSizeId: 9,
          productId: productId,
          size: '43',
          quantity: 1,
        ),
      ];
    }
    // Các product khác không có size data
    return [];
  }

  // Kiểm tra xem product có size data hay không
  Future<bool> hasShoeSize(int productId) async {
    try {
      final sizes = await getShoeSizesByProductId(productId);
      return sizes.isNotEmpty;
    } catch (e) {
      return false;
    }
  }

  // Lấy sizes có sẵn cho một product (chỉ trả về size có quantity > 0)
  List<ShoeSizeModel> getAvailableSizes(
    int productId,
    List<ShoeSizeModel> allSizes,
  ) {
    return allSizes.where((size) => size.quantity > 0).toList();
  }
}
