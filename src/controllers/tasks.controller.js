const Task = require('../models/task.model');
const Category = require('../models/category.model');
const { detectCategory } = require('../services/ai.service');
const { logger } = require('../utils/logger');

const createTask = async (req, res) => {
  try {
    const { title, dueIn } = req.body;
    const userId = req.decodedToken.uid;

    // Validar el formato de fecha DD/MM/YYYY
    if (dueIn && !/^\d{2}\/\d{2}\/\d{4}$/.test(dueIn)) {
      return res.status(400).json({
        error: 'INVALID_DATE',
        message: 'El formato de fecha debe ser DD/MM/YYYY'
      });
    }

    // Validar que la fecha sea válida
    if (dueIn) {
      const [day, month, year] = dueIn.split('/');
      const date = new Date(year, month - 1, day);
      if (isNaN(date.getTime())) {
        return res.status(400).json({
          error: 'INVALID_DATE',
          message: 'La fecha no es válida'
        });
      }
    }

    try {
      // Obtener categorías existentes del usuario
      const existingCategories = await Category.find({ userId });

      // Detectar categoría usando OpenAI
      const suggestedCategory = await detectCategory(title, existingCategories);

      // Buscar si la categoría ya existe
      let category = await Category.findOne({ 
        userId, 
        title: suggestedCategory 
      });

      // Si no existe, crear nueva categoría
      if (!category) {
        category = await Category.create({
          title: suggestedCategory,
          userId,
          color: generateRandomColor() // Función auxiliar que definiremos
        });
      }

      // Crear la tarea con la categoría asignada
      const task = await Task.create({
        title,
        dueIn,
        userId,
        categoryId: category._id
      });

      // Devolver la tarea con la información de la categoría
      const taskWithCategory = await Task.findById(task._id)
        .populate('categoryId')
        .lean();

      res.status(201).json(taskWithCategory);

    } catch (aiError) {
      logger.error('Error con IA:', aiError);
      // Si falla la IA, crear tarea sin categoría
      const task = await Task.create({
        title,
        dueIn,
        userId
      });
      res.status(201).json(task);
    }

  } catch (error) {
    logger.error('Error creando tarea:', error);
    res.status(500).json({
      error: 'TASK_CREATE_ERROR',
      message: 'Error al crear la tarea'
    });
  }
};

const getTasks = async (req, res) => {
  try {
    const userId = req.decodedToken.uid;

    // Obtener todas las tareas del usuario con sus categorías
    const tasks = await Task.find({ userId })
      .populate('categoryId')
      .lean();

    // Agrupar tareas por categoría
    const tasksByCategory = tasks.reduce((acc, task) => {
      // Si la tarea no tiene categoría, la ignoramos
      if (!task.categoryId) return acc;

      const categoryId = task.categoryId._id.toString();

      // Si la categoría no existe en el acumulador, la creamos
      if (!acc[categoryId]) {
        acc[categoryId] = {
          id: categoryId,
          title: task.categoryId.title,
          color: task.categoryId.color,
          tasks: []
        };
      }

      // Añadir la tarea a su categoría
      acc[categoryId].tasks.push({
        id: task._id.toString(),
        title: task.title,
        dueIn: task.dueIn,
        completed: task.completed
      });

      return acc;
    }, {});

    // Convertir el objeto a array
    const categories = Object.values(tasksByCategory);

    res.json({ categories });
  } catch (error) {
    logger.error('Error obteniendo tareas:', error);
    res.status(500).json({
      error: 'TASK_FETCH_ERROR',
      message: 'Error al obtener las tareas'
    });
  }
};

// Función auxiliar para formatear fechas
const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// Función auxiliar para generar colores aleatorios
const generateRandomColor = () => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
    '#D4A5A5', '#9FA8DA', '#FFE082', '#A5D6A7', '#EF9A9A'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

module.exports = {
  createTask,
  getTasks
}; 