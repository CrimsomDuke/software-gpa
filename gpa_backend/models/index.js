
const { sequelizeInst, Sequelize } = require('../config/db.config');

const User = require('./user')(sequelizeInst);
const AuditLog = require('./audit_log')(sequelizeInst);

/**
 * user y audit_log estan relacionados pero no cuentan con FKs para evitar problemas de integridad referencial
 * Al borrar un usuario, evitar que se borren los logs de auditoria
 */

sequelizeInst.sync({
    alter : true
}).then(() => {
    console.log("Database Synced Successfully")
}).catch((err) => {
    console.error("Error Syncing the Database", err)
});

module.exports = {
    User,
    AuditLog,
    sequelizeInst,
    Sequelize : sequelizeInst.Sequelize
}