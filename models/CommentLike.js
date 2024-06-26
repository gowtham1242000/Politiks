const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');
const User = require('./User');
const Comment = require('./Comment');

const CommentLike = sequelize.define('CommentLike', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  commentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Comment,
      key: 'id'
    }
  },
}, {
  timestamps: true
});

CommentLike.belongsTo(User, { foreignKey: 'userId', targetKey: 'id' });
CommentLike.belongsTo(Comment, { foreignKey: 'commentId', targetKey: 'id' });

module.exports = CommentLike;
