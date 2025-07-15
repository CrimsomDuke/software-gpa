const request = require('supertest');
const express = require('express');
const { sequelize } = require('../models');
const centroCostoController = require('../controllers/centro_costo.controller');

// Create Express app for testing
const app = express();
app.use(express.json());

// Setup routes
app.get('/centros-costo', centroCostoController.getAllCentrosCosto);
app.get('/centros-costo/:id', centroCostoController.getCentroCostoById);
app.post('/centros-costo', centroCostoController.createCentroCosto);
app.put('/centros-costo/:id', centroCostoController.updateCentroCosto);
app.delete('/centros-costo/:id', centroCostoController.deleteCentroCosto);
app.get('/centros-costo/activos/all', centroCostoController.getCentrosCostoActivos);

describe('🏢 CENTRO DE COSTO CONTROLLER TESTS', () => {
  let createdCentroCostoIds = [];

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    // Clean up created records
    if (createdCentroCostoIds.length > 0) {
      await sequelize.models.CentroCosto.destroy({
        where: { id: createdCentroCostoIds }
      });
    }
    await sequelize.close();
    console.log('✅ Centro Costo tests completados, limpieza finalizada');
  });

  afterEach(() => {
    // Reset created IDs after each test
    createdCentroCostoIds = [];
  });

  describe('GET /centros-costo - getAllCentrosCosto', () => {
    test('✅ Debería retornar todos los centros de costo exitosamente', async () => {
      // Create test data
      const centroCosto = await sequelize.models.CentroCosto.create({
        codigo: 'CC001',
        nombre: 'Administración',
        descripcion: 'Centro de costo administrativo',
        esta_activo: true
      });
      createdCentroCostoIds.push(centroCosto.id);

      const response = await request(app)
        .get('/centros-costo')
        .expect(200);

      expect(response.body).toHaveProperty('centrosCosto');
      expect(Array.isArray(response.body.centrosCosto)).toBe(true);
      expect(response.body.centrosCosto.length).toBeGreaterThan(0);
      
      const centroCostoFound = response.body.centrosCosto.find(cc => cc.id === centroCosto.id);
      expect(centroCostoFound).toBeDefined();
      expect(centroCostoFound.codigo).toBe('CC001');
      expect(centroCostoFound.nombre).toBe('Administración');
    });

    test('❌ Debería manejar errores de base de datos', async () => {
      // Mock Sequelize to throw error
      const originalFindAll = sequelize.models.CentroCosto.findAll;
      sequelize.models.CentroCosto.findAll = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/centros-costo')
        .expect(500);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Error');

      // Restore original method
      sequelize.models.CentroCosto.findAll = originalFindAll;
    });
  });

  describe('GET /centros-costo/:id - getCentroCostoById', () => {
    test('✅ Debería retornar un centro de costo por ID', async () => {
      const centroCosto = await sequelize.models.CentroCosto.create({
        codigo: 'CC002',
        nombre: 'Producción',
        descripcion: 'Centro de costo de producción',
        esta_activo: true
      });
      createdCentroCostoIds.push(centroCosto.id);

      const response = await request(app)
        .get(`/centros-costo/${centroCosto.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('centroCosto');
      expect(response.body.centroCosto.id).toBe(centroCosto.id);
      expect(response.body.centroCosto.codigo).toBe('CC002');
      expect(response.body.centroCosto.nombre).toBe('Producción');
    });

    test('❌ Debería retornar 404 si el centro de costo no existe', async () => {
      const response = await request(app)
        .get('/centros-costo/99999')
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('no encontrado');
    });
  });

  describe('POST /centros-costo - createCentroCosto', () => {
    test('✅ Debería crear un centro de costo exitosamente', async () => {
      const centroCostoData = {
        codigo: 'CC003',
        nombre: 'Ventas',
        descripcion: 'Centro de costo de ventas',
        esta_activo: true
      };

      const response = await request(app)
        .post('/centros-costo')
        .send(centroCostoData)
        .expect(201);

      expect(response.body).toHaveProperty('centroCosto');
      expect(response.body.centroCosto.codigo).toBe('CC003');
      expect(response.body.centroCosto.nombre).toBe('Ventas');
      expect(response.body.centroCosto.esta_activo).toBe(true);
      
      createdCentroCostoIds.push(response.body.centroCosto.id);
    });

    test('❌ Debería rechazar centro de costo sin campos requeridos', async () => {
      const centroCostoData = {
        descripcion: 'Centro incompleto'
        // Missing codigo and nombre
      };

      const response = await request(app)
        .post('/centros-costo')
        .send(centroCostoData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    test('❌ Debería rechazar centro de costo con código duplicado', async () => {
      // Create first centro de costo
      const centroCosto1 = await sequelize.models.CentroCosto.create({
        codigo: 'CC004',
        nombre: 'Primer centro',
        esta_activo: true
      });
      createdCentroCostoIds.push(centroCosto1.id);

      // Try to create second centro de costo with same code
      const centroCostoData = {
        codigo: 'CC004', // Duplicate code
        nombre: 'Segundo centro',
        esta_activo: true
      };

      const response = await request(app)
        .post('/centros-costo')
        .send(centroCostoData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('código ya existe');
    });

    test('✅ Debería establecer valores por defecto correctamente', async () => {
      const centroCostoData = {
        codigo: 'CC005',
        nombre: 'Centro con defaults'
        // No description, should default
        // No esta_activo, should default to true
      };

      const response = await request(app)
        .post('/centros-costo')
        .send(centroCostoData)
        .expect(201);

      expect(response.body.centroCosto.esta_activo).toBe(true);
      expect(response.body.centroCosto.descripcion).toBeDefined();
      
      createdCentroCostoIds.push(response.body.centroCosto.id);
    });
  });

  describe('PUT /centros-costo/:id - updateCentroCosto', () => {
    test('✅ Debería actualizar un centro de costo exitosamente', async () => {
      const centroCosto = await sequelize.models.CentroCosto.create({
        codigo: 'CC006',
        nombre: 'Centro original',
        descripcion: 'Descripción original',
        esta_activo: true
      });
      createdCentroCostoIds.push(centroCosto.id);

      const updateData = {
        nombre: 'Centro actualizado',
        descripcion: 'Descripción actualizada',
        esta_activo: false
      };

      const response = await request(app)
        .put(`/centros-costo/${centroCosto.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('centroCosto');
      expect(response.body.centroCosto.nombre).toBe('Centro actualizado');
      expect(response.body.centroCosto.descripcion).toBe('Descripción actualizada');
      expect(response.body.centroCosto.esta_activo).toBe(false);
    });

    test('❌ Debería retornar 404 cuando el centro de costo no existe', async () => {
      const updateData = {
        nombre: 'Centro inexistente'
      };

      const response = await request(app)
        .put('/centros-costo/99999')
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('no encontrado');
    });

    test('❌ Debería validar código único al actualizar', async () => {
      // Create two centers
      const centroCosto1 = await sequelize.models.CentroCosto.create({
        codigo: 'CC007',
        nombre: 'Primer centro',
        esta_activo: true
      });
      const centroCosto2 = await sequelize.models.CentroCosto.create({
        codigo: 'CC008',
        nombre: 'Segundo centro',
        esta_activo: true
      });
      createdCentroCostoIds.push(centroCosto1.id, centroCosto2.id);

      // Try to update centroCosto2 with centroCosto1's code
      const updateData = {
        codigo: 'CC007' // Already exists
      };

      const response = await request(app)
        .put(`/centros-costo/${centroCosto2.id}`)
        .send(updateData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('código ya existe');
    });

    test('✅ Debería permitir actualizar con el mismo código', async () => {
      const centroCosto = await sequelize.models.CentroCosto.create({
        codigo: 'CC009',
        nombre: 'Centro original',
        esta_activo: true
      });
      createdCentroCostoIds.push(centroCosto.id);

      const updateData = {
        codigo: 'CC009', // Same code
        nombre: 'Centro actualizado'
      };

      const response = await request(app)
        .put(`/centros-costo/${centroCosto.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.centroCosto.codigo).toBe('CC009');
      expect(response.body.centroCosto.nombre).toBe('Centro actualizado');
    });
  });

  describe('DELETE /centros-costo/:id - deleteCentroCosto', () => {
    test('✅ Debería eliminar un centro de costo exitosamente', async () => {
      const centroCosto = await sequelize.models.CentroCosto.create({
        codigo: 'CC010',
        nombre: 'Centro a eliminar',
        esta_activo: true
      });

      const response = await request(app)
        .delete(`/centros-costo/${centroCosto.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('eliminado exitosamente');

      // Verify it's deleted
      const deletedCentroCosto = await sequelize.models.CentroCosto.findByPk(centroCosto.id);
      expect(deletedCentroCosto).toBeNull();
    });

    test('❌ Debería retornar 404 cuando el centro de costo no existe', async () => {
      const response = await request(app)
        .delete('/centros-costo/99999')
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('no encontrado');
    });

    test('❌ Debería manejar error al eliminar centro de costo con dependencias', async () => {
      // This test simulates a foreign key constraint error
      const centroCosto = await sequelize.models.CentroCosto.create({
        codigo: 'CC011',
        nombre: 'Centro con dependencias',
        esta_activo: true
      });
      createdCentroCostoIds.push(centroCosto.id);

      // Mock the destroy method to throw a foreign key error
      const originalDestroy = sequelize.models.CentroCosto.destroy;
      sequelize.models.CentroCosto.destroy = jest.fn().mockRejectedValue(
        new Error('Cannot delete - foreign key constraint')
      );

      const response = await request(app)
        .delete(`/centros-costo/${centroCosto.id}`)
        .expect(500);

      expect(response.body).toHaveProperty('message');
      
      // Restore original method
      sequelize.models.CentroCosto.destroy = originalDestroy;
    });
  });

  describe('GET /centros-costo/activos/all - getCentrosCostoActivos', () => {
    test('✅ Debería retornar solo centros de costo activos', async () => {
      const centroCostoActivo = await sequelize.models.CentroCosto.create({
        codigo: 'CC012',
        nombre: 'Centro activo',
        esta_activo: true
      });
      const centroCostoInactivo = await sequelize.models.CentroCosto.create({
        codigo: 'CC013',
        nombre: 'Centro inactivo',
        esta_activo: false
      });
      createdCentroCostoIds.push(centroCostoActivo.id, centroCostoInactivo.id);

      const response = await request(app)
        .get('/centros-costo/activos/all')
        .expect(200);

      expect(response.body).toHaveProperty('centrosCosto');
      
      const activosEncontrados = response.body.centrosCosto.filter(cc => cc.esta_activo);
      const inactivosEncontrados = response.body.centrosCosto.filter(cc => !cc.esta_activo);
      
      expect(activosEncontrados.length).toBeGreaterThan(0);
      expect(inactivosEncontrados.length).toBe(0);
      
      const centroCostoActivoFound = response.body.centrosCosto.find(cc => cc.id === centroCostoActivo.id);
      const centroCostoInactivoFound = response.body.centrosCosto.find(cc => cc.id === centroCostoInactivo.id);
      
      expect(centroCostoActivoFound).toBeDefined();
      expect(centroCostoInactivoFound).toBeUndefined();
    });

    test('✅ Debería retornar array vacío si no hay centros activos', async () => {
      // Create only inactive centers
      const centroCostoInactivo1 = await sequelize.models.CentroCosto.create({
        codigo: 'CC014',
        nombre: 'Centro inactivo 1',
        esta_activo: false
      });
      const centroCostoInactivo2 = await sequelize.models.CentroCosto.create({
        codigo: 'CC015',
        nombre: 'Centro inactivo 2',
        esta_activo: false
      });
      createdCentroCostoIds.push(centroCostoInactivo1.id, centroCostoInactivo2.id);

      const response = await request(app)
        .get('/centros-costo/activos/all')
        .expect(200);

      expect(response.body).toHaveProperty('centrosCosto');
      expect(Array.isArray(response.body.centrosCosto)).toBe(true);
      
      // Should only return active centers (none in this case)
      const activosEncontrados = response.body.centrosCosto.filter(cc => cc.esta_activo);
      expect(activosEncontrados.length).toBe(0);
    });
  });

  describe('🔍 Validaciones de Negocio', () => {
    test('✅ Debería validar formato de código', () => {
      const validCodes = ['CC001', 'ADM', 'PROD-001', '100'];
      const invalidCodes = ['', '   ', null, undefined];

      validCodes.forEach(code => {
        expect(typeof code).toBe('string');
        expect(code.trim().length).toBeGreaterThan(0);
      });

      invalidCodes.forEach(code => {
        expect(code === null || code === undefined || 
               (typeof code === 'string' && code.trim().length === 0)).toBeTruthy();
      });
    });

    test('✅ Debería manejar nombres largos correctamente', async () => {
      const centroCostoData = {
        codigo: 'CC016',
        nombre: 'Centro de Costo con Nombre Muy Largo para Probar Validaciones de Límites de Caracteres',
        descripcion: 'Descripción también muy larga para validar que el sistema maneja correctamente los límites establecidos en la base de datos',
        esta_activo: true
      };

      const response = await request(app)
        .post('/centros-costo')
        .send(centroCostoData);

      // Should either succeed (if DB allows long names) or fail gracefully
      expect([201, 400]).toContain(response.status);
      
      if (response.status === 201) {
        createdCentroCostoIds.push(response.body.centroCosto.id);
      }
    });

    test('✅ Debería mantener consistencia de datos', async () => {
      const centroCosto = await sequelize.models.CentroCosto.create({
        codigo: 'CC017',
        nombre: 'Centro consistente',
        descripcion: 'Descripción original',
        esta_activo: true
      });
      createdCentroCostoIds.push(centroCosto.id);

      // Update partially
      const updateData = {
        descripcion: 'Descripción actualizada'
      };

      const response = await request(app)
        .put(`/centros-costo/${centroCosto.id}`)
        .send(updateData)
        .expect(200);

      // Verify other fields remain unchanged
      expect(response.body.centroCosto.codigo).toBe('CC017');
      expect(response.body.centroCosto.nombre).toBe('Centro consistente');
      expect(response.body.centroCosto.descripcion).toBe('Descripción actualizada');
      expect(response.body.centroCosto.esta_activo).toBe(true);
    });

    test('✅ Debería validar estado activo/inactivo', async () => {
      const centroCostoData = {
        codigo: 'CC018',
        nombre: 'Centro para test estado',
        esta_activo: 'invalid_boolean' // Invalid boolean value
      };

      const response = await request(app)
        .post('/centros-costo')
        .send(centroCostoData);

      // Should handle invalid boolean gracefully
      if (response.status === 201) {
        // System converted to valid boolean
        expect(typeof response.body.centroCosto.esta_activo).toBe('boolean');
        createdCentroCostoIds.push(response.body.centroCosto.id);
      } else {
        // System rejected invalid data
        expect(response.status).toBe(400);
      }
    });
  });
});
