module.exports = (app) => {
    const controller = require('../controllers/tipo_cuenta.controller');

    //con parametros
    app.get('/tipo_cuenta/:id', controller.getTipoCuentaById);
    app.patch('/tipo_cuenta/update/:id', controller.updateTipoCuenta);
    app.delete('/tipo_cuenta/delete/:id', controller.deleteTipoCuenta);

    //sin parametros
    app.get('/tipo_cuenta', controller.getAllTipoCuentas);
    app.post('/tipo_cuenta/create', controller.createTipoCuenta);


}

