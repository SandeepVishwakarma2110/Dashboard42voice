// import { Router } from 'express';
// import { getAllCalls, getAnalytics } from '../controllers/callController.js';

// const router = Router();

// // --- Existing Route ---
// // Fetches a list of individual call logs
// // Full URL: GET /api/calls
// router.get('/calls', getAllCalls);


// // --- New Route ---
// // Posts a query to get aggregated analytics data
// // Full URL: POST /api/analytics
// router.post('/analytics', getAnalytics);


// export default router;



// File: server/routes/callRoutes.js
// This file is now updated to use the authentication middleware.

import express from 'express';
import { getAllCalls, getAnalytics } from '../controllers/callController.js';
import protect from '../middleware/authMiddleware.js'; // 1. Import the middleware

const router = express.Router();

// 2. Apply the 'protect' middleware to the routes.
// Now, a user must be logged in to access these endpoints.
router.get('/', protect, getAllCalls);
router.post('/analytics', protect, getAnalytics);

export default router;
