
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

// ...existing code...

exports.getPeriodoFiscalById = async (req, res) => {
    const { id } = req.params;
    try {
        const periodoFiscal = await db.PeriodoFiscal.findByPk(id, {
            include: [
                { model: db.User, as: 'cerrado_por', attributes: ['id', 'username', 'fullname'] }
            ]
        });
        
        if (!periodoFiscal) {
            return res.status(404).json({ success: false, message: 'Período fiscal no encontrado' });
        }
        
        return res.status(200).json({ success: true, data: periodoFiscal });
    } catch (error) {
        console.error('Error fetching Periodo Fiscal:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.updatePeriodoFiscal = async (req, res) => {
    const { id } = req.params;
    const { nombre, fecha_inicio, fecha_fin, user_id } = req.body;
    
    try {
        const periodoFiscal = await db.PeriodoFiscal.findByPk(id);
        if (!periodoFiscal) {
            return res.status(404).json({ success: false, message: 'Período fiscal no encontrado' });
        }
        
        // Verificar si está cerrado
        if (periodoFiscal.esta_cerrado) {
            return res.status(400).json({ success: false, message: 'No se puede modificar un período fiscal cerrado' });
        }
        
        // Validar si existe otro período con el mismo nombre
        if (nombre && nombre !== periodoFiscal.nombre) {
            const existingPeriodo = await db.PeriodoFiscal.findOne({ 
                where: { nombre, id: { [db.Sequelize.Op.ne]: id } } 
            });
            if (existingPeriodo) {
                return res.status(400).json({ success: false, message: 'Ya existe un período fiscal con ese nombre' });
            }
        }
        
        // Actualizar campos
        const updatedFields = {};
        if (nombre) updatedFields.nombre = nombre;
        if (fecha_inicio) updatedFields.fecha_inicio = fecha_inicio;
        if (fecha_fin) updatedFields.fecha_fin = fecha_fin;
        
        await periodoFiscal.update(updatedFields);
        
        // Audit log
        if (user_id) {
            await auditLogService.createAuditLog('update', user_id, 'PeriodoFiscal', periodoFiscal.id);
        }
        
        return res.status(200).json({ success: true, data: periodoFiscal });
    } catch (error) {
        console.error('Error updating Periodo Fiscal:', error);
        return res.status(500).json({ success: false, message: 'Internal server error: ' + error.message });
    }
};

exports.deletePeriodoFiscal = async (req, res) => {
    const { id } = req.params;
    const { user_id } = req.body;
    
    try {
        const periodoFiscal = await db.PeriodoFiscal.findByPk(id);
        if (!periodoFiscal) {
            return res.status(404).json({ success: false, message: 'Período fiscal no encontrado' });
        }
        
        // Verificar si tiene transacciones asociadas
        const transacciones = await db.Transaccion.count({ where: { periodo_fiscal_id: id } });
        if (transacciones > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'No se puede eliminar un período fiscal que tiene transacciones asociadas' 
            });
        }
        
        await periodoFiscal.destroy();
        
        // Audit log
        if (user_id) {
            await auditLogService.createAuditLog('delete', user_id, 'PeriodoFiscal', id);
        }
        
        return res.status(200).json({ success: true, message: 'Período fiscal eliminado correctamente' });
    } catch (error) {
        console.error('Error deleting Periodo Fiscal:', error);
        return res.status(500).json({ success: false, message: 'Internal server error: ' + error.message });
    }
};

exports.cerrarPeriodoFiscal = async (req, res) => {
    const { id } = req.params;
    const { user_id } = req.body;
    
    try {
        const periodoFiscal = await db.PeriodoFiscal.findByPk(id);
        if (!periodoFiscal) {
            return res.status(404).json({ success: false, message: 'Período fiscal no encontrado' });
        }
        
        if (periodoFiscal.esta_cerrado) {
            return res.status(400).json({ success: false, message: 'El período fiscal ya está cerrado' });
        }
        
        // Cerrar período
        await periodoFiscal.update({
            esta_cerrado: true,
            fecha_cierre: new Date(),
            cerrado_por_id: user_id
        });
        
        // Audit log
        if (user_id) {
            await auditLogService.createAuditLog('close', user_id, 'PeriodoFiscal', periodoFiscal.id);
        }
        
        return res.status(200).json({ success: true, data: periodoFiscal, message: 'Período fiscal cerrado correctamente' });
    } catch (error) {
        console.error('Error closing Periodo Fiscal:', error);
        return res.status(500).json({ success: false, message: 'Internal server error: ' + error.message });
    }
};

exports.generarAsientos = async (req, res) => {
    const { id } = req.params;
    const { user_id, tipo_asiento } = req.body; // tipo_asiento: 'apertura' o 'cierre'
    
    try {
        const periodoFiscal = await db.PeriodoFiscal.findByPk(id);
        if (!periodoFiscal) {
            return res.status(404).json({ success: false, message: 'Período fiscal no encontrado' });
        }
        
        // Aquí implementarías la lógica para generar asientos de apertura o cierre
        // Por ejemplo, generar asientos de cierre basados en las cuentas de resultado
        
        const referencia = `${tipo_asiento.toUpperCase()}-${periodoFiscal.nombre}-${Date.now()}`;
        
        const nuevaTransaccion = await db.Transaccion.create({
            referencia: referencia,
            descripcion: `Asiento de ${tipo_asiento} - ${periodoFiscal.nombre}`,
            fecha: tipo_asiento === 'apertura' ? periodoFiscal.fecha_inicio : periodoFiscal.fecha_fin,
            tipo_transaccion: tipo_asiento,
            es_generado_sistema: true,
            periodo_fiscal_id: id,
            usuario_id: user_id
        });
        
        // Audit log
        await auditLogService.createAuditLog('generate_entries', user_id, 'PeriodoFiscal', id);
        
        return res.status(201).json({ 
            success: true, 
            data: nuevaTransaccion, 
            message: `Asientos de ${tipo_asiento} generados correctamente` 
        });
    } catch (error) {
        console.error('Error generando asientos:', error);
        return res.status(500).json({ success: false, message: 'Internal server error: ' + error.message });
    }
};

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

exports.getSaldosEntrePeriodos = async (req, res) => {
    const { actualId } = req.params;
    const { anteriorId } = req.query;

    if (!anteriorId) {
        return res.status(400).json({ success: false, message: 'Debe enviar el ID del periodo anterior' });
    }

    try {
        const anterior = await db.DetalleTransaccion.findAll({
            include: {
                model: db.Transaccion,
                as: 'transaccion',
                where: { periodo_fiscal_id: anteriorId },
                attributes: []
            },
            attributes: [
                'cuenta_id',
                [db.Sequelize.fn('SUM', db.Sequelize.literal('debito - credito')), 'saldo_anterior']
            ],
            group: ['cuenta_id']
        });

        const actual = await db.DetalleTransaccion.findAll({
            include: {
                model: db.Transaccion,
                as: 'transaccion',
                where: { periodo_fiscal_id: actualId },
                attributes: []
            },
            attributes: [
                'cuenta_id',
                [db.Sequelize.fn('SUM', db.Sequelize.literal('debito - credito')), 'saldo_actual']
            ],
            group: ['cuenta_id']
        });


        const saldos = {};

        anterior.forEach(a => {
            saldos[a.cuenta_id] = {
                cuenta_id: a.cuenta_id,
                saldo_anterior: parseFloat(a.get('saldo_anterior')) || 0,
                saldo_actual: 0,
            };
        });

        actual.forEach(a => {
            if (!saldos[a.cuenta_id]) {
                saldos[a.cuenta_id] = {
                    cuenta_id: a.cuenta_id,
                    saldo_anterior: 0,
                    saldo_actual: parseFloat(a.get('saldo_actual')) || 0,
                };
            } else {
                saldos[a.cuenta_id].saldo_actual = parseFloat(a.get('saldo_actual')) || 0;
            }
        });

        const cuentas = await db.Cuenta.findAll({ attributes: ['id', 'codigo', 'nombre'] });
        const cuentasMap = {};
        cuentas.forEach(c => cuentasMap[c.id] = c);

        const resultado = Object.values(saldos).map(s => ({
            cuenta_id: s.cuenta_id,
            codigo: cuentasMap[s.cuenta_id]?.codigo,
            nombre: cuentasMap[s.cuenta_id]?.nombre,
            saldo_anterior: s.saldo_anterior,
            saldo_actual: s.saldo_actual,
            saldo_total: s.saldo_anterior + s.saldo_actual
        }));

        return res.status(200).json({ success: true, data: resultado });

    } catch (error) {
        console.error('Error al calcular saldos:', error);
        return res.status(500).json({ success: false, message: 'Error interno al calcular saldos' });
    }
};
