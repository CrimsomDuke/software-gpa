
const db = require('../models/');
const AuditLogService = require('../services/audit_log.service');

exports.getCentroCostoById = async (req, res) => {
    const { id } = req.params;
    try {
        const centroCosto = await db.CentroCosto.findByPk(id);
        if (!centroCosto) {
            return res.status(404).json({ message: 'No se encontró un centro de costo' });
        }
        return res.status(200).json(centroCosto);
    }catch(error){
        console.error('Error fetching CentroCosto:', error);
        return res.status(500).json({ message: 'Error obteniendo centro de Costo' });
    }
}

exports.getAllCentroCosto = async (req, res) => {
    try{
        const centroCostos = await db.CentroCosto.findAll();
        return res.status(200).json(centroCostos);
    }catch(error){
        console.error('Error fetching CentroCostos:', error);
        return res.status(500).json({ message: 'Error obteniendo centros de costo' });
    }
}

exports.createCentroCosto = async (req, res) => {
    const { nombre, descripcion, codigo, user_id } = req.body;
    try {

        if(!nombre || !descripcion || !codigo) {
            return res.status(400).json({ message: 'Nombre, descripcion y codigo son requeridos' });
        }

        if(!user_id){
            return res.status(400).json({ message: 'user_id es requerido' });
        }

        const centroCosto = await db.CentroCosto.create({
            nombre : nombre,
            descripcion : descripcion,
            codigo : codigo,
            esta_activo : true
        })

        AuditLogService.createAuditLog('CREATE', user_id, 'CentroCosto', centroCosto.id);

        return res.status(201).json(centroCosto);
    }catch(error){
        console.error('Error creating CentroCosto:', error);
        return res.status(500).json({ message: 'Error creating CentroCosto' });
    }
}

exports.updateCentroCosto = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, codigo, esta_activo, user_id } = req.body;
    try {
        const centroCosto = await db.CentroCosto.findByPk(id);
        if (!centroCosto) {
            return res.status(404).json({ message: 'CentroCosto not found' });
        }

        if(!user_id){
            return res.status(400).json({ message: 'user_id es requerido' });
        }

        if(nombre){
            centroCosto.nombre = nombre;
        }
        if(descripcion){
            centroCosto.descripcion = descripcion;
        }
        if(codigo){
            centroCosto.codigo = codigo;
        }
        if(esta_activo !== undefined){
            centroCosto.esta_activo = esta_activo;
        }

        await centroCosto.save();

        AuditLogService.createAuditLog('UPDATE', user_id, 'CentroCosto', id);

        return res.status(200).json(centroCosto);
    }catch(error){
        console.error('Error updating CentroCosto:', error);
        return res.status(500).json({ message: 'Error updating CentroCosto' });
    }
}

exports.deleteCentroCosto = async (req, res) => {
    const { id } = req.params;
    const { user_id } = req.body;
    try {
        const centroCosto = await db.CentroCosto.findByPk(id);
        if (!centroCosto) {
            return res.status(404).json({ message: 'CentroCosto not found' });
        }

        if(!user_id){
            return res.status(400).json({ message: 'user_id es requerido' });
        }

        await centroCosto.destroy();

        AuditLogService.createAuditLog('DELETE', user_id, 'CentroCosto', id);

        return res.status(200).json({ message: 'CentroCosto deleted successfully' });
    }catch(error){
        console.error('Error deleting CentroCosto:', error);
        return res.status(500).json({ message: 'Error deleting CentroCosto' });
    }
}