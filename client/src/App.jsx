// File: client/src/App.jsx
// Final version for Phase 2 RBAC.

import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import DashboardPage from './pages/DashboardPage';
import ClientSelectionPage from './pages/ClientSelectionPage'; 
import Loader from './components/Loader';
import { verifyUserToken } from './services/api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null); 
  const [isAuthenticating, setIsAuthenticating] = useState(true); 

  
  useEffect(() => {
    const checkToken = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const verifiedUser = await verifyUserToken();
          setUser(verifiedUser);
          setToken(storedToken); 
        } catch (error) {
          console.log("Token verification failed, logging out.");
          handleLogout(); 
        }
      }
      setIsAuthenticating(false); 
      
    };
    checkToken();
  }, []);

  
  useEffect(() => {
      const handleStorageChange = () => {
          const currentToken = localStorage.getItem('token');
          setToken(currentToken);
          if (!currentToken) {
              setUser(null); 
          }
      };
      window.addEventListener('storage', handleStorageChange);
      return () => {
          window.removeEventListener('storage', handleStorageChange);
      };
  }, []);


  // Called by LoginPage on successful login
  const handleLogin = (newToken, loggedInUser) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(loggedInUser); 
  };

  
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

 
  if (isAuthenticating) {
    return <Loader />;
  }

 
  const ProtectedRoute = ({ children }) => {
    return token ? children : <Navigate to="/login" />;
  };

 
  const HomeRedirect = () => {
      if (!token || !user) return <Navigate to="/login" />;
    
      return user.role === 'client' ? <Navigate to="/dashboard" /> : <Navigate to="/select-client" />;
  }

  return (
    
    <Routes>
      {/* Root path redirects based on role */}
      <Route path="/" element={<HomeRedirect />} />

      {/* Login/Register only accessible when logged out */}
      <Route path="/login" element={!token ? <LoginPage onLogin={handleLogin} /> : <HomeRedirect />} />
      <Route path="/register" element={!token ? <RegistrationPage /> : <HomeRedirect />} />

      {/* Client Selection page for supervisor/admin */}
      <Route
        path="/select-client"
        element={
          <ProtectedRoute>
            {/* Ensure user is loaded before checking role */}
            {user && (user.role === 'supervisor' || user.role === 'admin') ? (
              <ClientSelectionPage onLogout={handleLogout} />
            ) : (
              // If user is loaded but is a client, redirect them
              user ? <Navigate to="/dashboard" /> : null // Avoid rendering null during auth check
            )}
          </ProtectedRoute>
        }
      />

      {/* Dashboard page */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
             {/* Pass user details and logout handler */}
            <DashboardPage user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />

      {/* Catch-all route for unknown paths */}
       <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;

