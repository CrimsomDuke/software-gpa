
module.exports = (app) => {
    const controller = require('../controllers/objeto_gasto.controller');

    //sin parametros
    app.get('/objeto_gasto', controller.getAllObjetoGasto);
    app.post('/objeto_gasto/create', controller.createObjetoGasto);

    //con parametros
    app.get('/objeto_gasto/:id', controller.getObjetoGastoById);
    app.put('/objeto_gasto/update/:id', controller.updateObjetoGasto);
    app.delete('/objeto_gasto/delete/:id', controller.deleteObjetoGasto);
}