const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/config'); // Ensure this path is correct for your setup

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
    defaultValue: []
  }
});

// Sync the model with the database
(async () => {
  try {
    await sequelize.sync({ alter: true }); // This will alter the table to match the model
    console.log('AdminRole table synchronized');
  } catch (error) {
    console.error('Error synchronizing AdminRole table:', error);
  }
})();

module.exports = AdminRole;
