
module.exports = (app) => {
    require('./user.routes')(app);
    require('./centro_costo.routes')(app);
}