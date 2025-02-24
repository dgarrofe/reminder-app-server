const Task = require('../models/task.model');
const Category = require('../models/category.model');
const { logger } = require('../utils/logger');

const createTask = async (req, res) => {
  try {
    const { title, dueIn, categoryId } = req.body;
    
    const task = new Task({
      title,
      dueIn: dueIn ? new Date(dueIn.split('/').reverse().join('-')) : null,
      userId: req.user._id,
      categoryId
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    logger.error('Error creando tarea:', error);
    res.status(500).json({ message: 'Error al crear la tarea' });
  }
};

const getTasks = async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.user._id });
    const tasks = await Task.find({ userId: req.user._id });

    const response = {
      categories: categories.map(category => ({
        id: category._id,
        title: category.title,
        color: category.color,
        tasks: tasks
          .filter(task => task.categoryId?.toString() === category._id.toString())
          .map(task => ({
            id: task._id,
            title: task.title,
            completed: task.completed,
            dueIn: task.dueIn ? task.dueIn.toLocaleDateString('es-ES') : undefined
          }))
      }))
    };

    res.json(response);
  } catch (error) {
    logger.error('Error obteniendo tareas:', error);
    res.status(500).json({ message: 'Error al obtener las tareas' });
  }
};

module.exports = {
  createTask,
  getTasks
}; 