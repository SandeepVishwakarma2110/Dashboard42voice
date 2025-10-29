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

      
      const userDetails = {
        email: formData.email, 
        role: response.data.role, 
        id: response.data.id      
      };
      console.log("LoginPage handleSubmit: Calling onLogin with:", response.data.token, userDetails); 
      onLogin(response.data.token, userDetails); 

    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#181737]">
      <div className="w-[355px] h-[420px] bg-gradient-to-br from-[#3E39A1] to-[#15F39E] rounded-2xl shadow-lg flex flex-col items-center justify-center p-6 relative">
        {/* Inner dark box */}
        <div className="absolute inset-[2px] bg-gradient-to-br from-[#3E39A1] to-[#15F39E] rounded-2xl"></div>

        <form
          onSubmit={handleSubmit}
          className="relative z-10 w-full flex flex-col items-center space-y-5"
        >
          <h2 className="text-white text-xl font-semibold mb-2">Log In</h2>

          {/* Email */}
          <div className="w-[80%]">
            <label className="text-sm text-gray-200 block mb-1">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-[#1E1E2F] text-gray-200 placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00FFC6] transition-all"
            />
          </div>

          {/* Password */}
          <div className="w-[80%]">
            <label className="text-sm text-gray-200 block mb-1">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-[#1E1E2F] text-gray-200 placeholder-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00FFC6] transition-all"
            />
          </div>

          {/* Button */}
          {error && <p className="text-sm text-red-400 text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-[80%] bg-[#15F39E] hover:bg-[#15F39E] text-black font-medium py-2 rounded-xl transition-colors" >
            {loading ? 'Logging in...' : 'Sign in'}
          </button>

          {/* Register */}
          <p className="text-sm text-gray-300 mt-2">
            Don’t have an account?{" "}
            <Link to="/register" className="text-white hover:underline font-bold">
              Register here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

