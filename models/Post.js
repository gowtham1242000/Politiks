// models/Post.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/config');

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
});

module.exports = Post;
