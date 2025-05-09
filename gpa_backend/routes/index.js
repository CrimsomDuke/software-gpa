
module.exports = (app) => {
    require('./user.routes')(app);
    require('./centro_costo.routes')(app);
    require('./tipo_cuenta.route')(app);
    require('./presupuesto.route')(app);
    require('./transaccion.routes')(app);
    require('./periodo_fiscal.routes')(app);
}