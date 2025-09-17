const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");
const OrderStatus = require("./OrderStatus"); // Import model OrderStatus

const Order = sequelize.define(
  "Order",
  {
    OrderId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    CustomerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "customer", // Bảng customer
        key: "CustomerId",
      },
    },
    PaymentMethod: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    SubPrice: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    TotalPrice: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    Discount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    CreateAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    OrderStatusId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: OrderStatus,
        key: "OrderStatusId",
      },
    },
    PaymentStatus: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: "Pending",
    },
  },
  {
    tableName: "order",
    freezeTableName: true,
    timestamps: false,
  }
);

Order.belongsTo(OrderStatus, {
  foreignKey: "OrderStatusId",
  as: "OrderStatus",
});

module.exports = Order;
