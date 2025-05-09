
module.exports = (app) => {
    require('./user.routes')(app);
    require('./centro_costo.routes')(app);
    require('./tipo_cuenta.route')(app);
    require('./presupuesto.route')(app);
}