const { DataTypes } = require('sequelize');

module.exports = (sequelizeInst) => {
    const EjecucionPresupuesto = sequelizeInst.define('EjecucionPresupuesto', {
        id: {
            primaryKey: true,
            type: DataTypes.INTEGER,
            autoIncrement: true,
        },
        monto: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false
        },
        fecha_ejecucion: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        presupuesto_id: { 
            type: DataTypes.INTEGER,
            allowNull: false
        },
        detalle_transaccion_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        timestamps: true,
        createdAt: 'fecha_creacion'
    });

    return EjecucionPresupuesto;
};