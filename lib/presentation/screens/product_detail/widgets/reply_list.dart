import 'package:flutter/material.dart';

class ReplyList extends StatelessWidget {
  final List<dynamic> replies;
  final bool loading;
  const ReplyList({super.key, required this.replies, required this.loading});

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 8),
        child: Center(child: CircularProgressIndicator()),
      );
    }
    if (replies.isEmpty) return const SizedBox();
    return Container(
      margin: const EdgeInsets.only(top: 8),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xfff1f6fb),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: replies.map((r) {
          final acc = r['Account'] ?? {};
          return Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(
              children: [
                const Icon(Icons.subdirectory_arrow_right, color: Colors.green, size: 18),
                const SizedBox(width: 6),
                Text(
                  acc['Username'] ?? acc['Email'] ?? 'Khách',
                  style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.green),
                ),
                const SizedBox(width: 8),
                if (r['CreatedAt'] != null)
                  Text(
                    r['CreatedAt'].toString().substring(0, 16).replaceAll('T', ' '),
                    style: const TextStyle(color: Colors.grey, fontSize: 11),
                  ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(r['Content'] ?? '', style: const TextStyle(fontSize: 14)),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }
}
