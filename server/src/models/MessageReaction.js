const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MessageReaction = sequelize.define('MessageReaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  messageId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  emoji: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'message_reactions',
  indexes: [
    {
      unique: true,
      fields: ['messageId', 'userId', 'emoji'],
    },
  ],
});

module.exports = MessageReaction;
