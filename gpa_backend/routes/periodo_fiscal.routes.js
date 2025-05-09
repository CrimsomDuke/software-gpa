module.exports = (app) => {
    const controller = require('../controllers/periodo_fiscal.controller');

    app.post('/periodo_fiscal/create', controller.createPeriodoFiscal);
    app.get('/periodo_fiscal', controller.getAllPeriodosFiscales);
}