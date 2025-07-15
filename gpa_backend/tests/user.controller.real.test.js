const request = require('supertest');
const express = require('express');

// Configurar la aplicación de prueba
const app = express();
app.use(express.json());

// Mock de los modelos antes de importar el controller
jest.mock('../models/', () => ({
  User: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  },
  Role: {
    findByPk: jest.fn(),
    findAll: jest.fn()
  }
}));

// Mock de servicios adicionales
jest.mock('../services/audit_log.service', () => ({
  createAuditLog: jest.fn().mockResolvedValue({})
}));

jest.mock('sha1', () => jest.fn((password) => `hashed_${password}`));

const { User, Role } = require('../models/');
const userController = require('../controllers/user.controller');

// Configurar rutas usando los nombres reales de las funciones
app.get('/users', userController.getAllUsers);
app.get('/users/:id', userController.getUserById);
app.post('/users/register', userController.registerUser);
app.put('/users/:id', userController.updateUser);
app.put('/users/:id/role', userController.changeUserRole);
app.post('/users/login', userController.loginUser);

describe('User Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /users - getAllUsers', () => {
    it('should return all users successfully', async () => {
      // Arrange
      const mockUsers = [
        global.mockFactory.user({ id: 1, username: 'admin' }),
        global.mockFactory.user({ id: 2, username: 'user1' })
      ];
      
      User.findAll.mockResolvedValue(mockUsers);

      // Act
      const response = await request(app).get('/users');

      // Assert
      expect(response.status).toBe(200);
      expect(User.findAll).toHaveBeenCalledWith({
        include: [{ model: Role, as: 'role' }]
      });
      expect(response.body).toEqual(expect.arrayContaining([
        expect.objectContaining({ username: 'admin' }),
        expect.objectContaining({ username: 'user1' })
      ]));
    });

    it('should handle database errors', async () => {
      // Arrange
      User.findAll.mockRejectedValue(new Error('Database connection failed'));

      // Act
      const response = await request(app).get('/users');

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message', 'Internal server error');
    });
  });

  describe('GET /users/:id - getUserById', () => {
    it('should return user when found', async () => {
      // Arrange
      const mockUser = global.mockFactory.user({ id: 1 });
      User.findByPk.mockResolvedValue(mockUser);

      // Act
      const response = await request(app).get('/users/1');

      // Assert
      expect(response.status).toBe(200);
      expect(User.findByPk).toHaveBeenCalledWith('1', {
        include: [{ model: Role, as: 'role' }]
      });
      expect(response.body).toEqual(expect.objectContaining({
        id: 1,
        username: 'testuser'
      }));
      // Password should be undefined
      expect(response.body.password).toBeUndefined();
    });

    it('should return 404 when user not found', async () => {
      // Arrange
      User.findByPk.mockResolvedValue(null);

      // Act
      const response = await request(app).get('/users/999');

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'User not found');
    });
  });

  describe('POST /users/register - registerUser', () => {
    it('should register user successfully with valid data', async () => {
      // Arrange
      const userData = global.testHelpers.createTestUser();
      const mockCreatedUser = {
        ...global.mockFactory.user(userData),
        password: `hashed_${userData.password}`
      };
      
      Role.findByPk.mockResolvedValue({ id: 1, name: 'User' });
      User.findOne.mockResolvedValue(null); // Usuario no existe
      User.create.mockResolvedValue(mockCreatedUser);

      // Act
      const response = await request(app)
        .post('/users/register')
        .send(userData);

      // Assert
      expect(response.status).toBe(201);
      expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
        username: userData.username,
        email: userData.email,
        password: `hashed_${userData.password}`
      }));
      expect(response.body).toEqual(expect.objectContaining({
        username: userData.username
      }));
    });

    it('should return 400 when username already exists', async () => {
      // Arrange
      const userData = global.testHelpers.createTestUser();
      User.findOne.mockResolvedValue(global.mockFactory.user()); // Usuario ya existe

      // Act
      const response = await request(app)
        .post('/users/register')
        .send(userData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Usuario ya existe');
      expect(User.create).not.toHaveBeenCalled();
    });

    it('should return 404 for invalid role_id', async () => {
      // Arrange
      const userData = {
        ...global.testHelpers.createTestUser(),
        role_id: 999 // Role no existe
      };
      
      User.findOne.mockResolvedValue(null);
      Role.findByPk.mockResolvedValue(null); // Role no encontrado

      // Act
      const response = await request(app)
        .post('/users/register')
        .send(userData);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Rol no encontrado');
    });

    it('should return 400 for invalid user data', async () => {
      // Arrange
      const invalidUserData = {
        username: 'ab', // Muy corto
        email: 'invalid-email',
        password: '123' // Muy corto
      };

      // Act
      const response = await request(app)
        .post('/users/register')
        .send(invalidUserData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /users/login - loginUser', () => {
    it('should login user successfully with valid credentials', async () => {
      // Arrange
      const loginData = {
        username: 'testuser',
        password: 'password123'
      };
      
      const mockUser = {
        ...global.mockFactory.user(),
        password: 'hashed_password123'
      };
      
      User.findOne.mockResolvedValue(mockUser);

      // Act
      const response = await request(app)
        .post('/users/login')
        .send(loginData);

      // Assert
      expect(response.status).toBe(200);
      expect(User.findOne).toHaveBeenCalledWith({
        where: { username: loginData.username }
      });
      expect(response.body).toEqual(expect.objectContaining({
        username: mockUser.username
      }));
    });

    it('should return 401 for invalid username', async () => {
      // Arrange
      const loginData = {
        username: 'nonexistent',
        password: 'password123'
      };
      
      User.findOne.mockResolvedValue(null); // Usuario no existe

      // Act
      const response = await request(app)
        .post('/users/login')
        .send(loginData);

      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Usuario o contraseña invalidos');
    });
  });

  describe('PUT /users/:id - updateUser', () => {
    it('should update user successfully', async () => {
      // Arrange
      const userId = 1;
      const updateData = { 
        fullname: 'Updated Name',
        user_edit_id: 2 // ID del usuario que está editando
      };
      const existingUser = {
        ...global.mockFactory.user({ id: userId }),
        save: jest.fn().mockResolvedValue()
      };
      const editingUser = {
        ...global.mockFactory.user({ id: 2, role_id: 1 }),
        role: { id: 1, level: 1 }
      };
      
      User.findByPk.mockImplementation((id) => {
        if (id == userId) return Promise.resolve(existingUser);
        if (id == 2) return Promise.resolve(editingUser);
        return Promise.resolve(null);
      });

      // Act
      const response = await request(app)
        .put(`/users/${userId}`)
        .send(updateData);

      // Assert
      expect(response.status).toBe(200);
      expect(existingUser.save).toHaveBeenCalled();
      expect(response.body).toEqual(expect.objectContaining({
        id: userId
      }));
    });

    it('should return 400 when user_edit_id is missing', async () => {
      // Arrange
      const updateData = { fullname: 'New Name' }; // Sin user_edit_id

      // Act
      const response = await request(app)
        .put('/users/1')
        .send(updateData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'ID de usuario que edita es requerido');
    });

    it('should return 404 when updating non-existent user', async () => {
      // Arrange
      const updateData = { 
        fullname: 'New Name',
        user_edit_id: 2
      };
      
      User.findByPk.mockResolvedValue(null);

      // Act
      const response = await request(app)
        .put('/users/999')
        .send(updateData);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Usuario no encontrado');
    });
  });

  describe('PUT /users/:id/role - changeUserRole', () => {
    it('should change user role successfully', async () => {
      // Arrange
      const userId = 1;
      const roleData = { 
        role_id: 2,
        user_edit_id: 3 // Usuario con permisos para editar
      };
      const existingUser = {
        ...global.mockFactory.user({ id: userId, role_id: 1 }),
        role: { id: 1, level: 5 }, // Role de nivel bajo
        save: jest.fn().mockResolvedValue()
      };
      const newRole = { id: 2, level: 3 }; // Role de nivel más alto
      
      User.findByPk.mockResolvedValue(existingUser);
      Role.findByPk.mockResolvedValue(newRole);

      // Act
      const response = await request(app)
        .put(`/users/${userId}/role`)
        .send(roleData);

      // Assert
      expect(response.status).toBe(200);
      expect(Role.findByPk).toHaveBeenCalledWith(roleData.role_id);
      expect(existingUser.save).toHaveBeenCalled();
      expect(existingUser.role_id).toBe(newRole.id);
    });

    it('should return 400 when user_edit_id is missing', async () => {
      // Arrange
      const roleData = { role_id: 2 }; // Sin user_edit_id

      // Act
      const response = await request(app)
        .put('/users/1/role')
        .send(roleData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'ID de usuario que edita es requerido');
    });

    it('should return 404 for invalid role_id', async () => {
      // Arrange
      const userId = 1;
      const roleData = { 
        role_id: 999,
        user_edit_id: 2
      };
      const existingUser = {
        ...global.mockFactory.user({ id: userId }),
        role: { id: 1, level: 5 }
      };
      
      User.findByPk.mockResolvedValue(existingUser);
      Role.findByPk.mockResolvedValue(null); // Role no existe

      // Act
      const response = await request(app)
        .put(`/users/${userId}/role`)
        .send(roleData);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Rol no encontrado');
    });

    it('should return 403 when trying to assign role with equal or higher level', async () => {
      // Arrange
      const userId = 1;
      const roleData = { 
        role_id: 2,
        user_edit_id: 3
      };
      const existingUser = {
        ...global.mockFactory.user({ id: userId, role_id: 1 }),
        role: { id: 1, level: 2 }, // Role actual de nivel 2
        save: jest.fn().mockResolvedValue()
      };
      const newRole = { id: 2, level: 3 }; // Role objetivo de nivel 3 (<=)
      
      User.findByPk.mockResolvedValue(existingUser);
      Role.findByPk.mockResolvedValue(newRole);

      // Act
      const response = await request(app)
        .put(`/users/${userId}/role`)
        .send(roleData);

      // Assert
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', 'No tienes permisos para cambiar el rol a un nivel superior o igual al actual');
    });
  });
});
