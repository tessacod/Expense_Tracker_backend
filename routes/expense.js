

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ExpenseModel = require('../models/expense.model');

const validateExpenseInput = (body) => {
  const { category, amount, date } = body;
  
  if (!category) return { isValid: false, message: 'Category is required' };
  if (!amount || amount <= 0) return { isValid: false, message: 'Invalid amount' };
  if (!date) return { isValid: false, message: 'Date is required' };
  
  return { isValid: true };
};


router.post('/add', async (req, res) => {
  try {
    console.log("Headers:", req.headers);
    console.log("Body received:", req.body);
    console.log("Auth header:", req.headers.authorization);
    console.log("User in request:", req.user); // This is likely undefined
    
    // Check if user exists before accessing properties
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required - no user in request'
      });
    }
    
    // Use the authenticated user's ID
    const userId = req.user.userId;
    console.log("User ID:", userId);

    // Create new expense with user context
    const expense = new ExpenseModel({
      ...req.body,
      userId: userId
    });

    await expense.save();

    res.status(201).json({
      success: true,
      message: 'Expense added successfully',
      data: expense
    });
  } catch (error) {
    console.error('Add expense error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error adding expense', 
      error: error.message 
    });
  }
});


router.get('/list', async (req, res) => {
  try {
    // Use the authenticated user's ID from the request
    const userId = req.user.userId;
    
    // Only retrieve expenses belonging to this user
    const expenses = await ExpenseModel.find({ userId });
    
    res.json({ 
      success: true,
      message: "Expenses retrieved successfully",
      data: expenses 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Error fetching expenses",
      error: error.message 
    });
  }
});


router.get('/list/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const expense = await ExpenseModel.findOne({ _id: id, userId });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "No expense found with the specified ID or you don't have permission to access it"
      });
    }
    
    res.json({
      success: true,
      message: "Expense retrieved successfully",
      data: expense
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching expense",
      error: error.message 
    });
  }
});

router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    // Only delete if the expense belongs to this user
    const deletedExpense = await ExpenseModel.findOneAndDelete({ _id: id, userId });

    if (!deletedExpense) {
      return res.status(404).json({
        success: false,
        message: "No expense found with the specified ID or you don't have permission to delete it"
      });
    }

    res.json({
      success: true,
      message: "Expense deleted successfully",
      data: deletedExpense
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Unable to delete expense",
      error: error.message 
    });
  }
});



router.put('/edit/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { category, amount, date, description } = req.body;

    const validation = validateExpenseInput(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    // Only update if the expense belongs to this user
    const updatedExpense = await ExpenseModel.findOneAndUpdate(
      { _id: id, userId }, 
      { category, amount, date, description }, 
      { new: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({
        success: false,
        message: "No expense found with the specified ID or you don't have permission to update it"
      });
    }

    res.json({
      success: true,
      message: "Expense updated successfully",
      data: updatedExpense
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Unable to update expense",
      error: error.message 
    });
  }
});
module.exports = router;