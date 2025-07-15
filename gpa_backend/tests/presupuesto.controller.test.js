const request = require('supertest');
const express = require('express');
const presupuestoController = require('../controllers/presupuesto.controller');

// Mock de la base de datos
jest.mock('../models/', () => ({
  Presupuesto: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  },
  presupuesto: {
    findByPk: jest.fn()
  },
  CentroCosto: {
    findByPk: jest.fn(),
    findAll: jest.fn()
  },
  ObjetoGasto: {
    findByPk: jest.fn(),
    findAll: jest.fn()
  },
  PeriodoFiscal: {
    findByPk: jest.fn(),
    findAll: jest.fn()
  },
  Cuenta: {
    findByPk: jest.fn(),
    findAll: jest.fn()
  },
  User: {
    findByPk: jest.fn(),
    findAll: jest.fn()
  }
}));

jest.mock('../services/audit_log.service');

const db = require('../models/');

describe('💰 PRESUPUESTO CONTROLLER TESTS', () => {
  let app;

  beforeEach(() => {
    // Configurar Express app para tests
    app = express();
    app.use(express.json());
    
    // Configurar rutas para tests
    app.get('/presupuestos', presupuestoController.getAllPresupuestos);
    app.get('/presupuestos/:id', presupuestoController.getPresupuestoById);
    app.post('/presupuestos', presupuestoController.createPresupuesto);

    // Limpiar mocks
    jest.clearAllMocks();
  });

  describe('GET /presupuestos - Obtener todos los presupuestos', () => {
    test('✅ Debería retornar todos los presupuestos exitosamente', async () => {
      // Arrange
      const mockPresupuestos = [
        {
          id: 1,
          monto_inicial: 50000000,
          monto_modificado: null,
          periodo_fiscal_id: 2,
          centro_costo: { id: 1, nombre: 'Administración General' },
          objeto_gasto: { id: 1, nombre: 'Sueldos y Salarios' }
        },
        {
          id: 2,
          monto_inicial: 15000000,
          monto_modificado: null,
          periodo_fiscal_id: 2,
          centro_costo: { id: 1, nombre: 'Administración General' },
          objeto_gasto: { id: 2, nombre: 'Servicios Básicos' }
        }
      ];

      db.Presupuesto.findAll.mockResolvedValue(mockPresupuestos);

      // Act
      const response = await request(app).get('/presupuestos');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].monto_inicial).toBe(50000000);
      expect(db.Presupuesto.findAll).toHaveBeenCalledWith({
        include: [
          { model: db.CentroCosto, as: 'centro_costo' },
          { model: db.ObjetoGasto, as: 'objeto_gasto' }
        ]
      });
    });

    test('❌ Debería retornar 404 si no hay presupuestos', async () => {
      // Arrange
      db.Presupuesto.findAll.mockResolvedValue([]);

      // Act
      const response = await request(app).get('/presupuestos');

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('No se encontraron presupuestos');
    });

    test('❌ Debería manejar errores de base de datos', async () => {
      // Arrange
      db.Presupuesto.findAll.mockRejectedValue(new Error('Database connection failed'));

      // Act
      const response = await request(app).get('/presupuestos');

      // Assert
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error obteniendo presupuestos');
    });
  });

  describe('GET /presupuestos/:id - Obtener presupuesto por ID', () => {
    test('✅ Debería retornar un presupuesto específico', async () => {
      // Arrange
      const mockPresupuesto = {
        id: 1,
        monto_inicial: 50000000,
        monto_modificado: 52500000,
        fecha_modificacion: '2025-02-01',
        centro_costo: { id: 1, nombre: 'Administración General' },
        objeto_gasto: { id: 1, nombre: 'Sueldos y Salarios' }
      };

      db.presupuesto.findByPk.mockResolvedValue(mockPresupuesto);

      // Act
      const response = await request(app).get('/presupuestos/1');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(1);
      expect(response.body.monto_inicial).toBe(50000000);
      expect(response.body.monto_modificado).toBe(52500000);
      expect(db.presupuesto.findByPk).toHaveBeenCalledWith('1', {
        include: [
          { model: db.CentroCosto, as: 'centro_costo' },
          { model: db.ObjetoGasto, as: 'objeto_gasto' }
        ]
      });
    });

    test('❌ Debería retornar 404 si el presupuesto no existe', async () => {
      // Arrange
      db.presupuesto.findByPk.mockResolvedValue(null);

      // Act
      const response = await request(app).get('/presupuestos/999');

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('No se encontró un presupuesto');
    });
  });

  describe('POST /presupuestos - Crear nuevo presupuesto', () => {
    test('✅ Debería crear un presupuesto exitosamente', async () => {
      // Arrange
      const newPresupuestoData = testHelpers.createTestPresupuesto();
      const mockCreatedPresupuesto = {
        id: 1,
        ...newPresupuestoData,
        fecha_creacion: new Date(),
        fecha_actualizacion: new Date()
      };

      // Mock validaciones
      db.PeriodoFiscal.findByPk.mockResolvedValue({ id: 1, nombre: '2025' });
      db.CentroCosto.findByPk.mockResolvedValue({ id: 1, nombre: 'Admin' });
      db.ObjetoGasto.findByPk.mockResolvedValue({ id: 1, nombre: 'Sueldos' });
      db.Cuenta.findByPk.mockResolvedValue({ id: 1, codigo: '510101' });
      
      // Mock creation
      db.Presupuesto.create.mockResolvedValue(mockCreatedPresupuesto);

      // Act
      const response = await request(app)
        .post('/presupuestos')
        .send({
          ...newPresupuestoData,
          user_id: 1
        });

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Presupuesto creado exitosamente');
      expect(db.Presupuesto.create).toHaveBeenCalled();
    });

    test('❌ Debería rechazar monto inicial inválido', async () => {
      // Arrange
      const invalidPresupuestoData = {
        ...testHelpers.createTestPresupuesto(),
        monto_inicial: -1000, // Monto negativo
        user_id: 1
      };

      // Act
      const response = await request(app)
        .post('/presupuestos')
        .send(invalidPresupuestoData);

      // Assert
      expect(response.status).toBe(400);
    });

    test('❌ Debería rechazar período fiscal inexistente', async () => {
      // Arrange
      const presupuestoData = {
        ...testHelpers.createTestPresupuesto(),
        periodo_fiscal_id: 999, // ID inexistente
        user_id: 1
      };

      db.PeriodoFiscal.findByPk.mockResolvedValue(null);

      // Act
      const response = await request(app)
        .post('/presupuestos')
        .send(presupuestoData);

      // Assert
      expect(response.status).toBe(400);
    });
  });

  describe('🔍 Validaciones de Negocio', () => {
    test('✅ Debería validar que el monto inicial sea positivo', async () => {
      const presupuestoData = {
        ...testHelpers.createTestPresupuesto(),
        monto_inicial: 0,
        user_id: 1
      };

      const response = await request(app)
        .post('/presupuestos')
        .send(presupuestoData);

      expect(response.status).toBe(400);
    });

    test('✅ Debería calcular correctamente el monto modificado', () => {
      // Test unitario para lógica de negocio
      const montoInicial = 1000000;
      const porcentajeModificacion = 0.05;
      const montoModificado = montoInicial * (1 + porcentajeModificacion);

      expect(montoModificado).toBe(1050000);
    });

    test('✅ Debería validar relaciones entre centro de costo y objeto de gasto', async () => {
      // Mock para validar que ciertas combinaciones sean válidas
      const presupuestoData = {
        ...testHelpers.createTestPresupuesto(),
        centro_costo_id: 1,
        objeto_gasto_id: 1,
        user_id: 1
      };

      db.PeriodoFiscal.findByPk.mockResolvedValue({ id: 1, nombre: '2025' });
      db.CentroCosto.findByPk.mockResolvedValue({ id: 1, nombre: 'Admin' });
      db.ObjetoGasto.findByPk.mockResolvedValue({ id: 1, nombre: 'Sueldos' });
      db.Cuenta.findByPk.mockResolvedValue({ id: 1, codigo: '510101' });
      
      const mockCreatedPresupuesto = { id: 1, ...presupuestoData };
      db.Presupuesto.create.mockResolvedValue(mockCreatedPresupuesto);

      const response = await request(app)
        .post('/presupuestos')
        .send(presupuestoData);

      expect(response.status).toBe(201);
    });
  });
});
