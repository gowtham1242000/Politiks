const { DataTypes } = require('sequelize');
const sequelize = require('../config/config'); // Adjust path as necessary

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

/*
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
*/
