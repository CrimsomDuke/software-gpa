const { DataTypes } = require('sequelize');

module.exports = (sequelizeInst) => {
    const CentroCosto = sequelizeInst.define('CentroCosto', {
        id: {
            primaryKey: true,
            type: DataTypes.INTEGER,
            autoIncrement: true,
        },
        codigo: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false
        },
        descripcion: {
            type: DataTypes.STRING,
            allowNull: true
        },
        esta_activo: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    });

    return CentroCosto;
};