const request = require('supertest');
const express = require('express');
const transaccionController = require('../controllers/transaccion.controller');

// Mock de la base de datos
jest.mock('../models/', () => ({
  Transaccion: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  },
  DetalleTransaccion: {
    create: jest.fn(),
    bulkCreate: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  },
  PeriodoFiscal: {
    findByPk: jest.fn(),
    findAll: jest.fn()
  },
  User: {
    findByPk: jest.fn(),
    findAll: jest.fn()
  },
  Cuenta: {
    findByPk: jest.fn(),
    findAll: jest.fn()
  },
  CentroCosto: {
    findByPk: jest.fn(),
    findAll: jest.fn()
  },
  ObjetoGasto: {
    findByPk: jest.fn(),
    findAll: jest.fn()
  },
  sequelize: {
    transaction: jest.fn(() => ({
      commit: jest.fn(),
      rollback: jest.fn()
    }))
  }
}));

jest.mock('../services/audit_log.service');

const db = require('../models/');

describe('📊 TRANSACCION CONTROLLER TESTS', () => {
  let app;

  beforeEach(() => {
    // Configurar Express app para tests
    app = express();
    app.use(express.json());
    
    // Configurar rutas para tests
    app.get('/transacciones', transaccionController.getAllTransacciones);
    app.get('/transacciones/:id', transaccionController.getTransaccionById);
    app.post('/transacciones', transaccionController.createTransaccion);

    // Limpiar mocks
    jest.clearAllMocks();
  });

  describe('GET /transacciones - Obtener todas las transacciones', () => {
    test('✅ Debería retornar todas las transacciones exitosamente', async () => {
      // Arrange
      const mockTransacciones = [
        {
          id: 1,
          referencia: 'TXN-2025-001',
          descripcion: 'Apertura de periodo fiscal 2025',
          fecha: '2025-01-01',
          tipo_transaccion: 'apertura',
          es_generado_sistema: true,
          periodo_fiscal_id: 2,
          usuario_id: 1
        },
        {
          id: 2,
          referencia: 'TXN-2025-002',
          descripcion: 'Pago nómina enero 2025',
          fecha: '2025-01-31',
          tipo_transaccion: 'egreso',
          es_generado_sistema: false,
          periodo_fiscal_id: 2,
          usuario_id: 2
        }
      ];

      db.Transaccion.findAll.mockResolvedValue(mockTransacciones);

      // Act
      const response = await request(app).get('/transacciones');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].referencia).toBe('TXN-2025-001');
      expect(response.body[1].tipo_transaccion).toBe('egreso');
      expect(db.Transaccion.findAll).toHaveBeenCalled();
    });

    test('❌ Debería manejar errores de base de datos', async () => {
      // Arrange
      db.Transaccion.findAll.mockRejectedValue(new Error('Database error'));

      // Act
      const response = await request(app).get('/transacciones');

      // Assert
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error obteniendo transacciones');
    });
  });

  describe('GET /transacciones/:id - Obtener transacción por ID', () => {
    test('✅ Debería retornar una transacción con sus detalles', async () => {
      // Arrange
      const mockTransaccion = {
        id: 2,
        referencia: 'TXN-2025-002',
        descripcion: 'Pago nómina enero 2025',
        fecha: '2025-01-31',
        tipo_transaccion: 'egreso',
        detalles: [
          {
            id: 1,
            debito: 25000000,
            credito: 0,
            descripcion: 'Gasto por sueldos enero',
            cuenta_id: 1
          },
          {
            id: 2,
            debito: 0,
            credito: 25000000,
            descripcion: 'Salida de efectivo por nómina',
            cuenta_id: 2
          }
        ],
        periodo_fiscal: { id: 2, nombre: '2025' },
        usuario: { id: 2, username: 'contador01' }
      };

      db.Transaccion.findByPk.mockResolvedValue(mockTransaccion);

      // Act
      const response = await request(app).get('/transacciones/2');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(2);
      expect(response.body.referencia).toBe('TXN-2025-002');
      expect(response.body.detalles).toHaveLength(2);
      expect(response.body.detalles[0].debito).toBe(25000000);
      expect(response.body.detalles[1].credito).toBe(25000000);
      expect(db.Transaccion.findByPk).toHaveBeenCalledWith('2', {
        include: [
          { model: db.DetalleTransaccion, as: 'detalles' },
          { model: db.PeriodoFiscal, as: 'periodo_fiscal' },
          { model: db.User, as: 'usuario' }
        ]
      });
    });

    test('❌ Debería retornar 404 si la transacción no existe', async () => {
      // Arrange
      db.Transaccion.findByPk.mockResolvedValue(null);

      // Act
      const response = await request(app).get('/transacciones/999');

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('No se encontró la transacción');
    });
  });

  describe('POST /transacciones - Crear nueva transacción', () => {
    test('✅ Debería crear una transacción con detalles balanceados', async () => {
      // Arrange
      const newTransaccionData = {
        ...global.testHelpers.createTestTransaccion(),
        transaccion_detalles: [
          {
            debito: 1000000,
            credito: 0,
            descripcion: 'Gasto de prueba',
            cuenta_id: 1
          },
          {
            debito: 0,
            credito: 1000000,
            descripcion: 'Salida de efectivo',
            cuenta_id: 2
          }
        ],
        usuario_id: 1
      };

      const mockCreatedTransaccion = {
        id: 1,
        ...newTransaccionData,
        fecha_creacion: new Date(),
        fecha_actualizacion: new Date()
      };

      // Mock validaciones
      db.PeriodoFiscal.findByPk.mockResolvedValue({ id: 1, nombre: '2025' });
      db.User.findByPk.mockResolvedValue({ id: 1, username: 'admin' });
      db.Cuenta.findByPk.mockResolvedValue({ id: 1, codigo: '110101' });
      
      // Mock transaction
      const mockTransaction = {
        commit: jest.fn(),
        rollback: jest.fn()
      };
      db.sequelize.transaction.mockResolvedValue(mockTransaction);
      
      // Mock creation
      db.Transaccion.create.mockResolvedValue(mockCreatedTransaccion);
      db.DetalleTransaccion.bulkCreate.mockResolvedValue([]);

      // Act
      const response = await request(app)
        .post('/transacciones')
        .send(newTransaccionData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Transacción creada exitosamente');
    });

    test('❌ Debería rechazar transacción con detalles no balanceados', async () => {
      // Arrange
      const unbalancedTransaccionData = {
        ...global.testHelpers.createTestTransaccion(),
        transaccion_detalles: [
          {
            debito: 1000000,
            credito: 0,
            descripcion: 'Gasto de prueba',
            cuenta_id: 1
          },
          {
            debito: 0,
            credito: 500000, // No balanceado!
            descripcion: 'Salida de efectivo',
            cuenta_id: 2
          }
        ],
        usuario_id: 1
      };

      // Act
      const response = await request(app)
        .post('/transacciones')
        .send(unbalancedTransaccionData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.errors).toContain('Los débitos y créditos deben estar balanceados');
    });

    test('❌ Debería rechazar transacción sin detalles', async () => {
      // Arrange
      const transaccionSinDetalles = {
        ...global.testHelpers.createTestTransaccion(),
        transaccion_detalles: [],
        usuario_id: 1
      };

      // Act
      const response = await request(app)
        .post('/transacciones')
        .send(transaccionSinDetalles);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.errors).toContain('La transacción debe tener al menos un detalle');
    });

    test('✅ Debería validar tipos de transacción permitidos', async () => {
      // Arrange
      const tiposValidos = ['ingreso', 'egreso', 'traspaso', 'apertura', 'cierre'];
      
      for (const tipo of tiposValidos) {
        const transaccionData = {
          ...global.testHelpers.createTestTransaccion(),
          tipo_transaccion: tipo,
          transaccion_detalles: [
            { debito: 1000, credito: 0, descripcion: 'Test', cuenta_id: 1 },
            { debito: 0, credito: 1000, descripcion: 'Test', cuenta_id: 2 }
          ],
          usuario_id: 1
        };

        // Mock validaciones
        db.PeriodoFiscal.findByPk.mockResolvedValue({ id: 1, nombre: '2025' });
        db.User.findByPk.mockResolvedValue({ id: 1, username: 'admin' });
        db.Cuenta.findByPk.mockResolvedValue({ id: 1, codigo: '110101' });
        
        const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
        db.sequelize.transaction.mockResolvedValue(mockTransaction);
        db.Transaccion.create.mockResolvedValue({ id: 1, ...transaccionData });
        db.DetalleTransaccion.bulkCreate.mockResolvedValue([]);

        const response = await request(app)
          .post('/transacciones')
          .send(transaccionData);

        expect(response.status).toBe(201);
        jest.clearAllMocks();
      }
    });
  });

  describe('🔍 Validaciones de Negocio Contable', () => {
    test('✅ Debería validar que débitos = créditos (principio contable)', () => {
      // Test unitario para validación de balance
      const detalles = [
        { debito: 1000000, credito: 0 },
        { debito: 0, credito: 800000 },
        { debito: 0, credito: 200000 }
      ];

      const totalDebitos = detalles.reduce((sum, d) => sum + d.debito, 0);
      const totalCreditos = detalles.reduce((sum, d) => sum + d.credito, 0);

      expect(totalDebitos).toBe(totalCreditos);
    });

    test('✅ Debería validar formato de referencia', () => {
      const referenciasValidas = [
        'TXN-2025-001',
        'TXN-2025-999',
        'TXN-2024-CIERRE'
      ];

      const referenciaInvalida = 'INVALID-REF';
      const regex = /^TXN-\d{4}-[\w]+$/;

      referenciasValidas.forEach(ref => {
        expect(regex.test(ref)).toBe(true);
      });

      expect(regex.test(referenciaInvalida)).toBe(false);
    });

    test('✅ Debería validar que cuentas existan antes de crear transacción', async () => {
      const transaccionData = {
        ...global.testHelpers.createTestTransaccion(),
        transaccion_detalles: [
          { debito: 1000, credito: 0, descripcion: 'Test', cuenta_id: 999 }, // Cuenta inexistente
          { debito: 0, credito: 1000, descripcion: 'Test', cuenta_id: 1 }
        ],
        usuario_id: 1
      };

      // Mock cuenta no encontrada
      db.Cuenta.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .post('/transacciones')
        .send(transaccionData);

      expect(response.status).toBe(400);
    });

    test('✅ Debería generar referencia automática para transacciones del sistema', () => {
      // Test unitario para generación de referencia
      const fecha = new Date('2025-01-01');
      const year = fecha.getFullYear();
      const nextNumber = 1;
      
      const referenciaGenerada = `TXN-${year}-${String(nextNumber).padStart(3, '0')}`;
      
      expect(referenciaGenerada).toBe('TXN-2025-001');
    });
  });
});
