import 'package:flutter/material.dart';

import '../../../core/constants/app_colors.dart';

import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../logic/product/product_bloc.dart';
import '../../../logic/product/product_state.dart';
import '../../../data/models/product_model.dart';
import '../../../data/models/brand_model.dart';
import '../../../data/models/category_model.dart';
import '../../../data/services/filter_service.dart';
import 'widgets/product_card.dart';
import 'widgets/search_widget.dart';
import 'widgets/filter_keywords_widget.dart';
import 'widgets/product_filter_widget.dart';
import '../home/widgets/banner_slider.dart';
import '../cart/cart_state.dart';
import '../cart/cart_screen.dart';

class ProductsScreen extends StatefulWidget {
  const ProductsScreen({super.key});

  @override
  State<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends State<ProductsScreen> {
  final TextEditingController searchController = TextEditingController();
  final FilterService _filterService = FilterService();

  String? selectedKeyword;
  List<ProductModel> allProducts = [];
  List<ProductModel> filteredProducts = [];
  List<BrandModel> brands = [];
  List<CategoryModel> categories = [];

  // Filter states
  List<int> selectedBrands = [];
  List<int> selectedCategories = [];
  RangeValues priceRange = const RangeValues(0, 5000000);
  double minPrice = 0;
  double maxPrice = 5000000;

  @override
  void initState() {
    super.initState();
    _loadFilterData();
  }

  Future<void> _loadFilterData() async {
    try {
      final results = await Future.wait([
        _filterService.getAllBrands(),
        _filterService.getAllCategories(),
      ]);

      if (mounted) {
        setState(() {
          brands = results[0] as List<BrandModel>;
          categories = results[1] as List<CategoryModel>;
        });
      }
    } catch (e) {
      // Handle error if needed
      print('Error loading filter data: $e');
    }
  }

  void filterProducts(String query) {
    setState(() {
      selectedKeyword = query;
      searchController.text = query;
      _applyAllFilters();
    });
  }

  void _applyAllFilters() {
    List<ProductModel> filtered = List.from(allProducts);

    // Search text filter
    if (selectedKeyword != null && selectedKeyword!.isNotEmpty) {
      final lower = selectedKeyword!.toLowerCase();
      filtered = filtered.where((product) {
        return product.name.toLowerCase().contains(lower) ||
            ['yonex', 'lining', 'mizuno', 'victor'].any(
              (brand) =>
                  brand.toLowerCase() == lower &&
                  product.name.toLowerCase().contains(brand),
            );
      }).toList();
    }

    // Category filter
    if (selectedCategories.isNotEmpty) {
      filtered = filtered
          .where((product) => selectedCategories.contains(product.categoryId))
          .toList();
    }

    // Brand filter
    if (selectedBrands.isNotEmpty) {
      filtered = filtered
          .where((product) => selectedBrands.contains(product.brandId))
          .toList();
    }

    // Price filter
    filtered = filtered
        .where(
          (product) =>
              product.price >= priceRange.start &&
              product.price <= priceRange.end,
        )
        .toList();

    filteredProducts = filtered;
  }

  void _resetFilters() {
    setState(() {
      selectedBrands.clear();
      selectedCategories.clear();
      priceRange = RangeValues(minPrice, maxPrice);
      selectedKeyword = null;
      searchController.clear();
      _applyAllFilters();
    });
  }

  void _updatePriceRange() {
    if (allProducts.isNotEmpty) {
      final prices = allProducts.map((p) => p.price).toList();
      minPrice = prices.reduce((a, b) => a < b ? a : b);
      maxPrice = prices.reduce((a, b) => a > b ? a : b);
      priceRange = RangeValues(minPrice, maxPrice);
    }
  }

  void _goToCart() {
    Navigator.of(
      context,
    ).push(MaterialPageRoute(builder: (_) => const CartScreen()));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        titleSpacing: 0,
        title: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                const SizedBox(width: 16),
                CircleAvatar(
                  radius: 16,
                  backgroundImage: AssetImage('assets/images/AT.png'),
                ),
                Text(
                  'AT BADMINTON',
                  style: TextStyle(
                    color: Colors.black,
                    fontWeight: FontWeight.bold,
                    fontSize: 20,
                  ),
                ),
              ],
            ),
            Row(
              children: [
                IconButton(
                  icon: const Icon(
                    Icons.notifications_none,
                    color: Colors.black,
                  ),
                  onPressed: () {},
                ),
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
                          onPressed: _goToCart,
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
          ],
        ),
      ),
      backgroundColor: AppColors.textthird,
      body: SingleChildScrollView(
        padding: const EdgeInsets.only(top: 12, left: 8, right: 8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.only(
                top: 16,
                left: 8,
                right: 8,
                bottom: 8,
              ),
              child: BannerSlider(),
            ),

            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
              child: SearchWidget(
                controller: searchController,
                onSearch: () {
                  filterProducts(searchController.text);
                  FocusScope.of(context).unfocus();
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(left: 16, right: 16, bottom: 8),
              child: FilterKeywordsWidget(
                keywords: const ['Yonex', 'Lining', 'Mizuno', 'Victor'],
                selected: selectedKeyword,
                onKeywordTap: (keyword) {
                  filterProducts(keyword);
                  FocusScope.of(context).unfocus();
                },
              ),
            ),

            // Advanced Filter Widget
            ProductFilterWidget(
              brands: brands,
              categories: categories,
              selectedBrands: selectedBrands,
              selectedCategories: selectedCategories,
              priceRange: priceRange,
              minPrice: minPrice,
              maxPrice: maxPrice,
              onBrandChanged: (newBrands) {
                setState(() {
                  selectedBrands = newBrands;
                  _applyAllFilters();
                });
              },
              onCategoryChanged: (newCategories) {
                setState(() {
                  selectedCategories = newCategories;
                  _applyAllFilters();
                });
              },
              onPriceChanged: (newPriceRange) {
                setState(() {
                  priceRange = newPriceRange;
                  _applyAllFilters();
                });
              },
              onReset: _resetFilters,
            ),

            const Padding(
              padding: EdgeInsets.only(left: 16),
              child: Text(
                'Sản phẩm nổi bật',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(height: 16),
            BlocBuilder<ProductBloc, ProductState>(
              builder: (context, state) {
                if (state is ProductLoading) {
                  return const Center(child: CircularProgressIndicator());
                } else if (state is ProductLoaded) {
                  if (allProducts.isEmpty) {
                    allProducts = List.from(state.products);
                    filteredProducts = List.from(state.products);
                    _updatePriceRange(); // Cập nhật price range khi load products
                  }
                  final products = filteredProducts;
                  if (products.isEmpty) {
                    return const Center(child: Text('Không có sản phẩm nào.'));
                  }
                  return GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          childAspectRatio: 0.7,
                          crossAxisSpacing: 16,
                          mainAxisSpacing: 16,
                        ),
                    itemCount: products.length,
                    itemBuilder: (context, index) {
                      final ProductModel product = products[index];
                      return ProductCard(product: product);
                    },
                  );
                } else if (state is ProductError) {
                  return Center(child: Text(state.message));
                }
                return const SizedBox.shrink();
              },
            ),
          ],
        ),
      ),
    );
  }
}
