
const { DataTypes } = require('sequelize');

module.exports = (sequelizeInstance) => {
    const Persona = sequelizeInstance.define('Persona', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false
        },
        apellido: {
            type: DataTypes.STRING,
            allowNull: false
        },
        fecha_nacimiento: {
            type: DataTypes.DATE,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        telefono: {
            type: DataTypes.STRING,
            allowNull: false
        },
        user_id : {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        tableName: 'Personas',
        timestamps: true
    });

    return Persona;
}