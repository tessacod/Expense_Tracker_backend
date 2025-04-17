const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  period: { type: String, enum: ['Daily', 'Weekly', 'Monthly', 'Yearly'], required: true },
  totalIncome: { type: Number, required: true },
  totalExpense: { type: Number, required: true },
  savings: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);
