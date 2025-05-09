
module.exports = (app) => {
    const controller = require('../controllers/transaccion.controller');

    app.post('/transaccion/create', controller.createTransaccion);
}