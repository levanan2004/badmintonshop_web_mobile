import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:mobile/core/constants/app_api.dart';

class RegisterScreen extends StatelessWidget {
  const RegisterScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final usernameController = TextEditingController();
    final passwordController = TextEditingController();
    final confirmPasswordController = TextEditingController();
    final emailController = TextEditingController();
    final firstNameController = TextEditingController();
    final lastNameController = TextEditingController();
    final phoneController = TextEditingController();

    Future<void> register() async {
      final username = usernameController.text.trim();
      final password = passwordController.text.trim();
      final confirmPassword = confirmPasswordController.text.trim();
      final email = emailController.text.trim();
      final firstName = firstNameController.text.trim();
      final lastName = lastNameController.text.trim();
      final phone = phoneController.text.trim();

      if (username.isEmpty ||
          password.isEmpty ||
          email.isEmpty ||
          firstName.isEmpty ||
          lastName.isEmpty) {
        Fluttertoast.showToast(
          msg: 'Vui lòng điền đầy đủ thông tin bắt buộc!',
          gravity: ToastGravity.CENTER,
          backgroundColor: Colors.red,
          textColor: Colors.white,
        );
        return;
      }

      if (password != confirmPassword) {
        Fluttertoast.showToast(
          msg: 'Mật khẩu xác nhận không khớp!',
          gravity: ToastGravity.CENTER,
          backgroundColor: Colors.red,
          textColor: Colors.white,
        );
        return;
      }

      try {
        final uri = Uri.parse(AppAPI.register);
        final response = await http.post(
          uri,
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'username': username,
            'password': password,
            'email': email,
            'firstname': firstName,
            'lastname': lastName,
            'mobile': phone,
          }),
        );

        final data = jsonDecode(utf8.decode(response.bodyBytes));

        if (response.statusCode == 201) {
          Fluttertoast.showToast(
            msg: 'Đăng ký thành công! Vui lòng đăng nhập.',
            gravity: ToastGravity.CENTER,
            backgroundColor: Colors.green,
            textColor: Colors.white,
          );
          Navigator.pop(context);
        } else {
          Fluttertoast.showToast(
            msg: data['message'] ?? 'Đăng ký thất bại!',
            gravity: ToastGravity.CENTER,
            backgroundColor: Colors.red,
            textColor: Colors.white,
          );
        }
      } catch (e) {
        Fluttertoast.showToast(
          msg: 'Đăng ký thất bại: $e',
          gravity: ToastGravity.CENTER,
          backgroundColor: Colors.red,
          textColor: Colors.white,
        );
      }
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF6F7FB),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Center(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Đăng ký',
                  style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Tạo tài khoản mới để bắt đầu.',
                  style: TextStyle(color: Colors.grey),
                ),
                const SizedBox(height: 32),

                // First Name
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black12,
                        blurRadius: 6,
                        offset: Offset(0, 2),
                      ),
                    ],
                  ),
                  child: TextField(
                    controller: firstNameController,
                    decoration: const InputDecoration(
                      prefixIcon: Icon(Icons.person_outline),
                      border: InputBorder.none,
                      hintText: 'Họ *',
                      contentPadding: EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 18,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Last Name
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black12,
                        blurRadius: 6,
                        offset: Offset(0, 2),
                      ),
                    ],
                  ),
                  child: TextField(
                    controller: lastNameController,
                    decoration: const InputDecoration(
                      prefixIcon: Icon(Icons.person_outline),
                      border: InputBorder.none,
                      hintText: 'Tên *',
                      contentPadding: EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 18,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Username
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black12,
                        blurRadius: 6,
                        offset: Offset(0, 2),
                      ),
                    ],
                  ),
                  child: TextField(
                    controller: usernameController,
                    decoration: const InputDecoration(
                      prefixIcon: Icon(Icons.account_circle_outlined),
                      border: InputBorder.none,
                      hintText: 'Tên đăng nhập *',
                      contentPadding: EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 18,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Email
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black12,
                        blurRadius: 6,
                        offset: Offset(0, 2),
                      ),
                    ],
                  ),
                  child: TextField(
                    controller: emailController,
                    decoration: const InputDecoration(
                      prefixIcon: Icon(Icons.email_outlined),
                      border: InputBorder.none,
                      hintText: 'Email *',
                      contentPadding: EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 18,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Phone
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black12,
                        blurRadius: 6,
                        offset: Offset(0, 2),
                      ),
                    ],
                  ),
                  // child: TextField(
                  //   controller: phoneController,
                  //   decoration: const InputDecoration(
                  //     prefixIcon: Icon(Icons.phone_outlined),
                  //     border: InputBorder.none,
                  //     hintText: 'Số điện thoại',
                  //     contentPadding: EdgeInsets.symmetric(
                  //       horizontal: 16,
                  //       vertical: 18,
                  //     ),
                  //   ),
                  // ),
                ),
                // const SizedBox(height: 16),

                // Password
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black12,
                        blurRadius: 6,
                        offset: Offset(0, 2),
                      ),
                    ],
                  ),
                  child: TextField(
                    controller: passwordController,
                    obscureText: true,
                    decoration: const InputDecoration(
                      prefixIcon: Icon(Icons.lock_outline),
                      border: InputBorder.none,
                      hintText: 'Mật khẩu *',
                      contentPadding: EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 18,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Confirm Password
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black12,
                        blurRadius: 6,
                        offset: Offset(0, 2),
                      ),
                    ],
                  ),
                  child: TextField(
                    controller: confirmPasswordController,
                    obscureText: true,
                    decoration: const InputDecoration(
                      prefixIcon: Icon(Icons.lock_outline),
                      border: InputBorder.none,
                      hintText: 'Xác nhận mật khẩu *',
                      contentPadding: EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 18,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Register Button
                SizedBox(
                  width: double.infinity,
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF5F9BD8), Color(0xFFD9DDE2)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: ElevatedButton(
                      onPressed: register,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        shadowColor: Colors.transparent,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(24),
                        ),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      child: const Text(
                        'Đăng ký  →',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text(
                      "Đã có tài khoản? ",
                      style: TextStyle(color: Colors.grey),
                    ),
                    GestureDetector(
                      onTap: () {
                        Navigator.pop(context);
                      },
                      child: ShaderMask(
                        shaderCallback: (bounds) => const LinearGradient(
                          colors: [Color(0xFF5F9BD8), Color(0xFFD9DDE2)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ).createShader(bounds),
                        child: const Text(
                          'Đăng nhập',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 40),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
