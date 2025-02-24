require('dotenv').config();
const OpenAI = require('openai');
const { logger } = require('../utils/logger');
const { createClient } = require("@deepgram/sdk");
const multer = require('multer');
const fs = require('fs').promises;

if (!process.env.OPENAI_API_KEY) {
  logger.error('OpenAI API Key no encontrada en las variables de entorno');
  throw new Error('OPENAI_API_KEY no está configurada');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY.trim()
});

if (!process.env.DEEPGRAM_API_KEY) {
  logger.error('Deepgram API Key no encontrada en las variables de entorno');
  throw new Error('DEEPGRAM_API_KEY no está configurada');
}

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

const transcribeAudio = async (audioBuffer, mimeType) => {
  try {
    logger.info('Transcribiendo audio...');
    const { result } = await deepgram.listen.prerecorded.transcribeFile(
      audioBuffer,
      {
        mimetype: mimeType,
        model: "general",
        language: "es",
        smart_format: true,
        punctuate: true,
      }
    );

    logger.info('Transcripción completada');
    
    // Verificar y acceder a la transcripción de manera segura
    if (!result?.results?.channels?.[0]?.alternatives?.[0]?.transcript) {
      logger.error('Estructura de respuesta inválida:', result);
      throw new Error('Formato de respuesta inesperado de Deepgram');
    }

    const transcript = result.results.channels[0].alternatives[0].transcript;
    logger.info('Transcripción:', transcript);
    
    return transcript;
  } catch (error) {
    logger.error('Error detallado en transcripción:', {
      message: error.message,
      stack: error.stack,
      result: error.result
    });
    throw new Error('Error transcribiendo el audio');
  }
};

const extractTasksFromText = async (text) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Eres un asistente que extrae tareas de un texto.
                   Analiza el texto y devuelve un array JSON de tareas.
                   Cada tarea DEBE tener:
                   - "title": string (obligatorio)
                   - "dueIn": string en formato DD/MM/YYYY (opcional)
                   
                   Ejemplo de respuesta:
                   [
                     {"title": "Comprar leche", "dueIn": "25/02/2024"},
                     {"title": "Llamar al médico"}
                   ]
                   
                   Si no hay tareas claras, devuelve un array vacío: []`
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.7,
      max_tokens: 150,
      response_format: { type: "json_object" }
    });

    let tasks = [];
    try {
      const content = completion.choices[0].message.content;
      const parsedContent = JSON.parse(content);
      tasks = Array.isArray(parsedContent) ? parsedContent : parsedContent.tasks || [];
      
      // Validar que cada tarea tenga un título
      tasks = tasks.filter(task => task && typeof task.title === 'string' && task.title.trim() !== '');
      
      logger.info('Tareas extraídas:', tasks);
    } catch (parseError) {
      logger.error('Error parseando respuesta de OpenAI:', parseError);
      tasks = [];
    }

    return {
      tasks,
      hasDetectedTasks: tasks.length > 0
    };
  } catch (error) {
    logger.error('Error en procesamiento de IA:', error);
    throw new Error('Error procesando el texto');
  }
};

const detectCategory = async (taskTitle, existingCategories) => {
  try {
    const categoriesText = existingCategories.length > 0 
      ? `Categorías existentes: ${existingCategories.map(c => c.title).join(', ')}.`
      : 'No hay categorías existentes.';

    const prompt = `
      Analiza el título de esta tarea: "${taskTitle}"
      ${categoriesText}
      
      Usa categorías amplias y generales (por ejemplo: viajes, administrativo, hogar, eventos, tecnología).
      Si el título coincide con alguna categoría existente, devuelve esa categoría.
      Si no coincide, sugiere una nueva categoría que sea corta, descriptiva y general.

      Responde solo con el nombre de la categoría, sin explicaciones adicionales.
      La respuesta debe ser una sola palabra en español y en minúsculas.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 10
    });

    return completion.choices[0].message.content.trim().toLowerCase();
  } catch (error) {
    logger.error('Error en OpenAI:', error);
    throw new Error('Error al detectar la categoría');
  }
};

module.exports = {
  extractTasksFromText,
  transcribeAudio,
  detectCategory
}; 