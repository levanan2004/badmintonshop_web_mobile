import 'package:flutter/material.dart';
import 'dart:async';

class BannerSlider extends StatefulWidget {
  const BannerSlider({super.key});

  @override
  State<BannerSlider> createState() => _BannerSliderState();
}

class _BannerSliderState extends State<BannerSlider> {
  final List<String> banners = List.generate(
    5,
    (i) => 'assets/images/Banners/banner${i + 1}.webp',
  );
  int _current = 0;
  final PageController _controller = PageController();
  Timer? _timer;

  @override
  void dispose() {
    _timer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 3), (timer) {
      if (!mounted) return;
      int next = _current + 1;
      if (next >= banners.length) next = 0;
      _controller.animateToPage(
        next,
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeInOut,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        SizedBox(
          height: 160,
          child: GestureDetector(
            onHorizontalDragEnd: (details) {}, // Để PageView nhận vuốt
            child: PageView.builder(
              controller: _controller,
              itemCount: banners.length,
              onPageChanged: (i) => setState(() => _current = i),
              itemBuilder: (context, idx) => ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: Image.asset(
                  banners[idx],
                  fit: BoxFit.cover,
                  width: double.infinity,
                ),
              ),
            ),
          ),
        ),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(
            banners.length,
            (i) => GestureDetector(
              onTap: () {
                _controller.animateToPage(
                  i,
                  duration: const Duration(milliseconds: 400),
                  curve: Curves.easeInOut,
                );
              },
              child: Container(
                width: 8,
                height: 8,
                margin: const EdgeInsets.symmetric(horizontal: 3),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: i == _current ? Colors.blue : Colors.grey[300],
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
