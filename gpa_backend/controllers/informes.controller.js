const { Op } = require('sequelize');
const db = require('../models/index.js');
const AuditLogService = require('../services/audit_log.service.js');

exports.libroDiario = async (req, res) => {
    const { periodo_fiscal_id, fecha_inicio, fecha_fin } = req.query;
    try {

        if (!periodo_fiscal_id && (!fecha_inicio || !fecha_fin)) {
            return res.status(400).json({ message: 'Debe proporcionar periodo_fiscal_id o un rango de fechas (fecha_inicio y fecha_fin)' });
        }
        const where = {};
        if (periodo_fiscal_id) where.periodo_fiscal_id = periodo_fiscal_id;
        if (fecha_inicio && fecha_fin) where.fecha = { [Op.between]: [fecha_inicio, fecha_fin] };

        const transacciones = await db.Transaccion.findAll({
            where,
            include: [
                {
                    model: db.DetalleTransaccion,
                    as: 'detalles',
                    include: [
                        { model: db.Cuenta, as: 'cuenta' }
                    ]
                },
                { model: db.User, as: 'usuario' },
            ],
            order: [['fecha', 'ASC'], ['id', 'ASC']]
        });

        if (!transacciones || transacciones.length === 0) {
            return res.status(404).json({ message: 'No se encontraron transacciones para los filtros proporcionados' });
        }
        // Formatear la respuesta para mostrar cada detalle como una línea del libro diario
        const libroDiario = [];
        transacciones.forEach(txn => {
            txn.detalles.forEach(det => {
                libroDiario.push({
                    fecha: txn.fecha,
                    referencia: txn.referencia,
                    descripcion_transaccion: txn.descripcion,
                    descripcion_detalle: det.descripcion,
                    codigo_cuenta: det.cuenta.codigo,
                    nombre_cuenta: det.cuenta.nombre,
                    debito: det.debito,
                    credito: det.credito,
                    usuario: txn.usuario ? txn.usuario.username : null
                });
            });
        });

        return res.status(200).json(libroDiario);
    } catch (error) {
        console.error('Error generando libro diario:', error);
        return res.status(500).json({ message: 'Error generando libro diario' });
    }
}

// para poder enviar desde el front end los parametros de periodo_fiscal_id, fecha_inicio y fecha_fin
// fetch('/api/informes/libro-diario', {
//   method: 'POST',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify({
//     periodo_fiscal_id: 1,
//     desde: '2025-01-01',
//     hasta: '2025-01-31'
//   })
// })
//   .then(res => res.json())
//   .then(data => console.log(data));

exports.libroMayor = async (req, res) => {
    const { cuenta_id, periodo_fiscal_id, fecha_inicio, fecha_fin } = req.query;
    try {
        if (!cuenta_id && !periodo_fiscal_id) {
            return res.status(400).json({ message: 'Debe proporcionar al menos cuenta_id o periodo_fiscal_id' });
        }
        const whereTransaccion = {};
        if (periodo_fiscal_id) whereTransaccion.periodo_fiscal_id = periodo_fiscal_id;
        if (fecha_inicio && fecha_fin) whereTransaccion.fecha = { [db.Sequelize.Op.between]: [fecha_inicio, fecha_fin] };

        const whereDetalle = {};
        if (cuenta_id) whereDetalle.cuenta_id = cuenta_id;

        const detalles = await db.DetalleTransaccion.findAll({
            where: whereDetalle,
            include: [
                {
                    model: db.Transaccion,
                    as: 'transaccion',
                    where: whereTransaccion,
                    attributes: ['fecha', 'referencia', 'descripcion']
                },
                {
                    model: db.Cuenta,
                    as: 'cuenta',
                    attributes: ['codigo', 'nombre']
                }
            ],
            order: [
                [{ model: db.Cuenta, as: 'cuenta' }, 'codigo', 'ASC'],
                [{ model: db.Transaccion, as: 'transaccion' }, 'fecha', 'ASC'],
                ['id', 'ASC']
            ]
        })

        if (!detalles || detalles.length === 0) {
            return res.status(404).json({ message: 'No se encontraron detalles para los filtros proporcionados' });
        }

        let saldo = 0;

        const libroMayor = detalles.map(det => {
            saldo += (det.debito || 0) - (det.credito || 0);
            return {
                cuenta_id: det.cuenta_id,
                codigo_cuenta: det.cuenta.codigo,
                nombre_cuenta: det.cuenta.nombre,
                fecha: det.transaccion.fecha,
                referencia: det.transaccion.referencia,
                descripcion_transaccion: det.transaccion.descripcion,
                debito: det.debito,
                credito: det.credito,
                saldo: saldo
            };
        });

        return res.status(200).json(libroMayor);
    } catch (error) {
        console.error('Error generando libro mayor:', error);
        return res.status(500).json({ message: 'Error generando libro mayor' });
    }

};

exports.balanceGeneral = async (req, res) => {
    const { fecha_corte } = req.query;

    try {

        if (!fecha_corte) {
            return res.status(400).json({ message: 'Debe proporcionar una fecha de corte' });
        }

        const cuentas = await db.Cuenta.findAll({
            where: { esta_activa: true },
            include: [
                {
                    model: db.TipoCuenta,
                    as: 'tipo_cuenta',
                    attributes: ['nombre']
                },
                {
                    model: db.DetalleTransaccion,
                    as: 'detalles',
                    include: [
                        {
                            model: db.Transaccion,
                            as: 'transaccion',
                            where: { fecha: { [db.Sequelize.Op.lte]: fecha_corte } },
                            attributes: []
                        }
                    ],
                    attributes: ['debito', 'credito']
                }
            ]
        });

        if (!cuentas || cuentas.length === 0) {
            return res.status(404).json({ message: 'No se encontraron cuentas activas para la fecha de corte proporcionada' });
        }

        const balance = { activos: 0, pasivos: 0, patrimonio: 0, detalles: [] };

        cuentas.forEach(cuenta => {
            const saldo = cuenta.detalles.reduce((acc, detalle) => {
                return acc + (detalle.debito || 0) - (detalle.credito || 0);
            }, 0);

            balance.detalles.push({
                tipo_cuenta: cuenta.tipo_cuenta.nombre,
                codigo_cuenta: cuenta.codigo,
                nombre_cuenta: cuenta.nombre,
                saldo
            });

            if (cuenta.tipo_cuenta.nombre === 'activo') {
                balance.activos += saldo;
            } else if (cuenta.tipo_cuenta.nombre === 'pasivo') {
                balance.pasivos += saldo;
            } else if (cuenta.tipo_cuenta.nombre === 'capital') {
                balance.patrimonio += saldo;
            }
        });

        return res.status(200).json(balance);
    } catch (error) {
        console.error('Error generando balance general:', error);
        return res.status(500).json({ message: 'Error generando balance general' });
    }
}

exports.estadoResultados = async (req, res) => {
    const { periodo_fiscal_id, fecha_inicio, fecha_fin } = req.query;

    try {

        if (!periodo_fiscal_id && (!fecha_inicio || !fecha_fin)) {
            return res.status(400).json({ message: 'Debe proporcionar periodo_fiscal_id o un rango de fechas (fecha_inicio y fecha_fin)' });
        }

        const whereTransaccion = {};
        if (periodo_fiscal_id) whereTransaccion.periodo_fiscal_id = periodo_fiscal_id;
        if (fecha_inicio && fecha_fin) whereTransaccion.fecha = { [db.Sequelize.Op.between]: [fecha_inicio, fecha_fin] };

        const cuentas = await db.Cuenta.findAll({
            where: { esta_activa: true },
            include: [
                {
                    model: db.TipoCuenta,
                    as: 'tipo_cuenta',
                    where: { nombre: { [db.Sequelize.Op.in]: ['ingresos', 'egresos'] } },
                    attributes: ['nombre']
                },
                {
                    model: db.DetalleTransaccion,
                    as: 'detalles',
                    include: [
                        {
                            model: db.Transaccion,
                            as: 'transaccion',
                            where: whereTransaccion,
                            attributes: []
                        }
                    ],
                    attributes: ['debito', 'credito']
                }
            ]
        });

        if (!cuentas || cuentas.length === 0) {
            return res.status(404).json({ message: 'No se encontraron cuentas activas para los filtros proporcionados' });
        }


        const resultado = { ingresos: 0, egresos: 0, utilidad_neta: 0, detalles: [] };

        cuentas.forEach(cuenta => {
            const totalDebito = cuenta.detalles.reduce((acc, detalle) => acc + (Number(detalle.debito) || 0), 0);
            const totalCredito = cuenta.detalles.reduce((acc, detalle) => acc + (Number(detalle.credito) || 0), 0);

            resultado.detalles.push({
                tipo_cuenta: cuenta.tipo_cuenta.nombre,
                codigo_cuenta: cuenta.codigo,
                nombre_cuenta: cuenta.nombre,
                total_debito: totalDebito,
                total_credito: totalCredito
            });

            if (cuenta.tipo_cuenta.nombre === 'ingresos') {
                resultado.ingresos += totalCredito;
            } else if (cuenta.tipo_cuenta.nombre === 'egresos') {
                resultado.egresos += totalDebito;
            }
        });

        resultado.utilidad_neta = resultado.ingresos - resultado.egresos;

        return res.status(200).json(resultado);
    } catch (error) {
        console.error('Error generando estado de resultados:', error);
        return res.status(500).json({ message: 'Error generando estado de resultados' });
    }
}

exports.balanceComprobacion = async (req, res) => {
    const { periodo_fiscal_id, fecha_inicio, fecha_fin } = req.query;

    try {

        if (!periodo_fiscal_id && (!fecha_inicio || !fecha_fin)) {
            return res.status(400).json({ message: 'Debe proporcionar periodo_fiscal_id o un rango de fechas (fecha_inicio y fecha_fin)' });
        }

        const whereTransaccion = {};
        if (periodo_fiscal_id) whereTransaccion.periodo_fiscal_id = periodo_fiscal_id;
        if (fecha_inicio && fecha_fin) whereTransaccion.fecha = { [db.Sequelize.Op.between]: [fecha_inicio, fecha_fin] };

        const cuentas = await db.Cuenta.findAll({
            where: { esta_activa: true },
            include: [
                {
                    model: db.DetalleTransaccion,
                    as: 'detalles',
                    include: [
                        {
                            model: db.Transaccion,
                            as: 'transaccion',
                            where: whereTransaccion,
                            attributes: []
                        }
                    ],
                    attributes: ['debito', 'credito']
                }
            ]
        });

        if (!cuentas || cuentas.length === 0) {
            return res.status(404).json({ message: 'No se encontraron cuentas activas para los filtros proporcionados' });
        }

        let totalDebito = 0;
        let totalCredito = 0;

        const balance = cuentas.map(cuenta => {
            const totalDebitoCuenta = cuenta.detalles.reduce((acc, detalle) => acc + (Number(detalle.debito) || 0), 0);
            const totalCreditoCuenta = cuenta.detalles.reduce((acc, detalle) => acc + (Number(detalle.credito) || 0), 0);
            totalDebito += totalDebitoCuenta;
            totalCredito += totalCreditoCuenta;

            return {
                cuenta_id: cuenta.id,
                codigo_cuenta: cuenta.codigo,
                nombre_cuenta: cuenta.nombre,
                total_debito: totalDebitoCuenta,
                total_credito: totalCreditoCuenta
            };
        });

        return res.status(200).json({
            balance,
            total_debito: totalDebito,
            total_credito: totalCredito,
            equilibrado: totalDebito === totalCredito
        });
    } catch (error) {
        console.error('Error generando balance de comprobación:', error);
        return res.status(500).json({ message: 'Error generando balance de comprobación' });
    }
}