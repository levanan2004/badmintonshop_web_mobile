import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:mobile/presentation/screens/cart/cart_state.dart';
import 'package:mobile/core/constants/app_api.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class PaymentWebViewScreen extends StatefulWidget {
  final String paymentUrl;
  final String paymentMethod;
  final int orderId;

  const PaymentWebViewScreen({
    super.key,
    required this.paymentUrl,
    required this.paymentMethod,
    required this.orderId,
  });

  @override
  State<PaymentWebViewScreen> createState() => _PaymentWebViewScreenState();
}

class _PaymentWebViewScreenState extends State<PaymentWebViewScreen> {
  late final WebViewController _controller;
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _initializeWebView();
  }

  void _initializeWebView() {
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {
            // Update loading bar if needed
          },
          onPageStarted: (String url) {
            setState(() {
              isLoading = true;
            });
          },
          onPageFinished: (String url) {
            setState(() {
              isLoading = false;
            });
            _checkPaymentResult(url);
          },
          onNavigationRequest: (NavigationRequest request) {
            _checkPaymentResult(request.url);
            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadRequest(Uri.parse(widget.paymentUrl));
  }

  void _checkPaymentResult(String url) {
    // Check for return URLs indicating payment completion
    if (url.contains('payment-success') ||
        url.contains('payment_success') ||
        url.contains('vnp_ResponseCode=00') ||
        url.contains('resultCode=0')) {
      // Payment successful
      _handlePaymentSuccess();
    } else if (url.contains('payment-failed') ||
        url.contains('payment_failed') ||
        url.contains('payment-cancel') ||
        url.contains('vnp_ResponseCode') &&
            !url.contains('vnp_ResponseCode=00') ||
        url.contains('resultCode') && !url.contains('resultCode=0')) {
      // Payment failed or cancelled
      _handlePaymentFailure();
    }
  }

  void _handlePaymentSuccess() async {
    // Update payment status to Success
    await _updatePaymentStatus('Success');

    // Reset cart after successful payment
    CartState.reset();

    // Show success dialog and navigate back
    if (!mounted) return;
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Text('Thanh toán thành công!'),
        content: Text(
          'Đơn hàng #${widget.orderId} đã được thanh toán thành công qua ${widget.paymentMethod}.',
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop(); // Close dialog
              Navigator.of(context).pop(); // Close webview
              Navigator.of(context).pop(true); // Return success to checkout
            },
            child: const Text('Về trang chủ'),
          ),
        ],
      ),
    );
  }

  void _handlePaymentFailure() async {
    // Update payment status to Failed
    await _updatePaymentStatus('Failed');

    // Show failure dialog
    if (!mounted) return;
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Thanh toán thất bại'),
        content: Text(
          'Thanh toán qua ${widget.paymentMethod} không thành công. Vui lòng thử lại.',
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop(); // Close dialog
              Navigator.of(context).pop(); // Close webview
            },
            child: const Text('Thử lại'),
          ),
        ],
      ),
    );
  }

  Future<void> _updatePaymentStatus(String status) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token != null) {
        await http.put(
          Uri.parse(AppAPI.updatePaymentStatus(widget.orderId)),
          headers: {
            'Authorization': 'Bearer $token',
            'Content-Type': 'application/json',
          },
          body: jsonEncode({'paymentStatus': status}),
        );
      }
    } catch (e) {
      print('Error updating payment status: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Thanh toán ${widget.paymentMethod}'),
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () {
            _showCancelDialog();
          },
        ),
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (isLoading) const Center(child: CircularProgressIndicator()),
        ],
      ),
    );
  }

  void _showCancelDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Hủy thanh toán'),
        content: const Text('Bạn có muốn hủy thanh toán này không?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Tiếp tục'),
          ),
          TextButton(
            onPressed: () async {
              // Update payment status to Cancel
              await _updatePaymentStatus('Cancel');

              if (!mounted) return;
              Navigator.of(context).pop(); // Close dialog
              Navigator.of(context).pop(); // Close webview
            },
            child: const Text('Hủy thanh toán'),
          ),
        ],
      ),
    );
  }
}
