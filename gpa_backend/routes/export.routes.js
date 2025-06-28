const { exportData } = require('../controllers/export.controller');

module.exports = (app) => {
  // Ruta para exportar en diferentes formatos: /export/pdf, /export/excel, /export/html -> http://localhost:3000/export/html
  app.get('/export/:format', exportData);
};
