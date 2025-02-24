const { extractTasksFromText, suggestCategories } = require('../../../src/services/ai.service');

jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{
            message: {
              content: JSON.stringify([
                { title: 'Tarea de prueba', dueIn: '2024-01-01' }
              ])
            }
          }]
        })
      }
    }
  }))
}));

describe('AI Service', () => {
  describe('extractTasksFromText', () => {
    it('debería extraer tareas del texto correctamente', async () => {
      const text = 'Necesito comprar leche mañana';
      const result = await extractTasksFromText(text);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty('title');
    });

    it('debería manejar errores de la API', async () => {
      jest.spyOn(global.console, 'error').mockImplementation(() => {});
      
      const openai = require('openai');
      openai.OpenAI.mockImplementationOnce(() => ({
        chat: {
          completions: {
            create: jest.fn().mockRejectedValue(new Error('API Error'))
          }
        }
      }));

      await expect(extractTasksFromText('test')).rejects.toThrow('Error procesando el texto');
    });
  });
}); 