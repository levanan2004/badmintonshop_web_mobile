import 'package:flutter/material.dart';
import 'dart:async';

class FeaturesSlider extends StatefulWidget {
  const FeaturesSlider({super.key});

  @override
  State<FeaturesSlider> createState() => _FeaturesSliderState();
}

class _FeaturesSliderState extends State<FeaturesSlider> {
  late PageController _pageController;
  late Timer _timer;
  int _currentIndex = 0;

  final List<FeatureItem> _features = [
    FeatureItem(
      icon: Icons.local_shipping,
      title: 'Vận chuyển TOÀN QUỐC',
      description: 'Thanh toán khi nhận hàng',
    ),
    FeatureItem(
      icon: Icons.verified,
      title: 'Bảo đảm chất lượng',
      description: 'Sản phẩm bảo đảm chất lượng.',
    ),
    FeatureItem(
      icon: Icons.payment,
      title: 'Tiến hành THANH TOÁN',
      description: 'Với nhiều PHƯƠNG THỨC',
    ),
    FeatureItem(
      icon: Icons.swap_horiz,
      title: 'Đổi sản phẩm mới',
      description: 'nếu sản phẩm lỗi',
    ),
  ];

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    _startAutoSlide();
  }

  void _startAutoSlide() {
    _timer = Timer.periodic(const Duration(seconds: 3), (timer) {
      if (_currentIndex < _features.length - 1) {
        _currentIndex++;
      } else {
        _currentIndex = 0;
      }

      if (_pageController.hasClients) {
        _pageController.animateToPage(
          _currentIndex,
          duration: const Duration(milliseconds: 500),
          curve: Curves.easeInOut,
        );
      }
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Dịch vụ của chúng tôi',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 80,
            child: PageView.builder(
              controller: _pageController,
              onPageChanged: (index) {
                setState(() {
                  _currentIndex = index;
                });
              },
              itemCount: _features.length,
              itemBuilder: (context, index) {
                final feature = _features[index];
                return _buildFeatureCard(feature);
              },
            ),
          ),
          const SizedBox(height: 12),
          // Dots indicator
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: _features.asMap().entries.map((entry) {
              return Container(
                width: 8,
                height: 8,
                margin: const EdgeInsets.symmetric(horizontal: 4),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: _currentIndex == entry.key
                      ? Colors.blue
                      : Colors.grey.shade300,
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureCard(FeatureItem feature) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: const Color(0xFFE26A1B).withOpacity(0.1),
              borderRadius: BorderRadius.circular(24),
            ),
            child: Icon(feature.icon, color: const Color(0xFFE26A1B), size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  feature.title,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Text(
                  feature.description,
                  style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class FeatureItem {
  final IconData icon;
  final String title;
  final String description;

  FeatureItem({
    required this.icon,
    required this.title,
    required this.description,
  });
}
