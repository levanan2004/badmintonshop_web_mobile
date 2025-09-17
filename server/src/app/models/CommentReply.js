const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const Account = require('./Account');

const CommentReply = sequelize.define('CommentReply', {
  ReplyId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  CommentId: { type: DataTypes.INTEGER, allowNull: false },
  AccountId: { type: DataTypes.STRING, allowNull: false },
  Content: { type: DataTypes.TEXT, allowNull: false },
  CreatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'CreatedAt' }
}, {
  tableName: 'comment_reply',
  freezeTableName: true,
  timestamps: false
});

CommentReply.belongsTo(Account, { foreignKey: 'AccountId' });

module.exports = CommentReply;
