
module.exports = (app) => {
    require('./user.routes')(app);
    require('./centro_costo.routes')(app);
    require('./tipo_cuenta.route')(app);
    require('./presupuesto.route')(app);
    require('./transaccion.routes')(app);
    require('./detalle_transaccion.routes')(app);
    require('./periodo_fiscal.routes')(app);
    require('./nivel_cuenta.routes')(app);
    require('./cuenta.routes')(app);
    require('./parametro.routes')(app);
    require('./objeto_gasto.routes')(app);
    require('./ejecucion_presupuesto.routes')(app);
    require('./informes.routes')(app);
}