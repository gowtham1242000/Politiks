const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/config'); // Assuming your Sequelize instance is imported from a database configuration file

const AdminRole = sequelize.define('AdminRole', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  },
  accessPermissions: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: [] // Default empty array for access permissions
  }
});

module.exports = AdminRole;
