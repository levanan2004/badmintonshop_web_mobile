const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const Product = require('./Product')

const Image = sequelize.define('Image', {
    ImageId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    ImageUrl: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    ProductId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, 
{
    tableName: 'image',
    freezeTableName: true,
    timestamps: false,
});
Image.belongsTo(Product, { foreignKey: 'ProductId' });
Product.hasMany(Image, { foreignKey: 'ProductId' });
module.exports = Image;
