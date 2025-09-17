import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:mobile/core/constants/app_api.dart';
import 'package:mobile/core/constants/app_colors.dart';
import 'package:mobile/utils/date_format.dart';
import 'package:mobile/utils/price_utils.dart';
import 'package:mobile/presentation/screens/auth/login_screen.dart';
import 'package:mobile/logic/booking/booking_bloc.dart';
import '../booking/booking_history_screen.dart';
import '../order/order_detail_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  Future<void> _updateProfileField(
    BuildContext context,
    String key,
    String value,
  ) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    if (token == null) return;
    try {
      final response = await http.put(
        Uri.parse(AppAPI.updateProfileUser),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({key: value}),
      );
      if (response.statusCode == 200) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Cập nhật thông tin thành công!')),
          );
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(const SnackBar(content: Text('Cập nhật thất bại!')));
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Có lỗi xảy ra!')));
      }
    }
  }

  Map<String, dynamic>? userData;
  bool isLoading = true;
  final Map<String, bool> _editingField = {
    'firstname': false,
    'lastname': false,
    'email': false,
    'mobile': false,
    'address': false,
    'gender': false,
  };
  final Map<String, TextEditingController> _controllers = {
    'firstname': TextEditingController(),
    'lastname': TextEditingController(),
    'email': TextEditingController(),
    'mobile': TextEditingController(),
    'address': TextEditingController(),
    'gender': TextEditingController(),
  };

  List<dynamic> orders = [];
  bool isLoadingOrders = false;
  String? changePassError;
  bool _isChangingPassword = false; // Flag để track quá trình đổi password

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _fetchUserInfo();
    _fetchOrders();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _fetchOrders([String? newToken]) async {
    setState(() {
      isLoadingOrders = true;
    });
    final prefs = await SharedPreferences.getInstance();
    final token = newToken ?? prefs.getString('token');
    if (token == null) {
      setState(() {
        isLoadingOrders = false;
      });
      return;
    }
    try {
      final response = await http.get(
        Uri.parse(AppAPI.getUserOrders),
        headers: {'Authorization': 'Bearer $token'},
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        print('Order API Response: ${response.body}');
        print('Orders data: ${data['orders']}');
        if (data['orders'] != null && data['orders'].isNotEmpty) {
          print('First order data: ${data['orders'][0]}');
          print('PaymentStatus field: ${data['orders'][0]['PaymentStatus']}');
        }
        setState(() {
          orders = data['orders'] ?? data['orders'] ?? [];
          if (orders.isEmpty &&
              data['orders'] == null &&
              data['message'] != null) {
            orders = [];
          }
          isLoadingOrders = false;
        });
      } else {
        setState(() {
          isLoadingOrders = false;
        });
      }
    } catch (e) {
      setState(() {
        isLoadingOrders = false;
      });
    }
  }

  Future<void> _fetchUserInfo([String? newToken]) async {
    print('🔍 _fetchUserInfo called with newToken: ${newToken ?? 'NULL'}');

    // Nếu đang đổi password và không có token mới, bỏ qua call này
    if (_isChangingPassword && newToken == null) {
      print(
        '🚫 Skipping _fetchUserInfo during password change without new token',
      );
      return;
    }

    final prefs = await SharedPreferences.getInstance();
    final token = newToken ?? prefs.getString('token');
    print('🔍 _fetchUserInfo final token: ${token ?? 'NULL'}');
    if (token == null) {
      setState(() {
        isLoading = false;
      });
      return;
    }
    try {
      final response = await http.get(
        Uri.parse(AppAPI.profileUser),
        headers: {'Authorization': 'Bearer $token'},
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          userData = data;
          isLoading = false;
          // Gán giá trị cho controller
          _controllers['firstname']?.text = data['firstname'] ?? '';
          _controllers['lastname']?.text = data['lastname'] ?? '';
          _controllers['email']?.text = data['email'] ?? '';
          _controllers['mobile']?.text = data['mobile'] ?? '';
          _controllers['address']?.text = data['address'] ?? '';
          _controllers['gender']?.text = data['gender'] ?? '';
        });
      } else {
        print(
          '❌ _fetchUserInfo failed! Status: ${response.statusCode}, Body: ${response.body}',
        );
        setState(() {
          isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tài khoản'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _handleLogout,
            tooltip: 'Đăng xuất',
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Thông tin'),
            Tab(text: 'Đơn hàng'),
            Tab(text: 'Đặt sân'),
            Tab(text: 'Đổi mật khẩu'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // Tab 1: Thông tin cá nhân
          isLoading
              ? const Center(child: CircularProgressIndicator())
              : userData == null
              ? const Center(child: Text('Không thể tải thông tin người dùng.'))
              : SingleChildScrollView(
                  child: Column(
                    children: [
                      const SizedBox(height: 24),
                      Center(
                        child: Container(
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.15),
                                blurRadius: 12,
                                offset: const Offset(0, 4),
                              ),
                            ],
                            border: Border.all(
                              color: AppColors.primary,
                              width: 3,
                            ),
                          ),
                          child: CircleAvatar(
                            radius: 60,
                            backgroundColor: AppColors.primary.withOpacity(0.1),
                            backgroundImage: const AssetImage(
                              'assets/images/user2.png',
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                      Container(
                        margin: const EdgeInsets.symmetric(horizontal: 16),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.07),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Column(
                          children: [
                            _editableField('Họ', 'lastname'),
                            _editableField('Tên', 'firstname'),
                            _editableField('Email', 'email'),
                            _editableField('Số điện thoại', 'mobile'),
                            _editableField('Địa chỉ', 'address'),
                            _editableField('Giới tính', 'gender'),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
          // Tab 2: Đơn hàng
          isLoadingOrders
              ? const Center(child: CircularProgressIndicator())
              : orders.isEmpty
              ? const Center(child: Text('Bạn chưa có đơn hàng nào.'))
              : Builder(
                  builder: (context) {
                    print('=================');
                    print('📋 BUILDING ORDER LIST:');
                    print('📊 Tổng số orders: ${orders.length}');
                    for (int i = 0; i < orders.length; i++) {
                      var order = orders[i];
                      print('📋 Order #$i:');
                      print('   OrderId: ${order['OrderId']}');
                      print('   PaymentStatus: ${order['PaymentStatus']}');
                      print('   Total: ${order['Total']}');
                    }
                    print('=================');

                    return ListView.builder(
                      itemCount: orders.length,
                      itemBuilder: (context, idx) {
                        final order = orders[idx];
                        Color statusColor;
                        switch (order['PaymentStatus']) {
                          case 'Success':
                            statusColor = Colors.green;
                            break;
                          case 'Pending':
                            statusColor = Colors.orange;
                            break;
                          case 'Failed':
                            statusColor = Colors.red;
                            break;
                          case 'Cancel':
                            statusColor = Colors.red;
                            break;
                          default:
                            statusColor = Colors.grey;
                        }
                        return Card(
                          margin: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 8,
                          ),
                          child: ListTile(
                            title: Text('Mã đơn: ${order['OrderId'] ?? ''}'),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Ngày: ${formatOrderDate(order['CreateAt'])}',
                                ),
                                Text(
                                  'Tổng tiền: ${PriceUtils.formatPrice(order['TotalPrice']?.toDouble() ?? 0)}',
                                ),
                                Text(
                                  'Phương thức thanh toán: ${order['PaymentMethod']}',
                                ),
                                Row(
                                  children: [
                                    const Text('Trạng thái thanh toán: '),
                                    Text(
                                      _getPaymentStatusText(
                                        order['PaymentStatus'],
                                      ),
                                      style: TextStyle(
                                        color: statusColor,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            trailing: const Icon(
                              Icons.arrow_forward_ios,
                              size: 16,
                            ),
                            onTap: () {
                              print('=================');
                              print(
                                '🚀 USER TAP: Đang điều hướng đến OrderDetailScreen',
                              );
                              print('🆔 OrderId: ${order['OrderId']}');
                              print('📋 Order data: $order');
                              print('=================');

                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => OrderDetailScreen(
                                    orderId: order['OrderId'],
                                  ),
                                ),
                              );
                            },
                          ),
                        );
                      },
                    );
                  },
                ),
          // Tab 3: Lịch sử đặt sân
          BlocProvider(
            create: (context) => BookingBloc(),
            child: const BookingHistoryScreen(),
          ),

          // Tab 4: Đổi mật khẩu
          _changePasswordTab(),
        ],
      ),
    );
  }

  // Định dạng ngày cho đơn hàng
  String formatOrderDate(String? dateStr) {
    if (dateStr == null) return '';
    return formatDateTime(dateStr);
  }

  // Chuyển đổi trạng thái thanh toán sang tiếng Việt
  String _getPaymentStatusText(String? status) {
    switch (status) {
      case 'Success':
        return 'Đã thanh toán';
      case 'Pending':
        return 'Đang xử lý';
      case 'Failed':
        return 'Thanh toán thất bại';
      case 'Cancel':
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  }

  // Tab đổi mật khẩu
  final _oldPassController = TextEditingController();
  final _newPassController = TextEditingController();
  final _confirmPassController = TextEditingController();
  bool _isChangingPass = false;
  bool _showOldPass = false;
  bool _showNewPass = false;
  bool _showConfirmPass = false;

  Widget _changePasswordTab() {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Đổi mật khẩu',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
          ),
          const SizedBox(height: 24),
          TextField(
            controller: _oldPassController,
            obscureText: !_showOldPass,
            decoration: InputDecoration(
              labelText: 'Mật khẩu cũ',
              suffixIcon: IconButton(
                icon: Icon(
                  _showOldPass ? Icons.visibility : Icons.visibility_off,
                ),
                onPressed: () {
                  setState(() {
                    _showOldPass = !_showOldPass;
                  });
                },
              ),
            ),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _newPassController,
            obscureText: !_showNewPass,
            decoration: InputDecoration(
              labelText: 'Mật khẩu mới',
              suffixIcon: IconButton(
                icon: Icon(
                  _showNewPass ? Icons.visibility : Icons.visibility_off,
                ),
                onPressed: () {
                  setState(() {
                    _showNewPass = !_showNewPass;
                  });
                },
              ),
            ),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _confirmPassController,
            obscureText: !_showConfirmPass,
            decoration: InputDecoration(
              labelText: 'Nhập lại mật khẩu mới',
              suffixIcon: IconButton(
                icon: Icon(
                  _showConfirmPass ? Icons.visibility : Icons.visibility_off,
                ),
                onPressed: () {
                  setState(() {
                    _showConfirmPass = !_showConfirmPass;
                  });
                },
              ),
            ),
          ),
          const SizedBox(height: 24),
          if (changePassError != null)
            Text(changePassError!, style: const TextStyle(color: Colors.red)),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _isChangingPass ? null : _handleChangePassword,
              child: _isChangingPass
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Đổi mật khẩu'),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _handleChangePassword() async {
    setState(() {
      changePassError = null;
      _isChangingPass = true;
      _isChangingPassword = true; // Bắt đầu quá trình đổi password
    });
    final oldPass = _oldPassController.text.trim();
    final newPass = _newPassController.text.trim();
    final confirmPass = _confirmPassController.text.trim();

    // Validation
    if (oldPass.isEmpty) {
      setState(() {
        changePassError = 'Vui lòng nhập mật khẩu cũ.';
        _isChangingPass = false;
        _isChangingPassword = false;
      });
      return;
    }

    if (newPass.isEmpty) {
      setState(() {
        changePassError = 'Vui lòng nhập mật khẩu mới.';
        _isChangingPass = false;
        _isChangingPassword = false;
      });
      return;
    }

    if (newPass.length < 8) {
      setState(() {
        changePassError = 'Mật khẩu mới phải có ít nhất 8 ký tự.';
        _isChangingPass = false;
        _isChangingPassword = false;
      });
      return;
    }

    if (newPass != confirmPass) {
      setState(() {
        changePassError = 'Mật khẩu mới không khớp.';
        _isChangingPass = false;
        _isChangingPassword = false;
      });
      return;
    }
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    print(
      '🔑 Token cũ (trước khi đổi mật khẩu): ${token?.substring(0, 50)}...',
    );
    print('🗂️ Data user cũ (userData): $userData');
    if (token == null) {
      setState(() {
        changePassError = 'Bạn chưa đăng nhập.';
        _isChangingPass = false;
        _isChangingPassword = false;
      });
      return;
    }
    try {
      final response = await http.put(
        Uri.parse(AppAPI.changePasswordUser),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({'oldPassword': oldPass, 'newPassword': newPass}),
      );
      print('Change password response: ${response.statusCode}');
      print('Change password body: ${response.body}');
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        print('📦 Payload/data nhận từ API: $data');
        // Cập nhật token mới nếu server trả về
        String? newToken;
        if (data['token'] != null) {
          newToken = data['token'] as String;
          print(
            '🔄 Token mới nhận từ API (bỏ qua, vẫn dùng token cũ): ${newToken.substring(0, 50)}...',
          );
        }

        // Reload user data và orders với token mới (truyền trực tiếp token để tránh cache)
        print('🚀 Gọi _fetchUserInfo sau khi đổi mật khẩu (dùng token cũ)');
        await _fetchUserInfo();
        print('🚀 Gọi _fetchOrders sau khi đổi mật khẩu (dùng token cũ)');
        await _fetchOrders();

        // In ra data user mới sau khi reload
        print('🗂️ Data user mới (userData): $userData');

        // Clear form và reset error state
        _oldPassController.clear();
        _newPassController.clear();
        _confirmPassController.clear();

        setState(() {
          changePassError = null;
          _isChangingPass = false;
          _isChangingPassword = false; // Kết thúc quá trình đổi password
        });

        // Force refresh UI bằng cách rebuild widget
        if (mounted) {
          setState(() {});
        }

        showDialog(
          context: context,
          builder: (_) => AlertDialog(
            title: const Text('Thành công'),
            content: const Text('Đổi mật khẩu thành công!'),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(),
                child: const Text('OK'),
              ),
            ],
          ),
        );
        _oldPassController.clear();
        _newPassController.clear();
        _confirmPassController.clear();
      } else {
        final data = jsonDecode(response.body);
        setState(() {
          changePassError = data['error'] ?? 'Đổi mật khẩu thất bại!';
          _isChangingPass = false;
          _isChangingPassword = false; // Kết thúc quá trình đổi password
        });
      }
    } catch (e) {
      setState(() {
        changePassError = 'Có lỗi xảy ra!';
        _isChangingPass = false;
        _isChangingPassword = false; // Kết thúc quá trình đổi password
      });
    }
  }

  Widget _editableField(String label, String key) {
    final isEditing = _editingField[key] ?? false;
    final value = userData?[key] ?? '';
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Expanded(
            child: isEditing
                ? TextField(
                    controller: _controllers[key],
                    autofocus: true,
                    onSubmitted: (_) => _saveField(key),
                    decoration: InputDecoration(
                      labelText: label,
                      suffixIcon: IconButton(
                        icon: const Icon(Icons.check, color: Colors.green),
                        onPressed: () => _saveField(key),
                      ),
                    ),
                  )
                : ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: Text(label),
                    subtitle: Text(value.isNotEmpty ? value : 'Chưa cập nhật'),
                  ),
          ),
          if (!isEditing)
            IconButton(
              icon: const Icon(Icons.edit),
              onPressed: () {
                setState(() {
                  _editingField[key] = true;
                  _controllers[key]?.text = value;
                });
              },
            ),
        ],
      ),
    );
  }

  void _saveField(String key) async {
    final value = _controllers[key]?.text ?? '';
    setState(() {
      userData![key] = value;
      _editingField[key] = false;
    });
    await _updateProfileField(context, key, value);
  }

  // Xử lý đăng xuất
  Future<void> _handleLogout() async {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Xác nhận đăng xuất'),
          content: const Text('Bạn có chắc chắn muốn đăng xuất không?'),
          actions: <Widget>[
            TextButton(
              child: const Text('Hủy'),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
            TextButton(
              child: const Text('Đăng xuất'),
              onPressed: () async {
                Navigator.of(context).pop();

                // Xóa token khỏi SharedPreferences
                final prefs = await SharedPreferences.getInstance();
                await prefs.remove('token');

                // Chuyển về màn hình đăng nhập
                if (mounted) {
                  Navigator.of(context).pushAndRemoveUntil(
                    MaterialPageRoute(builder: (_) => const LoginScreen()),
                    (route) => false,
                  );
                }
              },
            ),
          ],
        );
      },
    );
  }
}
