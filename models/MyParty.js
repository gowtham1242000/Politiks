// models/MyParty.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/config'); // Adjust path as necessary

const MyParty = sequelize.define('MyParty', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    icons: {
        type: DataTypes.STRING,
        allowNull: true
    },
    viewOrder: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    timestamps: true
});

module.exports = MyParty;
