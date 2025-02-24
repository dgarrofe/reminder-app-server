const express = require('express');
const { body } = require('express-validator');
const { authMiddleware } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validator.middleware');
const { createTask, getTasks } = require('../controllers/tasks.controller');

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

router.post('/', [
  body('title').notEmpty().withMessage('El título es requerido'),
  body('dueIn').optional().matches(/^\d{2}\/\d{2}\/\d{4}$/).withMessage('Formato de fecha inválido'),
  (req, res, next) => {
    const errors = validateRequest(req);
    if (errors) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: errors[0].msg,
        details: errors
      });
    }
    next();
  }
], createTask);

router.get('/', getTasks);

module.exports = router; 