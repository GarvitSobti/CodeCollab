const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'dm',
  },
  createdByUserId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastMessageId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  lastMessageAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'conversations',
});

module.exports = Conversation;
