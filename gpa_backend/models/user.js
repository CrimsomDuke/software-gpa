
const { DataTypes } = require('sequelize');

module.exports = (sequelizeInst) =>{
    const User = sequelizeInst.define('User', {
        id : {
            primaryKey : true,
            type : DataTypes.INTEGER,
            autoIncrement : true,
        },
        username : {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        email : {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password : {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role : {
            type: DataTypes.ENUM('admin', 'contador', 'auxiliar'),
            defaultValue: 'contador',
        }
    });

    return User;
}