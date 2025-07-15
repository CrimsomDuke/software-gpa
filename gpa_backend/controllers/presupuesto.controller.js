const db = require('../models');
const AuditLogService = require('../services/audit_log.service');

exports.getPresupuestoById = async (req, res) => {
    const { id } = req.params;
    try{
        const presupuesto = await db.presupuesto.findByPk(id, {
            include: [
                { model: db.CentroCosto, as: 'centro_costo' },
                { model: db.ObjetoGasto, as: 'objeto_gasto' },

            ]
        })

        if (!presupuesto) {
            return res.status(404).json({ message: 'No se encontró un presupuesto' });
        }

        return res.status(200).json(presupuesto);
    }catch(error){
        console.error('Error fetching Presupuesto:', error);
        return res.status(500).json({ message: 'Error obteniendo presupuesto' });
    }

}

exports.getAllPresupuestos = async (req, res) => {
    try{
        const presupuestos = await db.Presupuesto.findAll({
            include: [
                { model: db.CentroCosto, as: 'centro_costo' },
                { model: db.ObjetoGasto, as: 'objeto_gasto' },
            ]
        });

        if (presupuestos === null || presupuestos.length === 0) {
            return res.status(404).json({ message: 'No se encontraron presupuestos' });
        }

        return res.status(200).json(presupuestos);
    }catch(error){
        console.error('Error fetching Presupuestos:', error);
        return res.status(500).json({ message: 'Error obteniendo presupuestos' });
    }
}

exports.createPresupuesto = async (req, res) => {
    const { monto_inicial, periodo_fiscal_id, centro_costo_id, objeto_gasto_id, cuenta_id, user_id } = req.body;

    try {
        if (!monto_inicial || !periodo_fiscal_id || !centro_costo_id || !objeto_gasto_id  || !user_id) {
            return res.status(400).json({ message: 'Todos los campos son requeridos: monto_inicial, periodo_fiscal_id, centro_costo_id, objeto_gasto_id, user_id' });
        }

        const centroCosto = await db.CentroCosto.findByPk(centro_costo_id);
        if (!centroCosto) {
            return res.status(404).json({ message: 'El Centro de Costo no existe' });
        }

        const objetoGasto = await db.ObjetoGasto.findByPk(objeto_gasto_id);
        if (!objetoGasto) {
            return res.status(404).json({ message: 'El Objeto de Gasto no existe' });
        }

        const presupuesto = await db.Presupuesto.create({
            monto_inicial,
            periodo_fiscal_id,
            centro_costo_id,
            objeto_gasto_id,
            creado_por: user_id,
            esta_activo: true
        });

        AuditLogService.createAuditLog('CREATE', user_id, 'Presupuesto', presupuesto.id);

        return res.status(201).json(presupuesto);
    } catch (error) {
        console.error('Error creating Presupuesto:', error);
        return res.status(500).json({ message: 'Error creando el presupuesto' });
    }
};

exports.updatePresupuesto = async (req, res) => {
    const { id } = req.params; 
    const { monto_inicial, monto_modificado, fecha_modificacion, centro_costo_id, objeto_gasto_id, modificado_por_id } = req.body;

    try {
        const presupuesto = await db.Presupuesto.findByPk(id);
        if (!presupuesto) {
            return res.status(404).json({ message: 'No se encontró el presupuesto' });
        }

        if (centro_costo_id) {
            const centroCosto = await db.CentroCosto.findByPk(centro_costo_id);
            if (!centroCosto) {
                return res.status(404).json({ message: 'El Centro de Costo no existe' });
            }
        }

        if (objeto_gasto_id) {
            const objetoGasto = await db.ObjetoGasto.findByPk(objeto_gasto_id);
            if (!objetoGasto) {
                return res.status(404).json({ message: 'El Objeto de Gasto no existe' });
            }
        }

        await presupuesto.update({
            monto_inicial: monto_inicial || presupuesto.monto_inicial,
            monto_modificado: monto_modificado || presupuesto.monto_modificado,
            fecha_modificacion: fecha_modificacion || presupuesto.fecha_modificacion,
            centro_costo_id: centro_costo_id || presupuesto.centro_costo_id,
            objeto_gasto_id: objeto_gasto_id || presupuesto.objeto_gasto_id,
            modificado_por_id: modificado_por_id || presupuesto.modificado_por_id
        });

        AuditLogService.createAuditLog('UPDATE', modificado_por_id, 'Presupuesto', presupuesto.id);

        return res.status(200).json(presupuesto);
    } catch (error) {
        console.error('Error updating Presupuesto:', error);
        return res.status(500).json({ message: 'Error actualizando el presupuesto' });
    }
};

exports.patchPresupuesto = async (req, res) => {
    const { id } = req.params; 
    const { monto_modificado, fecha_modificacion, centro_costo_id, objeto_gasto_id, modificado_por_id } = req.body;

    try {
        
        const presupuesto = await db.Presupuesto.findByPk(id);
        if (!presupuesto) {
            return res.status(404).json({ message: 'No se encontró el presupuesto' });
        }

        
        if (centro_costo_id) {
            const centroCosto = await db.CentroCosto.findByPk(centro_costo_id);
            if (!centroCosto) {
                return res.status(404).json({ message: 'El Centro de Costo no existe' });
            }
        }

        
        if (objeto_gasto_id) {
            const objetoGasto = await db.ObjetoGasto.findByPk(objeto_gasto_id);
            if (!objetoGasto) {
                return res.status(404).json({ message: 'El Objeto de Gasto no existe' });
            }
        }

        
        await presupuesto.update({
            monto_modificado: monto_modificado || presupuesto.monto_modificado,
            fecha_modificacion: fecha_modificacion || presupuesto.fecha_modificacion,
            centro_costo_id: centro_costo_id || presupuesto.centro_costo_id,
            objeto_gasto_id: objeto_gasto_id || presupuesto.objeto_gasto_id,
            modificado_por_id: modificado_por_id || presupuesto.modificado_por_id
        });

        
        AuditLogService.createAuditLog('UPDATE', modificado_por_id, 'Presupuesto', presupuesto.id);

        
        return res.status(200).json(presupuesto);
    } catch (error) {
        console.error('Error updating Presupuesto:', error);
        return res.status(500).json({ message: 'Error actualizando el presupuesto' });
    }
};

exports.deletePresupuesto = async (req, res) => {
    const { id } = req.params; 
    const { user_id } = req.body; 

    try {
        
        const presupuesto = await db.Presupuesto.findByPk(id);
        if (!presupuesto) {
            return res.status(404).json({ message: 'No se encontró el presupuesto' });
        }


        await presupuesto.destroy();


        AuditLogService.createAuditLog('DELETE', user_id, 'Presupuesto', presupuesto.id);


        return res.status(200).json({ message: 'Presupuesto eliminado correctamente' });
    } catch (error) {
        console.error('Error deleting Presupuesto:', error);
        return res.status(500).json({ message: 'Error eliminando el presupuesto' });
    }
};