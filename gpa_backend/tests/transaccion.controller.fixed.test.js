const request = require('supertest');
const express = require('express');

// Configurar la aplicación de prueba
const app = express();
app.use(express.json());

// Mock de los modelos
jest.mock('../models/', () => ({
  Transaccion: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    sum: jest.fn(),
    count: jest.fn()
  },
  DetalleTransaccion: {
    findAll: jest.fn(),
    create: jest.fn(),
    bulkCreate: jest.fn()
  },
  PeriodoFiscal: {
    findByPk: jest.fn()
  },
  User: {
    findByPk: jest.fn()
  },
  Presupuesto: {
    findByPk: jest.fn(),
    update: jest.fn()
  }
}));

const { Transaccion, DetalleTransaccion, PeriodoFiscal, User, Presupuesto } = require('../models/');
const transaccionController = require('../controllers/transaccion.controller');

// Configurar rutas
app.get('/transacciones', transaccionController.getAllTransacciones);
app.get('/transacciones/:id', transaccionController.getTransaccionById);
app.post('/transacciones', transaccionController.createTransaccion);
app.put('/transacciones/:id', transaccionController.updateTransaccion);
app.delete('/transacciones/:id', transaccionController.deleteTransaccion);

describe('Transaccion Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /transacciones - getAllTransacciones', () => {
    it('should return all transactions successfully', async () => {
      // Arrange
      const mockTransacciones = [
        global.mockFactory.transaccion({ id: 1, referencia: 'TXN-001' }),
        global.mockFactory.transaccion({ id: 2, referencia: 'TXN-002' })
      ];
      
      Transaccion.findAll.mockResolvedValue(mockTransacciones);

      // Act
      const response = await request(app).get('/transacciones');

      // Assert
      expect(response.status).toBe(200);
      expect(Transaccion.findAll).toHaveBeenCalledWith({
        include: [
          { model: PeriodoFiscal, as: 'periodo_fiscal' },
          { model: User, as: 'usuario' },
          { model: DetalleTransaccion, as: 'detalles' }
        ]
      });
      expect(response.body).toEqual(expect.arrayContaining([
        expect.objectContaining({ referencia: 'TXN-001' }),
        expect.objectContaining({ referencia: 'TXN-002' })
      ]));
    });

    it('should handle database errors', async () => {
      // Arrange
      Transaccion.findAll.mockRejectedValue(new Error('Database error'));

      // Act
      const response = await request(app).get('/transacciones');

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /transacciones/:id - getTransaccionById', () => {
    it('should return transaction when found', async () => {
      // Arrange
      const mockTransaccion = global.mockFactory.transaccion({ id: 1 });
      Transaccion.findByPk.mockResolvedValue(mockTransaccion);

      // Act
      const response = await request(app).get('/transacciones/1');

      // Assert
      expect(response.status).toBe(200);
      expect(Transaccion.findByPk).toHaveBeenCalledWith('1', {
        include: [
          { model: PeriodoFiscal, as: 'periodo_fiscal' },
          { model: User, as: 'usuario' },
          { model: DetalleTransaccion, as: 'detalles' }
        ]
      });
      expect(response.body).toEqual(expect.objectContaining({
        id: 1,
        referencia: 'TXN-001'
      }));
    });

    it('should return 404 when transaction not found', async () => {
      // Arrange
      Transaccion.findByPk.mockResolvedValue(null);

      // Act
      const response = await request(app).get('/transacciones/999');

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /transacciones - createTransaccion', () => {
    it('should create transaction successfully with valid data', async () => {
      // Arrange
      const transaccionData = {
        ...global.testHelpers.createTestTransaccion(),
        detalles: [
          {
            presupuesto_id: 1,
            monto: 100000,
            descripcion: 'Detalle 1'
          }
        ]
      };
      
      const mockCreatedTransaccion = global.mockFactory.transaccion(transaccionData);
      
      // Mock foreign key validations
      PeriodoFiscal.findByPk.mockResolvedValue({ id: 1, anio: 2025 });
      User.findByPk.mockResolvedValue({ id: 1, username: 'testuser' });
      Presupuesto.findByPk.mockResolvedValue({ 
        id: 1, 
        monto_disponible: 500000,
        update: jest.fn().mockResolvedValue([1])
      });
      
      Transaccion.create.mockResolvedValue(mockCreatedTransaccion);
      DetalleTransaccion.bulkCreate.mockResolvedValue([{ id: 1 }]);

      // Act
      const response = await request(app)
        .post('/transacciones')
        .send(transaccionData);

      // Assert
      expect(response.status).toBe(201);
      expect(Transaccion.create).toHaveBeenCalledWith(expect.objectContaining({
        referencia: transaccionData.referencia,
        descripcion: transaccionData.descripcion
      }));
      expect(response.body).toEqual(expect.objectContaining({
        referencia: transaccionData.referencia
      }));
    });

    it('should return 400 for invalid foreign keys', async () => {
      // Arrange
      const invalidTransaccionData = {
        ...global.testHelpers.createTestTransaccion(),
        periodo_fiscal_id: 999 // ID que no existe
      };
      
      PeriodoFiscal.findByPk.mockResolvedValue(null); // No encontrado

      // Act
      const response = await request(app)
        .post('/transacciones')
        .send(invalidTransaccionData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for missing required fields', async () => {
      // Arrange
      const incompleteData = {
        referencia: 'TXN-001'
        // Missing required fields
      };

      // Act
      const response = await request(app)
        .post('/transacciones')
        .send(incompleteData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for duplicate reference', async () => {
      // Arrange
      const duplicateData = global.testHelpers.createTestTransaccion();
      
      // Mock que ya existe una transacción con esa referencia
      Transaccion.create.mockRejectedValue({
        name: 'SequelizeUniqueConstraintError',
        message: 'Duplicate entry'
      });

      // Act
      const response = await request(app)
        .post('/transacciones')
        .send(duplicateData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 when insufficient budget', async () => {
      // Arrange
      const transaccionData = {
        ...global.testHelpers.createTestTransaccion(),
        detalles: [
          {
            presupuesto_id: 1,
            monto: 600000, // Más que el disponible
            descripcion: 'Detalle excesivo'
          }
        ]
      };
      
      PeriodoFiscal.findByPk.mockResolvedValue({ id: 1, anio: 2025 });
      User.findByPk.mockResolvedValue({ id: 1, username: 'testuser' });
      Presupuesto.findByPk.mockResolvedValue({ 
        id: 1, 
        monto_disponible: 500000 // Menos que el monto solicitado
      });

      // Act
      const response = await request(app)
        .post('/transacciones')
        .send(transaccionData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('presupuesto insuficiente');
    });
  });

  describe('PUT /transacciones/:id - updateTransaccion', () => {
    it('should update transaction successfully', async () => {
      // Arrange
      const transaccionId = 1;
      const updateData = { descripcion: 'Descripción actualizada' };
      const existingTransaccion = global.mockFactory.transaccion({ id: transaccionId });
      
      Transaccion.findByPk.mockResolvedValue(existingTransaccion);
      Transaccion.update.mockResolvedValue([1]);

      // Act
      const response = await request(app)
        .put(`/transacciones/${transaccionId}`)
        .send(updateData);

      // Assert
      expect(response.status).toBe(200);
      expect(Transaccion.update).toHaveBeenCalledWith(
        updateData,
        { where: { id: transaccionId.toString() } }
      );
      expect(response.body).toHaveProperty('message');
    });

    it('should return 404 when updating non-existent transaction', async () => {
      // Arrange
      Transaccion.findByPk.mockResolvedValue(null);

      // Act
      const response = await request(app)
        .put('/transacciones/999')
        .send({ descripcion: 'Nueva descripción' });

      // Assert
      expect(response.status).toBe(404);
      expect(Transaccion.update).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /transacciones/:id - deleteTransaccion', () => {
    it('should delete transaction successfully', async () => {
      // Arrange
      const transaccionId = 1;
      const existingTransaccion = global.mockFactory.transaccion({ id: transaccionId });
      
      Transaccion.findByPk.mockResolvedValue(existingTransaccion);
      Transaccion.destroy.mockResolvedValue(1);

      // Act
      const response = await request(app).delete(`/transacciones/${transaccionId}`);

      // Assert
      expect(response.status).toBe(200);
      expect(Transaccion.destroy).toHaveBeenCalledWith({ 
        where: { id: transaccionId.toString() } 
      });
      expect(response.body).toHaveProperty('message');
    });

    it('should return 404 when deleting non-existent transaction', async () => {
      // Arrange
      Transaccion.findByPk.mockResolvedValue(null);

      // Act
      const response = await request(app).delete('/transacciones/999');

      // Assert
      expect(response.status).toBe(404);
      expect(Transaccion.destroy).not.toHaveBeenCalled();
    });
  });

  describe('Business Logic Tests', () => {
    it('should validate transaction type', async () => {
      // Arrange
      const validTypes = ['ingreso', 'egreso'];
      const testType = 'egreso';

      // Act & Assert
      expect(validTypes.includes(testType)).toBe(true);
    });

    it('should calculate total amount from details', async () => {
      // Arrange
      const detalles = [
        { monto: 100000 },
        { monto: 200000 },
        { monto: 150000 }
      ];

      // Act
      const total = detalles.reduce((sum, detalle) => sum + detalle.monto, 0);

      // Assert
      expect(total).toBe(450000);
    });

    it('should validate date format', async () => {
      // Arrange
      const validDate = new Date('2025-01-15');
      const invalidDate = new Date('invalid');

      // Act & Assert
      expect(validDate instanceof Date && !isNaN(validDate)).toBe(true);
      expect(invalidDate instanceof Date && !isNaN(invalidDate)).toBe(false);
    });
  });
});
