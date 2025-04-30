const { DataTypes } = require('sequelize');

module.exports = (sequelizeInst) => {
    const Cuenta = sequelizeInst.define('Cuenta', {
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
        esta_activa: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        tipo_cuenta_id: {  
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        nivel_cuenta_id: { 
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        cuenta_padre_id: { //(auto-referencia)
            type: DataTypes.INTEGER,
            allowNull: true,
        }
    });

    return Cuenta;
};