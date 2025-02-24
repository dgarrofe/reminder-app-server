require('dotenv').config();
const OpenAI = require('openai');
const { logger } = require('../utils/logger');

if (!process.env.OPENAI_API_KEY) {
  logger.error('OpenAI API Key no encontrada en las variables de entorno');
  throw new Error('OPENAI_API_KEY no está configurada');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY.trim() // Asegurarnos de que no hay espacios
});

const extractTasksFromText = async (text) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Eres un asistente que extrae tareas de un texto. Devuelve un array JSON de tareas con título y fecha si se menciona."
        },
        {
          role: "user",
          content: text
        }
      ]
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    logger.error('Error en procesamiento de IA:', error);
    throw new Error('Error procesando el texto');
  }
};

const suggestCategories = async (tasks) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Categoriza las siguientes tareas en grupos lógicos. Devuelve un array JSON con título y color para cada categoría."
        },
        {
          role: "user",
          content: JSON.stringify(tasks)
        }
      ]
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    logger.error('Error en categorización:', error);
    throw new Error('Error categorizando tareas');
  }
};

module.exports = {
  extractTasksFromText,
  suggestCategories
}; 