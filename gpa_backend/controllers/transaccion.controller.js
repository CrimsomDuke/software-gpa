const db = require('../models/');
const auditLogService = require('../services/audit_log.service');
const global_vars = require('../config/global');


exports.getAllTransacciones = async (req, res) => {
    try {
        const transacciones = await db.Transaccion.findAll();
        return res.status(200).json(transacciones);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return res.status(500).json({ message: 'Error obteniendo transacciones' });
    }
}

exports.getTransaccionById = async (req, res) => {
    const { id } = req.params
    const transaccion = await db.Transaccion.findByPk(id, {
        include : [
            { model: db.DetalleTransaccion, as: 'detalles' },
            { model: db.PeriodoFiscal, as: 'periodo_fiscal' },
            { model: db.User, as: 'usuario' }
        ]
    })

    if(!transaccion){
        return res.status(404).json({ message: 'No se encontró la transacción' });
    }

    return res.status(200).json(transaccion);
}

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
                errors: 'Los débitos y créditos deben estar balanceados',
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
        await auditLogService.createAuditLog('CREATE', usuario_id, 'Transacciones', nuevaTransaccion.id);

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
//LA MODIFICACIÓN DE LOS DETALLES DE TRANSACCION SE HACE EN EL CONTROLADOR DE DETALLE TRANSACCION
exports.updateTransaccion = async (req, res) => {
    const { id } = req.params;
    const { descripcion, fecha, tipo_transaccion, periodo_fiscal_id, usuario_id } = req.body;
    try{
        const transaccion = await db.Transaccion.findByPk(id);
        if (!transaccion) {
            return res.status(404).json({ message: 'No se encontró la transacción' });
        }

        //check campos enviados
        if (descripcion) transaccion.descripcion = descripcion;
        if (fecha) transaccion.fecha = fecha;
        if (tipo_transaccion) transaccion.tipo_transaccion = tipo_transaccion;
        if (periodo_fiscal_id) transaccion.periodo_fiscal_id = periodo_fiscal_id;
        if (usuario_id) transaccion.usuario_id = usuario_id;

        await transaccion.save();
        await auditLogService.createAuditLog('UPDATE', usuario_id, 'Transacciones', transaccion.id);

        return res.status(200).json(transaccion);

    }catch(error){
        console.error('Error updating transaction:', error);
        return res.status(500).json({
            message : 'Error al actualizar la transacción: ' + error.message,
            error : error
        });
    }
}

exports.deleteTransaccion = async (req, res) => {
    const { id } = req.params;
    const { usuario_id } = req.body;
    try {
        const transaccion = await db.Transaccion.findByPk(id);
        if (!transaccion) {
            return res.status(404).json({ message: 'No se encontró la transacción' });
        }

        // Eliminar detalles de transacción
        await db.DetalleTransaccion.destroy({
            where: {
                transaccion_id: id
            }
        });

        await transaccion.destroy();
        await auditLogService.createAuditLog('DELETE', usuario_id, 'Transacciones', transaccion.id);

        return res.status(200).json({
            message: 'Transacción eliminada exitosamente',
            data: transaccion
        });
    }catch (error) {
        console.error('Error deleting transaction:', error);
        return res.status(500).json({
            message : 'Error al eliminar la transacción: ' + error.message,
            error : error
        });
    }
}

exports.deleteTransaccionDetalles = async (req, res) => {
    const { id } = req.params;
    const { usuario_id } = req.body;

    try{
        const transaccion = await db.Transaccion.findByPk(id);
        if (!transaccion) {
            return res.status(404).json({ message: 'No se encontró la transacción' });
        }

        const detalles = await db.DetalleTransaccion.findAll({
            where: {
                transaccion_id: id
            }
        });

        if(!detalles || detalles.length === 0){
            return res.status(404).json({ message: 'No se encontraron detalles de transacción para eliminar' });
        }

        // Usar Promise.all en lugar de forEach para manejar correctamente las promesas
        await Promise.all(detalles.map(async (detalle) => {
            await detalle.destroy();
        }));

        await auditLogService.createAuditLog('DELETE', usuario_id, 'DetalleTransaccion', id);

        return res.status(200).json({ 
            message: 'Detalles de transacción eliminados exitosamente',
            detalles_eliminados: detalles.length
        });

    }catch(error){
        console.error('Error deleting transaction details:', error);
        return res.status(500).json({
            message : 'Error al eliminar los detalles de la transacción: ' + error.message,
            error : error
        });
    }
}

//CONSULTAR SALDOS DE UN PERÍODO FISCAL PARA TRASPASO
exports.consultarSaldosPeriodo = async (req, res) => {
    const { periodo_fiscal_id } = req.params;

    if (!periodo_fiscal_id) {
        return res.status(400).json({ 
            message: 'El periodo_fiscal_id es requerido' 
        });
    }

    try {
        // Verificar que el período fiscal exista
        const periodo = await db.PeriodoFiscal.findByPk(periodo_fiscal_id);

        if (!periodo) {
            return res.status(404).json({ 
                message: 'El período fiscal no existe' 
            });
        }

        // Calcular saldos de todas las cuentas del período
        const saldosCuentas = await calcularSaldosFinalePeriodo(periodo_fiscal_id);

        // Separar por tipo de cuenta
        const saldosPatrimoniales = saldosCuentas.filter(s => 
            ['activo', 'pasivo', 'capital'].includes(s.tipo_cuenta) && s.saldo !== 0
        );

        const saldosResultado = saldosCuentas.filter(s => 
            ['ingresos', 'egresos'].includes(s.tipo_cuenta) && s.saldo !== 0
        );

        // Calcular totales
        const totalActivos = saldosPatrimoniales
            .filter(s => s.tipo_cuenta === 'activo')
            .reduce((sum, s) => sum + s.saldo, 0);

        const totalPasivos = saldosPatrimoniales
            .filter(s => s.tipo_cuenta === 'pasivo')
            .reduce((sum, s) => sum + s.saldo, 0);

        const totalCapital = saldosPatrimoniales
            .filter(s => s.tipo_cuenta === 'capital')
            .reduce((sum, s) => sum + s.saldo, 0);

        const totalIngresos = saldosResultado
            .filter(s => s.tipo_cuenta === 'ingresos')
            .reduce((sum, s) => sum + s.saldo, 0);

        const totalEgresos = saldosResultado
            .filter(s => s.tipo_cuenta === 'egresos')
            .reduce((sum, s) => sum + s.saldo, 0);

        const resultadoEjercicio = totalIngresos - totalEgresos;

        return res.status(200).json({
            periodo_fiscal: {
                id: periodo.id,
                nombre: periodo.nombre,
                esta_cerrado: periodo.esta_cerrado
            },
            resumen_saldos: {
                total_activos: parseFloat(totalActivos.toFixed(2)),
                total_pasivos: parseFloat(totalPasivos.toFixed(2)),
                total_capital: parseFloat(totalCapital.toFixed(2)),
                total_ingresos: parseFloat(totalIngresos.toFixed(2)),
                total_egresos: parseFloat(totalEgresos.toFixed(2)),
                resultado_ejercicio: parseFloat(resultadoEjercicio.toFixed(2))
            },
            saldos_patrimoniales: saldosPatrimoniales.map(s => ({
                ...s,
                saldo: parseFloat(s.saldo.toFixed(2))
            })),
            saldos_resultado: saldosResultado.map(s => ({
                ...s,
                saldo: parseFloat(s.saldo.toFixed(2))
            })),
            puede_traspasar: periodo.esta_cerrado && (saldosPatrimoniales.length > 0 || saldosResultado.length > 0)
        });

    } catch (error) {
        console.error('Error consultando saldos del período:', error);
        return res.status(500).json({ 
            message: 'Error interno al consultar saldos del período',
            error: error.message 
        });
    }
};

//TRASPASO DE SALDOS CONTABLES ENTRE GESTIONES
exports.traspasoSaldos = async (req, res) => {
    const { periodo_fiscal_origen_id, periodo_fiscal_destino_id, user_id } = req.body;

    if (!periodo_fiscal_origen_id || !periodo_fiscal_destino_id || !user_id) {
        return res.status(400).json({ 
            message: 'Faltan campos requeridos: periodo_fiscal_origen_id, periodo_fiscal_destino_id, user_id' 
        });
    }

    try {
        // Verificar que los períodos fiscales existan
        const periodoOrigen = await db.PeriodoFiscal.findByPk(periodo_fiscal_origen_id);
        const periodoDestino = await db.PeriodoFiscal.findByPk(periodo_fiscal_destino_id);

        if (!periodoOrigen || !periodoDestino) {
            return res.status(404).json({ 
                message: 'Uno o ambos períodos fiscales no existen' 
            });
        }

        // Verificar que el período origen esté cerrado
        if (!periodoOrigen.esta_cerrado) {
            return res.status(400).json({ 
                message: 'El período fiscal de origen debe estar cerrado antes de realizar el traspaso' 
            });
        }

        // Calcular saldos de todas las cuentas al final del período origen
        const saldosCuentas = await calcularSaldosFinalePeriodo(periodo_fiscal_origen_id);

        // Crear asientos de cierre para cuentas de resultado (ingresos y egresos)
        const asientoCierre = await crearAsientoCierre(
            saldosCuentas, 
            periodo_fiscal_origen_id, 
            user_id
        );

        // Crear asientos de apertura para cuentas patrimoniales en el nuevo período
        const asientoApertura = await crearAsientoApertura(
            saldosCuentas, 
            periodo_fiscal_destino_id, 
            user_id
        );

        // Registrar auditoría
        await auditLogService.createAuditLog(
            'TRASPASO_SALDOS', 
            user_id, 
            'Transaccion', 
            asientoApertura.id, 
            `Traspaso de saldos del período ${periodoOrigen.nombre} al período ${periodoDestino.nombre}`
        );

        return res.status(200).json({
            message: 'Traspaso de saldos realizado exitosamente',
            asiento_cierre: asientoCierre,
            asiento_apertura: asientoApertura,
            saldos_traspasados: saldosCuentas.filter(s => s.saldo !== 0)
        });

    } catch (error) {
        console.error('Error en traspaso de saldos:', error);
        return res.status(500).json({ 
            message: 'Error interno al realizar el traspaso de saldos',
            error: error.message 
        });
    }
};

// Función auxiliar para calcular saldos finales del período
const calcularSaldosFinalePeriodo = async (periodo_fiscal_id) => {
    try {
        // Obtener todas las cuentas activas
        const cuentas = await db.Cuenta.findAll({
            where: { esta_activa: true },
            include: [
                { model: db.TipoCuenta, as: 'tipo_cuenta' }
            ]
        });

        const saldosCuentas = [];

        for (const cuenta of cuentas) {
            // Calcular total débito de la cuenta en el período
            const totalDebito = await db.DetalleTransaccion.sum('debito', {
                include: [{
                    model: db.Transaccion,
                    as: 'transaccion',
                    where: { periodo_fiscal_id: periodo_fiscal_id }
                }],
                where: { cuenta_id: cuenta.id }
            }) || 0;

            // Calcular total crédito de la cuenta en el período
            const totalCredito = await db.DetalleTransaccion.sum('credito', {
                include: [{
                    model: db.Transaccion,
                    as: 'transaccion',
                    where: { periodo_fiscal_id: periodo_fiscal_id }
                }],
                where: { cuenta_id: cuenta.id }
            }) || 0;

            // Determinar saldo según naturaleza de la cuenta
            let saldo = 0;
            const tipoCuenta = cuenta.tipo_cuenta.nombre;

            if (['activo', 'egresos'].includes(tipoCuenta)) {
                // Cuentas de naturaleza deudora
                saldo = totalDebito - totalCredito;
            } else if (['pasivo', 'capital', 'ingresos'].includes(tipoCuenta)) {
                // Cuentas de naturaleza acreedora
                saldo = totalCredito - totalDebito;
            }

            saldosCuentas.push({
                cuenta_id: cuenta.id,
                codigo_cuenta: cuenta.codigo,
                nombre_cuenta: cuenta.nombre,
                tipo_cuenta: tipoCuenta,
                total_debito: parseFloat(totalDebito),
                total_credito: parseFloat(totalCredito),
                saldo: parseFloat(saldo)
            });
        }

        return saldosCuentas;

    } catch (error) {
        console.error('Error calculando saldos finales:', error);
        throw error;
    }
};

// Función auxiliar para crear asiento de cierre
const crearAsientoCierre = async (saldosCuentas, periodo_fiscal_id, user_id) => {
    try {
        // Filtrar cuentas de resultado con saldo diferente de cero
        const cuentasResultado = saldosCuentas.filter(s => 
            ['ingresos', 'egresos'].includes(s.tipo_cuenta) && s.saldo !== 0
        );

        if (cuentasResultado.length === 0) {
            return null; // No hay cuentas de resultado para cerrar
        }

        // Crear transacción de cierre
        const transaccionCierre = await db.Transaccion.create({
            referencia: generarReferenciaTransaccion(),
            descripcion: 'Asiento de cierre - Traspaso de saldos',
            fecha: new Date(),
            tipo_transaccion: 'cierre',
            es_generado_sistema: true,
            periodo_fiscal_id: periodo_fiscal_id,
            usuario_id: user_id
        });

        // Crear detalles para cerrar las cuentas de resultado
        const detallesCierre = [];
        let totalResultado = 0;

        for (const cuenta of cuentasResultado) {
            if (cuenta.tipo_cuenta === 'ingresos' && cuenta.saldo > 0) {
                // Cerrar cuenta de ingresos con débito
                detallesCierre.push({
                    transaccion_id: transaccionCierre.id,
                    cuenta_id: cuenta.cuenta_id,
                    debito: cuenta.saldo,
                    credito: 0,
                    descripcion: `Cierre cuenta de ingresos: ${cuenta.nombre_cuenta}`
                });
                totalResultado += cuenta.saldo;
            } else if (cuenta.tipo_cuenta === 'egresos' && cuenta.saldo > 0) {
                // Cerrar cuenta de egresos con crédito
                detallesCierre.push({
                    transaccion_id: transaccionCierre.id,
                    cuenta_id: cuenta.cuenta_id,
                    debito: 0,
                    credito: cuenta.saldo,
                    descripcion: `Cierre cuenta de egresos: ${cuenta.nombre_cuenta}`
                });
                totalResultado -= cuenta.saldo;
            }
        }

        // Buscar o crear cuenta de resultado del ejercicio
        let cuentaResultado = await db.Cuenta.findOne({
            where: { codigo: '3.3.01' } // Código típico para resultado del ejercicio
        });

        if (!cuentaResultado) {
            // Si no existe, buscar tipo de cuenta capital y nivel cuenta apropiado
            const tipoCapital = await db.TipoCuenta.findOne({
                where: { nombre: 'capital' }
            });
            
            const nivelCuenta = await db.NivelCuenta.findOne({
                where: { nombre: 'mayor' }
            });
            
            if (tipoCapital && nivelCuenta) {
                cuentaResultado = await db.Cuenta.create({
                    codigo: '3.3.01',
                    nombre: 'Resultado del Ejercicio',
                    descripcion: 'Cuenta para acumular el resultado del período fiscal',
                    tipo_cuenta_id: tipoCapital.id,
                    nivel_cuenta_id: nivelCuenta.id,
                    esta_activa: true
                });
            }
        }

        // Agregar contrapartida a cuenta de resultado del ejercicio
        if (cuentaResultado && totalResultado !== 0) {
            detallesCierre.push({
                transaccion_id: transaccionCierre.id,
                cuenta_id: cuentaResultado.id,
                debito: totalResultado < 0 ? Math.abs(totalResultado) : 0,
                credito: totalResultado > 0 ? totalResultado : 0,
                descripcion: 'Resultado del ejercicio'
            });
        }

        // Crear todos los detalles de la transacción
        await db.DetalleTransaccion.bulkCreate(detallesCierre);

        return transaccionCierre;

    } catch (error) {
        console.error('Error creando asiento de cierre:', error);
        throw error;
    }
};

// Función auxiliar para crear asiento de apertura
const crearAsientoApertura = async (saldosCuentas, periodo_fiscal_id, user_id) => {
    try {
        // Filtrar cuentas patrimoniales con saldo diferente de cero
        const cuentasPatrimoniales = saldosCuentas.filter(s => 
            ['activo', 'pasivo', 'capital'].includes(s.tipo_cuenta) && s.saldo !== 0
        );

        if (cuentasPatrimoniales.length === 0) {
            return null; // No hay cuentas patrimoniales para abrir
        }

        // Crear transacción de apertura
        const transaccionApertura = await db.Transaccion.create({
            referencia: generarReferenciaTransaccion(),
            descripcion: 'Asiento de apertura - Traspaso de saldos',
            fecha: new Date(),
            tipo_transaccion: 'apertura',
            es_generado_sistema: true,
            periodo_fiscal_id: periodo_fiscal_id,
            usuario_id: user_id
        });

        // Crear detalles para las cuentas patrimoniales
        const detallesApertura = [];

        for (const cuenta of cuentasPatrimoniales) {
            if (cuenta.saldo > 0) {
                if (cuenta.tipo_cuenta === 'activo') {
                    // Cuentas de activo: saldo deudor
                    detallesApertura.push({
                        transaccion_id: transaccionApertura.id,
                        cuenta_id: cuenta.cuenta_id,
                        debito: cuenta.saldo,
                        credito: 0,
                        descripcion: `Apertura saldo: ${cuenta.nombre_cuenta}`
                    });
                } else if (['pasivo', 'capital'].includes(cuenta.tipo_cuenta)) {
                    // Cuentas de pasivo y capital: saldo acreedor
                    detallesApertura.push({
                        transaccion_id: transaccionApertura.id,
                        cuenta_id: cuenta.cuenta_id,
                        debito: 0,
                        credito: cuenta.saldo,
                        descripcion: `Apertura saldo: ${cuenta.nombre_cuenta}`
                    });
                }
            }
        }

        // Crear todos los detalles de la transacción
        await db.DetalleTransaccion.bulkCreate(detallesApertura);

        return transaccionApertura;

    } catch (error) {
        console.error('Error creando asiento de apertura:', error);
        throw error;
    }
};

const validateTransaccionFields = (req) => {
    const { descripcion, fecha, tipo_transaccion, periodo_fiscal_id, usuario_id } = req.body;
    let error = {}
    if (!descripcion) error.descripcion = 'Descripcion es requerido';
    if (!fecha) error.fecha = 'Fecha es requerido';
    if (!tipo_transaccion) error.tipo_transaccion = 'Tipo de transaccion es requerido';
    if (!periodo_fiscal_id) error.periodo_fiscal_id = 'Periodo fiscal es requerido';
    if (!usuario_id) error.usuario_id = 'Usuario es requerido';
    
    return Object.keys(error).length > 0 ? error : null;
}

const validateTransaccionDetalles = (detalles) => {
    if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
        return 'La transacción debe tener al menos un detalle';
    }

    const cuentaUsadas = new Set();
    for (const [index, detalle] of detalles.entries()) {
        if (!detalle.cuenta_id) {
            return `El detalle en posición ${index + 1} no tiene cuenta_id`;
        }
        
        const hasDebito = typeof detalle.debito !== 'undefined' && detalle.debito !== null && detalle.debito !== 0;
        const hasCredito = typeof detalle.credito !== 'undefined' && detalle.credito !== null && detalle.credito !== 0;
        
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

        if (cuentaUsadas.has(detalle.cuenta_id)) {
            return `La cuenta con ID ${detalle.cuenta_id} está repetida. Cada cuenta debe aparecer una sola vez por transacción.`;
        }
        cuentaUsadas.add(detalle.cuenta_id);
    }

    return null;
};

//CODIGO REFERENCIA
const generarReferenciaTransaccion = () => {
    const prefix = 'SAO-TXN';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 9000) + 1000;
    return `${prefix}-${timestamp}-${random}`;
}