
//===========================================
const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
  res.json({ message: 'Welcome to Expense Tracker API' });
});

module.exports = router;