import 'package:flutter_bloc/flutter_bloc.dart';
import 'product_event.dart';
import 'product_state.dart';
import '../../data/models/product_model.dart';
import '../../core/constants/app_api.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

class ProductBloc extends Bloc<ProductEvent, ProductState> {
  ProductBloc() : super(ProductInitial()) {
    on<FetchProducts>(_onFetchProducts);
  }

  Future<void> _onFetchProducts(
    FetchProducts event,
    Emitter<ProductState> emit,
  ) async {
    emit(ProductLoading());
    try {
      final response = await http.get(Uri.parse(AppAPI.products));
      if (response.statusCode == 200) {
        final List<ProductModel> products = (json.decode(response.body) as List)
            .map((e) => ProductModel.fromJson(e))
            .toList();
        emit(ProductLoaded(products));
      } else {
        emit(ProductError('Lỗi server: \\${response.statusCode}'));
      }
    } catch (e) {
      emit(ProductError('Không thể kết nối server'));
    }
  }
}
