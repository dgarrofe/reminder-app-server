const express = require('express');
const { body } = require('express-validator');
const { authMiddleware } = require('../middleware/auth.middleware');
const { signUp, handleAuthUser } = require('../controllers/auth.controller');
const { validateRequest } = require('../middleware/validator.middleware');

const router = express.Router();

// Ruta para registro (no necesita autenticación)
router.post('/signup', [
  body('email')
    .isEmail()
    .withMessage('El formato del email no es válido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
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
], signUp);

// Ruta para verificar token/sesión
router.post('/verify', authMiddleware, handleAuthUser);

module.exports = router;