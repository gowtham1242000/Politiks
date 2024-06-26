const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');
const User = require('./User');
const SubComment = require('./SubComment');

const SubCommentLike = sequelize.define('SubCommentLike', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  subCommentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: SubComment,
      key: 'id'
    }
  },
}, {
  timestamps: true
});

SubCommentLike.belongsTo(User, { foreignKey: 'userId', targetKey: 'id' });
SubCommentLike.belongsTo(SubComment, { foreignKey: 'subCommentId', targetKey: 'id' });

module.exports = SubCommentLike;