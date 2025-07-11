module.exports = (app) => {
    const controller = require('../controllers/periodo_fiscal.controller');

    app.get('/periodo_fiscal/:actualId/saldos', controller.getSaldosEntrePeriodos);

    // Rutas existentes
    app.post('/periodo_fiscal/create', controller.createPeriodoFiscal);
    app.get('/periodo_fiscal', controller.getAllPeriodosFiscales);
    
    
    // Rutas faltantes que necesitas agregar
    app.get('/periodo_fiscal/:id', controller.getPeriodoFiscalById);
    app.put('/periodo_fiscal/update/:id', controller.updatePeriodoFiscal);
    app.delete('/periodo_fiscal/delete/:id', controller.deletePeriodoFiscal);
    app.put('/periodo_fiscal/cerrar/:id', controller.cerrarPeriodoFiscal);
    app.post('/periodo_fiscal/:id/generar-asientos', controller.generarAsientos);
}