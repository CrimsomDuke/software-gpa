const { DataTypes } = require('sequelize');

module.exports = (sequelizeInst) => {
    const Parametro = sequelizeInst.define('Parametro', {

        clave: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        valor: {
            type: DataTypes.STRING,
            allowNull: true
        },
        descripcion: {
            type: DataTypes.STRING,
            allowNull: true
        },
    });

    return Parametro;
};
