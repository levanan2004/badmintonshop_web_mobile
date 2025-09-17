const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const OrderStatus = sequelize.define('OrderStatus', {
    OrderStatusId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    OrderStatusName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: 'orderstatus',
    freezeTableName: true,
    timestamps: false,
});

module.exports = OrderStatus;
