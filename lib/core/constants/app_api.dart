class AppAPI {
  // Base URL - Sử dụng IP để mobile app có thể kết nối từ thiết bị thật
  // static const baseUrl = "https://kientienonline.site/api";
  static const baseUrl = "https://kientienonline.site/api";
  // Auth
  static const login = '$baseUrl/auth/login';
  static const register = '$baseUrl/auth/register';

  // Product
  static const products = '$baseUrl/products';
  static String productById(int id) => '$baseUrl/products/$id';

  // Category
  static const categories = '$baseUrl/categories';
  static String categoryById(int id) => '$baseUrl/categories/$id';

  // Brand
  static const brands = '$baseUrl/brands';
  static String brandById(int id) => '$baseUrl/brands/$id';

  // Customer
  static const customers = '$baseUrl/customers';
  static String customerById(int id) => '$baseUrl/customers/$id';

  // Order
  static const orders = '$baseUrl/order'; // Sửa từ orders thành order
  static String orderById(int id) =>
      '$baseUrl/order/$id'; // Sửa từ orders thành order

  // Order Detail
  static const orderDetails = '$baseUrl/orderdetails';
  static String orderDetailById(int id) => '$baseUrl/orderdetails/$id';

  // Comments
  static const comments = '$baseUrl/comments';
  static String commentById(int id) => '$baseUrl/comments/$id';

  // Comment Reply
  static const commentReplies = '$baseUrl/commentreplies';
  static String commentReplyById(int id) => '$baseUrl/commentreplies/$id';

  // Account Management (Admin)
  static const accountManagement = '$baseUrl/privatesite/accountmanagement';
  static String accountManagementById(int id) =>
      '$baseUrl/privatesite/accountmanagement/$id';

  // Profile User (current logged in user)
  static const profileUser = '$baseUrl/profileUser';
  static String profileUserById(int id) => '$baseUrl/profileUser/$id';
  // Update profile
  static const updateProfileUser = '$baseUrl/updateprofileUser';

  // Get user's orders
  static const getUserOrders = '$baseUrl/order';

  // Change password
  static const changePasswordUser = '$baseUrl/profile/changepasswordUser';

  // Group Account
  static const groupAccounts = '$baseUrl/groupaccounts';
  static String groupAccountById(int id) => '$baseUrl/groupaccounts/$id';

  // Image
  static const images = '$baseUrl/images';
  static String imageById(int id) => '$baseUrl/images/$id';

  // Clothing Size
  static const clothingSizes = '$baseUrl/clothingsizes';
  static String clothingSizeById(int id) => '$baseUrl/clothingsizes/$id';

  // Shoes Size
  static const shoesSizes = '$baseUrl/shoessizes';
  static String shoesSizeById(int id) => '$baseUrl/shoessizes/$id';

  // Specification
  static const specifications = '$baseUrl/specifications';
  static String specificationById(int id) => '$baseUrl/specifications/$id';

  // Order Status
  static const orderStatuses = '$baseUrl/orderstatuses';
  static String orderStatusById(int id) => '$baseUrl/orderstatuses/$id';

  // Checkout
  static const checkout = '$baseUrl/checkout';
  static const checkoutGetCustomer = '$baseUrl/checkout/getcustomer';

  // VNPay Payment - Mobile
  static const createVNPayPaymentUrlMobile =
      '$baseUrl/checkout/mobile/create-vnpay-payment-url';
  static String updatePaymentStatus(int orderId) =>
      '$baseUrl/checkout/mobile/update-payment-status/$orderId';

  // Booking
  static const branches = '$baseUrl/branches';
  static String courtsByBranch(int branchId) =>
      '$baseUrl/courts/branch/$branchId';
  static const timeSlots = '$baseUrl/timeslots';
  static String bookedSlots(int courtId, String date) =>
      '$baseUrl/bookings/booked-slots/$courtId/$date';
  static const createBooking = '$baseUrl/bookings';
  static const bookingHistory = '$baseUrl/bookings/history';
  static String cancelBooking(int bookingId) =>
      '$baseUrl/bookings/cancel/$bookingId';
}
