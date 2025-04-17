// models/budget.model.js
const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  totalBudget: {
    type: Number,
    required: true,
    default: 0
  },
  spentAmount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Budget', budgetSchema);