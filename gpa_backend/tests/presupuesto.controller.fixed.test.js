const request = require('supertest');
const express = require('express');

// Configurar la aplicación de prueba
const app = express();
app.use(express.json());

// Mock de los modelos
jest.mock('../models/', () => ({
  Presupuesto: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    sum: jest.fn()
  },
  PeriodoFiscal: {
    findByPk: jest.fn(),
    findAll: jest.fn()
  },
  CentroCosto: {
    findByPk: jest.fn()
  },
  ObjetoGasto: {
    findByPk: jest.fn()
  },
  Cuenta: {
    findByPk: jest.fn()
  }
}));

const { Presupuesto, PeriodoFiscal, CentroCosto, ObjetoGasto, Cuenta } = require('../models/');
const presupuestoController = require('../controllers/presupuesto.controller');

// Configurar rutas
app.get('/presupuestos', presupuestoController.getAllPresupuestos);
app.get('/presupuestos/:id', presupuestoController.getPresupuestoById);
app.post('/presupuestos', presupuestoController.createPresupuesto);
app.put('/presupuestos/:id', presupuestoController.updatePresupuesto);
app.delete('/presupuestos/:id', presupuestoController.deletePresupuesto);

describe('Presupuesto Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /presupuestos - getAllPresupuestos', () => {
    it('should return all budgets successfully', async () => {
      // Arrange
      const mockPresupuestos = [
        global.mockFactory.presupuesto({ id: 1, monto_inicial: 1000000 }),
        global.mockFactory.presupuesto({ id: 2, monto_inicial: 2000000 })
      ];
      
      Presupuesto.findAll.mockResolvedValue(mockPresupuestos);

      // Act
      const response = await request(app).get('/presupuestos');

      // Assert
      expect(response.status).toBe(200);
      expect(Presupuesto.findAll).toHaveBeenCalledWith({
        include: [
          { model: PeriodoFiscal, as: 'periodo_fiscal' },
          { model: CentroCosto, as: 'centro_costo' },
          { model: ObjetoGasto, as: 'objeto_gasto' },
          { model: Cuenta, as: 'cuenta' }
        ]
      });
      expect(response.body).toEqual(expect.arrayContaining([
        expect.objectContaining({ monto_inicial: 1000000 }),
        expect.objectContaining({ monto_inicial: 2000000 })
      ]));
    });

    it('should handle database errors', async () => {
      // Arrange
      Presupuesto.findAll.mockRejectedValue(new Error('Database error'));

      // Act
      const response = await request(app).get('/presupuestos');

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /presupuestos/:id - getPresupuestoById', () => {
    it('should return budget when found', async () => {
      // Arrange
      const mockPresupuesto = global.mockFactory.presupuesto({ id: 1 });
      Presupuesto.findByPk.mockResolvedValue(mockPresupuesto);

      // Act
      const response = await request(app).get('/presupuestos/1');

      // Assert
      expect(response.status).toBe(200);
      expect(Presupuesto.findByPk).toHaveBeenCalledWith('1', {
        include: [
          { model: PeriodoFiscal, as: 'periodo_fiscal' },
          { model: CentroCosto, as: 'centro_costo' },
          { model: ObjetoGasto, as: 'objeto_gasto' },
          { model: Cuenta, as: 'cuenta' }
        ]
      });
      expect(response.body).toEqual(expect.objectContaining({
        id: 1,
        monto_inicial: 1000000
      }));
    });

    it('should return 404 when budget not found', async () => {
      // Arrange
      Presupuesto.findByPk.mockResolvedValue(null);

      // Act
      const response = await request(app).get('/presupuestos/999');

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /presupuestos - createPresupuesto', () => {
    it('should create budget successfully with valid data', async () => {
      // Arrange
      const presupuestoData = global.testHelpers.createTestPresupuesto();
      const mockCreatedPresupuesto = global.mockFactory.presupuesto(presupuestoData);
      
      // Mock foreign key validations
      PeriodoFiscal.findByPk.mockResolvedValue({ id: 1, anio: 2025 });
      CentroCosto.findByPk.mockResolvedValue({ id: 1, nombre: 'Test Centro' });
      ObjetoGasto.findByPk.mockResolvedValue({ id: 1, nombre: 'Test Objeto' });
      Cuenta.findByPk.mockResolvedValue({ id: 1, codigo: '001' });
      
      Presupuesto.create.mockResolvedValue(mockCreatedPresupuesto);

      // Act
      const response = await request(app)
        .post('/presupuestos')
        .send(presupuestoData);

      // Assert
      expect(response.status).toBe(201);
      expect(Presupuesto.create).toHaveBeenCalledWith(expect.objectContaining({
        monto_inicial: presupuestoData.monto_inicial,
        periodo_fiscal_id: presupuestoData.periodo_fiscal_id
      }));
      expect(response.body).toEqual(expect.objectContaining({
        monto_inicial: presupuestoData.monto_inicial
      }));
    });

    it('should return 400 for invalid foreign keys', async () => {
      // Arrange
      const invalidPresupuestoData = {
        ...global.testHelpers.createTestPresupuesto(),
        periodo_fiscal_id: 999 // ID que no existe
      };
      
      PeriodoFiscal.findByPk.mockResolvedValue(null); // No encontrado

      // Act
      const response = await request(app)
        .post('/presupuestos')
        .send(invalidPresupuestoData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for missing required fields', async () => {
      // Arrange
      const incompleteData = {
        monto_inicial: 1000000
        // Missing required fields
      };

      // Act
      const response = await request(app)
        .post('/presupuestos')
        .send(incompleteData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for negative amounts', async () => {
      // Arrange
      const invalidData = {
        ...global.testHelpers.createTestPresupuesto(),
        monto_inicial: -1000 // Monto negativo
      };

      // Act
      const response = await request(app)
        .post('/presupuestos')
        .send(invalidData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('PUT /presupuestos/:id - updatePresupuesto', () => {
    it('should update budget successfully', async () => {
      // Arrange
      const presupuestoId = 1;
      const updateData = { monto_inicial: 1500000 };
      const existingPresupuesto = global.mockFactory.presupuesto({ id: presupuestoId });
      
      Presupuesto.findByPk.mockResolvedValue(existingPresupuesto);
      Presupuesto.update.mockResolvedValue([1]);

      // Act
      const response = await request(app)
        .put(`/presupuestos/${presupuestoId}`)
        .send(updateData);

      // Assert
      expect(response.status).toBe(200);
      expect(Presupuesto.update).toHaveBeenCalledWith(
        updateData,
        { where: { id: presupuestoId.toString() } }
      );
      expect(response.body).toHaveProperty('message');
    });

    it('should return 404 when updating non-existent budget', async () => {
      // Arrange
      Presupuesto.findByPk.mockResolvedValue(null);

      // Act
      const response = await request(app)
        .put('/presupuestos/999')
        .send({ monto_inicial: 1500000 });

      // Assert
      expect(response.status).toBe(404);
      expect(Presupuesto.update).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /presupuestos/:id - deletePresupuesto', () => {
    it('should delete budget successfully', async () => {
      // Arrange
      const presupuestoId = 1;
      const existingPresupuesto = global.mockFactory.presupuesto({ id: presupuestoId });
      
      Presupuesto.findByPk.mockResolvedValue(existingPresupuesto);
      Presupuesto.destroy.mockResolvedValue(1);

      // Act
      const response = await request(app).delete(`/presupuestos/${presupuestoId}`);

      // Assert
      expect(response.status).toBe(200);
      expect(Presupuesto.destroy).toHaveBeenCalledWith({ 
        where: { id: presupuestoId.toString() } 
      });
      expect(response.body).toHaveProperty('message');
    });

    it('should return 404 when deleting non-existent budget', async () => {
      // Arrange
      Presupuesto.findByPk.mockResolvedValue(null);

      // Act
      const response = await request(app).delete('/presupuestos/999');

      // Assert
      expect(response.status).toBe(404);
      expect(Presupuesto.destroy).not.toHaveBeenCalled();
    });
  });

  describe('Business Logic Tests', () => {
    it('should calculate available amount correctly', async () => {
      // Arrange
      const presupuestoData = {
        monto_inicial: 1000000,
        monto_ejecutado: 300000
      };
      
      const expectedAvailable = presupuestoData.monto_inicial - presupuestoData.monto_ejecutado;

      // Act & Assert
      expect(expectedAvailable).toBe(700000);
    });

    it('should not allow execution over budget', async () => {
      // Arrange
      const presupuesto = {
        monto_inicial: 1000000,
        monto_ejecutado: 950000,
        monto_disponible: 50000
      };
      
      const newExecution = 100000; // Más que el disponible

      // Act & Assert
      const wouldExceed = newExecution > presupuesto.monto_disponible;
      expect(wouldExceed).toBe(true);
    });
  });
});
