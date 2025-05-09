module.exports = (app) => {
    const controller = require('../controllers/cuenta.controller');

    app.get('/cuenta', controller.getAllCuentas);
    app.get('/cuenta/:id', controller.getCuentaById);
    app.post('/cuenta/create', controller.createCuenta);
    app.put('/cuenta/update/:id', controller.updateCuenta);
    app.delete('/cuenta/delete/:id', controller.deleteCuenta);
};
