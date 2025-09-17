import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mobile/presentation/screens/auth/login_screen.dart';
import 'package:mobile/main.dart';
import 'package:http/http.dart' as http;
// import 'dart:convert';
import 'package:mobile/core/constants/app_api.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});
  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    // Thêm delay 1 giây để hiển thị splash screen
    await Future.delayed(const Duration(seconds: 1));

    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    if (token == null) {
      _goToLogin();
      return;
    }
    // Gọi API xác thực token với endpoint profile
    try {
      final response = await http.get(
        Uri.parse(AppAPI.profileUser),
        headers: {'Authorization': 'Bearer $token'},
      );
      if (response.statusCode == 200) {
        // Token hợp lệ, chuyển về trang chính
        _goToMain();
      } else {
        // Token không hợp lệ, xóa token và chuyển về login
        await prefs.remove('token');
        _goToLogin();
      }
    } catch (e) {
      // Lỗi kết nối, xóa token và chuyển về login
      await prefs.remove('token');
      _goToLogin();
    }
  }

  void _goToLogin() {
    Navigator.of(
      context,
    ).pushReplacement(MaterialPageRoute(builder: (_) => const LoginScreen()));
  }

  void _goToMain() {
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => const MainNavigation()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Logo
            Container(
              width: 240,
              height: 240,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                image: DecorationImage(
                  image: AssetImage('assets/images/AT.png'),
                  fit: BoxFit.cover,
                ),
              ),
            ),
            const SizedBox(height: 24),
            // Tên app
            const Text(
              'AT BADMINTON',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.black87,
              ),
            ),
            const SizedBox(height: 32),
            // Loading indicator
            const CircularProgressIndicator(),
          ],
        ),
      ),
    );
  }
}
