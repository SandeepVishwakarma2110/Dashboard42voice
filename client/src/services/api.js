// // File: src/services/api.js

// import axios from 'axios';

// const API_BASE_URL = 'http://localhost:3000/api';

// /**
//  * Fetches all necessary data for the dashboard from our backend server.
//  */
// export const fetchDashboardData = async () => {
//     try {
//         // Use Promise.all to fetch both analytics and calls data in parallel.
//         const [analyticsRes, callsRes] = await Promise.all([
//             axios.post(`${API_BASE_URL}/analytics`, {}),
//             // --- FIX: Removed the "?limit=1000" to fetch all calls from our backend ---
//             axios.get(`${API_BASE_URL}/calls`)
//         ]);

//         // Axios puts the response data in the `.data` property
//         return {
//             analyticsData: analyticsRes.data,
//             callsData: callsRes.data
//         };
//     } catch (error) {
//         console.error("Error fetching data from the backend server:", error);
//         // We re-throw the error so the component can catch it and display a message.
//         throw new Error("Failed to connect to the backend server. Is it running?");
//     }
// };


// File: client/src/services/api.js
// This file has been updated to call the correct backend API endpoint for analytics.
// File: client/src/services/api.js
// This file has been updated to prevent the 'p.map is not a function' error.

// import axios from 'axios';

// // The base URL is a relative path, which is correct for production.
// const API_BASE_URL = '/api';

// /**
//  * Fetches both analytics and call log data for the dashboard.
//  */
// export const fetchDashboardData = async () => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//         throw new Error('No authentication token found. Please log in again.');
//     }

//     // Set up the authorization header to be sent with every authenticated request.
//     const config = {
//         headers: {
//             'Authorization': `Bearer ${token}`
//         }
//     };

//     try {
//         // Use Promise.all to fetch both data points concurrently for better performance.
//         const [analyticsRes, callsRes] = await Promise.all([
//             axios.post(`${API_BASE_URL}/calls/analytics`, {}, config),
//             axios.get(`${API_BASE_URL}/calls`, config)
//         ]);
        
//         // --- FIX: Ensure that callsData is always an array ---
//         // If callsRes.data is not an array, default to an empty array to prevent crashes.
//         const callsData = Array.isArray(callsRes.data) ? callsRes.data : [];

//         return {
//             analyticsData: analyticsRes.data,
//             callsData: callsData
//         };
//     } catch (error) {
//         console.error('Failed to fetch dashboard data:', error);
//         // Provide a more user-friendly error message.
//         throw new Error(error.response?.data?.message || 'Failed to connect to the backend server. Is it running?');
//     }
// };






// File: src/services/api.js
// This file is updated with the missing 'verifyUserToken' function.

import axios from 'axios';

const API_BASE_URL = '/api';

// --- NEW: Function to verify the token on app load ---
export const verifyUserToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        // If there's no token, we don't need to make an API call.
        // We can just throw an error to signal that the user is not authenticated.
        throw new Error('No token found.');
    }
    const config = {
        headers: { 'Authorization': `Bearer ${token}` }
    };
    // This API call will either succeed (and the token is valid) or fail with a 401 error.
    return axios.get(`${API_BASE_URL}/auth/verify`, config);
};

/**
 * Fetches both analytics and call log data for the dashboard.
 */
export const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found. Please log in again.');
    }

    const config = {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };

    try {
        // Use Promise.all to fetch both data points concurrently
        const [analyticsRes, callsRes] = await Promise.all([
            // FIX: Corrected the URL to the proper analytics endpoint
            axios.post(`${API_BASE_URL}/calls/analytics`, {}, config), 
            axios.get(`${API_BASE_URL}/calls`, config)
        ]);
        
        // Ensure that callsData is always an array to prevent crashes
        const callsData = Array.isArray(callsRes.data) ? callsRes.data : [];

        return {
            analyticsData: analyticsRes.data,
            callsData: callsData
        };
    } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // If the token is invalid (401), this error will be caught
        throw new Error(error.response?.data?.message || 'Could not fetch data from server.');
    }
};

