

const express = require('express');
const router = express.Router();
const budgetModel = require('../models/budget.model');

router.get('/', function(req, res, next) {
  res.send('Budget API is working');
});

/* GET current budget data */
router.get('/current', function(req, res) {
  try {
    const userId = req.user.userId; // Changed from req.user.id
    
    budgetModel.findOne({ userId: userId })
      .then(budget => {
        res.json({
          success: true,
          message: "Budget retrieved successfully",
          data: budget || { totalBudget: 0, spentAmount: 0 }
        });
      })
      .catch(error => {
        console.error('Error fetching budget:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to fetch budget data',
          data: null
        });
      });
  } catch (error) {
    console.error('Error fetching budget:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch budget data',
      data: null
    });
  }
});

/* POST update budget */
router.post('/update', function(req, res) {
  try {
    const { totalBudget } = req.body;
    const userId = req.user.userId; // Changed from req.user.id
    
    if (totalBudget === undefined || totalBudget < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid budget amount',
        data: null
      });
    }
    
    budgetModel.findOne({ userId: userId })
      .then(budget => {
        if (budget) {
          budget.totalBudget = totalBudget;
          return budget.save();
        } else {
          return budgetModel.create({
            userId: userId,
            totalBudget: totalBudget,
            spentAmount: 0
          });
        }
      })
      .then(savedBudget => {
        res.status(200).json({
          success: true,
          message: "Budget updated successfully",
          data: savedBudget
        });
      })
      .catch(error => {
        console.error('Error updating budget:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to update budget',
          data: null
        });
      });
  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update budget',
      data: null
    });
  }
});

module.exports = router;