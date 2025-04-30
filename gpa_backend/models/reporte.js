const { DataTypes } = require('sequelize');

module.exports = (sequelizeInst) => {
    const Reporte = sequelizeInst.define('Reporte', {
        id: {
            primaryKey: true,
            type: DataTypes.INTEGER,
            autoIncrement: true,
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        ruta_plantilla: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'Ruta del archivo de plantilla para generación del reporte'
        }
    }, {
        timestamps: true,
        createdAt: 'fecha_creacion'
    });

    return Reporte;
};