
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
            allowNull: true,
        },
        tableName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        recordId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        timestamp: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    });

    return AuditLog;
}