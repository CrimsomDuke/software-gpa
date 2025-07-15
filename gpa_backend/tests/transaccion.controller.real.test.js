const transaccionController = require('../controllers/transaccion.controller');
const db = require('../models');
const auditLogService = require('../services/audit_log.service');

// Mock de las dependencias
jest.mock('../models');
jest.mock('../services/audit_log.service');

// Configurar mocks de los modelos
beforeAll(() => {
  // Mock de Transaccion
  db.Transaccion = {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  };

  // Mock de DetalleTransaccion
  db.DetalleTransaccion = {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    destroy: jest.fn()
  };

  // Mock de otros modelos relacionados
  db.PeriodoFiscal = {};
  db.User = {};
});

describe('Transaccion Controller', () => {
  let req, res, mockTransaccion, mockDetalleTransaccion;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    req = {
      params: {},
      body: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    // Mock objects
    mockTransaccion = {
      id: 1,
      referencia: 'SAO-TXN-123456-1234',
      descripcion: 'Transacción de prueba',
      fecha: new Date('2024-01-15'),
      tipo_transaccion: 'OPERACIONAL',
      es_generado_sistema: false,
      periodo_fiscal_id: 1,
      usuario_id: 1,
      save: jest.fn().mockResolvedValue(true),
      destroy: jest.fn().mockResolvedValue(true)
    };

    mockDetalleTransaccion = {
      id: 1,
      debito: 1000000,
      credito: 0,
      descripcion: 'Débito de prueba',
      transaccion_id: 1,
      cuenta_id: 1
    };

    // Setup default mocks
    db.Transaccion.findAll.mockResolvedValue([mockTransaccion]);
    db.Transaccion.findByPk.mockResolvedValue(mockTransaccion);
    db.Transaccion.create.mockResolvedValue(mockTransaccion);
    db.DetalleTransaccion.create.mockResolvedValue(mockDetalleTransaccion);
    db.DetalleTransaccion.destroy.mockResolvedValue(1);
    auditLogService.createAuditLog.mockResolvedValue(true);
  });

  describe('GET /transacciones - getAllTransacciones', () => {
    it('should return all transacciones successfully', async () => {
      await transaccionController.getAllTransacciones(req, res);

      expect(db.Transaccion.findAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([mockTransaccion]);
    });

    it('should handle database errors', async () => {
      db.Transaccion.findAll.mockRejectedValue(new Error('Database error'));

      await transaccionController.getAllTransacciones(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error obteniendo transacciones' });
    });
  });

  describe('GET /transacciones/:id - getTransaccionById', () => {
    it('should return transaccion when found', async () => {
      req.params.id = '1';

      await transaccionController.getTransaccionById(req, res);

      expect(db.Transaccion.findByPk).toHaveBeenCalledWith('1', {
        include: [
          { model: db.DetalleTransaccion, as: 'detalles' },
          { model: db.PeriodoFiscal, as: 'periodo_fiscal' },
          { model: db.User, as: 'usuario' }
        ]
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTransaccion);
    });

    it('should return 404 when transaccion not found', async () => {
      req.params.id = '999';
      db.Transaccion.findByPk.mockResolvedValue(null);

      await transaccionController.getTransaccionById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'No se encontró la transacción' });
    });
  });

  describe('POST /transacciones - createTransaccion', () => {
    beforeEach(() => {
      req.body = {
        descripcion: 'Transacción de prueba',
        fecha: '2024-01-15',
        tipo_transaccion: 'OPERACIONAL',
        periodo_fiscal_id: 1,
        usuario_id: 1,
        transaccion_detalles: [
          {
            cuenta_id: 1,
            debito: 1000000,
            credito: 0,
            descripcion: 'Débito de prueba'
          },
          {
            cuenta_id: 2,
            debito: 0,
            credito: 1000000,
            descripcion: 'Crédito de prueba'
          }
        ]
      };
    });

    it('should create transaccion successfully with valid data', async () => {
      await transaccionController.createTransaccion(req, res);

      expect(db.Transaccion.create).toHaveBeenCalledWith(expect.objectContaining({
        descripcion: req.body.descripcion,
        fecha: req.body.fecha,
        tipo_transaccion: req.body.tipo_transaccion,
        es_generado_sistema: false,
        periodo_fiscal_id: req.body.periodo_fiscal_id,
        usuario_id: req.body.usuario_id
      }));
      expect(db.DetalleTransaccion.create).toHaveBeenCalledTimes(2);
      expect(auditLogService.createAuditLog).toHaveBeenCalledWith('CREATE', 1, 'Transacciones', 1);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should return 400 for missing required fields', async () => {
      req.body = { descripcion: 'Solo descripción' };

      await transaccionController.createTransaccion(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Validation errors',
        errors: expect.objectContaining({
          fecha: 'Fecha es requerido',
          tipo_transaccion: 'Tipo de transaccion es requerido',
          periodo_fiscal_id: 'Periodo fiscal es requerido',
          usuario_id: 'Usuario es requerido'
        })
      });
    });

    it('should return 400 for missing transaction details', async () => {
      req.body.transaccion_detalles = [];

      await transaccionController.createTransaccion(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        errors: 'La transacción debe tener al menos un detalle'
      });
    });

    it('should return 400 for unbalanced debits and credits', async () => {
      req.body.transaccion_detalles = [
        {
          cuenta_id: 1,
          debito: 1000000,
          credito: 0
        },
        {
          cuenta_id: 2,
          debito: 0,
          credito: 500000 // Desbalanceado
        }
      ];

      await transaccionController.createTransaccion(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        errors: 'Los débitos y créditos deben estar balanceados',
        details: {
          totalDebito: 1000000,
          totalCredito: 500000
        }
      });
    });

    it('should return 400 for detail without debito or credito', async () => {
      req.body.transaccion_detalles = [
        {
          cuenta_id: 1,
          debito: 0,
          credito: 0
        }
      ];

      await transaccionController.createTransaccion(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        errors: 'El detalle en posición 1 debe tener débito o crédito'
      });
    });

    it('should return 400 for detail with both debito and credito', async () => {
      req.body.transaccion_detalles = [
        {
          cuenta_id: 1,
          debito: 500000,
          credito: 500000
        }
      ];

      await transaccionController.createTransaccion(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        errors: 'El detalle en posición 1 no puede tener débito y crédito simultáneamente'
      });
    });

    it('should handle database errors during creation', async () => {
      db.Transaccion.create.mockRejectedValue(new Error('Database error'));

      await transaccionController.createTransaccion(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error al crear la transacción: Database error',
        error: expect.any(Error)
      });
    });
  });

  describe('PUT /transacciones/:id - updateTransaccion', () => {
    beforeEach(() => {
      req.params.id = '1';
      req.body = {
        descripcion: 'Descripción actualizada',
        fecha: '2024-01-20',
        tipo_transaccion: 'AJUSTE',
        periodo_fiscal_id: 2,
        usuario_id: 2
      };
    });

    it('should update transaccion successfully', async () => {
      await transaccionController.updateTransaccion(req, res);

      expect(db.Transaccion.findByPk).toHaveBeenCalledWith('1');
      expect(mockTransaccion.save).toHaveBeenCalled();
      expect(auditLogService.createAuditLog).toHaveBeenCalledWith('UPDATE', 2, 'Transacciones', 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTransaccion);
    });

    it('should return 404 when updating non-existent transaccion', async () => {
      db.Transaccion.findByPk.mockResolvedValue(null);

      await transaccionController.updateTransaccion(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'No se encontró la transacción' });
    });

    it('should handle database errors during update', async () => {
      mockTransaccion.save.mockRejectedValue(new Error('Database error'));

      await transaccionController.updateTransaccion(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error al actualizar la transacción: Database error',
        error: expect.any(Error)
      });
    });

    it('should update only provided fields', async () => {
      req.body = { descripcion: 'Solo descripción nueva' };

      await transaccionController.updateTransaccion(req, res);

      expect(mockTransaccion.descripcion).toBe('Solo descripción nueva');
      expect(mockTransaccion.save).toHaveBeenCalled();
    });
  });

  describe('DELETE /transacciones/:id - deleteTransaccion', () => {
    beforeEach(() => {
      req.params.id = '1';
      req.body = { usuario_id: 1 };
    });

    it('should delete transaccion successfully', async () => {
      await transaccionController.deleteTransaccion(req, res);

      expect(db.Transaccion.findByPk).toHaveBeenCalledWith('1');
      expect(db.DetalleTransaccion.destroy).toHaveBeenCalledWith({
        where: { transaccion_id: '1' }
      });
      expect(mockTransaccion.destroy).toHaveBeenCalled();
      expect(auditLogService.createAuditLog).toHaveBeenCalledWith('DELETE', 1, 'Transacciones', 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Transacción eliminada exitosamente',
        data: mockTransaccion
      });
    });

    it('should return 404 when deleting non-existent transaccion', async () => {
      db.Transaccion.findByPk.mockResolvedValue(null);

      await transaccionController.deleteTransaccion(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'No se encontró la transacción' });
    });

    it('should handle database errors during deletion', async () => {
      mockTransaccion.destroy.mockRejectedValue(new Error('Database error'));

      await transaccionController.deleteTransaccion(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Error al eliminar la transacción: Database error',
        error: expect.any(Error)
      });
    });
  });

  describe('Business Logic Tests', () => {
    it('should generate unique transaction reference', async () => {
      req.body = {
        descripcion: 'Test',
        fecha: '2024-01-15',
        tipo_transaccion: 'OPERACIONAL',
        periodo_fiscal_id: 1,
        usuario_id: 1,
        transaccion_detalles: [
          { cuenta_id: 1, debito: 1000000, credito: 0 },
          { cuenta_id: 2, debito: 0, credito: 1000000 }
        ]
      };

      await transaccionController.createTransaccion(req, res);

      expect(db.Transaccion.create).toHaveBeenCalledWith(
        expect.objectContaining({
          referencia: expect.stringMatching(/^SAO-TXN-\d{6}-\d{4}$/)
        })
      );
    });

    it('should validate accounting equation balance', async () => {
      req.body = {
        descripcion: 'Test',
        fecha: '2024-01-15',
        tipo_transaccion: 'OPERACIONAL',
        periodo_fiscal_id: 1,
        usuario_id: 1,
        transaccion_detalles: [
          { cuenta_id: 1, debito: 1000000, credito: 0 },
          { cuenta_id: 2, debito: 0, credito: 800000 }, // Desbalanceado
          { cuenta_id: 3, debito: 0, credito: 100000 }  // Desbalanceado
        ]
      };

      await transaccionController.createTransaccion(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        errors: 'Los débitos y créditos deben estar balanceados',
        details: {
          totalDebito: 1000000,
          totalCredito: 900000
        }
      });
    });

    it('should validate positive amounts in details', async () => {
      req.body = {
        descripcion: 'Test',
        fecha: '2024-01-15',
        tipo_transaccion: 'OPERACIONAL',
        periodo_fiscal_id: 1,
        usuario_id: 1,
        transaccion_detalles: [
          { cuenta_id: 1, debito: -1000000, credito: 0 } // Negativo
        ]
      };

      await transaccionController.createTransaccion(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        errors: 'El detalle en posición 1 debe tener valores positivos'
      });
    });

    it('should ensure transaction has at least one detail', async () => {
      req.body = {
        descripcion: 'Test',
        fecha: '2024-01-15',
        tipo_transaccion: 'OPERACIONAL',
        periodo_fiscal_id: 1,
        usuario_id: 1,
        transaccion_detalles: undefined
      };

      await transaccionController.createTransaccion(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        errors: 'La transacción debe tener al menos un detalle'
      });
    });
  });
});
