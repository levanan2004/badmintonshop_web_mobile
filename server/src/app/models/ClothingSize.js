const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const Product = require('./Product');

const ClothingSize = sequelize.define('ClothingSize', {
    ClothingSizeId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    ProductId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    Size: {
        type: DataTypes.STRING(10),
        allowNull: false,
    },
    Quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
}, {
    tableName: 'clothingsize',
    freezeTableName: true,
    timestamps: false,
});

ClothingSize.belongsTo(Product, { foreignKey: 'ProductId' });
Product.hasMany(ClothingSize, { foreignKey: 'ProductId' });

module.exports = ClothingSize;
