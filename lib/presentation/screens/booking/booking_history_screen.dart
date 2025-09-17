import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import '../../../logic/booking/booking_bloc.dart';
import '../../../logic/booking/booking_event.dart';
import '../../../logic/booking/booking_state.dart';
import '../../../data/models/booking_model.dart';

class BookingHistoryScreen extends StatefulWidget {
  const BookingHistoryScreen({super.key});

  @override
  State<BookingHistoryScreen> createState() => _BookingHistoryScreenState();
}

class _BookingHistoryScreenState extends State<BookingHistoryScreen> {
  final List<int> _selectedBookings = [];

  @override
  void initState() {
    super.initState();
    context.read<BookingBloc>().add(LoadBookingHistory());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Lịch Sử Đặt Sân'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 1,
        actions: [
          if (_selectedBookings.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.delete),
              onPressed: _showCancelDialog,
            ),
        ],
      ),
      body: BlocConsumer<BookingBloc, BookingState>(
        listener: (context, state) {
          if (state is BookingError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: Colors.red,
              ),
            );
          } else if (state is BookingSuccess) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: Colors.green,
              ),
            );
            setState(() {
              _selectedBookings.clear();
            });
          }
        },
        builder: (context, state) {
          if (state is BookingLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (state is BookingLoaded) {
            final bookings = state.bookingHistory;

            if (bookings.isEmpty) {
              return const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.sports_tennis, size: 64, color: Colors.grey),
                    SizedBox(height: 16),
                    Text(
                      'Chưa có lịch sử đặt sân',
                      style: TextStyle(fontSize: 16, color: Colors.grey),
                    ),
                  ],
                ),
              );
            }

            // Group bookings by date - Bỏ grouping, hiển thị dạng bảng
            return Column(
              children: [
                // Header bảng
                Container(
                  decoration: BoxDecoration(
                    color: Colors.blue.shade50,
                    border: Border.all(color: Colors.grey.shade400, width: 1),
                  ),
                  child: Row(
                    children: [
                      _buildHeaderCell('Ngày', flex: 2),
                      _buildHeaderCell('Chi nhánh', flex: 2),
                      _buildHeaderCell(
                        'Sân',
                        flex: 2,
                        textAlign: TextAlign.center,
                      ),
                      _buildHeaderCell(
                        'Khung giờ',
                        flex: 2,
                        textAlign: TextAlign.center,
                      ),
                      _buildHeaderCell(
                        'Trạng thái',
                        flex: 2,
                        textAlign: TextAlign.center,
                      ),
                      _buildHeaderCell(
                        'Thao tác',
                        flex: 2,
                        textAlign: TextAlign.center,
                        isLast: true,
                      ),
                    ],
                  ),
                ),

                // Nội dung bảng
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.all(0),
                    itemCount: bookings.length,
                    itemBuilder: (context, index) {
                      final booking = bookings[index];
                      return _buildBookingRow(booking, index);
                    },
                  ),
                ),
              ],
            );
          }

          return const Center(child: Text('Có lỗi xảy ra. Vui lòng thử lại.'));
        },
      ),
    );
  }

  Widget _buildHeaderCell(
    String text, {
    required int flex,
    TextAlign? textAlign,
    bool isLast = false,
  }) {
    return Expanded(
      flex: flex,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          border: Border(
            right: isLast
                ? BorderSide.none
                : BorderSide(color: Colors.grey.shade400, width: 1),
          ),
        ),
        child: Text(
          text,
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: Colors.blue.shade700,
            fontSize: 12,
          ),
          textAlign: textAlign ?? TextAlign.left,
        ),
      ),
    );
  }

  Widget _buildBookingRow(BookingModel booking, int index) {
    final isEvenRow = index % 2 == 0;
    // Loại bỏ canCancel - user có thể hủy thoải mái

    return Container(
      decoration: BoxDecoration(
        color: isEvenRow ? Colors.white : Colors.grey.shade50,
        border: Border.all(color: Colors.grey.shade300, width: 0.5),
      ),
      child: Row(
        children: [
          _buildDataCell(
            DateFormat('yyyy-MM-dd').format(booking.bookingDate),
            flex: 2,
          ),
          _buildDataCell('An Phú Đông Q12', flex: 2),
          _buildDataCell(
            booking.courtId.toString(),
            flex: 1,
            textAlign: TextAlign.center,
          ),
          _buildDataCell(
            booking.timeSlot ?? '8-17',
            flex: 2,
            textAlign: TextAlign.center,
          ),
          _buildStatusCell(booking.status, flex: 3),
          _buildActionCell(
            true, // Luôn cho phép hủy
            booking.bookingId!,
            flex: 2,
            isLast: true,
          ),
        ],
      ),
    );
  }

  Widget _buildDataCell(
    String text, {
    required int flex,
    TextAlign? textAlign,
    bool isLast = false,
  }) {
    return Expanded(
      flex: flex,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          border: Border(
            right: isLast
                ? BorderSide.none
                : BorderSide(color: Colors.grey.shade300, width: 0.5),
          ),
        ),
        child: Text(
          text,
          style: const TextStyle(fontSize: 12),
          textAlign: textAlign ?? TextAlign.left,
        ),
      ),
    );
  }

  Widget _buildStatusCell(String status, {required int flex}) {
    return Expanded(
      flex: flex,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          border: Border(
            right: BorderSide(color: Colors.grey.shade300, width: 0.5),
          ),
        ),
        child: Center(
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: _getStatusColor(status),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: _getStatusColor(status).withOpacity(0.3),
                  blurRadius: 4,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Text(
              _getStatusText(status),
              style: const TextStyle(
                fontSize: 11,
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildActionCell(
    bool showCancelButton,
    int bookingId, {
    required int flex,
    bool isLast = false,
  }) {
    return Expanded(
      flex: flex,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          border: Border(
            right: isLast
                ? BorderSide.none
                : BorderSide(color: Colors.grey.shade300, width: 0.5),
          ),
        ),
        child: Center(
          child: showCancelButton
              ? ElevatedButton(
                  onPressed: () => _showCancelSingleBookingDialog(bookingId),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    minimumSize: const Size(50, 30),
                  ),
                  child: const Text(
                    'Hủy',
                    style: TextStyle(fontSize: 10, color: Colors.white),
                  ),
                )
              : const Text(
                  '-',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey),
                ),
        ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return Colors.green.shade600; // Xanh lá đậm - Đã xác nhận
      case 'cancelled':
      case 'user hủy sân':
        return Colors.deepOrange.shade600; // Đỏ cam - User hủy sân
      case 'pending':
      case 'đang chờ duyệt':
        return Colors.blue.shade600; // Xanh lam - Đang chờ duyệt
      case 'completed':
        return Colors.teal.shade600; // Xanh ngọc - Hoàn thành
      case 'expired':
        return Colors.grey.shade600; // Xám - Hết hạn
      case 'refunded':
        return Colors.purple.shade600; // Tím - Đã hoàn tiền
      default:
        return Colors.grey.shade500; // Xám nhạt - Không xác định
    }
  }

  String _getStatusText(String status) {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'Đã xác nhận';
      case 'cancelled':
        return 'Đã hủy';
      case 'user hủy sân':
        return 'User hủy sân';
      case 'pending':
        return 'Chờ xác nhận';
      case 'đang chờ duyệt':
        return 'Đang chờ duyệt';
      case 'completed':
        return 'Hoàn thành';
      case 'expired':
        return 'Hết hạn';
      case 'refunded':
        return 'Đã hoàn tiền';
      default:
        return status;
    }
  }

  void _showCancelSingleBookingDialog(int bookingId) {
    final bookingBloc = context
        .read<BookingBloc>(); // Lấy bloc trước khi vào dialog
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Xác nhận hủy'),
        content: const Text('Bạn có chắc chắn muốn hủy booking này?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('Không'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(dialogContext);
              bookingBloc.add(CancelBookings([bookingId])); // Dùng bloc đã lấy
            },
            child: const Text('Có', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  void _showCancelDialog() {
    final bookingBloc = context
        .read<BookingBloc>(); // Lấy bloc trước khi vào dialog
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Xác nhận hủy'),
        content: Text(
          'Bạn có chắc chắn muốn hủy ${_selectedBookings.length} booking đã chọn?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('Không'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(dialogContext);
              bookingBloc.add(
                CancelBookings(_selectedBookings),
              ); // Dùng bloc đã lấy
            },
            child: const Text('Có', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }
}
