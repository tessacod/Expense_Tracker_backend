
// middleware/auth.js

const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access Denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid Token' });
  }
};

module.exports = { authenticateToken };
