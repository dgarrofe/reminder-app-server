const admin = require('firebase-admin');
const { logger } = require('../utils/logger');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    // Verificar token y guardar la información decodificada
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.decodedToken = decodedToken;
    next();
  } catch (error) {
    logger.error('Error en autenticación:', error);
    res.status(401).json({ message: 'Token inválido' });
  }
};

module.exports = { authMiddleware }; 