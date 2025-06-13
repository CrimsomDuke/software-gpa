const db = require('../models/');

exports.getComparacionPresupuesto = async (req, res) => {
    try {
        const presupuestos = await db.Presupuesto.findAll({
            include: [
                { model: db.ObjetoGasto, as: 'objeto_gasto' }
            ]
        });

        const resultados = await Promise.all(presupuestos.map(async (presupuesto) => {
            const cuentas = await db.Cuenta.findAll({
                where: { objeto_gasto_id: presupuesto.objeto_gasto_id }
            });

            const cuentaIds = cuentas.map(c => c.id);

            let totalDebito = 0;
            let totalCredito = 0;

            for(const id of cuentaIds) {
                totalDebito += await db.DetalleTransaccion.sum('debito', {
                    where: { cuenta_id: id }
                }) || 0;
                console.log(totalDebito);
            }

            const montoEjecutado = totalDebito - totalCredito;

            return {
                presupuestoId: presupuesto.id,
                objetoGasto: presupuesto.objeto_gasto ? presupuesto.objeto_gasto.nombre : null,
                montoPlanificado: parseFloat(presupuesto.monto_inicial),
                montoEjecutado: parseFloat(montoEjecutado),
                diferencia: parseFloat(presupuesto.monto_inicial) - parseFloat(montoEjecutado)
            };
        }));

        return res.status(200).json(resultados);

    } catch (error) {
        console.error('Error en comparación de presupuesto:', error);
        return res.status(500).json({ message: 'Error al obtener la comparación de presupuesto' });
    }
};
