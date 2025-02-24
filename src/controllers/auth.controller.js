const admin = require('firebase-admin');
const User = require('../models/user.model');
const { logger } = require('../utils/logger');

const signUp = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Email y password son requeridos'
      });
    }

    // Crear usuario en Firebase
    try {
      const userRecord = await admin.auth().createUser({
        email,
        password
      });

      // Crear usuario en nuestra base de datos
      const user = await User.create({
        email,
        firebaseUid: userRecord.uid
      });

      // Generar custom token
      const customToken = await admin.auth().createCustomToken(userRecord.uid);

      res.status(201).json({
        user: {
          id: user._id,
          email: user.email
        },
        customToken,
        message: "Usa este customToken para obtener un idToken usando Firebase Auth en el cliente"
      });

    } catch (firebaseError) {
      // Manejar errores específicos de Firebase
      let errorResponse = {
        error: 'SIGNUP_ERROR',
        message: 'Error en el registro'
      };

      switch (firebaseError.code) {
        case 'auth/email-already-exists':
          errorResponse = {
            error: 'EMAIL_IN_USE',
            message: 'Este email ya está registrado'
          };
          break;
        case 'auth/invalid-email':
          errorResponse = {
            error: 'INVALID_EMAIL',
            message: 'El formato del email no es válido'
          };
          break;
        case 'auth/weak-password':
          errorResponse = {
            error: 'WEAK_PASSWORD',
            message: 'La contraseña debe tener al menos 6 caracteres'
          };
          break;
        default:
          logger.error('Error no manejado en registro:', firebaseError);
      }

      return res.status(400).json(errorResponse);
    }

  } catch (error) {
    logger.error('Error crítico en registro:', error);
    res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'Error interno del servidor'
    });
  }
};

const handleAuthUser = async (req, res) => {
  try {
    const { uid, email } = req.decodedToken;

    // Buscar o crear usuario
    let user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      try {
        user = await User.create({
          firebaseUid: uid,
          email: email
        });
      } catch (dbError) {
        logger.error('Error creando usuario en DB:', dbError);
        return res.status(500).json({
          error: 'DB_ERROR',
          message: 'Error creando usuario en la base de datos'
        });
      }
    }

    res.json({
      id: user._id,
      email: user.email
    });
  } catch (error) {
    logger.error('Error en autenticación:', error);
    res.status(500).json({
      error: 'AUTH_ERROR',
      message: 'Error en la autenticación'
    });
  }
};

module.exports = {
  signUp,
  handleAuthUser
}; 