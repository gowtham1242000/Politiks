// models/UserInterest.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/config'); // Adjust path as necessary
const User = require('./User'); // Adjust path as necessary
const Interest = require('./Interest'); // Adjust path as necessary

const UserInterest = sequelize.define('UserInterest', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    interestId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Interest,
            key: 'id'
        }
    }
}, {
    timestamps: true
});

UserInterest.belongsTo(User, { foreignKey: 'userId' });
UserInterest.belongsTo(Interest, { foreignKey: 'interestId' });

module.exports = UserInterest;
