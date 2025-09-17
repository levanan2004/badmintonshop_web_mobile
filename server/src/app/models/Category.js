const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Category = sequelize.define('Category', {
  CategoryId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  CategoryName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'category',
  freezeTableName: true,
  timestamps: false,
});

module.exports = Category;
