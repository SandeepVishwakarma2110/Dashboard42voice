
// File: src/services/api.js
// This file is updated with the missing 'verifyUserToken' function.

// import axios from 'axios';

// const API_BASE_URL = '/api';

// // --- NEW: Function to verify the token on app load ---
// export const verifyUserToken = async () => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//         // If there's no token, we don't need to make an API call.
//         // We can just throw an error to signal that the user is not authenticated.
//         throw new Error('No token found.');
//     }
//     const config = {
//         headers: { 'Authorization': `Bearer ${token}` }
//     };
//     // This API call will either succeed (and the token is valid) or fail with a 401 error.
//     return axios.get(`${API_BASE_URL}/auth/verify`, config);
// };

// /**
//  * Fetches both analytics and call log data for the dashboard.
//  */
// export const fetchDashboardData = async () => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//         throw new Error('No authentication token found. Please log in again.');
//     }

//     const config = {
//         headers: {
//             'Authorization': `Bearer ${token}`
//         }
//     };

//     try {
//         // Use Promise.all to fetch both data points concurrently
//         const [analyticsRes, callsRes] = await Promise.all([
//             // FIX: Corrected the URL to the proper analytics endpoint
//             axios.post(`${API_BASE_URL}/calls/analytics`, {}, config), 
//             axios.get(`${API_BASE_URL}/calls`, config)
//         ]);
        
//         // Ensure that callsData is always an array to prevent crashes
//         const callsData = Array.isArray(callsRes.data) ? callsRes.data : [];

//         return {
//             analyticsData: analyticsRes.data,
//             callsData: callsData
//         };
//     } catch (error) {
//         console.error('Failed to fetch dashboard data:', error);
//         // If the token is invalid (401), this error will be caught
//         throw new Error(error.response?.data?.message || 'Could not fetch data from server.');
//     }
// };

// *************************************************************************************************************

// File: client/src/services/api.js
// Final version for Phase 2 RBAC.

import axios from 'axios';

// Use relative path for all API calls
const API_BASE_URL = '/api';

/**
 * Verifies the JWT token stored in localStorage by calling the backend.
 * Returns the user object { id, email, role } if valid.
 * Throws an error if the token is missing, invalid, or expired.
 */
export const verifyUserToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No token found.');
    }
    const config = {
        headers: { 'Authorization': `Bearer ${token}` }
    };
    try {
        const response = await axios.get(`${API_BASE_URL}/auth/verify`, config);
        return response.data.user; // Return the user object
    } catch (error) {
        console.error("Token verification failed:", error.response?.data?.message || error.message);
        throw new Error(error.response?.data?.message || 'Token verification failed.');
    }
};

/**
 * Fetches the list of clients manageable by the logged-in supervisor or admin.
 * Requires a valid JWT token.
 * Returns an array of client objects { id, email, name }.
 */
export const fetchManagedClients = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found.');
    }
    const config = {
        headers: { 'Authorization': `Bearer ${token}` }
    };
    try {
        const response = await axios.get(`${API_BASE_URL}/users/clients`, config);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch managed clients:', error);
        throw new Error(error.response?.data?.message || 'Could not fetch client list.');
    }
};

/**
 * Fetches both analytics and call log data for the dashboard.
 * Requires a valid JWT token.
 * Accepts an optional clientId for supervisor/admin requests.
 */
export const fetchDashboardData = async (clientId = null) => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found. Please log in again.');
    }

    const config = {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };

    // Append clientId as a query parameter if provided by supervisor/admin
    const params = clientId ? { clientId } : {};
    const analyticsUrl = `${API_BASE_URL}/calls/analytics`;
    const callsUrl = `${API_BASE_URL}/calls`;

    try {
        const [analyticsRes, callsRes] = await Promise.all([
            axios.post(analyticsUrl, {}, { ...config, params }),
            axios.get(callsUrl, { ...config, params })
        ]);

        // Ensure callsData is always an array
        const callsData = Array.isArray(callsRes.data) ? callsRes.data : [];

        return {
            analyticsData: analyticsRes.data,
            callsData: callsData
        };
    } catch (error) {
        console.error(`Failed to fetch dashboard data (clientId: ${clientId}):`, error);
        throw new Error(error.response?.data?.message || 'Could not fetch data from server.');
    }
};

