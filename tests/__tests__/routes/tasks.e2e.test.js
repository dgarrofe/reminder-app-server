const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../src/app');
const Task = require('../../../src/models/task.model');
const { generateTestToken } = require('../../helpers/auth');
const Category = require('../../../src/models/category.model');

describe('Tasks Routes', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    const testUser = { _id: new mongoose.Types.ObjectId(), email: 'test@test.com' };
    userId = testUser._id;
    authToken = await generateTestToken(testUser);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Task.deleteMany({});
  });

  describe('POST /api/tasks', () => {
    it('debería crear una nueva tarea', async () => {
      const taskData = {
        title: 'Tarea de prueba',
        dueIn: '01/01/2024'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('title', taskData.title);
    });

    it('debería fallar si falta el título', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/tasks', () => {
    it('debería obtener las tareas agrupadas por categorías', async () => {
      // Crear una categoría de prueba
      const category = await Category.create({
        title: 'Test Category',
        color: '#FF6B6B',
        userId
      });

      // Crear algunas tareas de prueba
      await Task.create([
        { 
          title: 'Tarea 1', 
          userId,
          categoryId: category._id,
          completed: false
        },
        { 
          title: 'Tarea 2', 
          userId,
          categoryId: category._id,
          completed: true
        }
      ]);

      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('categories');
      expect(Array.isArray(response.body.categories)).toBe(true);
      expect(response.body.categories[0]).toHaveProperty('tasks');
      expect(Array.isArray(response.body.categories[0].tasks)).toBe(true);
    });
  });
}); 