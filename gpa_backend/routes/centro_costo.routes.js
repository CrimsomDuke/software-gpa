
module.exports = (app) => {
    const controller = require('../controllers/centro_costo.controller');

    //sin parametros
    app.get('/centro_costo', controller.getAllCentroCosto);
    app.post('/centro_costo/create', controller.createCentroCosto);

    //con parametros
    app.get('/centro_costo/:id', controller.getCentroCostoById);
    app.put('/centro_costo/update/:id', controller.updateCentroCosto);
    app.delete('/centro_costo/delete/:id', controller.deleteCentroCosto);
}