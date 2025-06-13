
module.exports = (app) => {
    const controller = require('../controllers/ejecucion_presupuesto.controller');

    app.get('/ejecucion_presupuesto', controller.getComparacionPresupuesto);
}