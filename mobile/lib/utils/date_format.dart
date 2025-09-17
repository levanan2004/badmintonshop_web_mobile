import 'package:intl/intl.dart';

String formatDateTime(String dateStr) {
  try {
    final dt = DateTime.parse(dateStr);
    final formatter = DateFormat('dd/MM/yyyy - HH:mm');
    return formatter.format(dt);
  } catch (e) {
    return dateStr;
  }
}
