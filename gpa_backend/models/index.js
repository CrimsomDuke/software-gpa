
const { sequelizeInst, Sequelize } = require('../config/db.config');

const Persona = require('./persona')(sequelizeInst);
const User = require('./user')(sequelizeInst);
const AuditLog = require('./audit_log')(sequelizeInst);
const TipoCuenta = require('./tipo_cuenta')(sequelizeInst);
const NivelCuenta = require('./nivel_cuenta')(sequelizeInst);
const Cuenta = require('./cuenta')(sequelizeInst);
const PeriodoFiscal = require('./periodo_fiscal')(sequelizeInst);
const Transaccion = require('./transaccion')(sequelizeInst);
const DetalleTransaccion = require('./detalle_transaccion')(sequelizeInst);
const CentroCosto = require('./centro_costo')(sequelizeInst);
const ObjetoGasto = require('./objeto_gasto')(sequelizeInst);
const Presupuesto = require('./presupuesto')(sequelizeInst);
const EjecucionPresupuesto = require('./ejecucion_presupuesto')(sequelizeInst);
const Reporte = require('./reporte')(sequelizeInst);
const Parametro = require('./parametro')(sequelizeInst, Sequelize.DataTypes);

/**
 * user y audit_log estan relacionados pero no cuentan con FKs para evitar problemas de integridad referencial
 * Al borrar un usuario, evitar que se borren los logs de auditoria
 */
//Persona
Persona.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

//CUENTA
TipoCuenta.hasMany(Cuenta, {
    foreignKey: 'tipo_cuenta_id',
    as: 'cuentas'
});

NivelCuenta.hasMany(Cuenta, {
    foreignKey: 'nivel_cuenta_id',
    as: 'cuentas'
});

Cuenta.belongsTo(TipoCuenta, {
    foreignKey: 'tipo_cuenta_id',
    as: 'tipo_cuenta'
});

Cuenta.belongsTo(NivelCuenta, {
    foreignKey: 'nivel_cuenta_id',
    as: 'nivel_cuenta'
});

Cuenta.belongsTo(Cuenta, {
    foreignKey: 'cuenta_padre_id',
    as: 'padre'
});

Cuenta.hasMany(Cuenta, {
    foreignKey: 'cuenta_padre_id',
    as: 'subcuentas'
});

Cuenta.hasMany(DetalleTransaccion, {
    foreignKey: 'cuenta_id',
    as: 'detalles'
});

//TRANSACCION
PeriodoFiscal.hasMany(Transaccion, {
    foreignKey: 'periodo_fiscal_id',
    as: 'transacciones'
});

Transaccion.belongsTo(PeriodoFiscal, {
    foreignKey: 'periodo_fiscal_id',
    as: 'periodo_fiscal'
});

Transaccion.belongsTo(User, {
    foreignKey: 'usuario_id',
    as: 'usuario'
});

Transaccion.hasMany(DetalleTransaccion, {
    foreignKey: 'transaccion_id',
    as: 'detalles'
});

DetalleTransaccion.belongsTo(Transaccion, {
    foreignKey: 'transaccion_id',
    as: 'transaccion'
});

DetalleTransaccion.belongsTo(Cuenta, {
    foreignKey: 'cuenta_id',
    as: 'cuenta'
});

//PRESUPUESTOS
CentroCosto.hasMany(Presupuesto, {
    foreignKey: 'centro_costo_id',
    as: 'presupuestos'
});

ObjetoGasto.hasMany(Presupuesto, {
    foreignKey: 'objeto_gasto_id',
    as: 'presupuestos'
});

Presupuesto.belongsTo(CentroCosto, {
    foreignKey: 'centro_costo_id',
    as: 'centro_costo'
});

Presupuesto.belongsTo(ObjetoGasto, {
    foreignKey: 'objeto_gasto_id',
    as: 'objeto_gasto'
});

Presupuesto.belongsTo(Cuenta, {
    foreignKey: 'cuenta_id',
    as: 'cuenta'
});

Presupuesto.belongsTo(PeriodoFiscal, {
    foreignKey: 'periodo_fiscal_id',
    as: 'periodo_fiscal'
});

Presupuesto.belongsTo(User, {
    foreignKey: 'modificado_por_id',
    as: 'modificado_por'
});

Presupuesto.hasMany(EjecucionPresupuesto, {
    foreignKey: 'presupuesto_id',
    as: 'ejecuciones'
});

EjecucionPresupuesto.belongsTo(Presupuesto, {
    foreignKey: 'presupuesto_id',
    as: 'presupuesto'
});

EjecucionPresupuesto.belongsTo(DetalleTransaccion, {
    foreignKey: 'detalle_transaccion_id',
    as: 'detalle_transaccion'
});

ObjetoGasto.hasMany(Cuenta, {
    foreignKey: 'objeto_gasto_id',
    as: 'cuentas'
});

sequelizeInst.sync({
    alter : true
}).then(() => {
    console.log("Database Synced Successfully")
}).catch((err) => {
    console.error("Error Syncing the Database", err)
});

module.exports = {
    User,
    AuditLog,
    TipoCuenta,
    NivelCuenta,
    Cuenta,
    PeriodoFiscal,
    Transaccion,
    DetalleTransaccion,
    CentroCosto,
    ObjetoGasto,
    Parametro,
    Presupuesto,
    EjecucionPresupuesto,
    Reporte,
    sequelizeInst,
    Sequelize: sequelizeInst.Sequelize
}