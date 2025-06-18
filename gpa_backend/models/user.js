
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
        fullname : {
            type: DataTypes.STRING,
            allowNull: false,
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
        is_active : {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        role_id : {
            type : DataTypes.INTEGER,
            allowNull: true,
        }
    });

    return User;
}