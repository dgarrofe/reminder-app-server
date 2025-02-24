const admin = require('firebase-admin');

const generateTestToken = async (user) => {
  // Si estamos en modo test, generamos un token falso
  if (process.env.NODE_ENV === 'test') {
    return 'test-token';
  }
  
  // En otro caso, usamos Firebase para generar un token real
  return admin.auth().createCustomToken(user.firebaseUid);
};

module.exports = { generateTestToken }; 