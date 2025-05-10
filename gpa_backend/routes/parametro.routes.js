module.exports = (app) => {
    const controller = require('../controllers/parametro.controller');


    app.get('/parametro', controller.getAllParametros);
    app.post('/parametro/create', controller.createOrUpdateParametro);
    app.get('/parametro/:clave', controller.getParametroByClave);
};
