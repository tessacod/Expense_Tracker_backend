

// models/expense.model.js
const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  description: {
    type: String
  },
  userId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const ExpenseModel = mongoose.model('Expense', expenseSchema);

module.exports = ExpenseModel;