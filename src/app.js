require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { errorHandler } = require('./middleware/error.middleware');
const { logger } = require('./utils/logger');
const { initializeFirebase } = require('./config/firebase.config');

// Inicializar Firebase
initializeFirebase();

// Rutas
const authRoutes = require('./routes/auth.routes');
const tasksRoutes = require('./routes/tasks.routes');
const aiRoutes = require('./routes/ai.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Documentación Swagger (opcional)
try {
  const swaggerUi = require('swagger-ui-express');
  const swaggerDocument = require('./swagger.json');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (error) {
  logger.warn('Swagger documentation not available');
}

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api', aiRoutes);

// Manejo de errores
app.use(errorHandler);

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => logger.info('Conectado a MongoDB'))
  .catch((err) => logger.error('Error conectando a MongoDB:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Servidor corriendo en puerto ${PORT}`);
});

module.exports = app; 