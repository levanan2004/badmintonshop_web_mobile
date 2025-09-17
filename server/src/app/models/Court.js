const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const Branch = require('./branch'); // Đảm bảo đúng đường dẫn

const Court = sequelize.define('Court', {
    CourtId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    BranchId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    CourtName: { // Đúng với tên trường trong database
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'court',
    freezeTableName: true,
    timestamps: false,
});

Court.belongsTo(Branch, { foreignKey: 'BranchId' });
Branch.hasMany(Court, { foreignKey: 'BranchId' });

module.exports = Court;
