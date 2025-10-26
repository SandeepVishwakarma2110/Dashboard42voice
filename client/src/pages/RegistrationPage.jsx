
// ********************************************************************************************************************************************

// File: src/pages/RegistrationPage.jsx
// Updated for Phase 2: Added name field, renamed key to vapiKey, uses relative API path.

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Use relative path for API endpoint
const API_BASE_URL = '/api/auth';

const RegistrationPage = () => {
    // 1. Add 'name' to state, rename 'key' to 'vapiKey'
    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        password: '', 
        confirmPassword: '', 
        vapiKey: '' 
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false); // Added loading state
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true); // Set loading true

        // 2. Add validation for name field
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.vapiKey) {
             setError('Please fill in all fields.');
             setLoading(false);
             return;
        }

         // Password Length Validation ---
        if (formData.password.length < 8 || formData.password.length > 16 ) {
            setError('Password must be at least 8 characters long. ');
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
             setError('Passwords do not match.');
             setLoading(false); // Stop loading on validation error
             return;
        }

        try {
            // 3. Send the updated formData (including name and vapiKey)
            await axios.post(`${API_BASE_URL}/register`, formData);
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
             setLoading(false); // Set loading false after request finishes
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-center text-white">Create an Account</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                     {/* 4. Add Name Input Field */}
                     <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300">Name</label>
                        <input type="text" name="name" id="name" onChange={handleChange} required className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                     <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
                        <input type="email" name="email" id="email" onChange={handleChange} required className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                     <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
                        <input type="password" name="password" id="password" onChange={handleChange} required className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                     <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">Confirm Password</label>
                        <input type="password" name="confirmPassword" id="confirmPassword" onChange={handleChange} required className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                     <div>
                         {/* 5. Update label, name, and id for Vapi API Key */}
                        <label htmlFor="vapiKey" className="block text-sm font-medium text-gray-300"> API Key</label>
                        <input type="text" name="vapiKey" id="vapiKey" onChange={handleChange} required className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    {error && <p className="text-sm text-red-400 text-center">{error}</p>}
                    {success && <p className="text-sm text-green-400 text-center">{success}</p>}
                    {/* Added loading state to button */}
                    <button type="submit" disabled={loading} className="w-full py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">
                         {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>
                <p className="text-sm text-center text-gray-400">
                    Already have an account? <Link to="/login" className="font-medium text-blue-400 hover:underline">Login here</Link>
                </p>
            </div>
        </div>
    );
};

export default RegistrationPage;

