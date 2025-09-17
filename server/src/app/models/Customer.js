const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Customer = sequelize.define('Customer', {
    CustomerId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    Firstname: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    Lastname: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    Mobile: {
        type: DataTypes.STRING(15),
        allowNull: true,
    },
    Address: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    Email: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
}, {
    tableName: 'customer',
    freezeTableName: true,
    timestamps: false,
});

module.exports = Customer;
