const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  dueIn: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^\d{2}\/\d{2}\/\d{4}$/.test(v);
      },
      message: 'La fecha debe tener el formato DD/MM/YYYY'
    }
  },
  completed: {
    type: Boolean,
    default: false
  },
  userId: {
    type: String,
    required: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', taskSchema); 