
const db = require('../models/');
const user = require('../models/user');
const AuditLogService = require('../services/audit_log.service');

exports.createDetallesTransaccion = async (req, res) => {
    const errors = validateTransaccionDetallesList(req);
    if (errors.length > 0) {
        return res.status(400).json({
            message: 'Validation errors',
            errorsList: errors
        });
    }

    const { transaccion_id } = req.params;
    const { transaccion_detalles, user_id } = req.body;

    if(!user_id){
        return res.status(400).json({ message: 'user_id es requerido' });
    }

    console.log(transaccion_detalles);

    try {
        const transaccion = await db.Transaccion.findByPk(transaccion_id);
        if (!transaccion) {
            return res.status(404).json({ message: 'No se encontró la transacción' });
        }

        const totales = getTotales(transaccion_detalles);
        if (totales.totalDebito !== totales.totalCredito) {
            return res.status(400).json({ message: 'La ecuación contable no se cumple', totales });
        }

        transaccion_detalles.forEach(async (detalle) => {
            detalle.transaccion_id = transaccion_id;
            detalle.debito = detalle.debito || 0;
            detalle.credito = detalle.credito || 0;

            const detalleTransaccion = await db.DetalleTransaccion.create(detalle);
            detalle.id = detalleTransaccion.id;
        });

        AuditLogService.createAuditLog('CREATE', user_id, 'Transaccion -> DetalleTransaccion', transaccion_id);
        return res.status(201).json({ message: 'Detalles de transacción creados exitosamente', "detalles" : transaccion_detalles });

    } catch (error) {
        console.error('Error creating transaction details:', error);
        return res.status(500).json({ message: 'Error creando detalles de transacción', error });
    }

}

exports.updateDetallesTransaccion = async (req, res) => {
    const { transaccion_id } = req.params;
    const { transaccion_detalles, user_id } = req.body;

    console.log(req.params);

    if(!user_id){
        return res.status(400).json({ message: 'user_id es requerido' });
    }

    const errors = validateTransaccionDetallesForUpdate(req);
    if (errors.length > 0) {
        return res.status(400).json({
            message: 'Validation errors',
            errorsList: errors
        });
    }

    try{
        const transaccion = await db.Transaccion.findByPk(transaccion_id);
        if (!transaccion) {
            return res.status(404).json({ message: 'No se encontró la transacción' });
        }

        const totales = getTotales(transaccion_detalles);
        if (totales.totalDebito !== totales.totalCredito) {
            return res.status(400).json({ message: 'La ecuación contable no se cumple', totales });
        }

        transaccion_detalles.forEach(async (detalle) => {
            const detalleTransaccionOriginal = await db.DetalleTransaccion.findByPk(detalle.id);
            if (!detalleTransaccionOriginal) {
                return res.status(404).json({ message: 'No se encontró el detalle de transacción' });
            }
            console.log("Se encuentra el detalle de transacción");
            console.log(detalleTransaccionOriginal);

            actualizarCamposDetallesTransaccion(detalleTransaccionOriginal, detalle);
            await detalleTransaccionOriginal.save();
        })

        AuditLogService.createAuditLog('UPDATE', req.body.user_id, 'Transaccion -> DetalleTransaccion', transaccion_id);

        return res.status(200).json({ message: 'Detalles de transacción actualizados exitosamente', transaccion_detalles });

    }catch(error){
        console.error('Error updating transaction details:', error);
        return res.status(500).json({ message: 'Error updating transaction details', error });
    }

}

exports.deleteDetallesTransaccion = async (req, res) => {
    const { transaccion_id } = req.params;
    const { detalles_ids, user_id } = req.body;

    if (!user_id) {
        return res.status(400).json({ message: 'user_id es requerido' });
    }

    // Validate input
    const errors = validateDetallesForDelete(req);
    if (errors.length > 0) {
        return res.status(400).json({
            message: 'Validation errors',
            errorsList: errors
        });
    }

    try {
        // Verify transaction exists
        const transaccion = await db.Transaccion.findByPk(transaccion_id);
        if (!transaccion) {
            return res.status(404).json({ message: 'No se encontró la transacción' });
        }

        // Get current details to verify accounting equation
        const detallesActuales = await db.DetalleTransaccion.findAll({
            where: { transaccion_id }
        });

        // Get details to be deleted
        const detallesAEliminar = await db.DetalleTransaccion.findAll({
            where: {
                id: detalles_ids,
                transaccion_id
            }
        });

        // Verify all requested details exist and belong to this transaction
        if (detallesAEliminar.length !== detalles_ids.length) {
            return res.status(400).json({ 
                message: 'Algunos detalles no existen o no pertenecen a esta transacción' 
            });
        }

        // Calculate remaining details after deletion
        const detallesRestantes = detallesActuales.filter(
            detalle => !detalles_ids.includes(detalle.id)
        );

        // Verify accounting equation will still hold
        const totales = getTotales(detallesRestantes);
        if (totales.totalDebito !== totales.totalCredito) {
            return res.status(400).json({ 
                message: 'La eliminación rompería la ecuación contable',
                totales 
            });
        }

        await db.DetalleTransaccion.destroy({
            where: {
                id: detalles_ids,
                transaccion_id : transaccion_id
            }
        });

        // Audit log
        AuditLogService.createAuditLog('DELETE', user_id, 'Transaccion -> DetalleTransaccion', transaccion_id);

        return res.status(200).json({ 
            message: 'Detalles de transacción eliminados exitosamente',
            deleted_ids: detalles_ids
        });

    } catch (error) {
        console.error('Error deleting transaction details:', error);
        return res.status(500).json({ 
            message: 'Error eliminando detalles de transacción', 
            error 
        });
    }
};

const getTotales = (detalles) => {
    const { totalDebito, totalCredito } = detalles.reduce((acc, detalle) => {
        acc.totalDebito += parseFloat(detalle.debito) || 0;
        acc.totalCredito += parseFloat(detalle.credito) || 0;
        return acc;
    }, { totalDebito: 0, totalCredito: 0 });

    const totales = {
        totalDebito : totalDebito,
        totalCredito : totalCredito
    }

    return totales;
}

const actualizarCamposDetallesTransaccion = (detalleOriginal, detalleActualizado) => {
    if(detalleActualizado.debito !== undefined){
        detalleOriginal.debito = detalleActualizado.debito;
        detalleOriginal.credito = 0;
    }

    if(detalleActualizado.credito !== undefined){
        detalleOriginal.credito = detalleActualizado.credito;
        detalleOriginal.debito = 0;
    }

    if(detalleActualizado.descripcion){
        detalleOriginal.descripcion = detalleActualizado.descripcion;
    }

    if(detalleActualizado.cuenta_id){
        detalleOriginal.cuenta_id = detalleActualizado.cuenta_id;
    }
}

const validateTransaccionDetallesList = (req) => {
    const { transaccion_detalles } = req.body;
    const errors = [];

    // Validar que transaccion_detalles SEA UN ARRAY
    if (!Array.isArray(transaccion_detalles)) {
        errors.push({ message: 'transaccion_detalles debe ser un array' });
    }

    if (!transaccion_detalles || transaccion_detalles.length === 0) {
        errors.push({ message: 'No se encontraron detalles de transacción' });
    }

    transaccion_detalles.forEach((detalle, index) => {
        if (!detalle.cuenta_id) {
            errors.push({ message: `El detalle de transacción en la posición ${index} no tiene cuenta_id` });
        }

        // O debito o credito, no ambos
        if (detalle.debito !== undefined && detalle.credito !== undefined) {
            errors.push({ message: `El detalle ${index} no puede tener débito y crédito simultáneamente` });
        }

        if (!detalle.debito && !detalle.credito) {
            errors.push({ message: `El detalle de transacción en la posición ${index} no tiene debito ni credito` });
        }
    });

    return errors;
}

const validateTransaccionDetallesForUpdate = (req) => {
    const { transaccion_detalles } = req.body;
    const errors = [];

    // Validar que transaccion_detalles SEA UN ARRAY
    if (!Array.isArray(transaccion_detalles)) {
        errors.push({ message: 'transaccion_detalles debe ser un array' });
    }

    if (!transaccion_detalles || transaccion_detalles.length === 0) {
        errors.push({ message: 'No se encontraron detalles de transacción' });
    }

    transaccion_detalles.forEach((detalle, index) => {
        if (!detalle.id) {
            errors.push({ message: `El detalle de transacción en la posición ${index} no tiene id` });
        }
    });

    return errors;
}

const validateDetallesForDelete = (req) => {
    const { detalles_ids } = req.body;
    const errors = [];

    if (!Array.isArray(detalles_ids)) {
        errors.push({ message: 'detalles_ids debe ser un array' });
    }

    if (!detalles_ids || detalles_ids.length === 0) {
        errors.push({ message: 'No se especificaron detalles a eliminar' });
    }

    detalles_ids.forEach((id, index) => {
        if (!id || typeof id !== 'number') {
            errors.push({ 
                message: `El ID en posición ${index} no es válido` 
            });
        }
    });

    return errors;
}