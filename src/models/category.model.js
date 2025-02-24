const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    lowercase: true
  },
  color: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

categorySchema.index({ userId: 1, title: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema); 