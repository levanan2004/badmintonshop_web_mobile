const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const Category = require('./Category');

const Brand = sequelize.define('Brand', {
    BrandId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    BrandName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    CategoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Category',
            key: 'CategoryId'
        }
    }
}, {
    tableName: 'brand',
    freezeTableName: true,
    timestamps: false,
});

// Thiết lập association giống ClothingSize
Brand.belongsTo(Category, { foreignKey: 'CategoryId' });
Category.hasMany(Brand, { foreignKey: 'CategoryId' });

module.exports = Brand;
