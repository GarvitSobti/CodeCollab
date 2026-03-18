const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  conversationId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  senderId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  messageType: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'text',
  },
  attachmentUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  attachmentName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  attachmentMimeType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  attachmentSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  linkPreviewJson: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  clientMessageId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  sentAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  editedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'messages',
});

module.exports = Message;
