const db = require('../models/');
const AuditLogService = require('../services/audit_log.service');
const global_vars = require('../config/global');

exports.getAllCuentas = async (req, res) => {
    try {
      const cuentas = await db.Cuenta.findAll({
        include: [
          { model: db.TipoCuenta, as: 'tipo_cuenta' },
          { model: db.NivelCuenta, as: 'nivel_cuenta' },
          { model: db.Cuenta, as: 'padre' },
          { model: db.Cuenta, as: 'subcuentas' },
          { model: db.ObjetoGasto, as: 'objeto_gasto' }
        ]
      });
      res.status(200).json(cuentas);
    } catch (error) {
      console.error('Error al obtener cuentas:', error);
      res.status(500).json({ message: 'Error interno al obtener cuentas' });
    }
  };
  
  // Obtener una cuenta por ID
  exports.getCuentaById = async (req, res) => {
    const { id } = req.params;
    try {
      const cuenta = await db.Cuenta.findByPk(id, {
        include: ['tipo_cuenta', 'nivel_cuenta', 'padre', 'subcuentas', 'objeto_gasto']
      });
      if (!cuenta) return res.status(404).json({ message: 'Cuenta no encontrada' });
      res.status(200).json(cuenta);
    } catch (error) {
      console.error('Error al obtener cuenta:', error);
      res.status(500).json({ message: 'Error interno al obtener cuenta' });
    }
  };
  
  // Crear cuenta
  exports.createCuenta = async (req, res) => {
    const { codigo, nombre, descripcion, tipo_cuenta_id, nivel_cuenta_id, cuenta_padre_id, objeto_gasto_id, user_id } = req.body;
  
    if (!codigo || !nombre || !tipo_cuenta_id || !nivel_cuenta_id || !objeto_gasto_id || !user_id) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }
  
    try {
      // Validar longitud de código
      const nivel = await db.NivelCuenta.findByPk(nivel_cuenta_id);
      if (!nivel) return res.status(400).json({ message: 'Nivel de cuenta inválido' });
  
      if (cuenta_padre_id) {
        const padre = await db.Cuenta.findByPk(cuenta_padre_id);
        if (!padre) return res.status(400).json({ message: 'Cuenta padre no encontrada' });
      }
  
      const cuenta = await db.Cuenta.create({
        codigo,
        nombre,
        descripcion,
        tipo_cuenta_id,
        nivel_cuenta_id,
        cuenta_padre_id,
        objeto_gasto_id: objeto_gasto_id || null,
        esta_activa: true
      });
  
      await AuditLogService.createAuditLog('CREATE', user_id, 'Cuenta', cuenta.id);
  
      res.status(201).json(cuenta);
    } catch (error) {
      console.error('Error al crear cuenta:', error);
      res.status(500).json({ message: 'Error interno al crear cuenta' });
    }
  };
  
  // Actualizar cuenta
  exports.updateCuenta = async (req, res) => {
    const { id } = req.params;
    const { codigo, nombre, descripcion, tipo_cuenta_id, nivel_cuenta_id, cuenta_padre_id, esta_activa, objeto_gasto_id, user_id } = req.body;
  
    try {
      const cuenta = await db.Cuenta.findByPk(id);
      if (!cuenta) return res.status(404).json({ message: 'Cuenta no encontrada' });
  
      if (codigo) cuenta.codigo = codigo;
      if (nombre) cuenta.nombre = nombre;
      if (descripcion) cuenta.descripcion = descripcion;
      if (tipo_cuenta_id) cuenta.tipo_cuenta_id = tipo_cuenta_id;
      if (nivel_cuenta_id) cuenta.nivel_cuenta_id = nivel_cuenta_id;
      if (cuenta_padre_id !== undefined) cuenta.cuenta_padre_id = cuenta_padre_id;
      if (esta_activa !== undefined) cuenta.esta_activa = esta_activa;
      if (objeto_gasto_id !== undefined) cuenta.objeto_gasto_id = objeto_gasto_id;
  
      await cuenta.save();
  
      await AuditLogService.createAuditLog('UPDATE', user_id, 'Cuenta', id);
  
      res.status(200).json(cuenta);
    } catch (error) {
      console.error('Error al actualizar cuenta:', error);
      res.status(500).json({ message: 'Error interno al actualizar cuenta' });
    }
  };
  
  // Eliminar cuenta
  exports.deleteCuenta = async (req, res) => {
    const { id } = req.params;
    const { user_id } = req.body;
  
    try {
      const cuenta = await db.Cuenta.findByPk(id, {
        include: [{ model: db.Cuenta, as: 'subcuentas' }]
      });
  
      if (!cuenta) return res.status(404).json({ message: 'Cuenta no encontrada' });
      if (cuenta.subcuentas.length > 0) {
        return res.status(400).json({ message: 'No se puede eliminar una cuenta con subcuentas' });
      }
  
      await cuenta.destroy();
  
      await AuditLogService.createAuditLog('DELETE', user_id, 'Cuenta', id);
  
      res.status(200).json({ message: 'Cuenta eliminada correctamente' });
    } catch (error) {
      console.error('Error al eliminar cuenta:', error);
      res.status(500).json({ message: 'Error interno al eliminar cuenta' });
    }
  };


  exports.getMovimientosPorCuenta = async (req, res) => {
    const { cuenta_id } = req.params;

    if (!cuenta_id) {
        return res.status(400).json({ message: 'El parámetro cuenta_id es obligatorio' });
    }

    try {
        const movimientos = await db.DetalleTransaccion.findAll({
            where: { cuenta_id },
            include: [
                {
                    model: db.Transaccion,
                    as: 'transaccion', // Asegúrate de tener la relación definida
                    attributes: ['id', 'fecha', 'descripcion']
                },
                {
                    model: db.Cuenta,
                    as: 'cuenta',
                    attributes: ['id', 'codigo', 'nombre']
                }
            ],
            order: [['id', 'ASC']]
        });

        res.status(200).json(movimientos);
    } catch (error) {
        console.error('Error al obtener movimientos por cuenta:', error);
        res.status(500).json({ message: 'Error interno al obtener movimientos por cuenta' });
    }
};
