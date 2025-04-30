const { DataTypes } = require('sequelize');

module.exports = (sequelizeInst) => {
    const DetalleTransaccion = sequelizeInst.define('DetalleTransaccion', {
        id: {
            primaryKey: true,
            type: DataTypes.INTEGER,
            autoIncrement: true,
        },
        debito: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0
        },
        credito: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0
        },
        descripcion: {
            type: DataTypes.STRING,
            allowNull: true
        },
        transaccion_id: { 
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        cuenta_id: { 
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    });

    return DetalleTransaccion;
};