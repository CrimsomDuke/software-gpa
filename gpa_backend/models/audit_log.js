
const { DataTypes } = require('sequelize');

module.exports = (sequelizeInst) => {
    const AuditLog = sequelizeInst.define('AuditLog', {
        id: {
            primaryKey: true,
            type: DataTypes.INTEGER,
            autoIncrement: true,
        },
        action: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        tableName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        recordId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        timestamp: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    });

    return AuditLog;
}