import 'package:flutter/material.dart';
import 'package:mobile/data/models/product_model.dart';
import '../../../../core/constants/app_api.dart';
import '../../../../utils/price_utils.dart';

class CartItemWidget extends StatelessWidget {
  final ProductModel product;
  const CartItemWidget({super.key, required this.product});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: product.avatar != null
          ? Image.network(
              '${AppAPI.baseUrl}/uploads/${product.avatar}',
              width: 48,
              height: 48,
              fit: BoxFit.cover,
            )
          : Container(width: 48, height: 48, color: Colors.grey[200]),
      title: Text(product.name),
      subtitle: Text(PriceUtils.formatPrice(product.price)),
    );
  }
}
