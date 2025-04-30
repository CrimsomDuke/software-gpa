const { DataTypes } = require('sequelize');

module.exports = (sequelizeInst) => {
    const TipoCuenta = sequelizeInst.define('TipoCuenta', {
        id: {
            primaryKey: true,
            type: DataTypes.INTEGER,
            autoIncrement: true,
        },
        nombre: {
            type: DataTypes.ENUM('activo', 'pasivo', 'capital', 'ingresos', 'egresos', 'cuentas_de_orden'),
            allowNull: false
        },
        descripcion: {
            type: DataTypes.STRING,
            allowNull: true
        }
    });

    return TipoCuenta;
};