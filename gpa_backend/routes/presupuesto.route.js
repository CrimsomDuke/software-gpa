module.exports = (app) => {
    const controller = require('../controllers/presupuesto.controller');

    //sin parametros
    app.get('/presupuesto', controller.getAllPresupuestos);
    app.post('/presupuesto/create', controller.createPresupuesto);

    //con parametros
    app.get('/presupuesto/:id', controller.getPresupuestoById);
    app.patch('/presupuesto/update/:id', controller.patchPresupuesto);
    app.delete('/presupuesto/delete/:id', controller.deletePresupuesto);
}