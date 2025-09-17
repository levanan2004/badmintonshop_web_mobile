import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../../../../core/constants/app_api.dart';

class ProfileForm extends StatefulWidget {
  const ProfileForm({super.key});

  @override
  State<ProfileForm> createState() => _ProfileFormState();
}

class _ProfileFormState extends State<ProfileForm> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _saveProfile() async {
    if (_formKey.currentState?.validate() ?? false) {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');
      if (token == null) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Bạn chưa đăng nhập!')));
        return;
      }
      // Tách họ tên thành firstname, lastname (nếu cần)
      final name = _nameController.text.trim();
      String firstname = '';
      String lastname = '';
      if (name.contains(' ')) {
        final parts = name.split(' ');
        lastname = parts.first;
        firstname = parts.sublist(1).join(' ');
      } else {
        lastname = name;
      }
      final body = {
        'firstname': firstname,
        'lastname': lastname,
        'email': _emailController.text.trim(),
        'mobile': _phoneController.text.trim(),
      };
      try {
        final response = await http.patch(
          Uri.parse(AppAPI.profileUser),
          headers: {
            'Authorization': 'Bearer $token',
            'Content-Type': 'application/json',
          },
          body: jsonEncode(body),
        );
        if (response.statusCode == 200) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Cập nhật thông tin thành công!')),
          );
        } else {
          final data = jsonDecode(response.body);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(data['error'] ?? 'Cập nhật thất bại!')),
          );
        }
      } catch (e) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Có lỗi xảy ra!')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TextFormField(
            controller: _nameController,
            decoration: const InputDecoration(labelText: 'Họ và tên'),
            validator: (value) =>
                value == null || value.isEmpty ? 'Vui lòng nhập họ tên' : null,
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _emailController,
            decoration: const InputDecoration(labelText: 'Email'),
            validator: (value) =>
                value == null || value.isEmpty ? 'Vui lòng nhập email' : null,
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _phoneController,
            decoration: const InputDecoration(labelText: 'Số điện thoại'),
            validator: (value) => value == null || value.isEmpty
                ? 'Vui lòng nhập số điện thoại'
                : null,
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _saveProfile,
              child: const Text('Lưu thông tin'),
            ),
          ),
        ],
      ),
    );
  }
}
