const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const Brand = require('./Brand');
const Category = require('./Category');

const Product = sequelize.define('Product', {
    ProductId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    ProductName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    SummaryDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    Discount: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    IdBrand: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    CategoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    Price: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    Avatar: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: 'product',
    timestamps: false,
    freezeTableName: true,
});

// Thiết lập mối quan hệ
Product.belongsTo(Brand, { foreignKey: 'IdBrand' });
Brand.hasMany(Product, { foreignKey: 'IdBrand' });

Product.belongsTo(Category, { foreignKey: 'CategoryId' });
Category.hasMany(Product, { foreignKey: 'CategoryId' });

module.exports = Product;
