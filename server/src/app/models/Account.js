const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const GroupAccount = require('./GroupAccount');
const Customer = require('./Customer');

const Account = sequelize.define('Account', {
    AccountId: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        allowNull: false,
    },
    Username: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    Password: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    Firstname: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    Lastname: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    Address: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    IdGroup: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    Gender: {
        type: DataTypes.ENUM('Nam', 'Nữ'),
        allowNull: true,
    },
    CustomerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    Mobile: {
        type: DataTypes.STRING(15),
        allowNull: true,
    },
    Email: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
}, {
    tableName: 'account',
    freezeTableName: true,
    timestamps: false,
});

// Associations
Account.belongsTo(GroupAccount, { foreignKey: 'IdGroup' });
GroupAccount.hasMany(Account, { foreignKey: 'IdGroup' });

Account.belongsTo(Customer, { foreignKey: 'CustomerId' });
Customer.hasMany(Account, { foreignKey: 'CustomerId' });

module.exports = Account;
