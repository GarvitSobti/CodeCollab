const sequelize = require('../config/database');
const User = require('./User');
const Conversation = require('./Conversation');
const ConversationParticipant = require('./ConversationParticipant');
const Message = require('./Message');
const MessageReaction = require('./MessageReaction');
const Match = require('./Match');

Conversation.hasMany(ConversationParticipant, { foreignKey: 'conversationId', as: 'participants', onDelete: 'CASCADE' });
ConversationParticipant.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' });

Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'messages', onDelete: 'CASCADE' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' });

User.hasMany(Message, { foreignKey: 'senderId', sourceKey: 'id', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', targetKey: 'id', as: 'sender' });

User.hasMany(ConversationParticipant, { foreignKey: 'userId', sourceKey: 'id', as: 'conversationMemberships' });
ConversationParticipant.belongsTo(User, { foreignKey: 'userId', targetKey: 'id', as: 'user' });

Message.hasMany(MessageReaction, { foreignKey: 'messageId', as: 'reactions', onDelete: 'CASCADE' });
MessageReaction.belongsTo(Message, { foreignKey: 'messageId', as: 'message' });
MessageReaction.belongsTo(User, { foreignKey: 'userId', targetKey: 'id', as: 'user' });

async function syncDatabase() {
  await sequelize.authenticate();
  await sequelize.sync();
}

module.exports = {
  sequelize,
  User,
  Conversation,
  ConversationParticipant,
  Message,
  MessageReaction,
  Match,
  syncDatabase,
};
