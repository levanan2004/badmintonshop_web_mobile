const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const GroupAccount = sequelize.define('GroupAccount', {
    GroupId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    GroupName: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
}, {
    tableName: 'groupaccount',
    freezeTableName: true,
    timestamps: false,
});

module.exports = GroupAccount;
