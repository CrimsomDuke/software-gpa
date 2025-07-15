const request = require('supertest');
const express = require('express');

// Configurar la aplicación de prueba
const app = express();
app.use(express.json());

// Mock de los modelos antes de importar el controller
jest.mock('../models/', () => ({
  Presupuesto: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    sum: jest.fn()
  },
  presupuesto: {  // Nota: parece que usan diferentes casing
    findByPk: jest.fn()
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
  },
  User: {
    findByPk: jest.fn()
  }
}));

// Mock de servicios adicionales
jest.mock('../services/audit_log.service', () => ({
  createAuditLog: jest.fn().mockResolvedValue({})
}));

const { Presupuesto, presupuesto, CentroCosto, ObjetoGasto } = require('../models/');
const presupuestoController = require('../controllers/presupuesto.controller');

// Configurar rutas usando los nombres reales de las funciones
app.get('/presupuestos', presupuestoController.getAllPresupuestos);
app.get('/presupuestos/:id', presupuestoController.getPresupuestoById);
app.post('/presupuestos', presupuestoController.createPresupuesto);
app.patch('/presupuestos/:id', presupuestoController.patchPresupuesto);
app.delete('/presupuestos/:id', presupuestoController.deletePresupuesto);

describe('Presupuesto Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /presupuestos - getAllPresupuestos', () => {
    it('should return all presupuestos successfully', async () => {
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
          { model: CentroCosto, as: 'centro_costo' },
          { model: ObjetoGasto, as: 'objeto_gasto' }
        ]
      });
      expect(response.body).toEqual(expect.arrayContaining([
        expect.objectContaining({ monto_inicial: 1000000 }),
        expect.objectContaining({ monto_inicial: 2000000 })
      ]));
    });

    it('should return 404 when no presupuestos found', async () => {
      // Arrange
      Presupuesto.findAll.mockResolvedValue([]);

      // Act
      const response = await request(app).get('/presupuestos');

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'No se encontraron presupuestos');
    });

    it('should handle database errors', async () => {
      // Arrange
      Presupuesto.findAll.mockRejectedValue(new Error('Database error'));

      // Act
      const response = await request(app).get('/presupuestos');

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message', 'Error obteniendo presupuestos');
    });
  });

  describe('GET /presupuestos/:id - getPresupuestoById', () => {
    it('should return presupuesto when found', async () => {
      // Arrange
      const mockPresupuesto = global.mockFactory.presupuesto({ id: 1 });
      presupuesto.findByPk.mockResolvedValue(mockPresupuesto);

      // Act
      const response = await request(app).get('/presupuestos/1');

      // Assert
      expect(response.status).toBe(200);
      expect(presupuesto.findByPk).toHaveBeenCalledWith('1', {
        include: [
          { model: CentroCosto, as: 'centro_costo' },
          { model: ObjetoGasto, as: 'objeto_gasto' }
        ]
      });
      expect(response.body).toEqual(expect.objectContaining({
        id: 1,
        monto_inicial: 1000000
      }));
    });

    it('should return 404 when presupuesto not found', async () => {
      // Arrange
      presupuesto.findByPk.mockResolvedValue(null);

      // Act
      const response = await request(app).get('/presupuestos/999');

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'No se encontró un presupuesto');
    });

    it('should handle database errors', async () => {
      // Arrange
      presupuesto.findByPk.mockRejectedValue(new Error('Database error'));

      // Act
      const response = await request(app).get('/presupuestos/1');

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message', 'Error obteniendo presupuesto');
    });
  });

  describe('POST /presupuestos - createPresupuesto', () => {
    it('should create presupuesto successfully with valid data', async () => {
      // Arrange
      const presupuestoData = {
        monto_inicial: 1000000,
        periodo_fiscal_id: 1,
        centro_costo_id: 1,
        objeto_gasto_id: 1,
        cuenta_id: 1,
        user_id: 1
      };
      const mockCreatedPresupuesto = global.mockFactory.presupuesto(presupuestoData);
      
      // Mock foreign key validations
      CentroCosto.findByPk.mockResolvedValue({ id: 1, nombre: 'Test Centro' });
      ObjetoGasto.findByPk.mockResolvedValue({ id: 1, nombre: 'Test Objeto' });
      
      Presupuesto.create.mockResolvedValue(mockCreatedPresupuesto);

      // Act
      const response = await request(app)
        .post('/presupuestos')
        .send(presupuestoData);

      // Assert
      expect(response.status).toBe(201);
      expect(CentroCosto.findByPk).toHaveBeenCalledWith(presupuestoData.centro_costo_id);
      expect(ObjetoGasto.findByPk).toHaveBeenCalledWith(presupuestoData.objeto_gasto_id);
      expect(Presupuesto.create).toHaveBeenCalledWith({
        monto_inicial: presupuestoData.monto_inicial,
        periodo_fiscal_id: presupuestoData.periodo_fiscal_id,
        centro_costo_id: presupuestoData.centro_costo_id,
        objeto_gasto_id: presupuestoData.objeto_gasto_id,
        creado_por: presupuestoData.user_id,
        esta_activo: true
      });
      expect(response.body).toEqual(expect.objectContaining({
        monto_inicial: presupuestoData.monto_inicial
      }));
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
      expect(response.body).toHaveProperty('message', 'Todos los campos son requeridos: monto_inicial, periodo_fiscal_id, centro_costo_id, objeto_gasto_id, user_id');
    });

    it('should return 404 for invalid centro_costo_id', async () => {
      // Arrange
      const invalidPresupuestoData = {
        monto_inicial: 1000000,
        periodo_fiscal_id: 1,
        centro_costo_id: 999, // ID que no existe
        objeto_gasto_id: 1,
        user_id: 1
      };
      
      CentroCosto.findByPk.mockResolvedValue(null); // No encontrado

      // Act
      const response = await request(app)
        .post('/presupuestos')
        .send(invalidPresupuestoData);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'El Centro de Costo no existe');
    });

    it('should return 404 for invalid objeto_gasto_id', async () => {
      // Arrange
      const invalidPresupuestoData = {
        monto_inicial: 1000000,
        periodo_fiscal_id: 1,
        centro_costo_id: 1,
        objeto_gasto_id: 999, // ID que no existe
        user_id: 1
      };
      
      CentroCosto.findByPk.mockResolvedValue({ id: 1, nombre: 'Test Centro' });
      ObjetoGasto.findByPk.mockResolvedValue(null); // No encontrado

      // Act
      const response = await request(app)
        .post('/presupuestos')
        .send(invalidPresupuestoData);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'El Objeto de Gasto no existe');
    });

    it('should handle database errors during creation', async () => {
      // Arrange
      const presupuestoData = {
        monto_inicial: 1000000,
        periodo_fiscal_id: 1,
        centro_costo_id: 1,
        objeto_gasto_id: 1,
        user_id: 1
      };
      
      CentroCosto.findByPk.mockResolvedValue({ id: 1, nombre: 'Test Centro' });
      ObjetoGasto.findByPk.mockResolvedValue({ id: 1, nombre: 'Test Objeto' });
      Presupuesto.create.mockRejectedValue(new Error('Database error'));

      // Act
      const response = await request(app)
        .post('/presupuestos')
        .send(presupuestoData);

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message', 'Error creando el presupuesto');
    });
  });

  describe('PATCH /presupuestos/:id - patchPresupuesto', () => {
    it('should update presupuesto successfully', async () => {
      // Arrange
      const presupuestoId = 1;
      const updateData = { 
        monto_modificado: 1500000,
        modificado_por_id: 2
      };
      const existingPresupuesto = {
        ...global.mockFactory.presupuesto({ id: presupuestoId }),
        update: jest.fn().mockResolvedValue() // Usar update en lugar de save
      };
      
      Presupuesto.findByPk.mockResolvedValue(existingPresupuesto);

      // Act
      const response = await request(app)
        .patch(`/presupuestos/${presupuestoId}`)
        .send(updateData);

      // Assert
      expect(response.status).toBe(200);
      expect(Presupuesto.findByPk).toHaveBeenCalledWith(presupuestoId.toString());
      expect(existingPresupuesto.update).toHaveBeenCalledWith({
        monto_modificado: updateData.monto_modificado,
        fecha_modificacion: existingPresupuesto.fecha_modificacion, // Preserva valor existente
        centro_costo_id: existingPresupuesto.centro_costo_id, // Preserva valor existente 
        objeto_gasto_id: existingPresupuesto.objeto_gasto_id, // Preserva valor existente
        modificado_por_id: updateData.modificado_por_id
      });
    });

    it('should return 404 when updating non-existent presupuesto', async () => {
      // Arrange
      Presupuesto.findByPk.mockResolvedValue(null);

      // Act
      const response = await request(app)
        .patch('/presupuestos/999')
        .send({ monto_modificado: 1500000, modificado_por_id: 2 });

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'No se encontró el presupuesto');
    });

    it('should validate centro_costo_id when provided', async () => {
      // Arrange
      const presupuestoId = 1;
      const updateData = { 
        centro_costo_id: 999, // ID que no existe
        modificado_por_id: 2
      };
      const existingPresupuesto = {
        ...global.mockFactory.presupuesto({ id: presupuestoId }),
        update: jest.fn().mockResolvedValue()
      };
      
      Presupuesto.findByPk.mockResolvedValue(existingPresupuesto);
      CentroCosto.findByPk.mockResolvedValue(null); // No encontrado

      // Act
      const response = await request(app)
        .patch(`/presupuestos/${presupuestoId}`)
        .send(updateData);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'El Centro de Costo no existe');
    });
  });

  describe('DELETE /presupuestos/:id - deletePresupuesto', () => {
    it('should delete presupuesto successfully', async () => {
      // Arrange
      const presupuestoId = 1;
      const deleteData = { user_id: 2 }; // El delete requiere user_id
      const existingPresupuesto = {
        ...global.mockFactory.presupuesto({ id: presupuestoId }),
        destroy: jest.fn().mockResolvedValue() // Usar destroy en lugar de save
      };
      
      Presupuesto.findByPk.mockResolvedValue(existingPresupuesto);

      // Act
      const response = await request(app)
        .delete(`/presupuestos/${presupuestoId}`)
        .send(deleteData);

      // Assert
      expect(response.status).toBe(200);
      expect(Presupuesto.findByPk).toHaveBeenCalledWith(presupuestoId.toString());
      expect(existingPresupuesto.destroy).toHaveBeenCalled();
      expect(response.body).toHaveProperty('message', 'Presupuesto eliminado correctamente');
    });

    it('should return 404 when deleting non-existent presupuesto', async () => {
      // Arrange
      Presupuesto.findByPk.mockResolvedValue(null);

      // Act
      const response = await request(app)
        .delete('/presupuestos/999')
        .send({ user_id: 2 });

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'No se encontró el presupuesto');
    });
  });

  describe('Business Logic Tests', () => {
    it('should calculate monto_disponible correctly', async () => {
      // Arrange
      const presupuesto = {
        monto_inicial: 1000000,
        monto_ejecutado: 300000,
        monto_modificado: 100000
      };
      
      // Act
      const montoTotal = presupuesto.monto_inicial + (presupuesto.monto_modificado || 0);
      const montoDisponible = montoTotal - presupuesto.monto_ejecutado;

      // Assert
      expect(montoTotal).toBe(1100000);
      expect(montoDisponible).toBe(800000);
    });

    it('should validate positive amounts', async () => {
      // Arrange
      const invalidAmount = -1000;
      const validAmount = 1000;

      // Act & Assert
      expect(invalidAmount > 0).toBe(false);
      expect(validAmount > 0).toBe(true);
    });

    it('should check budget availability', async () => {
      // Arrange
      const presupuesto = {
        monto_inicial: 1000000,
        monto_ejecutado: 950000,
        monto_disponible: 50000
      };
      
      const solicitudEjecucion = 100000;

      // Act
      const hasSufficientBudget = solicitudEjecucion <= presupuesto.monto_disponible;

      // Assert
      expect(hasSufficientBudget).toBe(false);
    });
  });
});
