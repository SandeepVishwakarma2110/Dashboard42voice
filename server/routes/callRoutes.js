// File: server/routes/callRoutes.js
// Final Phase 2 version: Uses authentication middleware and extracts clientId.

import express from 'express';
import { getAllCalls, getAnalytics , streamRecording } from '../controllers/callController.js'; 
import protect from '../middleware/authMiddleware.js'; 

const router = express.Router();

const getClientId = (req, res, next) => {
  
  req.requestedClientId = req.query.clientId; 
  next(); 
};


router.get('/', protect, getClientId, getAllCalls); 
router.post('/analytics', protect, getClientId, getAnalytics);


router.get('/recording/:callId', protect, streamRecording);

export default router;

