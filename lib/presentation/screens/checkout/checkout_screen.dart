import 'package:flutter/material.dart';
import 'package:mobile/data/models/product_model.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mobile/presentation/screens/cart/cart_state.dart';
import 'package:mobile/core/constants/app_api.dart';
import 'package:mobile/utils/price_utils.dart';
import 'package:http/http.dart' as http;
import 'package:mobile/presentation/screens/checkout/payment_webview_screen.dart';
import 'package:mobile/data/services/vnpay_service.dart';
import 'dart:convert';

class CheckoutScreen extends StatefulWidget {
  final List<Map<String, dynamic>> cart;
  const CheckoutScreen({super.key, required this.cart});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final _formKey = GlobalKey<FormState>();
  String? _token;

  // Text Controllers
  final _firstnameController = TextEditingController();
  final _lastnameController = TextEditingController();
  final _addressController = TextEditingController();
  final _mobileController = TextEditingController();
  final _emailController = TextEditingController();

  String paymentMethod = 'cod'; // Default to COD
  bool isLoading = false;
  bool isUserInfoLoaded = false;

  @override
  void initState() {
    super.initState();
    _loadTokenAndUser();
  }

  @override
  void dispose() {
    _firstnameController.dispose();
    _lastnameController.dispose();
    _addressController.dispose();
    _mobileController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _loadTokenAndUser() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('token');
    print('🔑 Token: $_token');

    if (_token != null && _token!.isNotEmpty) {
      try {
        print('📡 Calling API: ${AppAPI.profileUser}');
        final res = await http.get(
          Uri.parse(AppAPI.profileUser),
          headers: {'Authorization': 'Bearer $_token'},
        );

        print('📊 Response status: ${res.statusCode}');
        print('📋 Response body: ${res.body}');

        if (res.statusCode == 200) {
          final data = jsonDecode(res.body);
          print('✅ Parsed data: $data');

          if (!mounted) return;
          setState(() {
            _firstnameController.text = data['firstname'] ?? '';
            _lastnameController.text = data['lastname'] ?? '';
            _addressController.text = data['address'] ?? '';
            _mobileController.text = data['mobile'] ?? '';
            _emailController.text = data['email'] ?? '';
            isUserInfoLoaded = true;
          });

          print('📝 Controllers updated:');
          print('   - Firstname: ${_firstnameController.text}');
          print('   - Lastname: ${_lastnameController.text}');
          print('   - Address: ${_addressController.text}');
          print('   - Mobile: ${_mobileController.text}');
          print('   - Email: ${_emailController.text}');
        } else {
          print('❌ API Error: ${res.statusCode} - ${res.body}');
        }
      } catch (e) {
        print('💥 Error loading user info: $e');
      }
    } else {
      print('🚫 No token found');
    }
  }

  Future<void> _submitOrder() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => isLoading = true);

    try {
      // Tính tổng tiền
      final totalAmount = widget.cart.fold<double>(
        0,
        (sum, item) =>
            sum + ((item['product'] as ProductModel).price * item['quantity']),
      );

      // Nếu là VNPay, sử dụng API mobile mới
      if (paymentMethod == 'vnpay') {
        final result = await VNPayService.createPaymentUrl(
          amount: totalAmount,
          orderInfo: 'Thanh toán đơn hàng',
          cart: widget.cart
              .map(
                (e) => {
                  'ProductId': (e['product'] as ProductModel).id,
                  'Quantity': e['quantity'],
                  'Size': e['size'],
                  'Price': (e['product'] as ProductModel).price, // Thêm Price
                },
              )
              .toList(),
          address: _addressController.text,
          mobile: _mobileController.text,
          email: _emailController.text,
          firstname: _firstnameController.text,
          lastname: _lastnameController.text,
        );

        if (!mounted) return;
        setState(() => isLoading = false);

        if (result['success'] == true) {
          final paymentUrl = result['paymentUrl'];
          final orderId = result['orderId'];

          // Mở WebView để thanh toán
          _openPaymentWebView(paymentUrl, orderId);
        } else {
          _showErrorDialog(
            'Lỗi thanh toán',
            result['message'] ?? 'Không thể tạo link thanh toán VNPay',
          );
        }
        return;
      }

      // Xử lý COD và MoMo như cũ
      final cartData = widget.cart
          .map(
            (e) => {
              'ProductId': (e['product'] as ProductModel).id,
              'Quantity': e['quantity'],
              'Size': e['size'],
              'Price': (e['product'] as ProductModel).price,
            },
          )
          .toList();

      print('🛒 Cart gửi lên backend: \\${jsonEncode(cartData)}');

      final res = await http.post(
        Uri.parse(AppAPI.checkout),
        headers: {
          'Authorization': 'Bearer $_token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'cart': cartData,
          'firstname': _firstnameController.text,
          'lastname': _lastnameController.text,
          'address': _addressController.text,
          'mobile': _mobileController.text,
          'email': _emailController.text,
          'paymentMethod': paymentMethod,
        }),
      );

      if (!mounted) return;
      setState(() => isLoading = false);

      if (res.statusCode == 201) {
        final data = jsonDecode(res.body);
        final orderId = data['orderId'] ?? data['id'] ?? 0;

        // Handle different payment methods
        if (paymentMethod == 'cod') {
          // COD - show success message and reset cart
          CartState.reset();
          _showSuccessDialog();
        } else if (paymentMethod == 'momo' && data['paymentUrl'] != null) {
          // Open WebView for MoMo payment
          _openPaymentWebView(data['paymentUrl'], orderId);
        } else {
          _showErrorDialog('Lỗi thanh toán', 'Không nhận được URL thanh toán');
        }
      } else {
        final data = jsonDecode(res.body);
        _showErrorDialog('Lỗi', data['message'] ?? 'Đặt hàng thất bại!');
      }
    } catch (e) {
      if (!mounted) return;
      setState(() => isLoading = false);
      _showErrorDialog('Lỗi', 'Có lỗi xảy ra: $e');
    }
  }

  void _openPaymentWebView(String paymentUrl, int orderId) {
    Navigator.of(context)
        .push(
          MaterialPageRoute(
            builder: (context) => PaymentWebViewScreen(
              paymentUrl: paymentUrl,
              paymentMethod: paymentMethod.toUpperCase(),
              orderId: orderId,
            ),
          ),
        )
        .then((success) {
          if (success == true) {
            // Payment was successful, quay về trang home
            Navigator.of(context).popUntil((route) => route.isFirst);
          }
        });
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      barrierDismissible: false, // Không cho đóng dialog bằng cách tap ngoài
      builder: (_) => AlertDialog(
        title: const Text('Đặt hàng thành công!'),
        content: const Text('Cảm ơn bạn đã mua hàng.'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop(); // Đóng dialog
              // Quay về trang home (pop tất cả screen về root)
              Navigator.of(context).popUntil((route) => route.isFirst);
            },
            child: const Text('Về trang chủ'),
          ),
        ],
      ),
    );
  }

  void _showErrorDialog(String title, String message) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Đóng'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Thanh toán'), centerTitle: true),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Thông tin nhận hàng',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                    ),
                    if (isUserInfoLoaded)
                      const Padding(
                        padding: EdgeInsets.only(top: 4, bottom: 8),
                        child: Row(
                          children: [
                            Icon(
                              Icons.check_circle,
                              color: Colors.green,
                              size: 16,
                            ),
                            SizedBox(width: 4),
                            Text(
                              'Thông tin đã được tự động điền từ tài khoản của bạn',
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.green,
                                fontStyle: FontStyle.italic,
                              ),
                            ),
                          ],
                        ),
                      ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _firstnameController,
                      decoration: InputDecoration(
                        labelText: 'Tên',
                        border: const OutlineInputBorder(),
                        helperText:
                            isUserInfoLoaded &&
                                _firstnameController.text.isNotEmpty
                            ? '✓ Từ tài khoản'
                            : null,
                        helperStyle: const TextStyle(
                          color: Colors.green,
                          fontSize: 11,
                        ),
                      ),
                      validator: (v) =>
                          v == null || v.isEmpty ? 'Nhập tên' : null,
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _lastnameController,
                      decoration: InputDecoration(
                        labelText: 'Họ',
                        border: const OutlineInputBorder(),
                        helperText:
                            isUserInfoLoaded &&
                                _lastnameController.text.isNotEmpty
                            ? '✓ Từ tài khoản'
                            : null,
                        helperStyle: const TextStyle(
                          color: Colors.green,
                          fontSize: 11,
                        ),
                      ),
                      validator: (v) =>
                          v == null || v.isEmpty ? 'Nhập họ' : null,
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _addressController,
                      decoration: InputDecoration(
                        labelText: 'Địa chỉ',
                        border: const OutlineInputBorder(),
                        helperText:
                            isUserInfoLoaded &&
                                _addressController.text.isNotEmpty
                            ? '✓ Từ tài khoản'
                            : null,
                        helperStyle: const TextStyle(
                          color: Colors.green,
                          fontSize: 11,
                        ),
                      ),
                      validator: (v) =>
                          v == null || v.isEmpty ? 'Nhập địa chỉ' : null,
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _mobileController,
                      decoration: InputDecoration(
                        labelText: 'Số điện thoại',
                        border: const OutlineInputBorder(),
                        helperText:
                            isUserInfoLoaded &&
                                _mobileController.text.isNotEmpty
                            ? '✓ Từ tài khoản'
                            : null,
                        helperStyle: const TextStyle(
                          color: Colors.green,
                          fontSize: 11,
                        ),
                      ),
                      validator: (v) =>
                          v == null || v.isEmpty ? 'Nhập số điện thoại' : null,
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _emailController,
                      decoration: InputDecoration(
                        labelText: 'Email',
                        border: const OutlineInputBorder(),
                        helperText:
                            isUserInfoLoaded && _emailController.text.isNotEmpty
                            ? '✓ Từ tài khoản'
                            : null,
                        helperStyle: const TextStyle(
                          color: Colors.green,
                          fontSize: 11,
                        ),
                      ),
                      validator: (v) =>
                          v == null || v.isEmpty ? 'Nhập email' : null,
                    ),
                    const SizedBox(height: 24),
                    const Text(
                      'Phương thức thanh toán',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Container(
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.grey.shade300),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Column(
                        children: [
                          RadioListTile<String>(
                            title: const Text('Thanh toán khi nhận hàng (COD)'),
                            subtitle: const Text('Trả tiền mặt khi nhận hàng'),
                            value: 'cod',
                            groupValue: paymentMethod,
                            onChanged: (value) {
                              setState(() {
                                paymentMethod = value!;
                              });
                            },
                          ),
                          const Divider(height: 1),
                          RadioListTile<String>(
                            title: const Text('VNPay'),
                            subtitle: const Text(
                              'Thanh toán qua ví điện tử VNPay',
                            ),
                            value: 'vnpay',
                            groupValue: paymentMethod,
                            onChanged: (value) {
                              setState(() {
                                paymentMethod = value!;
                              });
                            },
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                    const Text(
                      'Sản phẩm',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                    ),
                    const SizedBox(height: 8),
                    ...widget.cart.map((e) {
                      final p = e['product'] as ProductModel;
                      return Card(
                        margin: const EdgeInsets.only(bottom: 8),
                        child: ListTile(
                          title: Text(
                            p.name,
                            style: const TextStyle(fontWeight: FontWeight.w500),
                          ),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Số lượng: ${e['quantity']}'),
                              if (e['size'] != null &&
                                  e['size'].toString().isNotEmpty)
                                Text('Size: ${e['size']}'),
                            ],
                          ),
                          trailing: Text(
                            PriceUtils.formatPrice(p.price),
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                        ),
                      );
                    }),
                    const SizedBox(height: 16),
                    // Total calculation
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade100,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Tổng cộng:',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            PriceUtils.formatPrice(
                              widget.cart.fold<double>(
                                0,
                                (sum, item) =>
                                    sum +
                                    ((item['product'] as ProductModel).price *
                                        item['quantity']),
                              ),
                            ),
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Colors.red,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton(
                        onPressed: _submitOrder,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Theme.of(context).primaryColor,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        child: Text(
                          paymentMethod == 'cod'
                              ? 'Xác nhận đặt hàng'
                              : 'Tiến hành thanh toán',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}
