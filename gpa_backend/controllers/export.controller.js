const { exportToExcel, exportToPDF, exportToHTML } = require('../utils/exportUtils');
const db = require('../models/');

exports.exportData = async (req, res) => {
  const format = req.params.format;
  const data = await db.Transaccion.findAll();

  try {
    let filePath;
    const fileName = `export_${Date.now()}`;

    if (format === 'excel') {
      filePath = await exportToExcel(data, fileName);
    } else if (format === 'pdf') {
      filePath = await exportToPDF(data, fileName); 
    } else if (format === 'html') {
      filePath = await exportToHTML(data, fileName);
    } else {
      return res.status(400).send('Formato no soportado');
    }

    if (!filePath || typeof filePath !== 'string') {
      console.error('filePath inválido:', filePath);
      return res.status(500).send('Error al generar el archivo de exportación');
    }

    res.download(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al exportar datos');
  }
};
