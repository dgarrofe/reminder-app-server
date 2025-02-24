const { extractTasksFromText, suggestCategories } = require('../services/ai.service');
const Task = require('../models/task.model');
const Category = require('../models/category.model');
const { logger } = require('../utils/logger');

const processVoiceToTask = async (req, res) => {
  try {
    // Aquí iría la lógica para convertir el audio a texto
    const text = "texto transcrito del audio"; // Placeholder
    
    const tasks = await extractTasksFromText(text);
    
    // Crear las tareas detectadas
    const createdTasks = await Promise.all(
      tasks.map(task => {
        const newTask = new Task({
          title: task.title,
          dueIn: task.dueIn,
          userId: req.user._id
        });
        return newTask.save();
      })
    );

    res.json(createdTasks);
  } catch (error) {
    logger.error('Error en procesamiento de voz:', error);
    res.status(500).json({ message: 'Error procesando el audio' });
  }
};

const autoCategorize = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id, categoryId: null });
    
    if (tasks.length === 0) {
      return res.json({ message: 'No hay tareas para categorizar' });
    }

    const suggestedCategories = await suggestCategories(tasks);
    
    // Crear categorías y asignar tareas
    for (const category of suggestedCategories) {
      const newCategory = await Category.create({
        title: category.title,
        color: category.color,
        userId: req.user._id
      });

      await Task.updateMany(
        { 
          _id: { $in: category.taskIds },
          userId: req.user._id 
        },
        { categoryId: newCategory._id }
      );
    }

    res.json({ message: 'Tareas categorizadas exitosamente' });
  } catch (error) {
    logger.error('Error en auto-categorización:', error);
    res.status(500).json({ message: 'Error categorizando tareas' });
  }
};

module.exports = {
  processVoiceToTask,
  autoCategorize
}; 