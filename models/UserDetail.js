// models/UserDetails.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/config'); // Adjust path as necessary
const User = require('./User'); // Adjust path as necessary
const Interest = require('./Interest');

const UserDetails = sequelize.define('UserDetails', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    userName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false
    },
    dateOfBirth: {
        type: DataTypes.DATE,
        allowNull: false
    },
    gender: {
        type: DataTypes.STRING,
        allowNull: false
    },
    country: {
        type: DataTypes.STRING,
        allowNull: false
    },
    state: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    mySelf:{
        type: DataTypes.TEXT,
        allowNull: true
    },
    userBannerProfile:{
        type: DataTypes.STRING,
        allowNull: true
    },
    userProfile:{
        type: DataTypes.STRING,
        allowNull: true
    },
    myParty:{
        type: DataTypes.STRING,
        allowNull: true
    },myInterest: {
        type: DataTypes.ARRAY(DataTypes.INTEGER), // Define as an array of integers
        allowNull: false,
        defaultValue: [] // Default value as an empty array
    },
    mailId:{
        type: DataTypes.STRING,
        allowNull: true 
    },action: {
        type: DataTypes.STRING, // Adjust the data type as per your requirements
        allowNull: true
    }
}, {
    timestamps: true
});

UserDetails.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(UserDetails, { foreignKey: 'userId' });

module.exports = UserDetails;
