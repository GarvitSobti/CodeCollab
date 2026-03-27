const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Match = sequelize.define('Match', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userOneId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userTwoId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'accepted',
  },
  createdByUserId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'matches',
  indexes: [
    {
      unique: true,
      fields: ['userOneId', 'userTwoId'],
    },
  ],
});

module.exports = Match;
