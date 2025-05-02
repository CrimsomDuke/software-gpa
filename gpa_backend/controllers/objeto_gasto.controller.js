
const db = require('../models/');
const AuditLogService = require('../services/audit_log.service');

exports.getObjetoGastoById = async (req, res) => {
    const { id } = req.params;
    try {
        const objetoGasto = await db.ObjetoGasto.findByPk(id);
        if (!objetoGasto) {
            return res.status(404).json({ message: 'No se encontró un objeto de gasto' });
        }
        return res.status(200).json(objetoGasto);
    }catch(error){
        console.error('Error fetching ObjetoGasto:', error);
        return res.status(500).json({ message: 'Error obteniendo objeto de gasto' });
    }
}

exports.getAllObjetoGasto = async (req, res) => {
    try{
        const objetoGastos = await db.ObjetoGasto.findAll();
        return res.status(200).json(objetoGastos);
    }catch(error){
        console.error('Error fetching ObjetoGastos:', error);
        return res.status(500).json({ message: 'Error obteniendo objeto de gasto' });
    }
}

exports.createObjetoGasto = async (req, res) => {
    const { nombre, descripcion, codigo, user_id } = req.body;
    try {

        if(!nombre || !descripcion || !codigo) {
            return res.status(400).json({ message: 'Nombre, descripcion y codigo son requeridos' });
        }

        if(!user_id){
            return res.status(400).json({ message: 'user_id es requerido' });
        }

        const objetoGasto = await db.ObjetoGasto.create({
            nombre : nombre,
            descripcion : descripcion,
            codigo : codigo,
            esta_activo : true
        })

        AuditLogService.createAuditLog('CREATE', user_id, 'ObjetoGasto', objetoGasto.id);

        return res.status(201).json(objetoGasto);
    }catch(error){
        console.error('Error creating ObjetoGasto:', error);
        return res.status(500).json({ message: 'Error creating ObjetoGasto' });
    }
}

exports.updateObjetoGasto = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, codigo, esta_activo, user_id } = req.body;
    try {
        const objetoGasto = await db.ObjetoGasto.findByPk(id);
        if (!objetoGasto) {
            return res.status(404).json({ message: 'ObjetoGasto not found' });
        }

        if(!user_id){
            return res.status(400).json({ message: 'user_id es requerido' });
        }

        if(nombre){
            objetoGasto.nombre = nombre;
        }
        if(descripcion){
            objetoGasto.descripcion = descripcion;
        }
        if(codigo){
            objetoGasto.codigo = codigo;
        }
        if(esta_activo !== undefined){
            objetoGasto.esta_activo = esta_activo;
        }

        await objetoGasto.save();

        AuditLogService.createAuditLog('UPDATE', user_id, 'ObjetoGasto', id);

        return res.status(200).json(objetoGasto);
    }catch(error){
        console.error('Error updating ObjetoGasto:', error);
        return res.status(500).json({ message: 'Error updating ObjetoGasto' });
    }
}

exports.deleteObjetoGasto = async (req, res) => {
    const { id } = req.params;
    const { user_id } = req.body;
    try {
        const objetoGasto = await db.ObjetoGasto.findByPk(id);
        if (!objetoGasto) {
            return res.status(404).json({ message: 'ObjetoGasto no encontrado' });
        }

        if(!user_id){
            return res.status(400).json({ message: 'user_id es requerido' });
        }

        await objetoGasto.destroy();

        AuditLogService.createAuditLog('DELETE', user_id, 'ObjetoGasto', id);

        return res.status(200).json({ message: 'ObjetoGasto deleted successfully' });
    }catch(error){
        console.error('Error deleting ObjetoGasto:', error);
        return res.status(500).json({ message: 'Error deleting ObjetoGasto' });
    }
}