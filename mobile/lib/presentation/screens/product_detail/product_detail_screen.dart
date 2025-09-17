import 'package:flutter/material.dart';

import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:http/http.dart' as http;
import '../../../../core/constants/app_api.dart';
import '../../../../data/models/product_model.dart';
import '../../../../data/models/specification_model.dart';
import '../../../../utils/price_utils.dart';
import '../../../../data/services/shoe_size_service.dart';
import 'widgets/specification_table.dart';
import 'widgets/comment_list.dart';
import 'widgets/shoe_size_selector.dart';
import '../cart/cart_state.dart';
import '../cart/cart_screen.dart';

class ProductDetailScreen extends StatefulWidget {
  final ProductModel product;
  const ProductDetailScreen({super.key, required this.product});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  List<dynamic> comments = [];
  bool loadingComments = true;
  Map<int, bool> openReplies = {}; // commentId -> bool
  Map<int, List<dynamic>> replies = {}; // commentId -> List reply
  Map<int, bool> loadingReplies = {}; // commentId -> bool
  Map<int, TextEditingController> replyControllers = {};
  TextEditingController commentController = TextEditingController();
  bool sendingReply = false;
  int? replyingTo;

  // Size selection cho giày (categoryId = 2)
  String? selectedSize;
  bool hasProductSizes = false;

  List<SpecificationModel> specifications = [];
  bool loadingSpecs = true;

  @override
  void initState() {
    super.initState();
    fetchComments();
    fetchSpecifications();
    _checkProductSizes();
  }

  Future<void> _checkProductSizes() async {
    if (widget.product.categoryId == 2) {
      final service = ShoeSizeService();
      hasProductSizes = await service.hasShoeSize(widget.product.id);
      setState(() {});
    }
  }

  Future<void> fetchSpecifications() async {
    setState(() => loadingSpecs = true);
    try {
      final res = await http.get(
        Uri.parse('${AppAPI.products}/${widget.product.id}/specifications'),
      );
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        setState(() {
          specifications = (data['data'] ?? data)
              .map<SpecificationModel>((e) => SpecificationModel.fromJson(e))
              .toList();
          loadingSpecs = false;
        });
      } else {
        setState(() => loadingSpecs = false);
      }
    } catch (e) {
      setState(() => loadingSpecs = false);
    }
  }

  Future<void> fetchComments() async {
    setState(() => loadingComments = true);
    try {
      final res = await http.get(
        Uri.parse('${AppAPI.comments}/${widget.product.id}'),
      );
      if (res.statusCode == 200) {
        final commentsData = jsonDecode(res.body);
        setState(() {
          comments = commentsData;
          loadingComments = false;
        });

        // Fetch replies cho tất cả comments ngay sau khi load comments
        for (var comment in commentsData) {
          if (comment['CommentId'] != null) {
            fetchReplies(comment['CommentId']);
          }
        }
      } else {
        setState(() => loadingComments = false);
      }
    } catch (e) {
      setState(() => loadingComments = false);
    }
  }

  Future<void> fetchReplies(int commentId) async {
    setState(() {
      loadingReplies[commentId] = true;
    });
    try {
      final res = await http.get(
        Uri.parse('${AppAPI.comments}/$commentId/replies'),
      );
      if (res.statusCode == 200) {
        setState(() {
          replies[commentId] = jsonDecode(res.body);
          loadingReplies[commentId] = false;
        });
      } else {
        setState(() {
          replies[commentId] = [];
          loadingReplies[commentId] = false;
        });
      }
    } catch (e) {
      setState(() {
        replies[commentId] = [];
        loadingReplies[commentId] = false;
      });
    }
  }

  Future<void> sendReply(int commentId) async {
    final content = replyControllers[commentId]?.text.trim() ?? '';
    if (content.isEmpty) return;
    setState(() {
      sendingReply = true;
    });
    try {
      final token = await _getToken();
      final res = await http.post(
        Uri.parse('${AppAPI.baseUrl}/comments/reply'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
        body: jsonEncode({'CommentId': commentId, 'Content': content}),
      );
      if (res.statusCode == 200 || res.statusCode == 201) {
        replyControllers[commentId]?.clear();
        await fetchReplies(commentId);
        setState(() {
          replyingTo = null;
          openReplies[commentId] = true;
        });
      } else {
        _showError('Gửi phản hồi thất bại');
      }
    } catch (e) {
      _showError('Gửi phản hồi thất bại');
    } finally {
      setState(() {
        sendingReply = false;
      });
    }
  }

  Future<String?> _getToken() async {
    // Lấy token từ SharedPreferences
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  void _showError(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  // Thêm comment mới
  Future<void> addComment() async {
    if (commentController.text.trim().isEmpty) return;

    final token = await _getToken();
    if (token == null) {
      _showError('Bạn cần đăng nhập để bình luận.');
      return;
    }

    try {
      final response = await http.post(
        Uri.parse(AppAPI.comments),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'ProductId': widget.product.id,
          'Content': commentController.text.trim(),
        }),
      );

      if (response.statusCode == 201) {
        commentController.clear();
        fetchComments(); // Reload comments
        _showError('Thêm bình luận thành công!');
      } else {
        _showError('Thêm bình luận thất bại');
      }
    } catch (e) {
      _showError('Đã xảy ra lỗi khi thêm bình luận');
    }
  }

  @override
  Widget build(BuildContext context) {
    // Giả sử product.images là List<String> các tên file ảnh phụ, nếu chưa có thì để []
    final product = widget.product;
    final List<String> images = product.images;
    final String mainImage = product.avatar != null
        ? '${AppAPI.baseUrl}/uploads/${product.avatar}'
        : '';
    return Scaffold(
      appBar: AppBar(
        title: Text(product.name),
        actions: [
          ValueListenableBuilder<int>(
            valueListenable: CartState.cartCount,
            builder: (context, count, child) {
              return Stack(
                children: [
                  IconButton(
                    icon: const Icon(
                      Icons.shopping_cart_outlined,
                      color: Colors.black,
                    ),
                    onPressed: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const CartScreen()),
                      );
                    },
                  ),
                  if (count > 0)
                    Positioned(
                      right: 6,
                      top: 6,
                      child: Container(
                        padding: const EdgeInsets.all(2),
                        decoration: BoxDecoration(
                          color: Colors.red,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        constraints: const BoxConstraints(
                          minWidth: 18,
                          minHeight: 18,
                        ),
                        child: Text(
                          '$count',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                ],
              );
            },
          ),
        ],
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.only(left: 16, right: 16, bottom: 80),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (mainImage.isNotEmpty)
                  AspectRatio(
                    aspectRatio: 1.7,
                    child: Container(
                      width: double.infinity,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.12),
                            blurRadius: 12,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child: Image.network(mainImage, fit: BoxFit.cover),
                      ),
                    ),
                  ),
                if (images.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    child: SizedBox(
                      height: 60,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: images.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 10),
                        itemBuilder: (context, idx) => ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Image.network(
                            '${AppAPI.baseUrl}/uploads/${images[idx]}',
                            width: 60,
                            height: 60,
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),
                    ),
                  ),
                const SizedBox(height: 12),
                // Tên sản phẩm
                Text(
                  product.name,
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                // Giá
                Text.rich(
                  TextSpan(
                    text: 'Giá: ',
                    style: const TextStyle(fontSize: 18, color: Colors.black87),
                    children: [
                      TextSpan(
                        text: PriceUtils.formatPrice(product.price),
                        style: const TextStyle(
                          color: Colors.blue,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                // Hãng dạng badge đẹp
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xffe8f0fe),
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.blue.withOpacity(0.15),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: RichText(
                        text: TextSpan(
                          text: 'Thương hiệu: ',
                          style: const TextStyle(
                            color: Colors.black87,
                            fontSize: 16,
                          ),
                          children: [
                            TextSpan(
                              text: product.brand ?? 'Không rõ',
                              style: const TextStyle(
                                color: Colors.blue,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                // Badge tình trạng, mã SP, quà tặng: dùng Wrap để không bị tràn
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xffe8f0fe),
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.blue.withOpacity(0.15),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Text(
                        'Tình trạng: ${product.status ?? "Còn hàng"}',
                        style: const TextStyle(
                          color: Colors.blue,
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                        ),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xffe8f0fe),
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.blue.withOpacity(0.15),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Text(
                        'Mã SP: ${product.id}',
                        style: const TextStyle(
                          color: Colors.blue,
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                        ),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xffe8f0fe),
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.blue.withOpacity(0.15),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: const Text(
                        'Mua online tặng ngay quấn cán Yonex',
                        style: TextStyle(
                          color: Colors.blue,
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                // Chọn size giày
                if (widget.product.categoryId == 2 && hasProductSizes) ...[
                  const Text(
                    'Chọn size:',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  ShoeSizeSelector(
                    productId: widget.product.id,
                    onSizeSelected: (size) {
                      setState(() {
                        selectedSize = size;
                      });
                    },
                    initialSelectedSize: selectedSize,
                  ),
                  const SizedBox(height: 12),
                ],
                const SizedBox(height: 12),
                // Mô tả
                Text(
                  product.description ?? '',
                  style: const TextStyle(fontSize: 15),
                ),
                const SizedBox(height: 18),
                // Thông số kỹ thuật
                Text(
                  'Thông số kỹ thuật',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                loadingSpecs
                    ? const Padding(
                        padding: EdgeInsets.symmetric(vertical: 16),
                        child: Center(child: CircularProgressIndicator()),
                      )
                    : SpecificationTable(specifications: specifications),
                const Divider(height: 32),
                Text(
                  'Bình luận',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                loadingComments
                    ? const Padding(
                        padding: EdgeInsets.symmetric(vertical: 16),
                        child: Center(child: CircularProgressIndicator()),
                      )
                    : CommentList(
                        comments: comments,
                        openReplies: openReplies,
                        replies: replies,
                        loadingReplies: loadingReplies,
                        replyControllers: replyControllers,
                        replyingTo: replyingTo,
                        sendingReply: sendingReply,
                        onReplyPressed: (commentId) {
                          setState(() {
                            replyingTo = replyingTo == commentId
                                ? null
                                : commentId;
                            if (!replyControllers.containsKey(commentId)) {
                              replyControllers[commentId] =
                                  TextEditingController();
                            }
                          });
                        },
                        onSendReply: sendReply,
                        onToggleReplies: (commentId) {
                          setState(() {
                            openReplies[commentId] =
                                !(openReplies[commentId] ?? false);
                          });
                        },
                        onAddComment: addComment,
                        commentController: commentController,
                      ),
                const SizedBox(height: 80), // Space for bottom button
              ],
            ),
          ),
          // Nút thêm vào giỏ hàng fixed dưới cùng
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: Container(
              color: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: SafeArea(
                top: false,
                child: SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      // Chỉ yêu cầu chọn size nếu sản phẩm là giày và có size trong database
                      if (widget.product.categoryId == 2 &&
                          hasProductSizes &&
                          selectedSize == null) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Vui lòng chọn size giày!'),
                            duration: Duration(milliseconds: 1000),
                          ),
                        );
                        return;
                      }

                      // Thêm vào cart với size đã chọn (nếu có)
                      CartState.addToCart(product, selectedSize: selectedSize);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Đã thêm vào giỏ hàng!'),
                          duration: Duration(milliseconds: 800),
                        ),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      textStyle: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    child: const Text('Thêm vào giỏ hàng'),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
