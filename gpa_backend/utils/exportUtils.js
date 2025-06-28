const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const ejs = require('ejs');
const path = require('path');

function flattenData(data) {
  return data.map(item => {
    const values = item.dataValues ?? item;

    const flat = {};
    for (const [key, value] of Object.entries(values)) {
      // Si el valor es un objeto o fecha, conviértelo en string legible
      if (value instanceof Date) {
        flat[key] = value.toISOString().split('T')[0];
      } else if (typeof value === 'object' && value !== null) {
        flat[key] = JSON.stringify(value);
      } else {
        flat[key] = value;
      }
    }
    return flat;
  });
}


async function exportToExcel(data, filename) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Transacciones');

  const flatData = flattenData(data);

  sheet.columns = Object.keys(flatData[0]).map(key => ({
    header: key.toUpperCase(),
    key
  }));

  flatData.forEach(item => {
    sheet.addRow(item);
  });

  const filePath = path.join(__dirname, `../exports/${filename}.xlsx`);
  await workbook.xlsx.writeFile(filePath);
  return filePath;
}

async function exportToPDF(data, filename) {
  const filePath = path.join(__dirname, `../exports/${filename}.pdf`);
  const doc = new PDFDocument();
  const stream = fs.createWriteStream(filePath);

  const flatData = flattenData(data);

  return new Promise((resolve, reject) => {
    doc.pipe(stream);

    flatData.forEach((item, index) => {
      doc.text(`Registro ${index + 1}`);
      Object.entries(item).forEach(([key, value]) => {
        doc.text(`${key}: ${value}`);
      });
      doc.moveDown();
    });

    doc.end();

    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
}

async function exportToHTML(data, filename) {
  const flatData = flattenData(data);

  const html = await ejs.renderFile(
    path.join(__dirname, '../templates/export.ejs'),
    { data: flatData }
  );

  const filePath = path.join(__dirname, `../exports/${filename}.html`);
  fs.writeFileSync(filePath, html);
  return filePath;
}

module.exports = { exportToExcel, exportToPDF, exportToHTML };
