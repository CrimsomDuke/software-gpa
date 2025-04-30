

const { DataTypes } = require('sequelize');

module.exports = (sequelizeInst) => {
    const NivelCuenta = sequelizeInst.define('NivelCuenta', {
        id: {
            primaryKey: true,
            type: DataTypes.INTEGER,
            autoIncrement: true,
        },
        nombre: {
            type: DataTypes.ENUM('cuenta', 'grupo', 'subgrupo', 'mayor', 'analitica'),
            allowNull: false
        },
        profundidad: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        longitud_maxima: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    });

    return NivelCuenta;
};