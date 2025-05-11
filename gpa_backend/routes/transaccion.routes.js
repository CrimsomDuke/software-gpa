
module.exports = (app) => {
    const controller = require('../controllers/transaccion.controller');
    app.get('/transaccion', controller.getAllTransacciones);
    app.post('/transaccion/create', controller.createTransaccion);
    
    app.get('/transaccion/:id', controller.getTransaccionById);
    app.put('/transaccion/update/:id', controller.updateTransaccion);
    app.delete('/transaccion/delete/:id', controller.deleteTransaccion);
    app.delete('/transaccion/detalles/delete/:id', controller.deleteTransaccionDetalles);
}