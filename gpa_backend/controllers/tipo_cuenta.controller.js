const db = require('../models');
const AuditLogService = require('../services/audit_log.service');

exports.getTipoCuentaById = async (req, res) => {
    const { id } = req.params;
    try {
        const tipoCuenta = await db.TipoCuenta.findByPk(id);
        if (!tipoCuenta) {
            return res.status(404).json({ message: 'No se encontró un tipo de cuenta' });
        }   
        return res.status(200).json(tipoCuenta);
    }catch(error){
        console.error('Error fetching TipoCuenta:', error);
        return res.status(500).json({ message: 'Error obteniendo tipo de cuenta' });
    }
}

exports.getAllTipoCuentas = async (req, res) => {
    try{
        const tipoCuentas = await db.TipoCuenta.findAll();

        if (tipoCuentas === null || tipoCuentas.length === 0) {
            return res.status(404).json({ message: 'No se encontraron tipos de cuenta' });
        }
        return res.status(200).json(tipoCuentas);
    }catch(error){
        console.error('Error fetching TipoCuentas:', error);
        return res.status(500).json({ message: 'Error obteniendo tipos de cuenta' });
    }
}

exports.createTipoCuenta = async (req, res) => {
    const { nombre, descripcion, user_id} = req.body;

    try{
        if(!nombre || !descripcion) {
            return res.status(400).json({ message: 'Nombre y descripcion son requeridos' });
        }

        if(!user_id){
            return res.status(400).json({ message: 'user_id es requerido' });
        }

        const tipoCuenta = await db.TipoCuenta.create({
            nombre : nombre,
            descripcion : descripcion,
        })

        AuditLogService.createAuditLog('CREATE', user_id, 'TipoCuenta', tipoCuenta.id);
        return res.status(201).json(tipoCuenta);

    }catch(error){
        console.error('Error creating TipoCuenta:', error);
        return res.status(500).json({ message: 'Error creando tipo de cuenta' });
    }
}

exports.updateTipoCuenta = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, user_id } = req.body;
    try {
        const tipoCuenta = await db.TipoCuenta.findByPk(id);
        if (!tipoCuenta) {
            return res.status(404).json({ message: 'No se encontró un tipo de cuenta' });
        }

        // if(!nombre || !descripcion) {
        //     return res.status(400).json({ message: 'Nombre y descripcion son requeridos' });
        // }

        if(!user_id){
            return res.status(400).json({ message: 'user_id es requerido' });
        }

        tipoCuenta.nombre = nombre;
        tipoCuenta.descripcion = descripcion;
        await tipoCuenta.save();

        AuditLogService.createAuditLog('UPDATE', user_id, 'TipoCuenta', tipoCuenta.id);

        return res.status(200).json(tipoCuenta);
    }catch(error){
        console.error('Error updating TipoCuenta:', error);
        return res.status(500).json({ message: 'Error actualizando tipo de cuenta' });
    }
}

exports.deleteTipoCuenta = async (req, res) => {
    const { id } = req.params;
    const { user_id } = req.body;
    try {
        const tipoCuenta = await db.TipoCuenta.findByPk(id);
        if (!tipoCuenta) {
            return res.status(404).json({ message: 'No se encontró un tipo de cuenta' });
        }

        if(!user_id){
            return res.status(400).json({ message: 'user_id es requerido' });
        }

        await tipoCuenta.destroy();

        AuditLogService.createAuditLog('DELETE', user_id, 'TipoCuenta', id);

        return res.status(200).json({ message: 'Tipo de cuenta eliminado' });
    }catch(error){
        console.error('Error deleting TipoCuenta:', error);
        return res.status(500).json({ message: 'Error eliminando tipo de cuenta' });
    }
}
