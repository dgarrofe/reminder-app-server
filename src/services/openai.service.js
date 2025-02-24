const OpenAI = require('openai');
const { logger } = require('../utils/logger');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

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
  detectCategory
}; 