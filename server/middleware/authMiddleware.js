// // File: server/middleware/authMiddleware.js
// // This middleware verifies the JWT token from the request header.

// import jwt from 'jsonwebtoken';

// const protect = (req, res, next) => {
//   let token;
//   const authHeader = req.headers.authorization;

//   if (authHeader && authHeader.startsWith('Bearer')) {
//     try {
//       // Get token from header (e.g., "Bearer TOKEN_STRING")
//       token = authHeader.split(' ')[1];

//       // Verify the token
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       // Attach the user info to the request object for other routes to use
//       req.user = decoded.user;
//       next(); // Proceed to the next middleware or route handler

//     } catch (error) {
//       console.error('Token verification failed:', error.message);
//       res.status(401).json({ message: 'Not authorized, token failed' });
//     }
//   }

//   if (!token) {
//     res.status(401).json({ message: 'Not authorized, no token' });
//   }
// };

// export default protect;

// **************************************************************************************************
// File: server/middleware/authMiddleware.js
// Final Phase 2 version: Verifies JWT and attaches user info to request.

import jwt from 'jsonwebtoken';
import { sql, poolPromise } from '../DB/db.js'; // Import DB if you need to check against DB, otherwise not needed here.

const protect = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  // Check if the Authorization header exists and starts with 'Bearer '
  if (authHeader && authHeader.startsWith('Bearer')) {
    try {
      // Extract the token (Bearer TOKEN_STRING -> TOKEN_STRING)
      token = authHeader.split(' ')[1];

      // Verify the token using the secret key from environment variables
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // --- CRITICAL ---
      // The decoded payload contains whatever we put in it during login.
      // Based on our authRoutes.js, it should be { user: { id, email, role } }
      // We attach this 'user' object to the request for subsequent routes/controllers.
      req.user = decoded.user; 

      // Optional: You could add a check here to ensure the user still exists in the DB
      // const pool = await poolPromise;
      // const userCheck = await pool.request().input('userId', sql.Int, req.user.id).query('SELECT id FROM VapiUsers WHERE id = @userId');
      // if (userCheck.recordset.length === 0) {
      //   throw new Error('User not found'); // Or handle appropriately
      // }

      next(); // Token is valid, proceed to the next function (getClientId or the controller)

    } catch (error) {
      console.error('Token verification failed:', error.message);
      // Handle specific errors like expired token if needed
      if (error.name === 'JsonWebTokenError') {
          return res.status(401).json({ message: 'Not authorized, invalid token' });
      }
      if (error.name === 'TokenExpiredError') {
          return res.status(401).json({ message: 'Not authorized, token expired' });
      }
      return res.status(401).json({ message: 'Not authorized, token verification failed' });
    }
  }

  // If no token was found in the header
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

export default protect;

