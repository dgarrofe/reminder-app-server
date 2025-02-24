const { transcribeAudio, extractTasksFromText } = require('../services/ai.service');
const { createTask } = require('./tasks.controller');
const { logger } = require('../utils/logger');
const multer = require('multer');

// Configuración de multer para manejar archivos de audio
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB límite
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Formato de archivo no soportado'));
    }
  }
}).single('audio');

const processVoiceToTask = async (req, res) => {
  try {
    // Manejar la subida del archivo
    upload(req, res, async (err) => {
      if (err) {
        logger.error('Error en upload:', err);
        return res.status(400).json({
          error: 'UPLOAD_ERROR',
          message: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          error: 'NO_AUDIO',
          message: 'No se ha proporcionado archivo de audio'
        });
      }

      try {
        // Transcribir el audio a texto
        const transcribedText = await transcribeAudio(
          req.file.buffer,
          req.file.mimetype
        );

        // Extraer tareas del texto
        const { tasks, hasDetectedTasks } = await extractTasksFromText(transcribedText);

        if (!hasDetectedTasks) {
          return res.status(200).json({
            message: 'No se detectaron tareas en el audio',
            transcribedText
          });
        }

        // Crear las tareas usando createTask
        const createdTasks = await Promise.all(
          tasks.map(async task => {
            // Simular el objeto req necesario para createTask
            const taskReq = {
              body: {
                title: task.title,
                dueIn: task.dueIn
              },
              decodedToken: req.decodedToken
            };

            // Simular el objeto res para capturar la respuesta
            const taskRes = {
              status: function(code) {
                this.statusCode = code;
                return this;
              },
              json: function(data) {
                this.data = data;
                return this;
              }
            };

            await createTask(taskReq, taskRes);
            return taskRes.data;
          })
        );

        res.status(201).json({
          message: 'Tareas creadas exitosamente',
          transcribedText,
          tasks: createdTasks
        });

      } catch (processingError) {
        logger.error('Error procesando audio:', processingError);
        res.status(500).json({
          error: 'PROCESSING_ERROR',
          message: 'Error procesando el audio'
        });
      }
    });
  } catch (error) {
    logger.error('Error en processVoiceToTask:', error);
    res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  processVoiceToTask
}; 