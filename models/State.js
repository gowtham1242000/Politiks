// models/State.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/config'); // Adjust the path to your config file
const Country = require('./Country'); // Adjust the path to your Country model

class State extends Model {}

State.init({
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    countryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Country,
            key: 'id',
        },
    },
}, {
    sequelize,
    modelName: 'State',
});

Country.hasMany(State, { foreignKey: 'countryId' });
State.belongsTo(Country, { foreignKey: 'countryId' });

module.exports = State;
