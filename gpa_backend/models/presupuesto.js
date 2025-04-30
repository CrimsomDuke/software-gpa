const { DataTypes } = require('sequelize');

module.exports = (sequelizeInst) => {
    const Presupuesto = sequelizeInst.define('Presupuesto', {
        id: {
            primaryKey: true,
            type: DataTypes.INTEGER,
            autoIncrement: true,
        },
        monto_inicial: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false
        },
        monto_modificado: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },
        fecha_modificacion: {
            type: DataTypes.DATE,
            allowNull: true
        },
        periodo_fiscal_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        centro_costo_id: {  
            type: DataTypes.INTEGER,
            allowNull: false
        },
        objeto_gasto_id: { 
            type: DataTypes.INTEGER,
            allowNull: false
        },
        cuenta_id: { 
            type: DataTypes.INTEGER,
            allowNull: false
        },
        modificado_por_id: { 
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        timestamps: true,
        createdAt: 'fecha_creacion',
        updatedAt: 'fecha_actualizacion'
    });

    return Presupuesto;
};