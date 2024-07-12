// models/Notification.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/config');
const User = require('./User');
const UserDetails = require('./UserDetail');
   
    const Notification = sequelize.define('Notification', {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      postId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
     userProfile: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  post: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
    });
    
    module.exports = Notification;


  
