// File: src/controllers/callController.js
// This is the stable, reverted version.

import * as vapiService from '../services/vapiService.js';

/**
 * Controller to handle fetching a list of call logs.
 * It passes query parameters from the client directly to the service.
 */
export const getAllCalls = async (req, res) => {
  try {
    // Pass client query params (like 'limit') to the service layer.
    const callsData = await vapiService.fetchAllCalls(req.query);
    res.status(200).json(callsData);
  } catch (error) {
    console.error('Error in callController (getAllCalls):', error.message);
    res.status(500).json({ message: 'Failed to fetch call data from Vapi.ai' });
  }
};

/**
 * Controller to handle analytics queries.
 */
export const getAnalytics = async (req, res) => {
  try {
    const analyticsData = await vapiService.fetchAnalyticsData(req.body);
    res.status(200).json(analyticsData);
  } catch (error) {
    console.error('Error in callController (getAnalytics):', error.message);
    res.status(500).json({ message: 'Failed to fetch analytics from Vapi.ai' });
  }
};

