// models/AdminSetting.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const AdminSetting = sequelize.define('AdminSetting', {
  locationSetting: {
    type: DataTypes.JSONB, // Assuming JSONB for flexibility in storing JSON data
    allowNull: false,
    defaultValue: {}, // Default empty object
  },
  paymentGatewaySetting: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
  },
  forceUpdate: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
  },
});

module.exports = AdminSetting;
