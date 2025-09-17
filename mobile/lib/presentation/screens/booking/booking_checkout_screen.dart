import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../../../logic/booking/booking_bloc.dart';
import '../../../logic/booking/booking_event.dart';
import '../../../logic/booking/booking_state.dart';
import '../../../data/models/timeslot_model.dart';
import '../../../utils/responsive_helper.dart';
import '../../../utils/price_utils.dart';
import '../../../core/constants/app_api.dart';
import '../auth/login_screen.dart';

class BookingCheckoutScreen extends StatefulWidget {
  const BookingCheckoutScreen({super.key});

  @override
  State<BookingCheckoutScreen> createState() => _BookingCheckoutScreenState();
}

class _BookingCheckoutScreenState extends State<BookingCheckoutScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();

  String? _token;
  bool isUserInfoLoaded = false;

  @override
  void initState() {
    super.initState();
    _loadTokenAndUser();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _loadTokenAndUser() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('token');
    print('🔑 [BookingCheckout] Token: $_token');

    if (_token != null && _token!.isNotEmpty) {
      try {
        print('📡 [BookingCheckout] Calling API: ${AppAPI.profileUser}');
        final res = await http.get(
          Uri.parse(AppAPI.profileUser),
          headers: {'Authorization': 'Bearer $_token'},
        );

        print('📊 [BookingCheckout] Response status: ${res.statusCode}');
        print('📋 [BookingCheckout] Response body: ${res.body}');

        if (res.statusCode == 200) {
          final data = json.decode(res.body);
          print('✅ [BookingCheckout] Parsed data: $data');

          if (!mounted) return;
          setState(() {
            // Combine firstname and lastname for name field
            final firstName = data['firstname'] ?? '';
            final lastName = data['lastname'] ?? '';
            _nameController.text = '$firstName $lastName'.trim();
            _emailController.text = data['email'] ?? '';
            _phoneController.text = data['mobile'] ?? '';
            isUserInfoLoaded = true;
          });

          print('📝 [BookingCheckout] Controllers updated:');
          print('   - Name: ${_nameController.text}');
          print('   - Email: ${_emailController.text}');
          print('   - Phone: ${_phoneController.text}');
        } else {
          print(
            '❌ [BookingCheckout] API Error: ${res.statusCode} - ${res.body}',
          );
        }
      } catch (e) {
        print('💥 [BookingCheckout] Error loading user info: $e');
      }
    } else {
      print('🚫 [BookingCheckout] No token found');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Xác Nhận Đặt Sân'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 1,
      ),
      body: BlocConsumer<BookingBloc, BookingState>(
        listener: (context, state) {
          if (state is BookingError) {
            // Check if token expired
            if (state.message.contains('TOKEN_EXPIRED')) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text(
                    'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
                  ),
                  backgroundColor: Colors.red,
                ),
              );
              // Navigate to login screen
              Navigator.of(context).pushAndRemoveUntil(
                MaterialPageRoute(builder: (context) => const LoginScreen()),
                (route) => false,
              );
            } else {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(state.message),
                  backgroundColor: Colors.red,
                ),
              );
            }
          } else if (state is BookingSuccess) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: Colors.green,
                duration: const Duration(seconds: 3),
              ),
            );
            // Simply pop back to booking screen
            Navigator.of(context).pop();
          }
        },
        builder: (context, state) {
          if (state is BookingLoaded) {
            return SingleChildScrollView(
              padding: ResponsiveHelper.responsivePadding(context, all: 16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Booking Summary
                    _buildBookingSummary(context, state),
                    SizedBox(
                      height: ResponsiveHelper.responsiveHeight(context, 3),
                    ),

                    // Customer Information
                    Text(
                      'Thông Tin Khách Hàng',
                      style: TextStyle(
                        fontSize: ResponsiveHelper.responsiveFontSize(
                          context,
                          18,
                        ),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(
                      height: ResponsiveHelper.responsiveHeight(context, 2),
                    ),

                    if (isUserInfoLoaded) ...[
                      // User info display (read-only)
                      Container(
                        width: double.infinity,
                        padding: ResponsiveHelper.responsivePadding(
                          context,
                          all: 16,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.grey.shade50,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.grey.shade300),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildCustomerInfoRow(
                              context,
                              Icons.person,
                              'Họ và tên',
                              _nameController.text,
                            ),
                            SizedBox(
                              height: ResponsiveHelper.responsiveHeight(
                                context,
                                1,
                              ),
                            ),
                            _buildCustomerInfoRow(
                              context,
                              Icons.email,
                              'Email',
                              _emailController.text,
                            ),
                            SizedBox(
                              height: ResponsiveHelper.responsiveHeight(
                                context,
                                1,
                              ),
                            ),
                            _buildCustomerInfoRow(
                              context,
                              Icons.phone,
                              'Số điện thoại',
                              _phoneController.text,
                            ),
                          ],
                        ),
                      ),
                    ] else ...[
                      // Loading indicator
                      Container(
                        width: double.infinity,
                        padding: ResponsiveHelper.responsivePadding(
                          context,
                          all: 20,
                        ),
                        child: Center(
                          child: Column(
                            children: [
                              const CircularProgressIndicator(),
                              SizedBox(
                                height: ResponsiveHelper.responsiveHeight(
                                  context,
                                  1,
                                ),
                              ),
                              Text(
                                'Đang tải thông tin khách hàng...',
                                style: TextStyle(
                                  fontSize: ResponsiveHelper.responsiveFontSize(
                                    context,
                                    14,
                                  ),
                                  color: Colors.grey[600],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                    SizedBox(
                      height: ResponsiveHelper.responsiveHeight(context, 3),
                    ),

                    // Total and Confirm Button
                    Container(
                      width: double.infinity,
                      padding: ResponsiveHelper.responsivePadding(
                        context,
                        all: 16,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.blue.shade50,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.blue.shade200),
                      ),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Tổng tiền:',
                                style: TextStyle(
                                  fontSize: ResponsiveHelper.responsiveFontSize(
                                    context,
                                    18,
                                  ),
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              Text(
                                PriceUtils.formatPrice(state.totalPrice),
                                style: TextStyle(
                                  fontSize: ResponsiveHelper.responsiveFontSize(
                                    context,
                                    18,
                                  ),
                                  fontWeight: FontWeight.bold,
                                  color: Colors.blue,
                                ),
                              ),
                            ],
                          ),
                          SizedBox(
                            height: ResponsiveHelper.responsiveHeight(
                              context,
                              2,
                            ),
                          ),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              onPressed:
                                  (state.isCreatingBooking || !isUserInfoLoaded)
                                  ? null
                                  : _confirmBooking,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.blue,
                                padding: ResponsiveHelper.responsivePadding(
                                  context,
                                  vertical: 16,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                              child: state.isCreatingBooking
                                  ? Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: [
                                        const SizedBox(
                                          width: 20,
                                          height: 20,
                                          child: CircularProgressIndicator(
                                            color: Colors.white,
                                            strokeWidth: 2,
                                          ),
                                        ),
                                        SizedBox(
                                          width:
                                              ResponsiveHelper.responsiveWidth(
                                                context,
                                                2,
                                              ),
                                        ),
                                        Text(
                                          'Đang xử lý...',
                                          style: TextStyle(
                                            fontSize:
                                                ResponsiveHelper.responsiveFontSize(
                                                  context,
                                                  16,
                                                ),
                                            fontWeight: FontWeight.bold,
                                            color: Colors.white,
                                          ),
                                        ),
                                      ],
                                    )
                                  : Text(
                                      'Xác Nhận Đặt Sân',
                                      style: TextStyle(
                                        fontSize:
                                            ResponsiveHelper.responsiveFontSize(
                                              context,
                                              16,
                                            ),
                                        fontWeight: FontWeight.bold,
                                        color: Colors.white,
                                      ),
                                    ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            );
          }

          return const Center(child: CircularProgressIndicator());
        },
      ),
    );
  }

  Widget _buildBookingSummary(BuildContext context, BookingLoaded state) {
    final dateFormat = DateFormat('dd/MM/yyyy');
    final sortedSlots = List<TimeSlotModel>.from(state.selectedTimeSlots)
      ..sort((a, b) => a.timeSlotId.compareTo(b.timeSlotId));

    return Container(
      padding: ResponsiveHelper.responsivePadding(context, all: 16),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey.shade300),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Chi Tiết Đặt Sân',
            style: TextStyle(
              fontSize: ResponsiveHelper.responsiveFontSize(context, 18),
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: ResponsiveHelper.responsiveHeight(context, 1.5)),
          _buildInfoRow(
            context,
            'Chi nhánh:',
            state.selectedBranch!.branchName,
          ),
          _buildInfoRow(context, 'Sân:', state.selectedCourt!.courtName),
          _buildInfoRow(
            context,
            'Ngày:',
            dateFormat.format(state.selectedDate!),
          ),
          _buildInfoRow(
            context,
            'Thời gian:',
            '${sortedSlots.first.displayTime} - ${sortedSlots.last.endTime}',
          ),
          _buildInfoRow(
            context,
            'Số giờ:',
            '${state.selectedTimeSlots.length} giờ',
          ),
          _buildInfoRow(
            context,
            'Giá/giờ:',
            PriceUtils.formatPrice(state.selectedCourt!.pricePerHour),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(BuildContext context, String label, String value) {
    return Padding(
      padding: ResponsiveHelper.responsivePadding(context, vertical: 2),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: ResponsiveHelper.responsiveWidth(context, 21),
            child: Text(
              label,
              style: TextStyle(
                color: Colors.grey[600],
                fontSize: ResponsiveHelper.responsiveFontSize(context, 14),
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                fontWeight: FontWeight.w500,
                fontSize: ResponsiveHelper.responsiveFontSize(context, 14),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCustomerInfoRow(
    BuildContext context,
    IconData icon,
    String label,
    String value,
  ) {
    return Row(
      children: [
        Icon(
          icon,
          size: ResponsiveHelper.responsiveFontSize(context, 16),
          color: Colors.grey[600],
        ),
        SizedBox(width: ResponsiveHelper.responsiveWidth(context, 3)),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  fontSize: ResponsiveHelper.responsiveFontSize(context, 12),
                  color: Colors.grey[600],
                ),
              ),
              Text(
                value.isNotEmpty ? value : 'Chưa có thông tin',
                style: TextStyle(
                  fontSize: ResponsiveHelper.responsiveFontSize(context, 14),
                  fontWeight: FontWeight.w500,
                  color: value.isNotEmpty ? Colors.black : Colors.grey[500],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  void _confirmBooking() {
    // Validate that user info is loaded and fields are not empty
    if (!isUserInfoLoaded) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Đang tải thông tin khách hàng, vui lòng đợi...'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    if (_nameController.text.trim().isEmpty ||
        _emailController.text.trim().isEmpty ||
        _phoneController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Thông tin khách hàng không đầy đủ. Vui lòng thử lại.'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    context.read<BookingBloc>().add(
      CreateBooking(
        customerName: _nameController.text.trim(),
        customerEmail: _emailController.text.trim(),
        customerPhone: _phoneController.text.trim(),
      ),
    );
  }
}
