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

const { User, Role } = require('../models/');
const userController = require('../controllers/user.controller');

// Configurar rutas
app.get('/users', userController.getAllUsers);
app.get('/users/:id', userController.getUserById);
app.post('/users', userController.createUser);
app.put('/users/:id', userController.updateUser);
app.delete('/users/:id', userController.deleteUser);

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
      expect(response.body).toHaveProperty('message');
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
    });

    it('should return 404 when user not found', async () => {
      // Arrange
      User.findByPk.mockResolvedValue(null);

      // Act
      const response = await request(app).get('/users/999');

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /users - createUser', () => {
    it('should create user successfully with valid data', async () => {
      // Arrange
      const userData = global.testHelpers.createTestUser();
      const mockCreatedUser = global.mockFactory.user(userData);
      
      Role.findByPk.mockResolvedValue({ id: 1, name: 'User' });
      User.findOne.mockResolvedValue(null); // Usuario no existe
      User.create.mockResolvedValue(mockCreatedUser);

      // Act
      const response = await request(app)
        .post('/users')
        .send(userData);

      // Assert
      expect(response.status).toBe(201);
      expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
        username: userData.username,
        email: userData.email
      }));
      expect(response.body).toEqual(expect.objectContaining({
        username: userData.username
      }));
    });

    it('should return 400 for invalid email format', async () => {
      // Arrange
      const invalidUserData = {
        ...global.testHelpers.createTestUser(),
        email: 'invalid-email'
      };

      // Act
      const response = await request(app)
        .post('/users')
        .send(invalidUserData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for missing required fields', async () => {
      // Arrange
      const incompleteUserData = {
        username: 'test'
        // Missing email, password, etc.
      };

      // Act
      const response = await request(app)
        .post('/users')
        .send(incompleteUserData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 when username already exists', async () => {
      // Arrange
      const userData = global.testHelpers.createTestUser();
      User.findOne.mockResolvedValue(global.mockFactory.user()); // Usuario ya existe

      // Act
      const response = await request(app)
        .post('/users')
        .send(userData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(User.create).not.toHaveBeenCalled();
    });
  });

  describe('PUT /users/:id - updateUser', () => {
    it('should update user successfully', async () => {
      // Arrange
      const userId = 1;
      const updateData = { fullname: 'Updated Name' };
      const existingUser = global.mockFactory.user({ id: userId });
      
      User.findByPk.mockResolvedValue(existingUser);
      User.update.mockResolvedValue([1]); // Number of affected rows

      // Act
      const response = await request(app)
        .put(`/users/${userId}`)
        .send(updateData);

      // Assert
      expect(response.status).toBe(200);
      expect(User.update).toHaveBeenCalledWith(
        updateData,
        { where: { id: userId.toString() } }
      );
      expect(response.body).toHaveProperty('message');
    });

    it('should return 404 when updating non-existent user', async () => {
      // Arrange
      User.findByPk.mockResolvedValue(null);

      // Act
      const response = await request(app)
        .put('/users/999')
        .send({ fullname: 'New Name' });

      // Assert
      expect(response.status).toBe(404);
      expect(User.update).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /users/:id - deleteUser', () => {
    it('should delete user successfully', async () => {
      // Arrange
      const userId = 1;
      const existingUser = global.mockFactory.user({ id: userId });
      
      User.findByPk.mockResolvedValue(existingUser);
      User.destroy.mockResolvedValue(1); // Number of affected rows

      // Act
      const response = await request(app).delete(`/users/${userId}`);

      // Assert
      expect(response.status).toBe(200);
      expect(User.destroy).toHaveBeenCalledWith({ where: { id: userId.toString() } });
      expect(response.body).toHaveProperty('message');
    });

    it('should return 404 when deleting non-existent user', async () => {
      // Arrange
      User.findByPk.mockResolvedValue(null);

      // Act
      const response = await request(app).delete('/users/999');

      // Assert
      expect(response.status).toBe(404);
      expect(User.destroy).not.toHaveBeenCalled();
    });
  });
});
