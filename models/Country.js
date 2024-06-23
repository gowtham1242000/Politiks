// models/Country.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/config'); // Adjust the path to your config file

class Country extends Model {}

Country.init({
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'Country',
});

module.exports = Country;
