// File: server/services/vapiService.js
// fetchAllCalls updated to dynamically determine limit from analytics count.

import axios from 'axios';
import { sql, poolPromise } from '../DB/db.js';

const VAPI_CALL_API_URL = 'https://api.vapi.ai/call';
const VAPI_ANALYTICS_API_URL = 'https://api.vapi.ai/analytics';


export const getVapiKeyForRequest = async (loggedInUser, requestedClientId) => {
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


export const fetchAllCalls = async (loggedInUser, requestedClientId) => {
    const apiKey = await getVapiKeyForRequest(loggedInUser, requestedClientId);
    let fetchLimit = 200; 

    try {
       
        console.log(`Fetching total call count for user ID ${requestedClientId || loggedInUser.id}...`);
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 30); 
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

       
        const countResult = analyticsCountResponse.data?.[0]?.result?.[0]?.countId;
        if (countResult && !isNaN(parseInt(countResult))) {
             
            fetchLimit = Math.max(100, parseInt(countResult))  ;
            console.log(`Analytics returned total count: ${countResult}. Setting fetch limit to ${fetchLimit}.`);
        } else {
            console.warn(`Could not get total count from analytics. Using default limit: ${fetchLimit}. Response:`, analyticsCountResponse.data);
        }

    } catch (countError) {
        console.error(`Error fetching call count from analytics for user ID ${requestedClientId || loggedInUser.id}. Using default limit ${fetchLimit}. Error:`, countError.response ? countError.response.data : countError.message);
      
    }


   
    try {
        console.log(`Fetching up to ${fetchLimit} calls for user ID ${requestedClientId || loggedInUser.id} (Dynamic limit)...`);

        const response = await axios.get(VAPI_CALL_API_URL, {
            headers: { 'Authorization': `Bearer ${apiKey}` },
            params: {
                limit: fetchLimit
              
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


// fetchAnalyticsData 
export const fetchAnalyticsData = async (loggedInUser, requestedClientId) => {
    const apiKey = await getVapiKeyForRequest(loggedInUser, requestedClientId);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    const timeRange = {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
    };
    
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

