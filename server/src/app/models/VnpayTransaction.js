const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const VnpayTransaction = sequelize.define(
  "VnpayTransaction",
  {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    OrderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    vnp_TxnRef: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    vnp_Amount: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    vnp_ResponseCode: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    vnp_TransactionNo: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    vnp_PayDate: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    Status: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    CreatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "vnpay_transaction",
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = VnpayTransaction;
