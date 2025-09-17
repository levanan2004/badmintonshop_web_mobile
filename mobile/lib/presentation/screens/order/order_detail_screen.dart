import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../../../core/constants/app_api.dart';
import '../../../utils/price_utils.dart';
import 'package:intl/intl.dart';

class OrderDetailScreen extends StatefulWidget {
  final int orderId;

  OrderDetailScreen({super.key, required this.orderId}) {
    debugPrint('🔥🔥🔥🔥🔥 KHỞI TẠO ORDER DETAIL SCREEN 🔥🔥🔥🔥🔥');
    debugPrint('🆔 OrderId: $orderId');
    debugPrint('�🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥');
    print('🔥🔥🔥🔥🔥 KHỞI TẠO ORDER DETAIL SCREEN 🔥🔥🔥🔥🔥');
    print('🆔 OrderId: $orderId');
  }

  @override
  State<OrderDetailScreen> createState() {
    debugPrint('🚀🚀🚀 TẠO STATE CHO ORDER DETAIL 🚀🚀🚀');
    debugPrint('� OrderId: $orderId');
    print('🚀🚀🚀 TẠO STATE CHO ORDER DETAIL 🚀🚀🚀');
    print('🆔 OrderId: $orderId');
    return _OrderDetailScreenState();
  }
}

class _OrderDetailScreenState extends State<OrderDetailScreen> {
  Map<String, dynamic>? orderDetail;
  List<dynamic> orderItems = [];
  bool isLoading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    debugPrint('⭐⭐⭐ INIT STATE ORDER DETAIL SCREEN ⭐⭐⭐');
    debugPrint('🆔 OrderId trong initState: ${widget.orderId}');
    debugPrint('⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐');
    print('⭐⭐⭐ INIT STATE ORDER DETAIL SCREEN ⭐⭐⭐');
    print('🆔 OrderId trong initState: ${widget.orderId}');
    _loadOrderDetail();
  }

  Future<void> _loadOrderDetail() async {
    debugPrint('📡📡📡 BẮT ĐẦU TẢI DỮ LIỆU ĐỚN HÀNG 📡📡📡');
    debugPrint('🆔 OrderId: ${widget.orderId}');
    debugPrint('📡 _loadOrderDetail started');
    debugPrint('🆔 Loading order detail for ID: ${widget.orderId}');

    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      debugPrint('🔑 Token exists: ${token != null}');
      debugPrint('🔑 Token preview: ${token?.substring(0, 20)}...');

      if (token == null) {
        debugPrint('❌ No token found - user not logged in');
        setState(() {
          error = 'Vui lòng đăng nhập';
          isLoading = false;
        });
        return;
      }

      final apiUrl = '${AppAPI.orders}/${widget.orderId}';
      debugPrint('🌐 API URL: $apiUrl');
      debugPrint('📡 Making HTTP GET request...');

      final response = await http.get(
        Uri.parse(apiUrl),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      debugPrint('📡 Response received:');
      debugPrint('  📊 Status Code: ${response.statusCode}');
      debugPrint('  📏 Response Length: ${response.body.length} characters');
      debugPrint('  📄 Response Headers: ${response.headers}');

      if (response.statusCode == 200) {
        print('✅ Success! Parsing response...');
        final data = jsonDecode(response.body);
        print('🔍 Raw API Response Body:');
        print(response.body);
        print('\n� Parsed Data Structure:');
        print('🔍 Top-level keys: ${data.keys.toList()}');

        // Log chi tiết cấu trúc data
        if (data['order'] != null) {
          print('\n📦 ORDER INFORMATION:');
          print('📦 Order keys: ${data['order'].keys.toList()}');
          print('📦 Order details:');
          data['order'].forEach((key, value) {
            print('    $key: $value');
          });
        }

        if (data['customer'] != null) {
          print('\n👤 CUSTOMER INFORMATION:');
          print('👤 Customer keys: ${data['customer'].keys.toList()}');
          print('👤 Customer details:');
          data['customer'].forEach((key, value) {
            print('    $key: $value');
          });
        }

        if (data['details'] != null && data['details'] is List) {
          print('\n📋 ORDER DETAILS/ITEMS:');
          print('📋 Number of items: ${data['details'].length}');
          for (int i = 0; i < data['details'].length; i++) {
            var detail = data['details'][i];
            print('\n📋 Item #$i:');
            detail.forEach((key, value) {
              print('    $key: $value');
            });
            // Kiểm tra có Avatar không
            if (detail['Avatar'] != null) {
              print('✅ Item #$i has Avatar: ${detail['Avatar']}');
            } else {
              print('❌ Item #$i missing Avatar field');
            }
          }
        }

        // Xử lý cấu trúc data từ server
        print('\n🔄 Processing data structure...');
        setState(() {
          if (data['order'] != null) {
            print(
              '✅ Using structure: { order: {...}, customer: {...}, details: [...] }',
            );
            // Cấu trúc: { order: {...}, customer: {...}, details: [...] }
            orderDetail = {
              ...data['order'],
              'customer': data['customer'], // Thêm thông tin khách hàng
            };
            orderItems = data['details'] ?? [];
          } else {
            print('⚠️ Using fallback structure');
            // Fallback structure
            orderDetail = data;
            orderItems = data['orderItems'] ?? data['details'] ?? [];
          }
          isLoading = false;
        });

        orderDetail?.forEach((key, value) {
          if (key != 'customer') {
            print('    $key: $value');
          } else {
            print(
              '    customer: ${value != null ? value.keys.toList() : 'null'}',
            );
          }
        });

        if (orderItems.isNotEmpty) {
          orderItems[0].forEach((key, value) {
            print('    $key: $value');
          });
        }
      } else {
        setState(() {
          error = 'Không thể tải thông tin đơn hàng';
          isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        error = 'Có lỗi xảy ra: $e';
        isLoading = false;
      });
    }
  }

  String _getStatusText(String? status) {
    if (status == null) return 'Không xác định';

    switch (status.toLowerCase()) {
      case 'pending':
        return 'Chờ xử lý';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'shipping':
        return 'Đang giao';
      case 'delivered':
        return 'Đã giao';
      case 'cancelled':
        return 'Đã hủy';
      case 'đang xử lí':
        return 'Đang xử lí';
      case 'completed':
        return 'Hoàn thành';
      case 'success':
        return 'Thành công';
      case 'failed':
        return 'Thất bại';
      case 'processing':
        return 'Đang xử lý';
      default:
        return status; // Hiển thị status gốc nếu không match
    }
  }

  Color _getStatusColor(String? status) {
    if (status == null) return Colors.grey;

    switch (status.toLowerCase()) {
      case 'pending':
      case 'đang xử lí':
      case 'processing':
        return Colors.orange;
      case 'confirmed':
        return Colors.blue;
      case 'shipping':
        return Colors.purple;
      case 'delivered':
      case 'completed':
      case 'success':
        return Colors.green;
      case 'cancelled':
      case 'failed':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Chi tiết đơn hàng #${widget.orderId}'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 1,
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : error != null
          ? Center(
              child: Text(error!, style: const TextStyle(color: Colors.red)),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Thông tin khách hàng
                  _buildCustomerInfo(),
                  const SizedBox(height: 16),

                  // Thông tin đơn hàng
                  _buildOrderInfo(),
                  const SizedBox(height: 16),

                  // Danh sách sản phẩm
                  _buildProductList(),
                  const SizedBox(height: 16),

                  // Tổng tiền
                  _buildTotalSection(),
                ],
              ),
            ),
    );
  }

  Widget _buildCustomerInfo() {
    if (orderDetail == null) return const SizedBox();

    final customer = orderDetail!['customer'] ?? {};

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Thông tin khách hàng',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          _buildInfoRow(
            'Họ tên:',
            '${customer['Firstname'] ?? customer['firstname'] ?? ''} ${customer['Lastname'] ?? customer['lastname'] ?? ''}'
                .trim(),
          ),
          _buildInfoRow(
            'Địa chỉ:',
            customer['Address'] ??
                customer['address'] ??
                orderDetail!['ShippingAddress'] ??
                'Không có thông tin',
          ),
          _buildInfoRow(
            'Số điện thoại:',
            customer['Mobile'] ??
                customer['mobile'] ??
                customer['phone'] ??
                'Không có thông tin',
          ),
          _buildInfoRow(
            'Email:',
            customer['Email'] ?? customer['email'] ?? 'Không có thông tin',
          ),
        ],
      ),
    );
  }

  Widget _buildOrderInfo() {
    if (orderDetail == null) return const SizedBox();

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Thông tin đơn hàng',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          _buildInfoRow(
            'Mã đơn hàng:',
            '#${orderDetail!['OrderId'] ?? widget.orderId}',
          ),
          _buildInfoRow(
            'Ngày đặt:',
            orderDetail!['OrderDate'] != null
                ? DateFormat(
                    'dd/MM/yyyy HH:mm',
                  ).format(DateTime.parse(orderDetail!['OrderDate']))
                : orderDetail!['CreateAt'] != null
                ? DateFormat(
                    'dd/MM/yyyy HH:mm',
                  ).format(DateTime.parse(orderDetail!['CreateAt']))
                : 'Không có thông tin',
          ),
          _buildInfoRow(
            'Phương thức thanh toán:',
            orderDetail!['PaymentMethod'] ??
                orderDetail!['paymentMethod'] ??
                'Chuyển khoản',
          ),
          _buildInfoRow('Tình trạng:', ''),
          const SizedBox(height: 4),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: _getStatusColor(
                orderDetail!['PaymentStatus']?.toString(),
              ).withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: _getStatusColor(
                  orderDetail!['PaymentStatus']?.toString(),
                ),
                width: 1,
              ),
            ),
            child: Text(
              _getStatusText(orderDetail!['PaymentStatus']?.toString()),
              style: TextStyle(
                color: _getStatusColor(
                  orderDetail!['PaymentStatus']?.toString(),
                ),
                fontWeight: FontWeight.w600,
                fontSize: 12,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: const TextStyle(color: Colors.grey, fontSize: 14),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProductList() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Sản phẩm',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),

          // Header table
          Container(
            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
            decoration: BoxDecoration(
              color: Colors.grey.shade50,
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Row(
              children: [
                Expanded(
                  flex: 2,
                  child: Text(
                    'Ảnh',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
                Expanded(
                  flex: 3,
                  child: Text(
                    'Tên sản phẩm',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
                Expanded(
                  flex: 2,
                  child: Text(
                    'Số lượng',
                    style: TextStyle(fontWeight: FontWeight.bold),
                    textAlign: TextAlign.center,
                  ),
                ),
                Expanded(
                  flex: 2,
                  child: Text(
                    'Giá',
                    style: TextStyle(fontWeight: FontWeight.bold),
                    textAlign: TextAlign.right,
                  ),
                ),
                Expanded(
                  flex: 3,
                  child: Text(
                    'Thành tiền',
                    style: TextStyle(fontWeight: FontWeight.bold),
                    textAlign: TextAlign.right,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),

          // Product items
          ...orderItems.map((item) => _buildProductItem(item)),
        ],
      ),
    );
  }

  Widget _buildProductItem(Map<String, dynamic> item) {
    // Server trả về data theo cấu trúc: { ProductName, ImageUrl, Price, Size, Quantity }
    final productName = item['ProductName'] ?? 'Không có tên';
    final imageUrl = item['ImageUrl'] ?? ''; // Sử dụng ImageUrl thay vì Avatar
    final quantity = item['Quantity'] ?? 0;
    final price = (item['Price'] ?? 0).toDouble();
    final size = item['Size'];
    final total = price * quantity;

    // Sử dụng AppAPI.baseUrl thay vì localhost trong ImageUrl
    final correctedImageUrl = imageUrl.isNotEmpty
        ? imageUrl.replaceAll('http://localhost:3000', AppAPI.baseUrl)
        : '';

    print('🖼️ Original Image URL: $imageUrl');
    print('🖼️ Corrected Image URL: $correctedImageUrl');

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 4),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: Colors.grey.shade200)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Ảnh - flex: 2
          Expanded(
            flex: 2,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: correctedImageUrl.isNotEmpty
                  ? Image.network(
                      correctedImageUrl, // Sử dụng URL đã được sửa
                      width: 50,
                      height: 50,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        print('❌ Error loading image: $correctedImageUrl');
                        print('❌ Error details: $error');
                        return Container(
                          width: 50,
                          height: 50,
                          color: Colors.grey[200],
                          child: const Icon(
                            Icons.image_not_supported,
                            size: 20,
                          ),
                        );
                      },
                    )
                  : Container(
                      width: 50,
                      height: 50,
                      color: Colors.grey[200],
                      child: const Icon(Icons.image_not_supported, size: 20),
                    ),
            ),
          ),

          // Tên sản phẩm - flex: 3
          Expanded(
            flex: 3,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    productName,
                    style: const TextStyle(
                      fontWeight: FontWeight.w500,
                      fontSize: 14,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (size != null && size.toString().isNotEmpty)
                    Text(
                      'Size: $size',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade600,
                      ),
                    ),
                ],
              ),
            ),
          ),

          // Số lượng - flex: 2
          Expanded(
            flex: 2,
            child: Text(
              quantity.toString(),
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 14),
            ),
          ),

          // Giá - flex: 2
          Expanded(
            flex: 2,
            child: Text(
              PriceUtils.formatPriceShort(price),
              textAlign: TextAlign.right,
              style: const TextStyle(fontSize: 14),
            ),
          ),

          // Thành tiền - flex: 3
          Expanded(
            flex: 3,
            child: Text(
              PriceUtils.formatPrice(total),
              textAlign: TextAlign.right,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: Colors.blue,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTotalSection() {
    if (orderDetail == null) return const SizedBox();

    // Tính tổng từ orderItems với data structure mới từ server
    double calculatedTotal = 0;
    for (var item in orderItems) {
      final quantity = item['Quantity'] ?? 0;
      final price = (item['Price'] ?? 0)
          .toDouble(); // Price đã có trong data từ server
      calculatedTotal += price * quantity;
      print('💰 Item calculation: $price x $quantity = ${price * quantity}');
    }

    final orderTotal =
        (orderDetail!['TotalAmount'] ??
                orderDetail!['TotalPrice'] ??
                calculatedTotal)
            .toDouble();
    final discount = 0.0; // Có thể lấy từ orderDetail!['Discount'] nếu có

    print('💰 Calculated total: $calculatedTotal');
    print('💰 Order total from API: $orderTotal');
    print('💰 Discount: $discount');

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Tạm tính
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Tạm tính:',
                style: TextStyle(fontSize: 16, color: Colors.grey),
              ),
              Text(
                PriceUtils.formatPrice(calculatedTotal),
                style: const TextStyle(fontSize: 16),
              ),
            ],
          ),
          const SizedBox(height: 8),

          // Giảm giá
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Giảm giá:',
                style: TextStyle(fontSize: 16, color: Colors.grey),
              ),
              Text(
                PriceUtils.formatPrice(discount),
                style: const TextStyle(fontSize: 16),
              ),
            ],
          ),
          const SizedBox(height: 8),

          const Divider(),
          const SizedBox(height: 8),

          // Tổng tiền
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Tổng tiền:',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.blue,
                ),
              ),
              Text(
                PriceUtils.formatPrice(orderTotal),
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.blue,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
