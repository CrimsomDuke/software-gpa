

const { DataTypes } = require('sequelize');

module.exports = (sequelizeInst) => {
    const Role = sequelizeInst.define('Role', {
        id : {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true
        },
        level : {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
    });

    return Role;
}