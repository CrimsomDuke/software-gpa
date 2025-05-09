

const db = require('../models/');
const AuditLogService = require('../services/audit_log.service');
const global_vars = require('../config/global');


exports.getAllNivelesCuentas = async (req, res) => {
    const nivelesCuenta = await db.NivelCuenta.findAll();
    if (nivelesCuenta === null || nivelesCuenta.length === 0) {
        return res.status(404).json({ message: 'No se encontraron niveles de cuenta' });
    }

    return res.status(200).json(nivelesCuenta);
}

exports.createNivelCuenta = async (req, res) => {
    let errors = validdateNivelCuentaFields(req);
    if (errors){
        return res.status(400).json({ 
            message: 'Validation errors',
            errors: errors
        });
    }

    const { nombre, profundidad, longitud_maxima, user_id } = req.body;
    try {
        const existingNivelCuenta = await db.NivelCuenta.findOne({ where: { nombre } });
        if (existingNivelCuenta) {
            return res.status(400).json({ message: 'El nivel de cuenta ya existe' });
        }

        const nuevoNivelCuenta = await db.NivelCuenta.create({
            nombre,
            profundidad,
            longitud_maxima,
        });

        // Create an audit log for the new level
        await AuditLogService.createAuditLog('create', user_id, 'NivelCuenta', nuevoNivelCuenta.id);

        return res.status(201).json(nuevoNivelCuenta);
    } catch (error) {
        console.error('Error creating Nivel Cuenta:', error);
        return res.status(500).json({ message: 'Error creando nivel de cuenta' });
    }
}

exports.deleteNivelCuenta = async (req, res) => {
    const { id } = req.params;
    try {
        const nivelCuenta = await db.NivelCuenta.findByPk(id);
        if (!nivelCuenta) {
            return res.status(404).json({ message: 'No se encontró un nivel de cuenta' });
        }

        await db.NivelCuenta.destroy({ where: { id } });
        return res.status(200).json({ message: 'Nivel de cuenta eliminado' });
    } catch (error) {
        console.error('Error deleting Nivel Cuenta:', error);
        return res.status(500).json({ message: 'Error eliminando nivel de cuenta' });
    }
}

exports.updateNivelCuenta = async (req, res) => {
    const { id } = req.params;
    const { nombre, profundidad, longitud_maxima, user_id } = req.body;

    try {
        const nivelCuenta = await db.NivelCuenta.findByPk(id);
        if (!nivelCuenta) {
            return res.status(404).json({ message: 'No se encontró un nivel de cuenta' });
        }
        if(nombre) nivelCuenta.nombre = nombre;
        if(profundidad) nivelCuenta.profundidad = profundidad;
        if(longitud_maxima) nivelCuenta.longitud_maxima = longitud_maxima;

        nivelCuenta.save();

        // Create an audit log for the updated level
        await AuditLogService.createAuditLog('update', user_id, 'NivelCuenta', id);

        return res.status(200).json(nivelCuenta);
    } catch (error) {
        console.error('Error updating Nivel Cuenta:', error);
        return res.status(500).json({ message: 'Error actualizando nivel de cuenta' });
    }
}

const validdateNivelCuentaFields = (req) => {
    const { nombre, profundidad, longitud_maxima } = req.body;
    let errors = {};

    if (!nombre) {
        errors.nombre = 'El campo nombre es obligatorio';
    }
    if (!profundidad) {
        errors.profundidad = 'El campo profundidad es obligatorio';
    }
    if (!longitud_maxima) {
        errors.longitud_maxima = 'El campo longitud maxima es obligatorio';
    }

    if(Object.keys(errors).length > 0) {
        return errors;
    }

    return null;
}