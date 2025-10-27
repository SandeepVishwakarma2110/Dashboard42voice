// // File: src/services/vapiService.js
// // This is the stable, reverted version that removes pagination.

// import axios from 'axios';

// const VAPI_CALL_API_URL = 'https://api.vapi.ai/call';
// const VAPI_ANALYTICS_API_URL = 'https://api.vapi.ai/analytics';

// /**
//  * Fetches a single page of call logs from the Vapi.ai API.
//  * This function does NOT handle pagination.
//  */
// export const fetchAllCalls = async (queryParams) => {
//   const apiKey = process.env.VAPI_API_KEY;

//   if (!apiKey || apiKey === "YOUR_VAPI_API_KEY") {
//     console.error("VAPI_API_KEY is not set in the .env file.");
//     throw new Error("API key is missing.");
//   }

//   try {
//     const response = await axios.get(VAPI_CALL_API_URL, {
//       headers: { 'Authorization': `Bearer ${apiKey}` },
//       params: queryParams, // Uses params from the client (e.g., limit=1000)
//     });
//     console.log(`✅ Successfully fetched ${response.data.length} calls.`);
//     return response.data;
//   } catch (error) {
//     console.error('❌ Error fetching from Vapi Call API:', error.response ? error.response.data : error.message);
//     throw new Error('Could not fetch call list from Vapi.ai.');
//   }
// };

// /**
//  * Posts a query for the LAST 30 DAYS to the Vapi.ai Analytics API.
//  */
// export const fetchAnalyticsData = async (clientQueryPayload) => {
//   const apiKey = process.env.VAPI_API_KEY;

//   if (!apiKey || apiKey === "YOUR_VAPI_API_KEY") {
//     console.error("VAPI_API_KEY is not set in the .env file.");
//     throw new Error("API key is missing.");
//   }

//   const endDate = new Date();
//   const startDate = new Date();
//   startDate.setDate(endDate.getDate() - 30);

//   const timeRange = {
//     start: startDate.toISOString(),
//     end: endDate.toISOString(),
//   };

//   const defaultOperations = [
//       { operation: "count", column: "id" },
//       { operation: "sum", column: "cost" },
//       { operation: "sum", column: "duration" },
//       { operation: "avg", column: "duration" }
//   ];

//   const finalPayload = { ...clientQueryPayload };

//   if (!finalPayload.queries || !Array.isArray(finalPayload.queries) || finalPayload.queries.length === 0) {
//       finalPayload.queries = [{
//           table: "call",
//           name: "server_generated_metrics"
//       }];
//   }

//   finalPayload.queries = finalPayload.queries.map(query => ({
//       ...query,
//       operations: defaultOperations,
//       timeRange: timeRange
//   }));
  
//   try {
//     const response = await axios.post(VAPI_ANALYTICS_API_URL, finalPayload, {
//       headers: {
//         'Authorization': `Bearer ${apiKey}`,
//         'Content-Type': 'application/json',
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.error('❌ Error fetching from Vapi Analytics API:', error.response ? error.response.data : error.message);
//     throw new Error('Could not fetch analytics data from Vapi.ai.');
//   }
// };



// *****************************************************************************************************************************************
// File: server/services/vapiService.js
// MAJOR UPDATE: Fetches Vapi key from DB based on user role and request.

// import axios from 'axios';
// import { sql, poolPromise } from '../DB/db.js'; // Import DB connection

// const VAPI_CALL_API_URL = 'https://api.vapi.ai/call';
// const VAPI_ANALYTICS_API_URL = 'https://api.vapi.ai/analytics';

// // --- Helper function to get Vapi Key ---
// const getVapiKeyForRequest = async (loggedInUser, requestedClientId) => {
//     const pool = await poolPromise;
//     let targetUserId = loggedInUser.id; // Default to logged-in user

//     if ((loggedInUser.role === 'supervisor' || loggedInUser.role === 'admin') && requestedClientId) {
//         // Supervisor or Admin is requesting data for a specific client
//         // Authorization Check: Ensure this user is allowed to view this client
//         let checkQuery;
//         if (loggedInUser.role === 'admin') {
//             // Admin can view any client
//             checkQuery = "SELECT id FROM VapiUsers WHERE id = @clientId AND role = 'client'";
//         } else { // Supervisor
//             // Supervisor can only view clients linked to them
//             checkQuery = "SELECT id FROM VapiUsers WHERE id = @clientId AND role = 'client' AND supervisorId = @supervisorId";
//         }
//         const authCheck = await pool.request()
//             .input('clientId', sql.Int, requestedClientId)
//             .input('supervisorId', sql.Int, loggedInUser.id) // supervisorId ignored if admin
//             .query(checkQuery);

//         if (authCheck.recordset.length === 0) {
//             throw new Error('Authorization denied: You cannot access this client\'s data.');
//         }
//         targetUserId = requestedClientId; // Authorized, set target to requested client
//     } else if (loggedInUser.role !== 'client' && !requestedClientId) {
//          // Supervisor/Admin didn't specify a client - this shouldn't happen for dashboard data
//          throw new Error('Invalid request: Supervisor/Admin must specify a client ID.');
//     } else if (loggedInUser.role === 'client' && requestedClientId && loggedInUser.id !== parseInt(requestedClientId)) {
//         // Client trying to access someone else's data
//         throw new Error('Authorization denied: Cannot access other client data.');
//     }

//     // Fetch the Vapi Key for the target user (either self or authorized client)
//     const keyResult = await pool.request()
//         .input('userId', sql.Int, targetUserId)
//         .query('SELECT vapiKey FROM VapiUsers WHERE id = @userId');

//     if (keyResult.recordset.length === 0 || !keyResult.recordset[0].vapiKey) {
//         throw new Error(`Vapi API Key not found for the specified user (ID: ${targetUserId}).`);
//     }

//     return keyResult.recordset[0].vapiKey;
// };


// // --- Updated fetchAllCalls ---
// export const fetchAllCalls = async (loggedInUser, requestedClientId) => {
//     // Get the correct API key based on the request context
//     const apiKey = await getVapiKeyForRequest(loggedInUser, requestedClientId);

//     let allCalls = [];
//     let lastCallId = null;
//     const VAPI_PAGE_LIMIT = 100; // Keep fetching in pages

//     try {
//         while (true) {
//             const params = new URLSearchParams({ limit: VAPI_PAGE_LIMIT });
//             if (lastCallId) {
//                 params.append('starting_after', lastCallId);
//             }
//             const requestUrl = `${VAPI_CALL_API_URL}?${params.toString()}`;

//             const response = await axios.get(requestUrl, {
//                 headers: { 'Authorization': `Bearer ${apiKey}` }, // Use the fetched API key
//             });

//             const calls = response.data;
//             if (!Array.isArray(calls)) throw new Error("Invalid response format from Vapi API");
//             if (calls.length === 0) break;

//             allCalls = allCalls.concat(calls);
//             lastCallId = calls[calls.length - 1].id;

//             if (calls.length < VAPI_PAGE_LIMIT) break;
//         }
//         console.log(`Successfully fetched ${allCalls.length} calls for user ID ${requestedClientId || loggedInUser.id}.`);
//         return allCalls;
//     } catch (error) {
//         console.error(`Error fetching Vapi calls for user ID ${requestedClientId || loggedInUser.id}:`, error.response ? error.response.data : error.message);
//         // Rethrow a more specific error
//         if (error.response && error.response.status === 401) {
//              throw new Error('Invalid Vapi API Key configured for this client.');
//         }
//         throw new Error('Could not fetch call data from Vapi.ai.');
//     }
// };

// // --- Updated fetchAnalyticsData ---
// export const fetchAnalyticsData = async (loggedInUser, requestedClientId) => {
//     // Get the correct API key
//     const apiKey = await getVapiKeyForRequest(loggedInUser, requestedClientId);

//     const endDate = new Date();
//     const startDate = new Date();
//     startDate.setDate(endDate.getDate() - 30); // Last 30 days

//     const timeRange = {
//         start: startDate.toISOString(),
//         end: endDate.toISOString(),
//     };
//     const defaultOperations = [
//         { operation: "count", column: "id" },
//         { operation: "sum", column: "cost" },
//         { operation: "sum", column: "duration" },
//         { operation: "avg", column: "duration" }
//     ];
//     const finalPayload = {
//         queries: [{
//             table: "call",
//             name: "dashboard_metrics",
//             operations: defaultOperations,
//             timeRange: timeRange
//         }]
//     };

//     try {
//         const response = await axios.post(VAPI_ANALYTICS_API_URL, finalPayload, {
//             headers: {
//                 'Authorization': `Bearer ${apiKey}`, // Use the fetched API key
//                 'Content-Type': 'application/json',
//             },
//         });
//         console.log(`Successfully fetched analytics for user ID ${requestedClientId || loggedInUser.id}.`);
//         return response.data;
//     } catch (error) {
//         console.error(`Error fetching Vapi analytics for user ID ${requestedClientId || loggedInUser.id}:`, error.response ? error.response.data : error.message);
//          if (error.response && error.response.status === 401) {
//              throw new Error('Invalid Vapi API Key configured for this client.');
//         }
//         throw new Error('Could not fetch analytics data from Vapi.ai.');
//     }
// };

// **************************************************************************************************
// File: server/services/vapiService.js
// Reverted fetchAllCalls to a stable version without pagination to resolve Vapi API errors.

// import axios from 'axios';
// import { sql, poolPromise } from '../DB/db.js';

// const VAPI_CALL_API_URL = 'https://api.vapi.ai/call';
// const VAPI_ANALYTICS_API_URL = 'https://api.vapi.ai/analytics';

// // Helper function to get Vapi Key (remains the same)
// const getVapiKeyForRequest = async (loggedInUser, requestedClientId) => {
//     const pool = await poolPromise;
//     let targetUserId = loggedInUser.id;

//     if ((loggedInUser.role === 'supervisor' || loggedInUser.role === 'admin') && requestedClientId) {
//         let checkQuery;
//         if (loggedInUser.role === 'admin') {
//             checkQuery = "SELECT id FROM VapiUsers WHERE id = @clientId AND role = 'client'";
//         } else {
//             checkQuery = "SELECT id FROM VapiUsers WHERE id = @clientId AND role = 'client' AND supervisorId = @supervisorId";
//         }
//         const authCheck = await pool.request()
//             .input('clientId', sql.Int, requestedClientId)
//             .input('supervisorId', sql.Int, loggedInUser.id)
//             .query(checkQuery);
//         if (authCheck.recordset.length === 0) {
//             throw new Error('Authorization denied: You cannot access this client\'s data.');
//         }
//         targetUserId = requestedClientId;
//     } else if (loggedInUser.role !== 'client' && !requestedClientId) {
//          throw new Error('Invalid request: Supervisor/Admin must specify a client ID.');
//     } else if (loggedInUser.role === 'client' && requestedClientId && loggedInUser.id !== parseInt(requestedClientId)) {
//         throw new Error('Authorization denied: Cannot access other client data.');
//     }

//     const keyResult = await pool.request()
//         .input('userId', sql.Int, targetUserId)
//         .query('SELECT vapiKey FROM VapiUsers WHERE id = @userId');
//     if (keyResult.recordset.length === 0 || !keyResult.recordset[0].vapiKey) {
//         throw new Error(`Vapi API Key not found for the specified user (ID: ${targetUserId}).`);
//     }
//     return keyResult.recordset[0].vapiKey;
// };

// // --- fetchAllCalls reverted to fetch a fixed limit (no pagination) ---
// export const fetchAllCalls = async (loggedInUser, requestedClientId) => {
//     const apiKey = await getVapiKeyForRequest(loggedInUser, requestedClientId);
//     const fetchLimit = 1000; // Fetch up to 1000 most recent calls

//     try {
//         console.log(`Fetching up to ${fetchLimit} calls for user ID ${requestedClientId || loggedInUser.id}...`);
//         const response = await axios.get(VAPI_CALL_API_URL, {
//             headers: { 'Authorization': `Bearer ${apiKey}` },
//             params: { limit: fetchLimit }, // Use the fixed limit
//         });

//         const calls = response.data;
//         if (!Array.isArray(calls)) throw new Error("Invalid response format from Vapi API");

//         console.log(`Successfully fetched ${calls.length} calls for user ID ${requestedClientId || loggedInUser.id}.`);
//         return calls; // Return the fetched calls
//     } catch (error) {
//         console.error(`Error fetching Vapi calls for user ID ${requestedClientId || loggedInUser.id}:`, error.response ? error.response.data : error.message);
//         if (error.response && error.response.status === 401) {
//              throw new Error('Invalid Vapi API Key configured for this client.');
//         }
//         // Use a more generic error message if it's not an auth issue
//         throw new Error('Could not fetch call data from Vapi.ai. Please check the Vapi API status or key.');
//     }
// };


// // fetchAnalyticsData remains the same
// export const fetchAnalyticsData = async (loggedInUser, requestedClientId) => {
//     const apiKey = await getVapiKeyForRequest(loggedInUser, requestedClientId);
//     const endDate = new Date();
//     const startDate = new Date();
//     startDate.setDate(endDate.getDate() - 30);
//     const timeRange = {
//         start: startDate.toISOString(),
//         end: endDate.toISOString(),
//     };
//     const defaultOperations = [
//         { operation: "count", column: "id" },
//         { operation: "sum", column: "cost" },
//         { operation: "sum", column: "duration" },
//         { operation: "avg", column: "duration" }
//     ];
//     const finalPayload = {
//         queries: [{
//             table: "call",
//             name: "dashboard_metrics",
//             operations: defaultOperations,
//             timeRange: timeRange
//         }]
//     };
//     try {
//         const response = await axios.post(VAPI_ANALYTICS_API_URL, finalPayload, {
//             headers: {
//                 'Authorization': `Bearer ${apiKey}`,
//                 'Content-Type': 'application/json',
//             },
//         });
//         console.log(`Successfully fetched analytics for user ID ${requestedClientId || loggedInUser.id}.`);
//         return response.data;
//     } catch (error) {
//         console.error(`Error fetching Vapi analytics for user ID ${requestedClientId || loggedInUser.id}:`, error.response ? error.response.data : error.message);
//          if (error.response && error.response.status === 401) {
//              throw new Error('Invalid Vapi API Key configured for this client.');
//         }
//         throw new Error('Could not fetch analytics data from Vapi.ai.');
//     }
// };

// ********************************************************************************************************************************************
// File: server/services/vapiService.js
// Updated fetchAllCalls to explicitly request the last 30 days of data.

// File: server/services/vapiService.js
// Reverted fetchAllCalls to remove startDate and endDate parameters due to Vapi API error.

// import axios from 'axios';
// import { sql, poolPromise } from '../DB/db.js';

// const VAPI_CALL_API_URL = 'https://api.vapi.ai/call';
// const VAPI_ANALYTICS_API_URL = 'https://api.vapi.ai/analytics';

// // Helper function to get Vapi Key (remains the same)
// const getVapiKeyForRequest = async (loggedInUser, requestedClientId) => {
//     const pool = await poolPromise;
//     let targetUserId = loggedInUser.id;

//     if ((loggedInUser.role === 'supervisor' || loggedInUser.role === 'admin') && requestedClientId) {
//         let checkQuery;
//         if (loggedInUser.role === 'admin') {
//             checkQuery = "SELECT id FROM VapiUsers WHERE id = @clientId AND role = 'client'";
//         } else {
//             checkQuery = "SELECT id FROM VapiUsers WHERE id = @clientId AND role = 'client' AND supervisorId = @supervisorId";
//         }
//         const authCheck = await pool.request()
//             .input('clientId', sql.Int, requestedClientId)
//             .input('supervisorId', sql.Int, loggedInUser.id)
//             .query(checkQuery);
//         if (authCheck.recordset.length === 0) {
//             throw new Error('Authorization denied: You cannot access this client\'s data.');
//         }
//         targetUserId = requestedClientId;
//     } else if (loggedInUser.role !== 'client' && !requestedClientId) {
//          throw new Error('Invalid request: Supervisor/Admin must specify a client ID.');
//     } else if (loggedInUser.role === 'client' && requestedClientId && loggedInUser.id !== parseInt(requestedClientId)) {
//         throw new Error('Authorization denied: Cannot access other client data.');
//     }

//     const keyResult = await pool.request()
//         .input('userId', sql.Int, targetUserId)
//         .query('SELECT vapiKey FROM VapiUsers WHERE id = @userId');
//     if (keyResult.recordset.length === 0 || !keyResult.recordset[0].vapiKey) {
//         throw new Error(`Vapi API Key not found for the specified user (ID: ${targetUserId}).`);
//     }
//     return keyResult.recordset[0].vapiKey;
// };

// // --- fetchAllCalls reverted to NOT use startDate/endDate ---
// export const fetchAllCalls = async (loggedInUser, requestedClientId) => {
//     const apiKey = await getVapiKeyForRequest(loggedInUser, requestedClientId);
//     const fetchLimit = 200; // Fetch up to 1000 most recent calls

//     try {
//         console.log(`Fetching up to ${fetchLimit} calls for user ID ${requestedClientId || loggedInUser.id}...`);

//         const response = await axios.get(VAPI_CALL_API_URL, {
//             headers: { 'Authorization': `Bearer ${apiKey}` },
//             // --- FIX: Removed startDate and endDate parameters ---
//             params: {
//                 limit: fetchLimit
//             },
//         });

//         const calls = response.data;
//         if (!Array.isArray(calls)) throw new Error("Invalid response format from Vapi API");

//         console.log(`Successfully fetched ${calls.length} calls for user ID ${requestedClientId || loggedInUser.id}.`);
//         return calls; // Return the fetched calls
//     } catch (error) {
//         console.error(`Error fetching Vapi calls for user ID ${requestedClientId || loggedInUser.id}:`, error.response ? error.response.data : error.message);
//         if (error.response && error.response.status === 401) {
//              throw new Error('Invalid Vapi API Key configured for this client.');
//         }
//         // Use a more generic error message
//         throw new Error('Could not fetch call data from Vapi.ai. Please check the Vapi API status or key.');
//     }
// };


// // fetchAnalyticsData remains the same (correctly uses last 30 days via timeRange object)
// export const fetchAnalyticsData = async (loggedInUser, requestedClientId) => {
//     const apiKey = await getVapiKeyForRequest(loggedInUser, requestedClientId);
//     const endDate = new Date();
//     const startDate = new Date();
//     startDate.setDate(endDate.getDate() - 30);
//     const timeRange = {
//         start: startDate.toISOString(),
//         end: endDate.toISOString(),
//     };
//     const defaultOperations = [
//         { operation: "count", column: "id" },
//         { operation: "sum", column: "cost" },
//         { operation: "sum", column: "duration" },
//         { operation: "avg", column: "duration" }
//     ];
//     const finalPayload = {
//         queries: [{
//             table: "call",
//             name: "dashboard_metrics",
//             operations: defaultOperations,
//             timeRange: timeRange // Analytics endpoint uses timeRange object
//         }]
//     };
//     try {
//         const response = await axios.post(VAPI_ANALYTICS_API_URL, finalPayload, {
//             headers: {
//                 'Authorization': `Bearer ${apiKey}`,
//                 'Content-Type': 'application/json',
//             },
//         });
//         console.log(`Successfully fetched analytics for user ID ${requestedClientId || loggedInUser.id}.`);
//         return response.data;
//     } catch (error) {
//         console.error(`Error fetching Vapi analytics for user ID ${requestedClientId || loggedInUser.id}:`, error.response ? error.response.data : error.message);
//          if (error.response && error.response.status === 401) {
//              throw new Error('Invalid Vapi API Key configured for this client.');
//         }
//         throw new Error('Could not fetch analytics data from Vapi.ai.');
//     }
// };



// ********************************************************************************************************************************************


// File: server/services/vapiService.js
// fetchAllCalls updated to dynamically determine limit from analytics count.

import axios from 'axios';
import { sql, poolPromise } from '../DB/db.js';

const VAPI_CALL_API_URL = 'https://api.vapi.ai/call';
const VAPI_ANALYTICS_API_URL = 'https://api.vapi.ai/analytics';

// Helper function to get Vapi Key (remains the same)
const getVapiKeyForRequest = async (loggedInUser, requestedClientId) => {
    const pool = await poolPromise;
    let targetUserId = loggedInUser.id;

    if ((loggedInUser.role === 'supervisor' || loggedInUser.role === 'admin') && requestedClientId) {
        let checkQuery;
        if (loggedInUser.role === 'admin') {
            checkQuery = "SELECT id FROM VapiUsers WHERE id = @clientId AND role = 'client'";
        } else {
            checkQuery = "SELECT id FROM VapiUsers WHERE id = @clientId AND role = 'client' AND supervisorId = @supervisorId";
        }
        const authCheck = await pool.request()
            .input('clientId', sql.Int, requestedClientId)
            .input('supervisorId', sql.Int, loggedInUser.id)
            .query(checkQuery);
        if (authCheck.recordset.length === 0) {
            throw new Error('Authorization denied: You cannot access this client\'s data.');
        }
        targetUserId = requestedClientId;
    } else if (loggedInUser.role !== 'client' && !requestedClientId) {
         throw new Error('Invalid request: Supervisor/Admin must specify a client ID.');
    } else if (loggedInUser.role === 'client' && requestedClientId && loggedInUser.id !== parseInt(requestedClientId)) {
        throw new Error('Authorization denied: Cannot access other client data.');
    }

    const keyResult = await pool.request()
        .input('userId', sql.Int, targetUserId)
        .query('SELECT vapiKey FROM VapiUsers WHERE id = @userId');
    if (keyResult.recordset.length === 0 || !keyResult.recordset[0].vapiKey) {
        throw new Error(`Vapi API Key not found for the specified user (ID: ${targetUserId}).`);
    }
    return keyResult.recordset[0].vapiKey;
};

// --- fetchAllCalls uses dynamic limit based on analytics count ---
export const fetchAllCalls = async (loggedInUser, requestedClientId) => {
    const apiKey = await getVapiKeyForRequest(loggedInUser, requestedClientId);
    let fetchLimit = 200; // Default limit in case analytics fails

    try {
        // --- Step 1: Fetch the total call count from analytics ---
        console.log(`Fetching total call count for user ID ${requestedClientId || loggedInUser.id}...`);
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 30); // Use same 30-day window
        const timeRange = { start: startDate.toISOString(), end: endDate.toISOString() };
        const countPayload = {
            queries: [{
                table: "call",
                name: "total_count_query",
                operations: [{ operation: "count", column: "id" }],
                timeRange: timeRange
            }]
        };
        const analyticsCountResponse = await axios.post(VAPI_ANALYTICS_API_URL, countPayload, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
        });

        // Extract the count
        const countResult = analyticsCountResponse.data?.[0]?.result?.[0]?.countId;
        if (countResult && !isNaN(parseInt(countResult))) {
             // Use the count + a small buffer (e.g., 10) as the limit, minimum 100
            fetchLimit = Math.max(100, parseInt(countResult))  ;
            console.log(`Analytics returned total count: ${countResult}. Setting fetch limit to ${fetchLimit}.`);
        } else {
            console.warn(`Could not get total count from analytics. Using default limit: ${fetchLimit}. Response:`, analyticsCountResponse.data);
        }

    } catch (countError) {
        console.error(`Error fetching call count from analytics for user ID ${requestedClientId || loggedInUser.id}. Using default limit ${fetchLimit}. Error:`, countError.response ? countError.response.data : countError.message);
        // Continue with the default limit if the count fails
    }


    // --- Step 2: Fetch the call logs using the determined limit ---
    try {
        console.log(`Fetching up to ${fetchLimit} calls for user ID ${requestedClientId || loggedInUser.id} (Dynamic limit)...`);

        const response = await axios.get(VAPI_CALL_API_URL, {
            headers: { 'Authorization': `Bearer ${apiKey}` },
            params: {
                limit: fetchLimit
                // NO DATE PARAMETERS based on previous errors
            },
        });

        const calls = response.data;
        if (!Array.isArray(calls)) {
             console.error("Invalid response format from Vapi API /call. Expected an array.", response.data);
             throw new Error("Invalid response format from Vapi API");
        }

        console.log(`Successfully fetched ${calls.length} calls for user ID ${requestedClientId || loggedInUser.id}.`);
        return calls;

    } catch (error) {
        console.error(`Error fetching Vapi calls for user ID ${requestedClientId || loggedInUser.id}:`, error.response ? error.response.data : error.message);
        if (error.response && error.response.status === 401) {
             throw new Error('Invalid Vapi API Key configured for this client.');
        }
        throw new Error('Could not fetch call data from Vapi.ai.');
    }
};


// fetchAnalyticsData remains the same (fetches standard metrics)
export const fetchAnalyticsData = async (loggedInUser, requestedClientId) => {
    const apiKey = await getVapiKeyForRequest(loggedInUser, requestedClientId);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    const timeRange = {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
    };
    // Standard operations for the main dashboard KPIs
    const defaultOperations = [
        { operation: "count", column: "id" },
        { operation: "max", column: "duration" },
        { operation: "sum", column: "duration" },
        { operation: "avg", column: "duration" }
    ];
    const finalPayload = {
        queries: [{
            table: "call",
            name: "dashboard_metrics",
            operations: defaultOperations,
            timeRange: timeRange
        }]
    };
    try {
        const response = await axios.post(VAPI_ANALYTICS_API_URL, finalPayload, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
        });
        console.log(`Successfully fetched dashboard analytics for user ID ${requestedClientId || loggedInUser.id}.`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching Vapi dashboard analytics for user ID ${requestedClientId || loggedInUser.id}:`, error.response ? error.response.data : error.message);
         if (error.response && error.response.status === 401) {
             throw new Error('Invalid Vapi API Key configured for this client.');
        }
        throw new Error('Could not fetch analytics data from Vapi.ai.');
    }
};

