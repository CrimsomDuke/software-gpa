const db = require('../models');
const AuditLogService = require('../services/audit_log.service');
const global_vars = require('../config/global');

exports.getAllParametros = async (req, res) => {
    try {
        const parametros = await db.Parametro.findAll();
        res.status(200).json(parametros);
    } catch (error) {
        console.error('Error al obtener todos los parámetros:', error);
        res.status(500).json({ message: 'Error interno al obtener parámetros' });
    }
};


exports.getParametroByClave = async (req, res) => {
    const { clave } = req.params;
    try {
        const parametro = await db.Parametro.findOne({ where: { clave } });
        if (!parametro) {
            return res.status(404).json({ message: 'Parámetro no encontrado' });
        }
        res.status(200).json(parametro);
    } catch (error) {
        console.error('Error al obtener parámetro:', error);
        res.status(500).json({ message: 'Error interno al obtener parámetro' });
    }
};

exports.createOrUpdateParametro = async (req, res) => {
    const { clave, valor, descripcion } = req.body;
    try {
        const [parametro, created] = await db.Parametro.upsert({ clave, valor, descripcion });
        res.status(created ? 201 : 200).json(parametro);
    } catch (error) {
        console.error('Error al crear o actualizar parámetro:', error);
        res.status(500).json({ message: 'Error interno al guardar parámetro' });
    }
};
