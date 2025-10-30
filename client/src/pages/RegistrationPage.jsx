
// ********************************************************************************************************************************************

// File: src/pages/RegistrationPage.jsx
// Updated for Phase 2: Added name field, renamed key to vapiKey, uses relative API path.

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';


const API_BASE_URL = '/api/auth';

const RegistrationPage = () => {
    
    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        password: '', 
        confirmPassword: '', 
        vapiKey: '' 
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false); 
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true); // Set loading true

        //  validation for name field
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
             setLoading(false); 
             return;
        }

        try {
           
            await axios.post(`${API_BASE_URL}/register`, formData);
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
             setLoading(false); 
        }
    };

      return (
        <div className="flex items-center justify-center min-h-screen bg-[#181737]">
            <div className="w-full max-w-md p-8 space-y-6 bg-gradient-to-br from-[#3E39A1] to-[#15F39E] rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-center text-white">Create an Account</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                         <label className="block text-sm font-medium text-white">Name</label>
                         <input type="text" placeholder='Enter Your Name' name="name"  onChange={handleChange} required className="w-full px-3 py-2 mt-1 text-white bg-[#1E1E2F] border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#15F39E]/40"/>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-white">Email</label>
                        <input type="email" placeholder='Enter Your Email' name="email" onChange={handleChange} required className="w-full px-3 py-2 mt-1 text-white bg-[#1E1E2F] border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#15F39E]/40" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-white">Password</label>
                        <input type="password" placeholder='Enter Your Password' name="password" onChange={handleChange} required className="w-full px-3 py-2 mt-1 text-white   bg-[#1E1E2F] border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#15F39E]/40" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-white">Confirm Password</label>
                        <input type="password" placeholder='Re-enter Your password' name="confirmPassword" onChange={handleChange} required className="w-full px-3 py-2 mt-1 text-white bg-[#1E1E2F] border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#15F39E]/40" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-white">API Key</label>
                        <input type="text" placeholder='Enter API Key' name="vapiKey" onChange={handleChange} required className="w-full px-3 py-2 mt-1 text-white bg-[#1E1E2F] border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#15F39E]/40" />
                    </div>
                    {error && <p className="text-sm text-red-400">{error}</p>}
                    {success && <p className="text-sm text-green-400">{success}</p>}
                    
                     {/* Added loading state to button */}
                    <button type="submit" disabled={loading} className="w-full py-2 font-semibold text-black bg-[#15F39E] rounded-xl hover:bg-[#10bb79]">
                          {loading ? 'Registering...' : 'Register'}
                 </button></form>
                <p className="text-sm text-center text-white">
                    Already have an account? <Link to="/login" className="font-medium text-white hover:underline">Login here</Link>
                </p>
            </div>
        </div>
    );
};

export default RegistrationPage;

