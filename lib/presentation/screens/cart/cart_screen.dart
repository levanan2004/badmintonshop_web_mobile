import 'package:flutter/material.dart';
import 'package:mobile/data/models/product_model.dart';
import 'package:mobile/core/constants/app_api.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../utils/price_utils.dart';
import 'cart_state.dart';
import '../checkout/checkout_screen.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  String? _token;
  late List<Map<String, dynamic>> cart;

  @override
  void initState() {
    super.initState();
    // Lấy cart trực tiếp từ CartState thay vì từ parameter
    _refreshCart();
    _loadToken();
  }

  void _refreshCart() {
    setState(() {
      cart = List.from(CartState.cart);
    });
  }

  @override
  void didUpdateWidget(CartScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    // Refresh cart khi widget được update
    _refreshCart();
  }

  Future<void> _loadToken() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _token = prefs.getString('token');
    });
  }

  bool get isLoggedIn => _token != null && _token!.isNotEmpty;

  double get total {
    return cart.fold<double>(
      0,
      (sum, item) => sum + (item['product'].price * item['quantity']),
    );
  }

  void _goToCheckout() async {
    // Log token để kiểm tra
    print('[CartScreen] Token hiện tại: \x1B[32m\x1B[1m$_token\x1B[0m');
    print('[CartScreen] Cart hiện tại: ' + cart.toString());
    if (!isLoggedIn) {
      showDialog(
        context: context,
        builder: (_) => AlertDialog(
          title: const Text('Bạn hãy đăng nhập để đặt hàng!'),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                Navigator.of(context).pushNamed('/login');
              },
              child: const Text('Đăng nhập'),
            ),
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Hủy'),
            ),
          ],
        ),
      );
    } else if (_token == null || _token!.isEmpty) {
      // Nếu token null/rỗng, yêu cầu đăng nhập lại
      print('[CartScreen] Token null hoặc rỗng, yêu cầu đăng nhập lại!');
      showDialog(
        context: context,
        builder: (_) => AlertDialog(
          title: const Text('Phiên đăng nhập đã hết hạn!'),
          content: const Text('Vui lòng đăng nhập lại để tiếp tục.'),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                Navigator.of(context).pushNamed('/login');
              },
              child: const Text('Đăng nhập'),
            ),
          ],
        ),
      );
    } else {
      print(
        '[CartScreen] Điều hướng sang màn hình Checkout với token: $_token',
      );
      Navigator.of(
        context,
      ).push(MaterialPageRoute(builder: (_) => CheckoutScreen(cart: cart)));
    }
  }

  void increase(int index) {
    setState(() {
      // Cập nhật cả local cart và CartState
      cart[index]['quantity']++;
      CartState.increaseQuantity(index);
    });
  }

  void decrease(int index) {
    setState(() {
      if (cart[index]['quantity'] > 1) {
        cart[index]['quantity']--;
        CartState.decreaseQuantity(index);
      } else {
        cart.removeAt(index);
        CartState.removeItem(index);
      }
    });
  }

  void remove(int index) {
    setState(() {
      cart.removeAt(index);
      CartState.removeItem(index);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Giỏ hàng'),
        centerTitle: true,
        backgroundColor: Colors.white,
        elevation: 0.5,
        iconTheme: const IconThemeData(color: Colors.black),
        titleTextStyle: const TextStyle(
          color: Colors.black,
          fontWeight: FontWeight.bold,
          fontSize: 20,
        ),
      ),
      backgroundColor: const Color(0xFFF6F7FB),
      body: cart.isEmpty
          ? const Center(
              child: Text('Giỏ hàng trống', style: TextStyle(fontSize: 18)),
            )
          : Column(
              children: [
                Expanded(
                  child: ListView.separated(
                    padding: const EdgeInsets.all(12),
                    itemCount: cart.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 8),
                    itemBuilder: (context, index) {
                      final product = cart[index]['product'] as ProductModel;
                      final quantity = cart[index]['quantity'] as int;
                      return Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(14),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.03),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Padding(
                              padding: const EdgeInsets.all(8.0),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(10),
                                child: product.avatar != null
                                    ? Image.network(
                                        '${AppAPI.baseUrl}/uploads/${product.avatar}',
                                        width: 70,
                                        height: 70,
                                        fit: BoxFit.cover,
                                        errorBuilder:
                                            (context, error, stackTrace) =>
                                                Container(
                                                  width: 70,
                                                  height: 70,
                                                  color: Colors.grey[200],
                                                ),
                                      )
                                    : Container(
                                        width: 70,
                                        height: 70,
                                        color: Colors.grey[200],
                                      ),
                              ),
                            ),
                            Expanded(
                              child: Padding(
                                padding: const EdgeInsets.symmetric(
                                  vertical: 8.0,
                                  horizontal: 4,
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      product.name,
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(
                                        fontWeight: FontWeight.w600,
                                        fontSize: 16,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    // Hiển thị size chỉ cho giày (categoryId = 2)
                                    if (product.categoryId == 2 &&
                                        cart[index]['selectedSize'] != null &&
                                        cart[index]['selectedSize']!.isNotEmpty)
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 8,
                                          vertical: 2,
                                        ),
                                        decoration: BoxDecoration(
                                          color: Colors.grey[200],
                                          borderRadius: BorderRadius.circular(
                                            12,
                                          ),
                                        ),
                                        child: Text(
                                          'Size: ${cart[index]['selectedSize']}',
                                          style: const TextStyle(
                                            fontSize: 12,
                                            color: Colors.black87,
                                          ),
                                        ),
                                      ),
                                    const SizedBox(height: 6),
                                    Text(
                                      PriceUtils.formatPrice(product.price),
                                      style: const TextStyle(
                                        color: Colors.blue,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 15,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.only(right: 8.0),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  IconButton(
                                    icon: const Icon(
                                      Icons.remove_circle_outline,
                                    ),
                                    onPressed: () => decrease(index),
                                  ),
                                  Text(
                                    '$quantity',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
                                    ),
                                  ),
                                  IconButton(
                                    icon: const Icon(Icons.add_circle_outline),
                                    onPressed: () => increase(index),
                                  ),
                                  IconButton(
                                    icon: const Icon(
                                      Icons.delete,
                                      color: Colors.red,
                                    ),
                                    onPressed: () => remove(index),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 12,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.04),
                        blurRadius: 8,
                        offset: const Offset(0, -2),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Tổng cộng:',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                          Text(
                            PriceUtils.formatPrice(total),
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 18,
                              color: Colors.blue,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: cart.isEmpty ? null : _goToCheckout,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.blue,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                          child: const Text(
                            'Đặt ngay',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }
}
