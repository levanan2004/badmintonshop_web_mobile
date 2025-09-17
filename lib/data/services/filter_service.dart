import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../core/constants/app_api.dart';
import '../models/brand_model.dart';
import '../models/category_model.dart';

class FilterService {
  // Fetch all brands
  Future<List<BrandModel>> getAllBrands() async {
    try {
      final response = await http.get(
        Uri.parse(AppAPI.brands),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => BrandModel.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load brands: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching brands: $e');
    }
  }

  // Fetch all categories
  Future<List<CategoryModel>> getAllCategories() async {
    try {
      final response = await http.get(
        Uri.parse(AppAPI.categories),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => CategoryModel.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load categories: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching categories: $e');
    }
  }
}
