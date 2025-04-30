const { DataTypes } = require('sequelize');

module.exports = (sequelizeInst) => {
    const Transaccion = sequelizeInst.define('Transaccion', {
        id: {
            primaryKey: true,
            type: DataTypes.INTEGER,
            autoIncrement: true,
        },
        referencia: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        descripcion: {
            type: DataTypes.STRING,
            allowNull: false
        },
        fecha: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        tipo_transaccion: {
            type: DataTypes.ENUM('ingreso', 'egreso', 'traspaso', 'apertura', 'cierre'),
            allowNull: false
        },
        es_generado_sistema: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        periodo_fiscal_id: { 
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        usuario_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    }, {
        timestamps: true,
        createdAt: 'fecha_creacion',
        updatedAt: 'fecha_actualizacion'
    });

    return Transaccion;
};