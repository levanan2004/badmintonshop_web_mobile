import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/presentation/screens/products/products_screen.dart';
import 'package:mobile/presentation/screens/splash_screen.dart';
import 'package:mobile/presentation/screens/auth/register_screen.dart';
import 'presentation/screens/home/home_screen.dart';
import 'presentation/screens/booking/booking_screen.dart';

import 'presentation/screens/profile/profile_screen.dart';

import 'logic/product/product_bloc.dart';
import 'logic/product/product_event.dart';
import 'logic/auth/auth_bloc.dart';
import 'logic/booking/booking_bloc.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
      ),
      home: const SplashScreen(),
      routes: {'/register': (context) => const RegisterScreen()},
    );
  }
}

class MainNavigation extends StatefulWidget {
  const MainNavigation({super.key});

  @override
  State<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation> {
  int _selectedIndex = 0;
  final AuthBloc _authBloc = AuthBloc();

  static final List<Widget> _pages = <Widget>[
    const HomeScreen(),
    BlocProvider(
      create: (_) => ProductBloc()..add(FetchProducts()),
      child: const ProductsScreen(),
    ),
    const BookingScreen(),
    const ProfileScreen(),
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider<AuthBloc>.value(value: _authBloc),
        BlocProvider<BookingBloc>(create: (_) => BookingBloc()),
      ],
      child: Scaffold(
        body: _pages[_selectedIndex],
        bottomNavigationBar: BottomNavigationBar(
          type: BottomNavigationBarType.fixed,
          currentIndex: _selectedIndex,
          onTap: _onItemTapped,
          items: const [
            BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Trang chủ'),
            BottomNavigationBarItem(
              icon: Icon(Icons.shopping_bag),
              label: 'Mua sắm',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.sports_tennis),
              label: 'Đặt sân',
            ),
            BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Hồ sơ'),
          ],
        ),
      ),
    );
  }
}
