// // import { Router } from 'express';
// // import { getAllCalls, getAnalytics } from '../controllers/callController.js';

// // const router = Router();

// // // --- Existing Route ---
// // // Fetches a list of individual call logs
// // // Full URL: GET /api/calls
// // router.get('/calls', getAllCalls);


// // // --- New Route ---
// // // Posts a query to get aggregated analytics data
// // // Full URL: POST /api/analytics
// // router.post('/analytics', getAnalytics);


// // export default router;



// // File: server/routes/callRoutes.js
// // This file is now updated to use the authentication middleware.

// import express from 'express';
// import { getAllCalls, getAnalytics } from '../controllers/callController.js';
// import protect from '../middleware/authMiddleware.js'; // 1. Import the middleware

// const router = express.Router();

// // 2. Apply the 'protect' middleware to the routes.
// // Now, a user must be logged in to access these endpoints.
// router.get('/', protect, getAllCalls);
// router.post('/analytics', protect, getAnalytics);

// export default router;

// **********************************************************************************************************************

// File: server/routes/callRoutes.js
// Final Phase 2 version: Uses authentication middleware and extracts clientId.

import express from 'express';
// Assuming controllers are in '../controllers/' relative to this file
import { getAllCalls, getAnalytics , streamRecording } from '../controllers/callController.js'; 
// Assuming middleware is in '../middleware/' relative to this file
import protect from '../middleware/authMiddleware.js'; 

const router = express.Router();

// Middleware to extract potential clientId from query for supervisor/admin access
// This runs *after* 'protect' ensures the user is logged in.
const getClientId = (req, res, next) => {
  // If a clientId is provided in the query string (e.g., /api/calls?clientId=123),
  // attach it to the request object for the controller to use.
  req.requestedClientId = req.query.clientId; 
  next(); // Proceed to the actual controller function (getAllCalls or getAnalytics)
};

// Apply 'protect' middleware first to secure the route,
// then 'getClientId' to potentially extract the target client ID.
router.get('/', protect, getClientId, getAllCalls); 
router.post('/analytics', protect, getClientId, getAnalytics);


// --- NEW: Route to proxy recording ---
// Uses :callId as a URL parameter
router.get('/recording/:callId', protect, streamRecording);

export default router;

