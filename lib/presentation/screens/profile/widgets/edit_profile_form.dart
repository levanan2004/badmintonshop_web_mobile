import 'package:flutter/material.dart';

class EditProfileForm extends StatefulWidget {
  final Map<String, dynamic> userData;
  final void Function(Map<String, dynamic>) onSave;
  const EditProfileForm({
    super.key,
    required this.userData,
    required this.onSave,
  });

  @override
  State<EditProfileForm> createState() => _EditProfileFormState();
}

class _EditProfileFormState extends State<EditProfileForm> {
  late TextEditingController _nameController;
  late TextEditingController _emailController;
  late TextEditingController _phoneController;
  late TextEditingController _addressController;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(
      text: widget.userData['name'] ?? '',
    );
    _emailController = TextEditingController(
      text: widget.userData['email'] ?? '',
    );
    _phoneController = TextEditingController(
      text: widget.userData['phone'] ?? '',
    );
    _addressController = TextEditingController(
      text: widget.userData['address'] ?? '',
    );
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  void _submit() {
    widget.onSave({
      'name': _nameController.text,
      'email': _emailController.text,
      'phone': _phoneController.text,
      'address': _addressController.text,
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        TextField(
          controller: _nameController,
          decoration: const InputDecoration(labelText: 'Tên'),
        ),
        TextField(
          controller: _emailController,
          decoration: const InputDecoration(labelText: 'Email'),
        ),
        TextField(
          controller: _phoneController,
          decoration: const InputDecoration(labelText: 'Số điện thoại'),
        ),
        TextField(
          controller: _addressController,
          decoration: const InputDecoration(labelText: 'Địa chỉ'),
        ),
        const SizedBox(height: 24),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: _submit,
            child: const Text('Lưu thay đổi'),
          ),
        ),
      ],
    );
  }
}
