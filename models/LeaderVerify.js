// models/UserDetails.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/config'); // Adjust path as necessary
const User = require('./User'); // Adjust path as necessary

const LeaderVerify = sequelize.define('LeaderVerifys', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    // Other fields
    verificationImage: {
        type: DataTypes.STRING,
        allowNull: true
    },
    verificationVideo: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

LeaderVerify.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(LeaderVerify, { foreignKey: 'userId' });

module.exports = LeaderVerify;
