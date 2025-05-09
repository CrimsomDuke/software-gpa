
module.exports = (app) => {
    const controller = require('../controllers/nivel_cuenta.controller');

    app.get('/nivel_cuenta', controller.getAllNivelesCuentas);
    app.post('/nivel_cuenta/create', controller.createNivelCuenta);

    app.put('/nivel_cuenta/update/:id', controller.updateNivelCuenta);
    app.delete('/nivel_cuenta/delete/:id', controller.deleteNivelCuenta);
}