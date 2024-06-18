const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const Interest = sequelize.define('Interest', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = Interest;
