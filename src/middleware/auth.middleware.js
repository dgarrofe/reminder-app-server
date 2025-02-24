const admin = require('firebase-admin');
const { logger } = require('../utils/logger');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'NO_TOKEN',
        message: 'No se proporcionó token de autenticación'
      });
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      req.decodedToken = decodedToken;
      next();
    } catch (firebaseError) {
      logger.error('Error verificando token:', firebaseError);
      
      if (firebaseError.code === 'auth/id-token-expired') {
        return res.status(401).json({
          error: 'TOKEN_EXPIRED',
          message: 'El token ha expirado. Por favor, vuelve a iniciar sesión'
        });
      }

      return res.status(401).json({
        error: 'INVALID_TOKEN',
        message: 'Token inválido o mal formado'
      });
    }
  } catch (error) {
    logger.error('Error en middleware de autenticación:', error);
    res.status(500).json({
      error: 'AUTH_ERROR',
      message: 'Error en la autenticación'
    });
  }
};

module.exports = { authMiddleware }; 