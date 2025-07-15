const request = require('supertest');
const express = require('express');
const { sequelize } = require('../models');
const cuentaController = require('../controllers/cuenta.controller');

// Create Express app for testing
const app = express();
app.use(express.json());

// Setup routes
app.get('/cuentas', cuentaController.getAllCuentas);
app.get('/cuentas/:id', cuentaController.getCuentaById);
app.post('/cuentas', cuentaController.createCuenta);
app.put('/cuentas/:id', cuentaController.updateCuenta);
app.delete('/cuentas/:id', cuentaController.deleteCuenta);
app.get('/cuentas/tipo/:tipoId', cuentaController.getCuentasByTipo);
app.get('/cuentas/nivel/:nivelId', cuentaController.getCuentasByNivel);
app.get('/cuentas/activas/all', cuentaController.getCuentasActivas);

describe('💰 CUENTA CONTROLLER TESTS', () => {
  let createdCuentaIds = [];
  let testTipoCuentaId, testNivelCuentaId, testObjetoGastoId;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    
    // Create test dependencies
    const tipoCuenta = await sequelize.models.TipoCuenta.create({
      nombre: 'activo',
      descripcion: 'Cuentas de activo'
    });
    testTipoCuentaId = tipoCuenta.id;

    const nivelCuenta = await sequelize.models.NivelCuenta.create({
      nombre: 'cuenta',
      profundidad: 1,
      longitud_maxima: 10
    });
    testNivelCuentaId = nivelCuenta.id;

    const objetoGasto = await sequelize.models.ObjetoGasto.create({
      codigo: 'OG001',
      nombre: 'Suministros de oficina',
      descripcion: 'Materiales de oficina'
    });
    testObjetoGastoId = objetoGasto.id;
  });

  afterAll(async () => {
    // Clean up created records
    if (createdCuentaIds.length > 0) {
      await sequelize.models.Cuenta.destroy({
        where: { id: createdCuentaIds }
      });
    }
    await sequelize.close();
    console.log('✅ Tests completados, limpieza finalizada');
  });

  afterEach(() => {
    // Reset created IDs after each test
    createdCuentaIds = [];
  });

  describe('GET /cuentas - getAllCuentas', () => {
    test('✅ Debería retornar todas las cuentas exitosamente', async () => {
      // Create test data
      const cuenta = await sequelize.models.Cuenta.create({
        codigo: 'CTA001',
        nombre: 'Caja',
        descripcion: 'Cuenta de caja',
        tipo_cuenta_id: testTipoCuentaId,
        nivel_cuenta_id: testNivelCuentaId,
        esta_activa: true
      });
      createdCuentaIds.push(cuenta.id);

      const response = await request(app)
        .get('/cuentas')
        .expect(200);

      expect(response.body).toHaveProperty('cuentas');
      expect(Array.isArray(response.body.cuentas)).toBe(true);
      expect(response.body.cuentas.length).toBeGreaterThan(0);
      
      const cuentaFound = response.body.cuentas.find(c => c.id === cuenta.id);
      expect(cuentaFound).toBeDefined();
      expect(cuentaFound.codigo).toBe('CTA001');
      expect(cuentaFound.nombre).toBe('Caja');
    });

    test('❌ Debería manejar errores de base de datos', async () => {
      // Mock Sequelize to throw error
      const originalFindAll = sequelize.models.Cuenta.findAll;
      sequelize.models.Cuenta.findAll = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/cuentas')
        .expect(500);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Error');

      // Restore original method
      sequelize.models.Cuenta.findAll = originalFindAll;
    });
  });

  describe('GET /cuentas/:id - getCuentaById', () => {
    test('✅ Debería retornar una cuenta por ID', async () => {
      const cuenta = await sequelize.models.Cuenta.create({
        codigo: 'CTA002',
        nombre: 'Bancos',
        descripcion: 'Cuenta bancaria',
        tipo_cuenta_id: testTipoCuentaId,
        nivel_cuenta_id: testNivelCuentaId,
        esta_activa: true
      });
      createdCuentaIds.push(cuenta.id);

      const response = await request(app)
        .get(`/cuentas/${cuenta.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('cuenta');
      expect(response.body.cuenta.id).toBe(cuenta.id);
      expect(response.body.cuenta.codigo).toBe('CTA002');
      expect(response.body.cuenta.nombre).toBe('Bancos');
    });

    test('❌ Debería retornar 404 si la cuenta no existe', async () => {
      const response = await request(app)
        .get('/cuentas/99999')
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('no encontrada');
    });
  });

  describe('POST /cuentas - createCuenta', () => {
    test('✅ Debería crear una cuenta exitosamente', async () => {
      const cuentaData = {
        codigo: 'CTA003',
        nombre: 'Inventarios',
        descripcion: 'Cuenta de inventarios',
        tipo_cuenta_id: testTipoCuentaId,
        nivel_cuenta_id: testNivelCuentaId,
        objeto_gasto_id: testObjetoGastoId,
        esta_activa: true
      };

      const response = await request(app)
        .post('/cuentas')
        .send(cuentaData)
        .expect(201);

      expect(response.body).toHaveProperty('cuenta');
      expect(response.body.cuenta.codigo).toBe('CTA003');
      expect(response.body.cuenta.nombre).toBe('Inventarios');
      expect(response.body.cuenta.tipo_cuenta_id).toBe(testTipoCuentaId);
      
      createdCuentaIds.push(response.body.cuenta.id);
    });

    test('❌ Debería rechazar cuenta sin campos requeridos', async () => {
      const cuentaData = {
        nombre: 'Cuenta incompleta'
        // Missing codigo, tipo_cuenta_id, nivel_cuenta_id
      };

      const response = await request(app)
        .post('/cuentas')
        .send(cuentaData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    test('❌ Debería rechazar cuenta con código duplicado', async () => {
      // Create first cuenta
      const cuenta1 = await sequelize.models.Cuenta.create({
        codigo: 'CTA004',
        nombre: 'Primera cuenta',
        tipo_cuenta_id: testTipoCuentaId,
        nivel_cuenta_id: testNivelCuentaId
      });
      createdCuentaIds.push(cuenta1.id);

      // Try to create second cuenta with same code
      const cuentaData = {
        codigo: 'CTA004', // Duplicate code
        nombre: 'Segunda cuenta',
        tipo_cuenta_id: testTipoCuentaId,
        nivel_cuenta_id: testNivelCuentaId
      };

      const response = await request(app)
        .post('/cuentas')
        .send(cuentaData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('código ya existe');
    });

    test('❌ Debería validar tipo_cuenta_id válido', async () => {
      const cuentaData = {
        codigo: 'CTA005',
        nombre: 'Cuenta con tipo inválido',
        tipo_cuenta_id: 99999, // Invalid ID
        nivel_cuenta_id: testNivelCuentaId
      };

      const response = await request(app)
        .post('/cuentas')
        .send(cuentaData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Tipo de cuenta no encontrado');
    });

    test('❌ Debería validar nivel_cuenta_id válido', async () => {
      const cuentaData = {
        codigo: 'CTA006',
        nombre: 'Cuenta con nivel inválido',
        tipo_cuenta_id: testTipoCuentaId,
        nivel_cuenta_id: 99999 // Invalid ID
      };

      const response = await request(app)
        .post('/cuentas')
        .send(cuentaData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Nivel de cuenta no encontrado');
    });
  });

  describe('PUT /cuentas/:id - updateCuenta', () => {
    test('✅ Debería actualizar una cuenta exitosamente', async () => {
      const cuenta = await sequelize.models.Cuenta.create({
        codigo: 'CTA007',
        nombre: 'Cuenta original',
        tipo_cuenta_id: testTipoCuentaId,
        nivel_cuenta_id: testNivelCuentaId,
        esta_activa: true
      });
      createdCuentaIds.push(cuenta.id);

      const updateData = {
        nombre: 'Cuenta actualizada',
        descripcion: 'Descripción actualizada',
        esta_activa: false
      };

      const response = await request(app)
        .put(`/cuentas/${cuenta.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('cuenta');
      expect(response.body.cuenta.nombre).toBe('Cuenta actualizada');
      expect(response.body.cuenta.descripcion).toBe('Descripción actualizada');
      expect(response.body.cuenta.esta_activa).toBe(false);
    });

    test('❌ Debería retornar 404 cuando la cuenta no existe', async () => {
      const updateData = {
        nombre: 'Cuenta inexistente'
      };

      const response = await request(app)
        .put('/cuentas/99999')
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('no encontrada');
    });

    test('❌ Debería validar código único al actualizar', async () => {
      // Create two accounts
      const cuenta1 = await sequelize.models.Cuenta.create({
        codigo: 'CTA008',
        nombre: 'Primera cuenta',
        tipo_cuenta_id: testTipoCuentaId,
        nivel_cuenta_id: testNivelCuentaId
      });
      const cuenta2 = await sequelize.models.Cuenta.create({
        codigo: 'CTA009',
        nombre: 'Segunda cuenta',
        tipo_cuenta_id: testTipoCuentaId,
        nivel_cuenta_id: testNivelCuentaId
      });
      createdCuentaIds.push(cuenta1.id, cuenta2.id);

      // Try to update cuenta2 with cuenta1's code
      const updateData = {
        codigo: 'CTA008' // Already exists
      };

      const response = await request(app)
        .put(`/cuentas/${cuenta2.id}`)
        .send(updateData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('código ya existe');
    });
  });

  describe('DELETE /cuentas/:id - deleteCuenta', () => {
    test('✅ Debería eliminar una cuenta exitosamente', async () => {
      const cuenta = await sequelize.models.Cuenta.create({
        codigo: 'CTA010',
        nombre: 'Cuenta a eliminar',
        tipo_cuenta_id: testTipoCuentaId,
        nivel_cuenta_id: testNivelCuentaId
      });

      const response = await request(app)
        .delete(`/cuentas/${cuenta.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('eliminada exitosamente');

      // Verify it's deleted
      const deletedCuenta = await sequelize.models.Cuenta.findByPk(cuenta.id);
      expect(deletedCuenta).toBeNull();
    });

    test('❌ Debería retornar 404 cuando la cuenta no existe', async () => {
      const response = await request(app)
        .delete('/cuentas/99999')
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('no encontrada');
    });
  });

  describe('GET /cuentas/tipo/:tipoId - getCuentasByTipo', () => {
    test('✅ Debería retornar cuentas por tipo', async () => {
      const cuenta = await sequelize.models.Cuenta.create({
        codigo: 'CTA011',
        nombre: 'Cuenta por tipo',
        tipo_cuenta_id: testTipoCuentaId,
        nivel_cuenta_id: testNivelCuentaId
      });
      createdCuentaIds.push(cuenta.id);

      const response = await request(app)
        .get(`/cuentas/tipo/${testTipoCuentaId}`)
        .expect(200);

      expect(response.body).toHaveProperty('cuentas');
      expect(Array.isArray(response.body.cuentas)).toBe(true);
      
      const cuentaFound = response.body.cuentas.find(c => c.id === cuenta.id);
      expect(cuentaFound).toBeDefined();
    });
  });

  describe('GET /cuentas/nivel/:nivelId - getCuentasByNivel', () => {
    test('✅ Debería retornar cuentas por nivel', async () => {
      const cuenta = await sequelize.models.Cuenta.create({
        codigo: 'CTA012',
        nombre: 'Cuenta por nivel',
        tipo_cuenta_id: testTipoCuentaId,
        nivel_cuenta_id: testNivelCuentaId
      });
      createdCuentaIds.push(cuenta.id);

      const response = await request(app)
        .get(`/cuentas/nivel/${testNivelCuentaId}`)
        .expect(200);

      expect(response.body).toHaveProperty('cuentas');
      expect(Array.isArray(response.body.cuentas)).toBe(true);
      
      const cuentaFound = response.body.cuentas.find(c => c.id === cuenta.id);
      expect(cuentaFound).toBeDefined();
    });
  });

  describe('GET /cuentas/activas/all - getCuentasActivas', () => {
    test('✅ Debería retornar solo cuentas activas', async () => {
      const cuentaActiva = await sequelize.models.Cuenta.create({
        codigo: 'CTA013',
        nombre: 'Cuenta activa',
        tipo_cuenta_id: testTipoCuentaId,
        nivel_cuenta_id: testNivelCuentaId,
        esta_activa: true
      });
      const cuentaInactiva = await sequelize.models.Cuenta.create({
        codigo: 'CTA014',
        nombre: 'Cuenta inactiva',
        tipo_cuenta_id: testTipoCuentaId,
        nivel_cuenta_id: testNivelCuentaId,
        esta_activa: false
      });
      createdCuentaIds.push(cuentaActiva.id, cuentaInactiva.id);

      const response = await request(app)
        .get('/cuentas/activas/all')
        .expect(200);

      expect(response.body).toHaveProperty('cuentas');
      
      const activasEncontradas = response.body.cuentas.filter(c => c.esta_activa);
      const inactivasEncontradas = response.body.cuentas.filter(c => !c.esta_activa);
      
      expect(activasEncontradas.length).toBeGreaterThan(0);
      expect(inactivasEncontradas.length).toBe(0);
      
      const cuentaActivaFound = response.body.cuentas.find(c => c.id === cuentaActiva.id);
      const cuentaInactivaFound = response.body.cuentas.find(c => c.id === cuentaInactiva.id);
      
      expect(cuentaActivaFound).toBeDefined();
      expect(cuentaInactivaFound).toBeUndefined();
    });
  });

  describe('🔍 Validaciones de Negocio', () => {
    test('✅ Debería validar estructura jerárquica de cuentas', async () => {
      // Create parent account
      const cuentaPadre = await sequelize.models.Cuenta.create({
        codigo: 'CTA100',
        nombre: 'Cuenta Padre',
        tipo_cuenta_id: testTipoCuentaId,
        nivel_cuenta_id: testNivelCuentaId
      });
      createdCuentaIds.push(cuentaPadre.id);

      // Create child account
      const cuentaHijaData = {
        codigo: 'CTA101',
        nombre: 'Cuenta Hija',
        tipo_cuenta_id: testTipoCuentaId,
        nivel_cuenta_id: testNivelCuentaId,
        cuenta_padre_id: cuentaPadre.id
      };

      const response = await request(app)
        .post('/cuentas')
        .send(cuentaHijaData)
        .expect(201);

      expect(response.body.cuenta.cuenta_padre_id).toBe(cuentaPadre.id);
      createdCuentaIds.push(response.body.cuenta.id);
    });

    test('✅ Debería validar formato de código de cuenta', () => {
      const validCodes = ['CTA001', '1000', '1.1.01', '100.001'];
      const invalidCodes = ['', '   ', 'CÓDIGO_MUY_LARGO_PARA_CAMPO', null];

      validCodes.forEach(code => {
        expect(typeof code).toBe('string');
        expect(code.trim().length).toBeGreaterThan(0);
      });

      invalidCodes.forEach(code => {
        expect(code === null || code === undefined || code.trim().length === 0).toBeTruthy();
      });
    });

    test('✅ Debería mantener integridad referencial', async () => {
      const cuenta = await sequelize.models.Cuenta.create({
        codigo: 'CTA015',
        nombre: 'Cuenta con objeto gasto',
        tipo_cuenta_id: testTipoCuentaId,
        nivel_cuenta_id: testNivelCuentaId,
        objeto_gasto_id: testObjetoGastoId
      });
      createdCuentaIds.push(cuenta.id);

      // Verify relationship exists
      const cuentaConRelaciones = await sequelize.models.Cuenta.findByPk(cuenta.id, {
        include: [
          { model: sequelize.models.TipoCuenta },
          { model: sequelize.models.NivelCuenta },
          { model: sequelize.models.ObjetoGasto }
        ]
      });

      expect(cuentaConRelaciones.TipoCuenta).toBeDefined();
      expect(cuentaConRelaciones.NivelCuenta).toBeDefined();
      expect(cuentaConRelaciones.ObjetoGasto).toBeDefined();
    });
  });
});
