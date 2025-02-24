const express = require('express');
const { body } = require('express-validator');
const { authMiddleware } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validator.middleware');
const Task = require('../models/task.model');

const router = express.Router();

router.use(authMiddleware);

router.post('/', [
  body('title').notEmpty().withMessage('El título es requerido'),
  body('dueIn').optional().matches(/^\d{2}\/\d{2}\/\d{4}$/).withMessage('Formato de fecha inválido'),
  validateRequest
], async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      userId: req.decodedToken.uid // Usamos directamente el uid de Firebase
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error creando tarea' });
  }
});

router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.decodedToken.uid });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo tareas' });
  }
});

module.exports = router; 