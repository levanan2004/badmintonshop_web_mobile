import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mobile/core/constants/app_api.dart';
import 'dart:convert';
import 'package:equatable/equatable.dart';

class AuthRegister extends AuthEvent {
  final String email;
  final String password;
  final String name;
  AuthRegister(this.email, this.password, this.name);
  @override
  List<Object?> get props => [email, password, name];
}

// Events
abstract class AuthEvent extends Equatable {
  @override
  List<Object?> get props => [];
}

class AuthCheckRequested extends AuthEvent {}

class AuthLogin extends AuthEvent {
  final String email;
  final String password;
  AuthLogin(this.email, this.password);
  @override
  List<Object?> get props => [email, password];
}

class AuthLogout extends AuthEvent {}

// States
abstract class AuthState extends Equatable {
  @override
  List<Object?> get props => [];
}

class AuthInitial extends AuthState {}

class Authenticated extends AuthState {}

class Unauthenticated extends AuthState {}

class AuthLoading extends AuthState {}

class AuthFailure extends AuthState {
  final String message;
  AuthFailure(this.message);
  @override
  List<Object?> get props => [message];
}

// Bloc
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  bool _isLoggedIn = false;
  AuthBloc() : super(AuthInitial()) {
    on<AuthCheckRequested>((event, emit) async {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');
      if (token == null) {
        _isLoggedIn = false;
        emit(Unauthenticated());
        return;
      }
      // Gọi API xác thực token (nếu có endpoint, ví dụ: /customers)
      try {
        final response = await http.get(
          Uri.parse(AppAPI.customers),
          headers: {'Authorization': 'Bearer $token'},
        );
        if (response.statusCode == 200) {
          _isLoggedIn = true;
          emit(Authenticated());
        } else {
          _isLoggedIn = false;
          emit(Unauthenticated());
        }
      } catch (e) {
        _isLoggedIn = false;
        emit(Unauthenticated());
      }
    });
    on<AuthLogin>((event, emit) async {
      emit(AuthLoading());
      try {
        final response = await http.post(
          Uri.parse(AppAPI.login),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({'email': event.email, 'password': event.password}),
        );
        if (response.statusCode == 200) {
          final data = jsonDecode(response.body);
          final token = data['token'];
          if (token != null) {
            final prefs = await SharedPreferences.getInstance();
            await prefs.setString('token', token);
            _isLoggedIn = true;
            emit(Authenticated());
          } else {
            emit(AuthFailure('Đăng nhập thất bại!'));
            emit(Unauthenticated());
          }
        } else {
          emit(AuthFailure('Sai tài khoản hoặc mật khẩu!'));
          emit(Unauthenticated());
        }
      } catch (e) {
        emit(AuthFailure('Lỗi kết nối server!'));
        emit(Unauthenticated());
      }
    });
    on<AuthRegister>((event, emit) async {
      emit(AuthLoading());
      try {
        final response = await http.post(
          Uri.parse(AppAPI.register),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'email': event.email,
            'password': event.password,
            'name': event.name,
          }),
        );
        if (response.statusCode == 200) {
          final data = jsonDecode(response.body);
          final token = data['token'];
          if (token != null) {
            final prefs = await SharedPreferences.getInstance();
            await prefs.setString('token', token);
            _isLoggedIn = true;
            emit(Authenticated());
          } else {
            emit(AuthFailure('Đăng ký thất bại!'));
            emit(Unauthenticated());
          }
        } else {
          emit(AuthFailure('Đăng ký thất bại!'));
          emit(Unauthenticated());
        }
      } catch (e) {
        emit(AuthFailure('Lỗi kết nối server!'));
        emit(Unauthenticated());
      }
    });
    on<AuthLogout>((event, emit) async {
      _isLoggedIn = false;
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('token');
      emit(Unauthenticated());
    });
  }
  bool get isLoggedIn => _isLoggedIn;
}
