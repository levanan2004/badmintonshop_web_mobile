const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const Order = require('./Order');
const Product = require('./Product');

  const OrderDetail = sequelize.define('OrderDetail', {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    OrderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Order', // Tên bảng tương ứng
        key: 'OrderId',
      },
    },
    ProductId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Product', // Tên bảng tương ứng
        key: 'ProductId',
      },
    },
    Quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
     Size: {
    type: DataTypes.STRING(10),
    allowNull: true,
    defaultValue: null,
    },
  },
  {
    tableName: 'orderdetail',
    freezeTableName: true,
    timestamps: false,
}
);
  OrderDetail.belongsTo(Order, { foreignKey: 'OrderId' });
  OrderDetail.belongsTo(Product, { foreignKey: 'ProductId' });

module.exports = OrderDetail;
