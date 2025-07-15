const request = require('supertest');
const express = require('express');

// Mock the database models
jest.mock('../models/', () => ({
    Transaccion: {
        findAll: jest.fn(),
        findByPk: jest.fn(),
        create: jest.fn(),
    },
    DetalleTransaccion: {
        create: jest.fn(),
        findAll: jest.fn(),
        destroy: jest.fn(),
    },
    PeriodoFiscal: {
        findByPk: jest.fn(),
    },
    User: {},
}));

// Mock audit log service
jest.mock('../services/audit_log.service', () => ({
    createAuditLog: jest.fn(),
}));

// Mock global config
jest.mock('../config/global', () => ({}));

const db = require('../models/');
const auditLogService = require('../services/audit_log.service');
const transaccionController = require('../controllers/transaccion.controller');

// Create Express app for testing
const app = express();
app.use(express.json());

// Add routes
app.get('/transacciones', transaccionController.getAllTransacciones);
app.get('/transacciones/:id', transaccionController.getTransaccionById);
app.post('/transacciones', transaccionController.createTransaccion);
app.put('/transacciones/:id', transaccionController.updateTransaccion);
app.delete('/transacciones/:id', transaccionController.deleteTransaccion);
app.delete('/transacciones/:id/detalles', transaccionController.deleteTransaccionDetalles);

describe('Transaccion Controller - Comprehensive Tests', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset console.error mock
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    describe('GET /transacciones - getAllTransacciones', () => {
        test('debe retornar todas las transacciones exitosamente', async () => {
            const mockTransacciones = [
                { id: 1, referencia: 'TR-001', descripcion: 'Transacción 1' },
                { id: 2, referencia: 'TR-002', descripcion: 'Transacción 2' }
            ];

            db.Transaccion.findAll.mockResolvedValue(mockTransacciones);

            const response = await request(app).get('/transacciones');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockTransacciones);
            expect(db.Transaccion.findAll).toHaveBeenCalledTimes(1);
        });

        test('debe manejar errores de base de datos', async () => {
            const errorMessage = 'Database connection error';
            db.Transaccion.findAll.mockRejectedValue(new Error(errorMessage));

            const response = await request(app).get('/transacciones');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Error obteniendo transacciones' });
            expect(console.error).toHaveBeenCalledWith('Error fetching transactions:', expect.any(Error));
        });
    });

    describe('GET /transacciones/:id - getTransaccionById', () => {
        test('debe retornar una transacción por ID exitosamente', async () => {
            const mockTransaccion = {
                id: 1,
                referencia: 'TR-001',
                descripcion: 'Transacción test',
                detalles: [],
                periodo_fiscal: { id: 1, nombre: '2024' },
                usuario: { id: 1, nombre: 'Test User' }
            };

            db.Transaccion.findByPk.mockResolvedValue(mockTransaccion);

            const response = await request(app).get('/transacciones/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockTransaccion);
            expect(db.Transaccion.findByPk).toHaveBeenCalledWith('1', {
                include: [
                    { model: db.DetalleTransaccion, as: 'detalles' },
                    { model: db.PeriodoFiscal, as: 'periodo_fiscal' },
                    { model: db.User, as: 'usuario' }
                ]
            });
        });

        test('debe retornar 404 cuando la transacción no existe', async () => {
            db.Transaccion.findByPk.mockResolvedValue(null);

            const response = await request(app).get('/transacciones/999');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'No se encontró la transacción' });
        });
    });

    describe('POST /transacciones - createTransaccion', () => {
        const validTransaccionData = {
            descripcion: 'Nueva transacción',
            fecha: '2024-01-15',
            tipo_transaccion: 'MANUAL',
            periodo_fiscal_id: 1,
            usuario_id: 1,
            transaccion_detalles: [
                {
                    cuenta_id: 1,
                    debito: 1000,
                    credito: 0,
                    descripcion: 'Débito cuenta 1'
                },
                {
                    cuenta_id: 2,
                    debito: 0,
                    credito: 1000,
                    descripcion: 'Crédito cuenta 2'
                }
            ]
        };

        // Mock para la función generarReferenciaTransaccion que está definida en el controller
        beforeEach(() => {
            // La función está definida internamente en el controller, no necesita mock adicional
        });

        test('debe crear una transacción exitosamente', async () => {
            const mockTransaccion = {
                id: 1,
                referencia: 'TR-123456789',
                ...validTransaccionData
            };

            const mockDetallesCreados = [
                { id: 1, transaccion_id: 1, cuenta_id: 1, debito: 1000, credito: 0 },
                { id: 2, transaccion_id: 1, cuenta_id: 2, debito: 0, credito: 1000 }
            ];

            db.Transaccion.create.mockResolvedValue(mockTransaccion);
            db.DetalleTransaccion.create.mockResolvedValueOnce(mockDetallesCreados[0]);
            db.DetalleTransaccion.create.mockResolvedValueOnce(mockDetallesCreados[1]);
            auditLogService.createAuditLog.mockResolvedValue(true);

            const response = await request(app)
                .post('/transacciones')
                .send(validTransaccionData);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Transacción creada exitosamente');
            expect(response.body.data.transaccion).toEqual(mockTransaccion);
            
            expect(db.Transaccion.create).toHaveBeenCalledWith(expect.objectContaining({
                descripcion: validTransaccionData.descripcion,
                fecha: validTransaccionData.fecha,
                tipo_transaccion: validTransaccionData.tipo_transaccion,
                es_generado_sistema: false,
                periodo_fiscal_id: validTransaccionData.periodo_fiscal_id,
                usuario_id: validTransaccionData.usuario_id
            }));

            expect(db.DetalleTransaccion.create).toHaveBeenCalledTimes(2);
            expect(auditLogService.createAuditLog).toHaveBeenCalledWith(
                'CREATE', 
                validTransaccionData.usuario_id, 
                'Transacciones', 
                mockTransaccion.id
            );
        });

        test('debe rechazar transacción sin campos requeridos', async () => {
            const invalidData = {
                // Falta descripcion, fecha, tipo_transaccion, periodo_fiscal_id, usuario_id
                transaccion_detalles: [
                    {
                        cuenta_id: 1,
                        debito: 1000,
                        credito: 0
                    }
                ]
            };

            const response = await request(app)
                .post('/transacciones')
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Validation errors');
            expect(response.body.errors).toHaveProperty('descripcion');
            expect(response.body.errors).toHaveProperty('fecha');
            expect(response.body.errors).toHaveProperty('tipo_transaccion');
            expect(response.body.errors).toHaveProperty('periodo_fiscal_id');
            expect(response.body.errors).toHaveProperty('usuario_id');
        });

        test('debe rechazar transacción sin detalles', async () => {
            const invalidData = {
                descripcion: 'Test',
                fecha: '2024-01-15',
                tipo_transaccion: 'MANUAL',
                periodo_fiscal_id: 1,
                usuario_id: 1,
                transaccion_detalles: []
            };

            const response = await request(app)
                .post('/transacciones')
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body.errors).toBe('La transacción debe tener al menos un detalle');
        });

        test('debe rechazar detalles sin cuenta_id', async () => {
            const invalidData = {
                descripcion: 'Test',
                fecha: '2024-01-15',
                tipo_transaccion: 'MANUAL',
                periodo_fiscal_id: 1,
                usuario_id: 1,
                transaccion_detalles: [
                    {
                        // falta cuenta_id
                        debito: 1000,
                        credito: 0
                    }
                ]
            };

            const response = await request(app)
                .post('/transacciones')
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body.errors).toContain('no tiene cuenta_id');
        });

        test('debe rechazar detalles sin débito ni crédito', async () => {
            const invalidData = {
                descripcion: 'Test',
                fecha: '2024-01-15',
                tipo_transaccion: 'MANUAL',
                periodo_fiscal_id: 1,
                usuario_id: 1,
                transaccion_detalles: [
                    {
                        cuenta_id: 1,
                        debito: 0,
                        credito: 0
                    }
                ]
            };

            const response = await request(app)
                .post('/transacciones')
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body.errors).toContain('debe tener débito o crédito');
        });

        test('debe rechazar detalles con débito y crédito simultáneos', async () => {
            const invalidData = {
                descripcion: 'Test',
                fecha: '2024-01-15',
                tipo_transaccion: 'MANUAL',
                periodo_fiscal_id: 1,
                usuario_id: 1,
                transaccion_detalles: [
                    {
                        cuenta_id: 1,
                        debito: 1000,
                        credito: 500
                    }
                ]
            };

            const response = await request(app)
                .post('/transacciones')
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body.errors).toContain('no puede tener débito y crédito simultáneamente');
        });

        test('debe rechazar detalles con valores negativos', async () => {
            const invalidData = {
                descripcion: 'Test',
                fecha: '2024-01-15',
                tipo_transaccion: 'MANUAL',
                periodo_fiscal_id: 1,
                usuario_id: 1,
                transaccion_detalles: [
                    {
                        cuenta_id: 1,
                        debito: -1000,
                        credito: 0
                    }
                ]
            };

            const response = await request(app)
                .post('/transacciones')
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body.errors).toContain('debe tener valores positivos');
        });

        test('debe rechazar transacción con débitos y créditos desbalanceados', async () => {
            const invalidData = {
                ...validTransaccionData,
                transaccion_detalles: [
                    {
                        cuenta_id: 1,
                        debito: 1000,
                        credito: 0,
                        descripcion: 'Débito mayor'
                    },
                    {
                        cuenta_id: 2,
                        debito: 0,
                        credito: 500,
                        descripcion: 'Crédito menor'
                    }
                ]
            };

            const response = await request(app)
                .post('/transacciones')
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body.errors).toBe('Los débitos y créditos deben estar balanceados');
            expect(response.body.details.totalDebito).toBe(1000);
            expect(response.body.details.totalCredito).toBe(500);
        });

        test('debe manejar errores al crear transacción', async () => {
            const errorMessage = 'Database error';
            db.Transaccion.create.mockRejectedValue(new Error(errorMessage));

            const response = await request(app)
                .post('/transacciones')
                .send(validTransaccionData);

            expect(response.status).toBe(500);
            expect(response.body.message).toContain('Error al crear la transacción');
            expect(console.error).toHaveBeenCalledWith('Error creating transaction:', expect.any(Error));
        });
    });

    describe('PUT /transacciones/:id - updateTransaccion', () => {
        test('debe actualizar una transacción exitosamente', async () => {
            const mockTransaccion = {
                id: 1,
                descripcion: 'Descripción original',
                fecha: '2024-01-01',
                tipo_transaccion: 'MANUAL',
                save: jest.fn().mockResolvedValue(true)
            };

            const updateData = {
                descripcion: 'Descripción actualizada',
                fecha: '2024-01-15',
                usuario_id: 1
            };

            db.Transaccion.findByPk.mockResolvedValue(mockTransaccion);
            auditLogService.createAuditLog.mockResolvedValue(true);

            const response = await request(app)
                .put('/transacciones/1')
                .send(updateData);

            expect(response.status).toBe(200);
            expect(mockTransaccion.descripcion).toBe(updateData.descripcion);
            expect(mockTransaccion.fecha).toBe(updateData.fecha);
            expect(mockTransaccion.save).toHaveBeenCalledTimes(1);
            expect(auditLogService.createAuditLog).toHaveBeenCalledWith(
                'UPDATE', 
                updateData.usuario_id, 
                'Transacciones', 
                mockTransaccion.id
            );
        });

        test('debe retornar 404 cuando la transacción no existe', async () => {
            db.Transaccion.findByPk.mockResolvedValue(null);

            const response = await request(app)
                .put('/transacciones/999')
                .send({ descripcion: 'Nueva descripción', usuario_id: 1 });

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'No se encontró la transacción' });
        });

        test('debe manejar errores al actualizar transacción', async () => {
            const mockTransaccion = {
                id: 1,
                save: jest.fn().mockRejectedValue(new Error('Save error'))
            };

            db.Transaccion.findByPk.mockResolvedValue(mockTransaccion);

            const response = await request(app)
                .put('/transacciones/1')
                .send({ descripcion: 'Nueva descripción', usuario_id: 1 });

            expect(response.status).toBe(500);
            expect(response.body.message).toContain('Error al actualizar la transacción');
        });
    });

    describe('DELETE /transacciones/:id - deleteTransaccion', () => {
        test('debe eliminar una transacción exitosamente', async () => {
            const mockTransaccion = {
                id: 1,
                descripcion: 'Transacción a eliminar',
                destroy: jest.fn().mockResolvedValue(true)
            };

            db.Transaccion.findByPk.mockResolvedValue(mockTransaccion);
            db.DetalleTransaccion.destroy.mockResolvedValue(2); // 2 detalles eliminados
            auditLogService.createAuditLog.mockResolvedValue(true);

            const response = await request(app)
                .delete('/transacciones/1')
                .send({ usuario_id: 1 });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Transacción eliminada exitosamente');
            // Comparar solo las propiedades relevantes, no la función destroy
            expect(response.body.data.id).toBe(mockTransaccion.id);
            expect(response.body.data.descripcion).toBe(mockTransaccion.descripcion);
            
            expect(db.DetalleTransaccion.destroy).toHaveBeenCalledWith({
                where: { transaccion_id: '1' }
            });
            expect(mockTransaccion.destroy).toHaveBeenCalledTimes(1);
            expect(auditLogService.createAuditLog).toHaveBeenCalledWith(
                'DELETE', 
                1, 
                'Transacciones', 
                mockTransaccion.id
            );
        });

        test('debe retornar 404 cuando la transacción no existe', async () => {
            db.Transaccion.findByPk.mockResolvedValue(null);

            const response = await request(app)
                .delete('/transacciones/999')
                .send({ usuario_id: 1 });

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'No se encontró la transacción' });
        });
    });

    describe('DELETE /transacciones/:id/detalles - deleteTransaccionDetalles', () => {
        test('debe eliminar todos los detalles de una transacción exitosamente', async () => {
            const mockTransaccion = { id: 1, descripcion: 'Transacción test' };
            const mockDetalles = [
                { id: 1, destroy: jest.fn().mockResolvedValue(true) },
                { id: 2, destroy: jest.fn().mockResolvedValue(true) }
            ];

            db.Transaccion.findByPk.mockResolvedValue(mockTransaccion);
            db.DetalleTransaccion.findAll.mockResolvedValue(mockDetalles);
            auditLogService.createAuditLog.mockResolvedValue(true);

            const response = await request(app)
                .delete('/transacciones/1/detalles')
                .send({ usuario_id: 1 });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Detalles de transacción eliminados exitosamente');
            expect(response.body.detalles_eliminados).toBe(2);
            
            expect(db.DetalleTransaccion.findAll).toHaveBeenCalledWith({
                where: { transaccion_id: '1' }
            });
            
            // Verificar que se llamó destroy en cada detalle
            mockDetalles.forEach(detalle => {
                expect(detalle.destroy).toHaveBeenCalledTimes(1);
            });

            expect(auditLogService.createAuditLog).toHaveBeenCalledWith(
                'DELETE', 
                1, 
                'DetalleTransaccion', 
                '1'
            );
        });

        test('debe retornar 404 cuando no hay detalles para eliminar', async () => {
            const mockTransaccion = { id: 1, descripcion: 'Transacción test' };

            db.Transaccion.findByPk.mockResolvedValue(mockTransaccion);
            db.DetalleTransaccion.findAll.mockResolvedValue([]);

            const response = await request(app)
                .delete('/transacciones/1/detalles')
                .send({ usuario_id: 1 });

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ 
                message: 'No se encontraron detalles de transacción para eliminar' 
            });
        });

        test('debe retornar 404 cuando la transacción no existe', async () => {
            db.Transaccion.findByPk.mockResolvedValue(null);

            const response = await request(app)
                .delete('/transacciones/999/detalles')
                .send({ usuario_id: 1 });

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'No se encontró la transacción' });
        });
    });

    describe('Edge Cases y Validaciones', () => {
        test('debe manejar parámetros inválidos en getTransaccionById', async () => {
            // Este test verifica que el controller maneje IDs inválidos
            db.Transaccion.findByPk.mockResolvedValue(null);

            const response = await request(app).get('/transacciones/invalid-id');

            expect(response.status).toBe(404);
            expect(db.Transaccion.findByPk).toHaveBeenCalledWith('invalid-id', expect.any(Object));
        });

        test('debe manejar casos donde el usuario_id es undefined en operaciones de auditoría', async () => {
            const mockTransaccion = {
                id: 1,
                save: jest.fn().mockResolvedValue(true)
            };

            db.Transaccion.findByPk.mockResolvedValue(mockTransaccion);
            auditLogService.createAuditLog.mockResolvedValue(true);

            const response = await request(app)
                .put('/transacciones/1')
                .send({ descripcion: 'Sin usuario_id' }); // Sin usuario_id

            expect(response.status).toBe(200);
            expect(auditLogService.createAuditLog).toHaveBeenCalledWith(
                'UPDATE', 
                undefined, 
                'Transacciones', 
                1
            );
        });
    });
});
