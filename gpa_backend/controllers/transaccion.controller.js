
const db = require('../models/');
const auditLogService = require('../services/audit_log.service');
const global_vars = require('../config/global');


exports.createTransaccion = async (req, res) => {
    try {
        // Validate campos transaccion
        const validationError = validateTransaccionFields(req);
        if (validationError){
            return res.status(400).json({ 
                message: 'Validation errors',
                errors: validationError
            });
        }

        const { descripcion, fecha, tipo_transaccion, periodo_fiscal_id, transaccion_detalles, usuario_id } = req.body;

        // Validar detalles de transacción
        const detallesValidation = validateTransaccionDetalles(transaccion_detalles);
        if (detallesValidation !== null) {
            return res.status(400).json({ 
                errors: detallesValidation,
            });
        }

        // Validar ecuacion contable
        const { totalDebito, totalCredito } = transaccion_detalles.reduce((acc, detalle) => {
            acc.totalDebito += parseFloat(detalle.debito) || 0;
            acc.totalCredito += parseFloat(detalle.credito) || 0;
            return acc;
        }, { totalDebito: 0, totalCredito: 0 });

        if (totalDebito !== totalCredito) {
            return res.status(400).json({ 
                success: false,
                message: 'La suma de los débitos y créditos no es igual',
                details: {
                    totalDebito,
                    totalCredito
                }
            });
        }

        // Crear transacción
        let referencia = generarReferenciaTransaccion();
        console.log('Referencia generada:', referencia);
   
        const nuevaTransaccion = await db.Transaccion.create({
            referencia: referencia,
            descripcion : descripcion,
            fecha: fecha || new Date(),
            tipo_transaccion : tipo_transaccion,
            es_generado_sistema: false,
            periodo_fiscal_id : periodo_fiscal_id,
            usuario_id : usuario_id
        });
        

        
        // Crear detalles de transacción
        const detallesCreados = await Promise.all(
            transaccion_detalles.map(detalle => 
                db.DetalleTransaccion.create({
                    debito: detalle.debito || 0,
                    credito: detalle.credito || 0,
                    descripcion: detalle.descripcion || null,
                    transaccion_id: nuevaTransaccion.id,
                    cuenta_id: detalle.cuenta_id
                })
            )
        );

        

        // Audit log
        await auditLogService.log('CREATE', ueser_id, 'Transacciones', nuevaTransaccion.id);

        return res.status(201).json({
            success: true,
            message: 'Transacción creada exitosamente',
            data: {
                transaccion: nuevaTransaccion
            }
        });

    } catch (error) {
        console.error('Error creating transaction:', error);
        
        return res.status(500).json({
            message : 'Error al crear la transacción: ' + error.message,
            error : error
        });
    }

}

const validateTransaccionFields = (req) => {
    const { descripcion, fecha, tipo_transaccion, periodo_fiscal_id, usuario_id } = req.body;
    let error = {}
    if (!descripcion) error.descripcion = 'Descripcion es requerido';
    if (!fecha) error.fecha = 'Fecha es requerido';
    if (!tipo_transaccion) error.tipo_transaccion = 'Tipo de transaccion es requerido';
    if (!periodo_fiscal_id) error.periodo_fiscal_id = 'Periodo fiscal es requerido';
    if (!usuario_id) error.usuario_id = 'Usuario es requerido';
}

const validateTransaccionDetalles = (detalles) => {
    if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
        return 'Debe proporcionar al menos un detalle de transacción';
    }

    for (const [index, detalle] of detalles.entries()) {
        if (!detalle.cuenta_id) {
            return `El detalle en posición ${index + 1} no tiene cuenta_id`;
        }
        
        const hasDebito = typeof detalle.debito !== 'undefined' && detalle.debito !== null;
        const hasCredito = typeof detalle.credito !== 'undefined' && detalle.credito !== null;
        
        if (!hasDebito && !hasCredito) {
            return `El detalle en posición ${index + 1} debe tener débito o crédito`;
        }
        
        if (hasDebito && hasCredito) {
            return `El detalle en posición ${index + 1} no puede tener débito y crédito simultáneamente`;
        }
        
        if ((hasDebito && parseFloat(detalle.debito) <= 0) || 
            (hasCredito && parseFloat(detalle.credito) <= 0)) {
            return `El detalle en posición ${index + 1} debe tener valores positivos`;
        }
    }

    return null;
};


const generarReferenciaTransaccion = () => {
    const prefix = 'SAO-TXN';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 9000) + 1000;
    return `${prefix}-${timestamp}-${random}`;
}