const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const Comment = sequelize.define('Comment', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    postId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    likeCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    timestamps: true
});

Comment.associate = models => {
  Comment.hasMany(models.SubComment, {
    foreignKey: 'commentId',
    as: 'subComments' // Alias for the association
  });
};

module.exports = Comment;
