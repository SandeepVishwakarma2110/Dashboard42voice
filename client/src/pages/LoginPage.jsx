// // File: src/pages/LoginPage.jsx
// // ACTION: Create this new file.

// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import axios from 'axios';

// const API_BASE_URL = 'http://localhost:3000/api/auth';

// const LoginPage = () => {
//     const [formData, setFormData] = useState({ email: '', password: '' });
//     const [error, setError] = useState('');
//     const navigate = useNavigate();

//     const handleChange = (e) => {
//         setFormData({ ...formData, [e.target.name]: e.target.value });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError('');
//         try {
//             const response = await axios.post(`${API_BASE_URL}/login`, formData);
//             localStorage.setItem('token', response.data.token); // Store token 
//             navigate('/dashboard'); // Redirect to dashboard
//         } catch (err) {
//             setError(err.response?.data?.message || 'Login failed. Please try again.');
//         }
//     };

//     return (
//         <div className="flex items-center justify-center min-h-screen bg-gray-900">
//             <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
//                 <h1 className="text-3xl font-bold text-center text-white">Login</h1>
//                 <form onSubmit={handleSubmit} className="space-y-6">
//                     <div>
//                         <label className="block text-sm font-medium text-gray-300">Email</label>
//                         <input type="email" name="email" onChange={handleChange} required className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-300">Password</label>
//                         <input type="password" name="password" onChange={handleChange} required className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
//                     </div>
//                     {error && <p className="text-sm text-red-400">{error}</p>}
//                     <button type="submit" className="w-full py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">Login</button>
//                 </form>
//                 <p className="text-sm text-center text-gray-400">
//                     Don't have an account? <Link to="/register" className="font-medium text-blue-400 hover:underline">Register here</Link>
//                 </p>
//             </div>
//         </div>
//     );
// };

// export default LoginPage;


// File: src/pages/LoginPage.jsx
// This component has been updated to trigger the state change in App.jsx.

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// 1. Accept the 'onLogin' function as a prop from App.jsx
const LoginPage = ({ onLogin }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      const response = await axios.post('/api/auth/login', formData);
      
     
      // 2. Call the onLogin function with the new token.
      // This updates the state in App.jsx, which triggers the redirect.
      onLogin(response.data.token);
      
      // 3. Although the state change will cause a redirect, we can
      //    also navigate programmatically for a faster user experience.
      navigate('/dashboard');

    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-white">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              required
            />
          </div>
          {error && <p className="text-sm text-red-400 text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="text-sm text-center text-gray-400">
          Don't have an account? <Link to="/register" className="font-medium text-blue-400 hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;


