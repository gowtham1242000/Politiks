// models/User.js

const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/config');

class User extends Model {}

User.init({
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
   },
   fullName: {
     type: DataTypes.STRING,
        allowNull: true,
  },
//     role: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     status: {
//         type: DataTypes.BOOLEAN,
//         defaultValue: true,
//     },
//     uniqueName: {
//         type: DataTypes.STRING,
//     },
//     iam: {
//         type: DataTypes.STRING,
//     },
//     dateOfBirth: {
//         type: DataTypes.DATE,
//     },
//     gender: {
//         type: DataTypes.STRING,
//     },
//     country: {
//         type: DataTypes.STRING,
//     },
//     state: {
//         type: DataTypes.STRING,
//     },
//     interests: {
//         type: DataTypes.ARRAY(DataTypes.STRING),
//     },
//     accountsToFollow: {
//         type: DataTypes.ARRAY(DataTypes.STRING),
//     },
    token: {
        type: DataTypes.STRING,
    }
// },
  },{
    sequelize,
    modelName: 'User',
});


module.exports = User;
