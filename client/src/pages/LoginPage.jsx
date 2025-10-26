
// **************************************************************************************************

// File: client/src/pages/LoginPage.jsx
// Updated handleSubmit to pass the complete user object (including ID) to onLogin.

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = '/api/auth';

const LoginPage = ({ onLogin }) => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!formData.email || !formData.password) {
            setError('Please enter both email and password.');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/login`, formData);

            // --- FIX: Create the userDetails object using data from the response ---
            const userDetails = {
                email: formData.email, // Keep email from form data
                role: response.data.role, // Get role from response
                id: response.data.id      // Get ID from response
            };
            console.log("LoginPage handleSubmit: Calling onLogin with:", response.data.token, userDetails); // Add log
            onLogin(response.data.token, userDetails); // Pass the complete object

        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ... rest of the component's return statement remains the same ...
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-center text-white">Login</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            autoComplete="email"
                            required
                            className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            autoComplete="current-password"
                            required
                            className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>
                    {error && <p className="text-sm text-red-400 text-center">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
                    >
                        {loading ? 'Logging in...' : 'Sign in'}
                    </button>
                </form>
                <p className="text-sm text-center text-gray-400">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-medium text-blue-400 hover:text-blue-300 hover:underline">
                        Register here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;

