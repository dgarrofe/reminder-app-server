const admin = require('firebase-admin');
const { logger } = require('../utils/logger');

const initializeFirebase = () => {
  try {
    // Asegurarnos de que la app no esté ya inicializada
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        })
      });
      logger.info('Firebase inicializado correctamente');
    }
  } catch (error) {
    logger.error('Error inicializando Firebase:', error);
    throw error;
  }
};

module.exports = { initializeFirebase }; 