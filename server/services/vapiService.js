// File: src/services/vapiService.js
// This is the stable, reverted version that removes pagination.

import axios from 'axios';

const VAPI_CALL_API_URL = 'https://api.vapi.ai/call';
const VAPI_ANALYTICS_API_URL = 'https://api.vapi.ai/analytics';

/**
 * Fetches a single page of call logs from the Vapi.ai API.
 * This function does NOT handle pagination.
 */
export const fetchAllCalls = async (queryParams) => {
  const apiKey = process.env.VAPI_API_KEY;

  if (!apiKey || apiKey === "YOUR_VAPI_API_KEY") {
    console.error("VAPI_API_KEY is not set in the .env file.");
    throw new Error("API key is missing.");
  }

  try {
    const response = await axios.get(VAPI_CALL_API_URL, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
      params: queryParams, // Uses params from the client (e.g., limit=1000)
    });
    console.log(`✅ Successfully fetched ${response.data.length} calls.`);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching from Vapi Call API:', error.response ? error.response.data : error.message);
    throw new Error('Could not fetch call list from Vapi.ai.');
  }
};

/**
 * Posts a query for the LAST 30 DAYS to the Vapi.ai Analytics API.
 */
export const fetchAnalyticsData = async (clientQueryPayload) => {
  const apiKey = process.env.VAPI_API_KEY;

  if (!apiKey || apiKey === "YOUR_VAPI_API_KEY") {
    console.error("VAPI_API_KEY is not set in the .env file.");
    throw new Error("API key is missing.");
  }

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);

  const timeRange = {
    start: startDate.toISOString(),
    end: endDate.toISOString(),
  };

  const defaultOperations = [
      { operation: "count", column: "id" },
      { operation: "sum", column: "cost" },
      { operation: "sum", column: "duration" },
      { operation: "avg", column: "duration" }
  ];

  const finalPayload = { ...clientQueryPayload };

  if (!finalPayload.queries || !Array.isArray(finalPayload.queries) || finalPayload.queries.length === 0) {
      finalPayload.queries = [{
          table: "call",
          name: "server_generated_metrics"
      }];
  }

  finalPayload.queries = finalPayload.queries.map(query => ({
      ...query,
      operations: defaultOperations,
      timeRange: timeRange
  }));
  
  try {
    const response = await axios.post(VAPI_ANALYTICS_API_URL, finalPayload, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching from Vapi Analytics API:', error.response ? error.response.data : error.message);
    throw new Error('Could not fetch analytics data from Vapi.ai.');
  }
};

