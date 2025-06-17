module.exports = (app) => {
    const controller = require('../controllers/informes.controller');

    app.get('/informe/libro_diario', controller.libroDiario);
    app.get('/informe/libro_mayor', controller.libroMayor);
    app.get('/informe/balance_general', controller.balanceGeneral);
    app.get('/informe/estado_resultados', controller.estadoResultados);
    app.get('/informe/balance_comprobacion', controller.balanceComprobacion);
}