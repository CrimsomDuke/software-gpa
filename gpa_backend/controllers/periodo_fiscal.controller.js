
const db = require('../models/');
const auditLogService = require('../services/audit_log.service');
const global_vars = require('../config/global');
const user = require('../models/user');

exports.getAllPeriodosFiscales = async (req, res) => {
    try {
        const periodosFiscales = await db.PeriodoFiscal.findAll();
        return res.status(200).json({ success: true, data: periodosFiscales });
    } catch (error) {
        console.error('Error fetching Periodos Fiscales:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

exports.createPeriodoFiscal = async (req, res) => {
    let errors = validatePeriodoFiscalFields(req);
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ success: false, message: 'Validation errors', errors });
    }

    const { nombre, fecha_inicio, fecha_fin, user_id } = req.body;
    try{
        const existingPeriodo = await db.PeriodoFiscal.findOne({ where: { nombre } });
        if (existingPeriodo) {
            return res.status(400).json({ success: false, message: 'El periodo fiscal ya existe' });
        }

        const nuevoPeriodoFiscal = await db.PeriodoFiscal.create({
            nombre,
            fecha_inicio,
            fecha_fin,
        });

        // Create an audit log for the new period
        await auditLogService.createAuditLog('create', user_id, 'PeriodoFiscal', nuevoPeriodoFiscal.id);

        return res.status(201).json({ success: true, data: nuevoPeriodoFiscal });
    }catch (error) {
        console.error('Error creating Periodo Fiscal:', error);
        return res.status(500).json({ success: false, message: 'Internal server error: ' + error.message });
    }
}

const validatePeriodoFiscalFields = (req) => {
    const { nombre, fecha_inicio, fecha_fin, user_id } = req.body;
    let errors = {};

    if (!nombre || nombre.trim() === '') {
        errors.nombre = 'El campo nombre es obligatorio';
    }
    if (!fecha_inicio || fecha_inicio.trim() === '') {
        errors.fecha_inicio = 'El campo fecha inicio es obligatorio';
    }
    if (!fecha_fin || fecha_fin.trim() === '') {
        errors.fecha_fin = 'El campo fecha fin es obligatorio';
    }
    if(!user_id){
        errors.user_id = 'El campo usuario id es obligatorio';
    }

    return errors;
}