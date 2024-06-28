// models/Post.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/config');
const User = require('./User');
const UserDetails = require('./UserDetail');
const Post = sequelize.define('Post', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true, // initially allowNull, update after file save
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  tagUser: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  caption: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  likeCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0, // Default value for like count
}
});



Post.belongsTo(User,{foreignKey: 'userId', targetKey: 'id'});

module.exports = Post;
