
const db = require('../models/')
const AuditLogService = {
    async createAuditLog(action, userId, tableName, recordId) {
        try {
            const auditLog = await db.AuditLog.create({
                action,
                userId,
                tableName,
                recordId,
            });
            return auditLog;
        } catch (error) {
            console.error('Error creating audit log:', error);
            throw error;
        }
    },

    async getAuditLogs() {
        try {
            const auditLogs = await db.AuditLog.findAll();
            return auditLogs;
        } catch (error) {
            console.error('Error fetching audit logs:', error);
            throw error;
        }
    },

    async getAuditLogById(id) {
        try {
            const auditLog = await db.AuditLog.findByPk(id);
            return auditLog;
        } catch (error) {
            console.error('Error fetching audit log by ID:', error);
            throw error;
        }
    },

    async getAuditLogByUserId(userId) {
        try {
            const auditLogs = await db.AuditLog.findAll({
                where: { userId },
            });
            return auditLogs;
        } catch (error) {
            console.error('Error fetching audit logs by user ID:', error);
            throw error;
        }
    }
}

module.exports = AuditLogService;