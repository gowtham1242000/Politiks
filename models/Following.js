// models/Following.js

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/config'); 

const Following = sequelize.define('Following', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  followerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  followedAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
});

module.exports = Following;
