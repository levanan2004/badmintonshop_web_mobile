const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const Product = require('./Product');

const Specification = sequelize.define('Specification', {
    SpecificationId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    SpecificationName: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    SpecificationContent: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    ProductId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
}, {
    tableName: 'specification',
    freezeTableName: true,
    timestamps: false,
});

Specification.belongsTo(Product, { foreignKey: 'ProductId' });
Product.hasMany(Specification, { foreignKey: 'ProductId' });

module.exports = Specification;
