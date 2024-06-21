// models/UserForgetOtp.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/config'); // Adjust the path to your sequelize instance

const UserForgetOtp = sequelize.define('UserForgetOtp', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true, // Each user can have only one OTP record
  },
  otp: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  otpExpires: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

module.exports = UserForgetOtp;
