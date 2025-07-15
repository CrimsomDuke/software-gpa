const { Sequelize } = require('sequelize');

// Configuración de base de datos en memoria para tests
const sequelize = new Sequelize('sqlite::memory:', {
  dialect: 'sqlite',
  logging: false, // Desactivar logs en tests
});

// Configurar timeout global para tests
jest.setTimeout(30000);

// Mock completo de todos los modelos
const createModelMock = (modelName) => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  bulkCreate: jest.fn(),
  count: jest.fn(),
  sum: jest.fn(),
  max: jest.fn(),
  min: jest.fn(),
  findAndCountAll: jest.fn(),
  findOrCreate: jest.fn(),
  upsert: jest.fn(),
  // Métodos de validación comunes
  rawAttributes: {},
  associations: {},
  tableName: modelName.toLowerCase()
});

// Setup global antes de todos los tests
beforeAll(async () => {
  console.log('🧪 Configurando entorno de testing...');
  
  // Configurar mocks globales para todos los modelos
  jest.doMock('../models', () => ({
    sequelize,
    User: createModelMock('User'),
    Role: createModelMock('Role'),
    Presupuesto: createModelMock('Presupuesto'),
    PeriodoFiscal: createModelMock('PeriodoFiscal'),
    CentroCosto: createModelMock('CentroCosto'),
    ObjetoGasto: createModelMock('ObjetoGasto'),
    Cuenta: createModelMock('Cuenta'),
    Transaccion: createModelMock('Transaccion'),
    DetalleTransaccion: createModelMock('DetalleTransaccion'),
    EjecucionPresupuesto: createModelMock('EjecucionPresupuesto'),
    TipoCuenta: createModelMock('TipoCuenta'),
    NivelCuenta: createModelMock('NivelCuenta'),
    Parametro: createModelMock('Parametro'),
    AuditLog: createModelMock('AuditLog'),
    Persona: createModelMock('Persona'),
    Reporte: createModelMock('Reporte')
  }));
});

// Cleanup después de todos los tests
afterAll(async () => {
  // Cerrar conexiones de base de datos
  if (sequelize) {
    await sequelize.close();
  }
  console.log('✅ Tests completados, limpieza finalizada');
});

// Helper functions para tests
global.testHelpers = {
  // Crear usuario de prueba
  createTestUser: () => ({
    username: 'testuser',
    fullname: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role_id: 1
  }),

  // Crear presupuesto de prueba
  createTestPresupuesto: () => ({
    monto_inicial: 1000000,
    periodo_fiscal_id: 1,
    centro_costo_id: 1,
    objeto_gasto_id: 1,
    cuenta_id: 1
  }),

  // Crear transacción de prueba
  createTestTransaccion: () => ({
    referencia: 'TEST-001',
    descripcion: 'Transacción de prueba',
    fecha: new Date(),
    tipo_transaccion: 'egreso',
    periodo_fiscal_id: 1,
    usuario_id: 1
  }),

  // Funciones de validación mock
  validateRequired: (data, requiredFields) => {
    const errors = [];
    requiredFields.forEach(field => {
      if (!data[field]) {
        errors.push(`${field} es requerido`);
      }
    });
    return errors;
  },

  // Validar email
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Crear response mock estándar
  createMockResponse: () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  },

  // Crear request mock estándar
  createMockRequest: (body = {}, params = {}, query = {}) => ({
    body,
    params,
    query,
    user: { id: 1, username: 'testuser' }
  })
};

// Factory para crear modelos mock con datos específicos
global.mockFactory = {
  user: (overrides = {}) => ({
    id: 1,
    username: 'testuser',
    fullname: 'Test User',
    email: 'test@example.com',
    role_id: 1,
    activo: true,
    created_at: new Date('2025-01-01'),
    updated_at: new Date('2025-01-01'),
    ...overrides
  }),

  presupuesto: (overrides = {}) => ({
    id: 1,
    monto_inicial: 1000000,
    monto_ejecutado: 0,
    monto_disponible: 1000000,
    periodo_fiscal_id: 1,
    centro_costo_id: 1,
    objeto_gasto_id: 1,
    cuenta_id: 1,
    activo: true,
    created_at: new Date('2025-01-01'),
    ...overrides
  }),

  transaccion: (overrides = {}) => ({
    id: 1,
    referencia: 'TXN-001',
    descripcion: 'Transacción de prueba',
    fecha: new Date('2025-01-15'),
    tipo_transaccion: 'egreso',
    periodo_fiscal_id: 1,
    usuario_id: 1,
    created_at: new Date('2025-01-15'),
    ...overrides
  })
};

module.exports = sequelize;
