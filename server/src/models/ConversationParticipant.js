const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ConversationParticipant = sequelize.define('ConversationParticipant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  conversationId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastReadAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  lastDeliveredAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  joinedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'conversation_participants',
  indexes: [
    {
      unique: true,
      fields: ['conversationId', 'userId'],
    },
  ],
});

module.exports = ConversationParticipant;
