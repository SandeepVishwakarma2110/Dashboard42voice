



// File: server/controllers/callController.js
// Final Phase 2 version: Includes fully implemented streamRecording function.
// File: server/controllers/callController.js
// Ensures getVapiKeyForRequest is correctly imported and used.
// File: server/controllers/callController.js
// Re-verified correct import and usage of vapiService functions.
// File: server/controllers/callController.js
// Switched to named imports for vapiService functions.
// File: server/controllers/callController.js
// Updated streamRecording to read clientId from query parameters.

import axios from 'axios';
import { fetchAllCalls, fetchAnalyticsData, getVapiKeyForRequest } from '../services/vapiService.js';
import { sql, poolPromise } from '../DB/db.js';

// --- Existing Controllers (getAllCalls, getAnalytics - no changes needed) ---
export const getAllCalls = async (req, res) => { /* ... */ try { const allCalls = await fetchAllCalls(req.user, req.requestedClientId); res.status(200).json(allCalls); } catch (error) { console.error('Error in callController (getAllCalls):', error.message); const statusCode = error.message.startsWith('Authorization denied') ? 403 : error.message.includes('Vapi API Key not found') ? 404 : error.message.startsWith('Invalid Vapi API Key') ? 401 : 500; res.status(statusCode).json({ message: error.message || 'Failed to fetch call data.' }); } };
export const getAnalytics = async (req, res) => { /* ... */ try { const analyticsData = await fetchAnalyticsData(req.user, req.requestedClientId); res.status(200).json(analyticsData); } catch (error) { console.error('Error in callController (getAnalytics):', error.message); const statusCode = error.message.startsWith('Authorization denied') ? 403 : error.message.includes('Vapi API Key not found') ? 404 : error.message.startsWith('Invalid Vapi API Key') ? 401 : 500; res.status(statusCode).json({ message: error.message || 'Failed to fetch analytics data.' }); } };


// --- Controller function for streaming recording ---
export const streamRecording = async (req, res) => {
    const { callId } = req.params; // ID of the specific recording
    const loggedInUser = req.user; // User requesting the recording
    // --- FIX: Read clientId from query parameters ---
    const requestedClientId = req.query.clientId; // ID of the client whose recording is being requested

    if (!callId) {
        return res.status(400).json({ message: 'Call ID parameter is required.' });
    }
     // --- FIX: Add check for clientId when user is supervisor/admin ---
     if ((loggedInUser.role === 'supervisor' || loggedInUser.role === 'admin') && !requestedClientId) {
          console.error(`Error in streamRecording: Supervisor/Admin ${loggedInUser.id} did not provide clientId in query.`);
          return res.status(400).json({ message: 'Client ID query parameter is required for supervisors/admins.' });
     }


    try {
        const pool = await poolPromise;

        console.log(`Attempting to fetch details for call ID: ${callId}`);

        // --- FIX: Pass the correct requestedClientId to getVapiKeyForRequest ---
        // If it's a client user, requestedClientId will be ignored by getVapiKeyForRequest,
        // If it's supervisor/admin, it will be used for authorization check and key lookup.
        const apiKeyForLookup = await getVapiKeyForRequest(loggedInUser, requestedClientId);

        let vapiCallDetails;
        try {
            console.log(`Fetching Vapi call details using key ending with ...${apiKeyForLookup.slice(-4)}`);
            vapiCallDetails = await axios.get(`https://api.vapi.ai/call/${callId}`, {
                headers: { 'Authorization': `Bearer ${apiKeyForLookup}` }
            });
            console.log("Vapi call details fetched successfully.");
        } catch (vapiError) {
             console.error("Error fetching Vapi call details:", vapiError.response ? { status: vapiError.response.status, data: vapiError.response.data } : vapiError.message);
             if (vapiError.response && vapiError.response.status === 404) { return res.status(404).json({ message: 'Call record not found via Vapi API.' }); }
             if (vapiError.response && vapiError.response.status === 401) { return res.status(401).json({ message: 'Could not authenticate with Vapi to fetch call details (check API key permissions).' }); }
             throw new Error('Failed to fetch call details from Vapi.');
        }

        const recordingUrl = vapiCallDetails.data?.recordingUrl;

        // --- Authorization Check (Refined) ---
        // Authorization is effectively handled within getVapiKeyForRequest now.
        // If that function didn't throw an error, the user is authorized for the *key*.
        // We still need to ensure the fetched call *actually belongs* to the client
        // if Vapi doesn't enforce this via the key (e.g., using orgId if available).
        // For now, we trust the key lookup implies access.
        console.log(`Authorization check passed implicitly via key lookup for user ${loggedInUser.id} accessing call ${callId}`);


        if (!recordingUrl) {
            console.warn(`Recording URL missing for call ID ${callId}`);
            return res.status(404).json({ message: 'Recording URL not found for this call.' });
        }

        // --- Fetch and Stream Audio ---
        console.log(`Streaming recording from: ${recordingUrl}`);
        const audioResponse = await axios({ method: 'get', url: recordingUrl, responseType: 'stream' });

        res.setHeader('Content-Type', audioResponse.headers['content-type'] || 'audio/wav');
        if (audioResponse.headers['content-length']) { res.setHeader('Content-Length', audioResponse.headers['content-length']); }
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        audioResponse.data.on('error', (streamError) => {
             console.error(`Error piping audio stream for ${callId}:`, streamError);
             if (!res.headersSent) { res.status(500).json({ message: 'Error streaming audio file.' }); }
             else { res.end(); }
        });
        audioResponse.data.pipe(res);

    } catch (error) {
        // Catch errors from getVapiKeyForRequest or other setup steps
        console.error(`Unhandled error in streamRecording for call ID ${callId}:`, error.message);
        if (!res.headersSent) {
            if (error.message.startsWith('Authorization denied')) { res.status(403).json({ message: error.message }); }
            else if (error.message.includes('Vapi API Key not found')) { res.status(404).json({ message: 'Associated user/key not found.' }); }
            else if (error.response && error.response.status === 401) { res.status(401).json({ message: 'Authentication failed.' }); }
            else { res.status(500).json({ message: error.message || 'Server error processing recording request.' }); } // Send back more specific error
        } else {
            res.end();
        }
    }
};

