// // File: src/controllers/callController.js
// // This is the stable, reverted version.

// import * as vapiService from '../services/vapiService.js';

// /**
//  * Controller to handle fetching a list of call logs.
//  * It passes query parameters from the client directly to the service.
//  */
// export const getAllCalls = async (req, res) => {
//   try {
//     // Pass client query params (like 'limit') to the service layer.
//     const callsData = await vapiService.fetchAllCalls(req.query);
//     res.status(200).json(callsData);
//   } catch (error) {
//     console.error('Error in callController (getAllCalls):', error.message);
//     res.status(500).json({ message: 'Failed to fetch call data from Vapi.ai' });
//   }
// };

// /**
//  * Controller to handle analytics queries.
//  */
// export const getAnalytics = async (req, res) => {
//   try {
//     const analyticsData = await vapiService.fetchAnalyticsData(req.body);
//     res.status(200).json(analyticsData);
//   } catch (error) {
//     console.error('Error in callController (getAnalytics):', error.message);
//     res.status(500).json({ message: 'Failed to fetch analytics from Vapi.ai' });
//   }
// };



// File: server/controllers/callController.js
// Updated to pass loggedInUser and requestedClientId to service functions.

// import * as vapiService from '../services/vapiService.js';

// export const getAllCalls = async (req, res) => {
//   try {
//     // req.user is added by the 'protect' middleware
//     // req.requestedClientId is added by the 'getClientId' middleware
//     const allCalls = await vapiService.fetchAllCalls(req.user, req.requestedClientId);
//     res.status(200).json(allCalls);
//   } catch (error) {
//     console.error('Error in callController (getAllCalls):', error.message);
//     // Determine appropriate status code based on error type
//     const statusCode = error.message.startsWith('Authorization denied') ? 403 : error.message.startsWith('Invalid Vapi API Key') ? 401 : 500;
//     res.status(statusCode).json({ message: error.message || 'Failed to fetch call data.' });
//   }
// };

// export const getAnalytics = async (req, res) => {
//   try {
//     // Pass user and requested client ID to the service
//     const analyticsData = await vapiService.fetchAnalyticsData(req.user, req.requestedClientId);
//     res.status(200).json(analyticsData);
//   } catch (error) {
//     console.error('Error in callController (getAnalytics):', error.message);
//      const statusCode = error.message.startsWith('Authorization denied') ? 403 : error.message.startsWith('Invalid Vapi API Key') ? 401 : 500;
//     res.status(statusCode).json({ message: error.message || 'Failed to fetch analytics data.' });
//   }
// };





// File: server/controllers/callController.js
// Final Phase 2 version: Includes fully implemented streamRecording function.

import axios from 'axios';
import * as vapiService from '../services/vapiService.js';
import { sql, poolPromise } from '../DB/db.js';

// --- Existing Controllers ---
export const getAllCalls = async (req, res) => {
  try {
    // req.user comes from protect middleware
    // req.requestedClientId comes from getClientId middleware
    const allCalls = await vapiService.fetchAllCalls(req.user, req.requestedClientId);
    res.status(200).json(allCalls);
  } catch (error) {
    console.error('Error in callController (getAllCalls):', error.message);
    const statusCode = error.message.startsWith('Authorization denied') ? 403
                     : error.message.includes('Vapi API Key not found') ? 404
                     : error.message.startsWith('Invalid Vapi API Key') ? 401
                     : 500;
    res.status(statusCode).json({ message: error.message || 'Failed to fetch call data.' });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const analyticsData = await vapiService.fetchAnalyticsData(req.user, req.requestedClientId);
    res.status(200).json(analyticsData);
  } catch (error) {
    console.error('Error in callController (getAnalytics):', error.message);
     const statusCode = error.message.startsWith('Authorization denied') ? 403
                     : error.message.includes('Vapi API Key not found') ? 404
                     : error.message.startsWith('Invalid Vapi API Key') ? 401
                     : 500;
    res.status(statusCode).json({ message: error.message || 'Failed to fetch analytics data.' });
  }
};


// --- Updated Controller function for streaming recording ---
export const streamRecording = async (req, res) => {
    const { callId } = req.params; // Get callId from URL parameter (e.g., 019a0...)
    const loggedInUser = req.user; // User info { id, email, role } from 'protect' middleware

    if (!callId) {
        return res.status(400).json({ message: 'Call ID parameter is required.' });
    }

    try {
        const pool = await poolPromise; // Get DB pool

        // --- Step 1: Fetch Call Details (including owner) Directly from Vapi ---
        console.log(`Attempting to fetch details for call ID: ${callId}`);

        // We need an API key to fetch the call details. Let's use the logged-in user's key
        // or potentially figure out the target client's key if supervisor/admin.
        // For simplicity *and security*, let's fetch the key associated with the logged-in user first.
        // If they are supervisor/admin, they might need broader permissions on Vapi side,
        // OR we need a more complex lookup if keys are strictly per-client.
        // Assuming getVapiKeyForRequest handles getting the relevant key based on loggedInUser.
        // Passing null for requestedClientId assumes we want the user's *own* key for this initial lookup,
        // or a key with sufficient permissions if they are admin/supervisor.
        const apiKeyForLookup = await vapiService.getVapiKeyForRequest(loggedInUser, null); // Get key relevant to loggedInUser

        let vapiCallDetails;
        try {
            vapiCallDetails = await axios.get(`https://api.vapi.ai/call/${callId}`, {
                headers: { 'Authorization': `Bearer ${apiKeyForLookup}` }
            });
        } catch (vapiError) {
             if (vapiError.response && vapiError.response.status === 404) {
                 console.warn(`Vapi call details not found for ID: ${callId}`);
                 return res.status(404).json({ message: 'Call record not found via Vapi API.' });
             }
              if (vapiError.response && vapiError.response.status === 401) {
                 console.error(`Invalid API Key used for Vapi lookup: ${apiKeyForLookup}`);
                 return res.status(401).json({ message: 'Could not authenticate with Vapi to fetch call details.' });
             }
             throw vapiError; // Rethrow other errors
        }


        const recordingUrl = vapiCallDetails.data?.recordingUrl;
        const callOwnerOrgId = vapiCallDetails.data?.orgId; // Assuming Vapi provides this
        // We need to map orgId or some identifier back to your clientId/userId
        // Let's assume the user's vapiKey IS the identifier or linked uniquely in your DB.
        // Find the client owner based on the vapiKey used for the call.
        // This is complex if supervisors/admins used their own key. A better approach
        // might be to store the userId/clientId alongside the callId if using webhooks.

        // --- Simplified Authorization (Assuming Vapi Key = Client Link) ---
        // Find which client in your DB owns the API key used for the call.
        const ownerResult = await pool.request()
            .input('vapiKey', sql.NVarChar, apiKeyForLookup) // Search by the key we used
            .query('SELECT id as ownerClientId, supervisorId FROM VapiUsers WHERE vapiKey = @vapiKey AND role = \'client\'');

        if (ownerResult.recordset.length === 0) {
             console.error(`Could not find client owner in DB for the used Vapi key.`);
             // This implies the key used for lookup doesn't belong to a client in your system,
             // which might be okay if it's an admin/supervisor key with broad Vapi access.
             // We need a clearer link between Vapi call and your user roles.
             // For now, let's proceed but add stricter checks later.
             // return res.status(404).json({ message: 'Could not determine call owner.' });
        }

        // Extract potential owner info if found
        const ownerClientId = ownerResult.recordset[0]?.ownerClientId;
        const ownerSupervisorId = ownerResult.recordset[0]?.supervisorId;

        // --- Step 2: Authorization Check ---
        let authorized = false;
        if (loggedInUser.role === 'admin') {
            authorized = true; // Admin can access any recording
            console.log(`Admin ${loggedInUser.id} accessing recording for call ${callId}`);
        } else if (loggedInUser.role === 'supervisor' && loggedInUser.id === ownerSupervisorId) {
            authorized = true; // Supervisor accessing their own client's recording
             console.log(`Supervisor ${loggedInUser.id} accessing recording for their client ${ownerClientId} (call ${callId})`);
        } else if (loggedInUser.role === 'client' && loggedInUser.id === ownerClientId) {
            authorized = true; // Client accessing their own recording
             console.log(`Client ${loggedInUser.id} accessing their own recording (call ${callId})`);
        }
        // Add edge case: What if supervisor/admin initiated the call using their *own* key?
        // Need to refine logic based on how calls are associated with users/keys.

        if (!authorized) {
             console.warn(`Authorization failed: User ${loggedInUser.id} (${loggedInUser.role}) attempting to access recording ${callId} owned by client ${ownerClientId} (Supervisor: ${ownerSupervisorId})`);
            return res.status(403).json({ message: 'Forbidden: You do not have permission to access this recording.' });
        }

        // --- Step 3: Check if Recording URL Exists ---
        if (!recordingUrl) {
            console.warn(`Recording URL missing for call ID ${callId}`);
            return res.status(404).json({ message: 'Recording URL not found for this call.' });
        }

        // --- Step 4: Fetch and Stream the Audio ---
        console.log(`User authorized. Streaming recording from: ${recordingUrl}`);
        const audioResponse = await axios({
            method: 'get',
            url: recordingUrl,
            responseType: 'stream'
        });

        // Pipe the audio stream back to the client
        res.setHeader('Content-Type', audioResponse.headers['content-type'] || 'audio/wav');
        res.setHeader('Content-Length', audioResponse.headers['content-length'] || '');
        // Handle potential errors during streaming
        audioResponse.data.on('error', (streamError) => {
             console.error(`Error piping audio stream for ${callId}:`, streamError);
             if (!res.headersSent) { // Check if headers were already sent
                res.status(500).json({ message: 'Error streaming audio file.' });
             }
             res.end(); // End the response if an error occurs during piping
        });
        audioResponse.data.pipe(res);

    } catch (error) {
        // Log detailed error, especially if it's from getVapiKeyForRequest
        console.error(`Error in streamRecording for call ID ${callId}:`, error.response ? error.response.data : error.message);
        if (error.message.startsWith('Authorization denied')) {
             res.status(403).json({ message: error.message });
        } else if (error.message.includes('Vapi API Key not found') || (error.response && error.response.status === 404)) {
            res.status(404).json({ message: 'Recording or associated user/key not found.' });
        } else if (error.response && error.response.status === 401) {
             res.status(401).json({ message: 'Authentication failed when accessing Vapi.' });
        }
         else {
             res.status(500).json({ message: 'Server error streaming recording.' });
        }
    }
};

