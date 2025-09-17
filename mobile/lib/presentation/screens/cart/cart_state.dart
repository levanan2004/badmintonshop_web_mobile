import 'package:flutter/material.dart';

class CartState {
  static void reset() {
    cart.clear();
    cartCount.value = 0;
  }

  static final ValueNotifier<int> cartCount = ValueNotifier<int>(0);
  static final List<Map<String, dynamic>> cart = [];

  static void addToCart(dynamic product, {String? selectedSize}) {
    // Tạo key unique để phân biệt cùng product nhưng khác size
    String cartKey = '${product.id}';
    if (selectedSize != null) {
      cartKey = '${product.id}_$selectedSize';
    }

    final idx = cart.indexWhere((e) => e['cartKey'] == cartKey);
    if (idx >= 0) {
      cart[idx]['quantity']++;
    } else {
      cart.add({
        'product': product,
        'quantity': 1,
        'selectedSize': selectedSize,
        'cartKey': cartKey,
      });
    }
    cartCount.value = cart.fold(0, (sum, e) => sum + e['quantity'] as int);
  }

  static void increaseQuantity(int index) {
    if (index >= 0 && index < cart.length) {
      cart[index]['quantity']++;
      cartCount.value = cart.fold(0, (sum, e) => sum + e['quantity'] as int);
    }
  }

  static void decreaseQuantity(int index) {
    if (index >= 0 && index < cart.length) {
      if (cart[index]['quantity'] > 1) {
        cart[index]['quantity']--;
      } else {
        cart.removeAt(index);
      }
      cartCount.value = cart.fold(0, (sum, e) => sum + e['quantity'] as int);
    }
  }

  static void removeItem(int index) {
    if (index >= 0 && index < cart.length) {
      cart.removeAt(index);
      cartCount.value = cart.fold(0, (sum, e) => sum + e['quantity'] as int);
    }
  }
}
