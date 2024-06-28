// models/PostLike.js
const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../config/config');
const User = require('./User'); // Assuming User model is defined
const Post = require('./Post'); // Assuming Post model is defined

class PostLike extends Model {}

PostLike.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    likedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'PostLike',
  }
);

PostLike.belongsTo(User, { foreignKey: 'userId', targetKey: 'id' });
PostLike.belongsTo(Post, { foreignKey: 'postId', targetKey: 'id' });

module.exports = PostLike;
