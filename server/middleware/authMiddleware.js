// File: server/middleware/authMiddleware.js
// This middleware verifies the JWT token from the request header.

import jwt from 'jsonwebtoken';

const protect = (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer')) {
    try {
      // Get token from header (e.g., "Bearer TOKEN_STRING")
      token = authHeader.split(' ')[1];

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the user info to the request object for other routes to use
      req.user = decoded.user;
      next(); // Proceed to the next middleware or route handler

    } catch (error) {
      console.error('Token verification failed:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export default protect;
