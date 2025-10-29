

// File: server/middleware/authMiddleware.js
// Final Phase 2 version: Verifies JWT and attaches user info to request.

import jwt from 'jsonwebtoken';
import { sql, poolPromise } from '../DB/db.js'; 

const protect = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

 
  if (authHeader && authHeader.startsWith('Bearer')) {
    try {
      token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded.user; 

      next(); 

    } catch (error) {
      console.error('Token verification failed:', error.message);
      
      if (error.name === 'JsonWebTokenError') {
          return res.status(401).json({ message: 'Not authorized, invalid token' });
      }
      if (error.name === 'TokenExpiredError') {
          return res.status(401).json({ message: 'Not authorized, token expired' });
      }
      return res.status(401).json({ message: 'Not authorized, token verification failed' });
    }
  }


  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

export default protect;

