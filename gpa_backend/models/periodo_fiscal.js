

const { DataTypes } = require('sequelize');

module.exports = (sequelizeInst) => {
    const PeriodoFiscal = sequelizeInst.define('PeriodoFiscal', {
        id: {
            primaryKey: true,
            type: DataTypes.INTEGER,
            autoIncrement: true,
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false
        },
        fecha_inicio: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        fecha_fin: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        esta_cerrado: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        fecha_cierre: {
            type: DataTypes.DATE,
            allowNull: true
        },
        cerrado_por_id: { 
            type: DataTypes.INTEGER,
            allowNull: true,
        }
    });

    return PeriodoFiscal;
};