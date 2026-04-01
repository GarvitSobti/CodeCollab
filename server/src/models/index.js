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

  // Add team chat columns to conversations table if missing
  await sequelize.query(`
    ALTER TABLE conversations ADD COLUMN IF NOT EXISTS name VARCHAR(255);
  `).catch(() => {});
  await sequelize.query(`
    ALTER TABLE conversations ADD COLUMN IF NOT EXISTS "teamId" VARCHAR(255);
  `).catch(() => {});
  await sequelize.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS conversations_team_id_unique ON conversations ("teamId");
  `).catch(() => {});

  // Clean up duplicate unique constraints left by prior alter:true runs
  const [dupes] = await sequelize.query(`
    SELECT conname, conrelid::regclass AS tablename
    FROM pg_constraint
    WHERE contype = 'u' AND conname ~ '_key[0-9]+'
  `).catch(() => [[]]);
  for (const { conname, tablename } of dupes) {
    await sequelize.query(`ALTER TABLE ${tablename} DROP CONSTRAINT "${conname}"`).catch(() => {});
  }
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
