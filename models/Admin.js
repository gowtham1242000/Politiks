// models/User.js

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/config'); // Adjust as per your project structure

const Admin = sequelize.define('Admin', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'admin', // Assuming admin role
  },
});

module.exports = Admin;
