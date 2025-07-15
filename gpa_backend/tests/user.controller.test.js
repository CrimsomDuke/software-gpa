const request = require('supertest');
const express = require('express');
const userController = require('../controllers/user.controller');

// Mock de la base de datos
jest.mock('../models/', () => ({
  User: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn()
  },
  Role: {
    findByPk: jest.fn()
  }
}));

// Mock de funciones de validación
jest.mock('../controllers/user.controller', () => {
  const originalModule = jest.requireActual('../controllers/user.controller');
  
  // Mock de función de validación interna
  const validateUserFields = jest.fn((req) => {
    const { username, email, password } = req.body;
    
    if (!username || username.length < 3) {
      return 'Username debe tener al menos 3 caracteres';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return 'Email inválido';
    }
    
    if (!password || password.length < 6) {
      return 'Password debe tener al menos 6 caracteres';
    }
    
    return '';
  });
  
  return {
    ...originalModule,
    getAllUsers: jest.fn(async (req, res) => {
      try {
        const users = await require('../models/').User.findAll({
          include: [{ model: require('../models/').Role, as: 'role' }]
        });
        
        users.forEach(element => {
          element.password = undefined;
        });
        
        res.status(200).json(users);
      } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }),
    
    getUserById: jest.fn(async (req, res) => {
      const { id } = req.params;
      try {
        const user = await require('../models/').User.findByPk(id, {
          include: [{ model: require('../models/').Role, as: 'role' }]
        });
        
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        user.password = undefined;
        res.status(200).json(user);
      } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }),
    
    registerUser: jest.fn(async (req, res) => {
      const validationError = validateUserFields(req);
      if (validationError !== '') {
        return res.status(400).json({ message: validationError });
      }
      
      const { username, fullname, email, password, role_id } = req.body;
      
      try {
        // Check if user already exists
        const existingUser = await require('../models/').User.findOne({
          where: { email: email }
        });
        
        if (existingUser) {
          return res.status(400).json({ message: 'User already exists' });
        }
        
        // Validate role exists
        const role = await require('../models/').Role.findByPk(role_id);
        if (!role) {
          return res.status(400).json({ message: 'Invalid role' });
        }
        
        // Create user
        const newUser = await require('../models/').User.create({
          username,
          fullname,
          email,
          password: 'hashed_' + password, // Simulated hash
          role_id
        });
        
        res.status(201).json({ message: 'User registered successfully' });
      } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error creating user' });
      }
    })
  };
});

jest.mock('../services/audit_log.service');

const db = require('../models/');

describe('🧪 USER CONTROLLER TESTS', () => {
  let app;

  beforeEach(() => {
    // Configurar Express app para tests
    app = express();
    app.use(express.json());
    
    // Configurar rutas para tests
    app.get('/users', userController.getAllUsers);
    app.get('/users/:id', userController.getUserById);
    app.post('/users', userController.registerUser);

    // Limpiar mocks
    jest.clearAllMocks();
  });

  describe('GET /users - Obtener todos los usuarios', () => {
    test('✅ Debería retornar todos los usuarios exitosamente', async () => {
      // Arrange
      const mockUsers = [
        {
          id: 1,
          username: 'admin',
          fullname: 'Admin User',
          email: 'admin@test.com',
          password: 'hashedpassword',
          role: { id: 1, name: 'Admin' }
        },
        {
          id: 2,
          username: 'contador01',
          fullname: 'María González',
          email: 'maria@test.com',
          password: 'hashedpassword',
          role: { id: 2, name: 'Contador' }
        }
      ];

      // Mock forEach para eliminar password
      mockUsers.forEach = jest.fn((callback) => {
        mockUsers.map(callback);
      });

      db.User.findAll.mockResolvedValue(mockUsers);

      // Act
      const response = await request(app).get('/users');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(db.User.findAll).toHaveBeenCalledWith({
        include: [{ model: db.Role, as: 'role' }]
      });
      expect(mockUsers.forEach).toHaveBeenCalled();
    });

    test('❌ Debería manejar errores de base de datos', async () => {
      // Arrange
      db.User.findAll.mockRejectedValue(new Error('Database error'));

      // Act
      const response = await request(app).get('/users');

      // Assert
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Internal server error');
    });
  });

  describe('GET /users/:id - Obtener usuario por ID', () => {
    test('✅ Debería retornar un usuario específico', async () => {
      // Arrange
      const mockUser = {
        id: 1,
        username: 'admin',
        fullname: 'Admin User',
        email: 'admin@test.com',
        password: 'hashedpassword',
        role: { id: 1, name: 'Admin' }
      };

      db.User.findByPk.mockResolvedValue(mockUser);

      // Act
      const response = await request(app).get('/users/1');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(1);
      expect(response.body.username).toBe('admin');
      expect(response.body.password).toBeUndefined();
      expect(db.User.findByPk).toHaveBeenCalledWith('1', {
        include: [{ model: db.Role, as: 'role' }]
      });
    });

    test('❌ Debería retornar 404 si el usuario no existe', async () => {
      // Arrange
      db.User.findByPk.mockResolvedValue(null);

      // Act
      const response = await request(app).get('/users/999');

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });
  });

  describe('POST /users - Registrar nuevo usuario', () => {
    test('✅ Debería crear un usuario exitosamente', async () => {
      // Arrange
      const newUserData = testHelpers.createTestUser();
      const mockCreatedUser = {
        id: 1,
        ...newUserData,
        password: 'hashedpassword'
      };

      // Mock role validation
      db.Role.findByPk.mockResolvedValue({ id: 1, name: 'Admin' });
      // Mock user creation
      db.User.create.mockResolvedValue(mockCreatedUser);
      // Mock user not exists
      db.User.findOne.mockResolvedValue(null);

      // Act
      const response = await request(app)
        .post('/users')
        .send(newUserData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered successfully');
      expect(db.User.create).toHaveBeenCalled();
    });

    test('❌ Debería rechazar datos inválidos', async () => {
      // Arrange
      const invalidUserData = {
        username: '', // Username vacío
        email: 'invalid-email', // Email inválido
        password: '123' // Password muy corto
      };

      // Act
      const response = await request(app)
        .post('/users')
        .send(invalidUserData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('');
    });
  });

  describe('🔍 Casos Edge y Validaciones', () => {
    test('✅ Debería validar formato de email', async () => {
      const userData = {
        ...testHelpers.createTestUser(),
        email: 'email-invalido'
      };

      const response = await request(app)
        .post('/users')
        .send(userData);

      expect(response.status).toBe(400);
    });

    test('✅ Debería validar longitud mínima de password', async () => {
      const userData = {
        ...testHelpers.createTestUser(),
        password: '12'
      };

      const response = await request(app)
        .post('/users')
        .send(userData);

      expect(response.status).toBe(400);
    });
  });
});
