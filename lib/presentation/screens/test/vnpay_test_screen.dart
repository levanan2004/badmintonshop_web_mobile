import 'package:flutter/material.dart';
import 'package:mobile/data/services/vnpay_service.dart';
import 'package:mobile/presentation/screens/checkout/payment_webview_screen.dart';

class VNPayTestScreen extends StatefulWidget {
  const VNPayTestScreen({super.key});

  @override
  State<VNPayTestScreen> createState() => _VNPayTestScreenState();
}

class _VNPayTestScreenState extends State<VNPayTestScreen> {
  final _amountController = TextEditingController(text: '100000');
  final _orderInfoController = TextEditingController(
    text: 'Test thanh toán VNPay',
  );
  bool _isLoading = false;

  Future<void> _handleVNPayPayment() async {
    if (_amountController.text.isEmpty) {
      _showMessage('Vui lòng nhập số tiền');
      return;
    }

    final amount = double.tryParse(_amountController.text);
    if (amount == null || amount <= 0) {
      _showMessage('Số tiền không hợp lệ');
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      // Gọi API tạo link thanh toán
      final result = await VNPayService.createPaymentUrl(
        amount: amount,
        orderInfo: _orderInfoController.text.isNotEmpty
            ? _orderInfoController.text
            : 'Test thanh toán VNPay',
        // Không gửi cart để tránh lỗi ProductId không tồn tại
        // cart: [
        //   {
        //     'ProductId': 1,
        //     'Quantity': 1,
        //     'Size': 'M',
        //     'Price': amount,
        //   }
        // ],
      );

      if (result['success'] == true) {
        final paymentUrl = result['paymentUrl'];
        final orderId = result['orderId'];

        // Mở WebView để thanh toán
        if (!mounted) return;
        final paymentResult = await Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => PaymentWebViewScreen(
              paymentUrl: paymentUrl,
              paymentMethod: 'VNPay',
              orderId: orderId,
            ),
          ),
        );

        // Xử lý kết quả thanh toán
        if (paymentResult == true) {
          _showMessage('Thanh toán thành công!', isSuccess: true);
        } else {
          _showMessage('Thanh toán chưa hoàn thành');
        }
      } else {
        _showMessage(result['message'] ?? 'Không thể tạo link thanh toán');
      }
    } catch (e) {
      _showMessage('Lỗi: $e');
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _showMessage(String message, {bool isSuccess = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isSuccess ? Colors.green : Colors.red,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Test VNPay Payment')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextField(
              controller: _amountController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Số tiền (VND)',
                border: OutlineInputBorder(),
                prefixText: '₫ ',
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _orderInfoController,
              decoration: const InputDecoration(
                labelText: 'Thông tin đơn hàng',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _isLoading ? null : _handleVNPayPayment,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: _isLoading
                  ? const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(
                              Colors.white,
                            ),
                          ),
                        ),
                        SizedBox(width: 8),
                        Text('Đang tạo link thanh toán...'),
                      ],
                    )
                  : const Text(
                      'Thanh toán VNPay',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Lưu ý: Đây là màn hình test. Sử dụng thông tin thẻ test của VNPay để thanh toán.',
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey,
                fontStyle: FontStyle.italic,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _amountController.dispose();
    _orderInfoController.dispose();
    super.dispose();
  }
}
