const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');
const User = require('./User');
const Comment = require('./Comment');

const SubComment = sequelize.define('SubComment', {
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
  subComment: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  likeCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  timestamps: true,
});

SubComment.belongsTo(User, { foreignKey: 'userId', targetKey: 'id' });
SubComment.belongsTo(Comment, { foreignKey: 'commentId', targetKey: 'id' });

module.exports = SubComment;
