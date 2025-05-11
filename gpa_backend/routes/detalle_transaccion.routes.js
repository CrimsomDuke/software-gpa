

module.exports = (app) => {
    const controller = require('../controllers/detalle_transaccion.controller');

    app.post('/detalle_transaccion/create/transaccion/:transaccion_id', controller.createDetallesTransaccion);
    app.put('/detalle_transaccion/update/transaccion/:transaccion_id', controller.updateDetallesTransaccion);
    app.delete('/detalle_transaccion/delete/transaccion/:transaccion_id', controller.deleteDetallesTransaccion);
}