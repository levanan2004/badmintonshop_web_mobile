import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/domain/entities/cart_item.dart';
import 'package:mobile/domain/entities/product.dart';

abstract class CartEvent {}

class AddToCart extends CartEvent {
  final Product product;
  AddToCart(this.product);
}

class RemoveFromCart extends CartEvent {
  final Product product;
  RemoveFromCart(this.product);
}

class ChangeQuantity extends CartEvent {
  final Product product;
  final int quantity;
  ChangeQuantity(this.product, this.quantity);
}

class CartState {
  final List<CartItem> items;
  CartState(this.items);
}

class CartBloc extends Bloc<CartEvent, CartState> {
  CartBloc() : super(CartState([])) {
    on<AddToCart>((event, emit) {
      final items = List<CartItem>.from(state.items);
      final idx = items.indexWhere((e) => e.product.id == event.product.id);
      if (idx >= 0) {
        items[idx].quantity++;
      } else {
        items.add(CartItem(product: event.product));
      }
      emit(CartState(items));
    });
    on<RemoveFromCart>((event, emit) {
      final items = state.items
          .where((e) => e.product.id != event.product.id)
          .toList();
      emit(CartState(items));
    });
    on<ChangeQuantity>((event, emit) {
      final items = List<CartItem>.from(state.items);
      final idx = items.indexWhere((e) => e.product.id == event.product.id);
      if (idx >= 0) {
        items[idx].quantity = event.quantity;
        if (event.quantity <= 0) items.removeAt(idx);
      }
      emit(CartState(items));
    });
  }
}
