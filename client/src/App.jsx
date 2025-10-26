// // File: src/App.jsx

// import { useState, useEffect, useMemo } from 'react';
// import { fetchDashboardData } from './services/api';
// import KpiCard from './components/KpiCard';
// import Charts from './components/Charts';
// import CallTable from './components/CallTable';
// import Loader from './components/Loader';
// import ErrorMessage from './components/ErrorMessage';

// // Import icons from lucide-react
// import { Phone, DollarSign, Clock, BarChart3 } from 'lucide-react';

// function App() {
//     const [analyticsData, setAnalyticsData] = useState(null);
//     const [calls, setCalls] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         const loadData = async () => {
//             try {
//                 const { analyticsData, callsData } = await fetchDashboardData();
                
//                 console.log("✅ Fetched Analytics Data from API:", analyticsData);
//                 console.log("✅ Fetched Calls Data from API:", callsData);

//                 const augmentedCalls = callsData.map(call => {
//                     if (call.startedAt && call.endedAt) {
//                         const start = new Date(call.startedAt);
//                         const end = new Date(call.endedAt);
//                         const durationInSeconds = (end - start) / 1000;
//                         return { ...call, duration: durationInSeconds };
//                     }
//                     return { ...call, duration: 0 };
//                 });

//                 setAnalyticsData(analyticsData);
//                 setCalls(augmentedCalls);
//             } catch (err) {
//                 setError(err.message);
//                 console.error("❌ Failed to load dashboard data:", err);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         loadData();
//     }, []);

//     const kpiValues = useMemo(() => {
//         console.log("🤔 Recalculating KPIs with analyticsData:", analyticsData);
        
//         // --- FIX: Handle the case where analyticsData is an object, not an array ---
//         if (!analyticsData) {
//             console.log("⚠️ Analytics data is not ready. Defaulting KPIs to 0.");
//             return { totalCalls: 0, totalCost: 0, totalDuration: 0, avgDuration: 0 };
//         }
        
//         // The API returns an array, but if it gets parsed as an object, we handle it.
//         const dataArray = Array.isArray(analyticsData) ? analyticsData : [analyticsData];

//         if (dataArray.length === 0) {
//             console.log("⚠️ Analytics data array is empty. Defaulting KPIs to 0.");
//             return { totalCalls: 0, totalCost: 0, totalDuration: 0, avgDuration: 0 };
//         }
        
//         const results = dataArray[0]?.result?.[0] || {};
//         console.log("📊 Extracted results for KPIs:", results);
        
//         return {
//             totalCalls: Number(results.countId) || 0,
//             totalCost: Number(results.sumCost) || 0,
//             totalDuration: Number(results.sumDuration) || 0,
//             avgDuration: Number(results.avgDuration) || 0,
//         };
//     }, [analyticsData]);

//     if (loading) return <Loader />;
//     if (error) return <ErrorMessage message={error} />;

//     return (
//         <div className="p-4 sm:p-6 lg:p-8">
//             <header className="mb-8">
//                 <h1 className="text-4xl font-bold text-white">Vapi Call Analytics</h1>
//                 <p className="text-gray-400 mt-1">Real-time insights into your call logs.</p>
//             </header>

//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//                 <KpiCard title="Total Calls" value={kpiValues.totalCalls.toLocaleString()} icon={Phone} color="bg-blue-600" />
//                 <KpiCard title="Total Cost" value={`$${kpiValues.totalCost.toFixed(2)}`} icon={DollarSign} color="bg-green-600" />
//                 <KpiCard title="Total Duration" value={`${(kpiValues.totalDuration / 60).toFixed(1)} min`} icon={Clock} color="bg-yellow-600" />
//                 <KpiCard title="Avg. Duration" value={`${kpiValues.avgDuration.toFixed(1)} sec`} icon={BarChart3} color="bg-indigo-600" />
//             </div>

//             <Charts calls={calls} />
//             <CallTable calls={calls} />
//         </div>
//     );
// }

// export default App;

// File: src/App.jsx
// ACTION: This file is now the main router for the application.

// import { Routes, Route, Navigate } from 'react-router-dom';
// import LoginPage from './pages/LoginPage';
// import RegistrationPage from './pages/RegistrationPage';
// import DashboardPage from './pages/DashboardPage'; // We will create this next

// const App = () => {
//     const token = localStorage.getItem('token');

//     return (
//         <Routes>
//             <Route path="/login" element={<LoginPage />} />
//             <Route path="/register" element={<RegistrationPage />} />
//             <Route 
//                 path="/dashboard" 
//                 element={token ? <DashboardPage /> : <Navigate to="/login" />} 
//             />
//             {/* Redirect root to dashboard if logged in, otherwise to login */}
//             <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
//         </Routes>
//     );
// };

// export default App;


// // File: src/App.jsx
// // This file now manages the authentication token state and provides functions to log in and out.

// // import { useState } from 'react';
// // import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// // import LoginPage from './pages/LoginPage';
// // import RegistrationPage from './pages/RegistrationPage';
// // import DashboardPage from './pages/DashboardPage';

// // function App() {
// //   // Initialize token from localStorage to keep the user logged in across page refreshes
// //   const [token, setToken] = useState(localStorage.getItem('token'));

// //   // Function to handle successful login
// //   const handleLogin = (newToken) => {
// //     localStorage.setItem('token', newToken);
// //     setToken(newToken);
// //   };

// //   // Function to handle logout
// //   const handleLogout = () => {
// //     localStorage.removeItem('token');
// //     setToken(null);
// //   };

// //   return (
// //     <BrowserRouter>
// //       <Routes>
// //         <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
// //         <Route 
// //           path="/login" 
// //           element={!token ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
// //         />
// //         <Route 
// //           path="/register" 
// //           element={!token ? <RegistrationPage /> : <Navigate to="/dashboard" />} 
// //         />
// //         <Route 
// //           path="/dashboard" 
// //           element={token ? <DashboardPage onLogout={handleLogout} /> : <Navigate to="/login" />} 
// //         />
// //       </Routes>
// //     </BrowserRouter>
// //   );
// // }

// // export default App;


// File: src/App.jsx
// This file manages the authentication token and provides login/logout functions.
// File: src/App.jsx
// This is the clean version that resolves the "Identifier has already been declared" error.
// ******************************************************************************************************************************************
// import { useState, useEffect } from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';
// import LoginPage from './pages/LoginPage';
// import RegistrationPage from './pages/RegistrationPage';
// import DashboardPage from './pages/DashboardPage';

// function App() {
//   // Initialize token from localStorage to keep the user logged in across page refreshes
//   const [token, setToken] = useState(localStorage.getItem('token'));

  // Function to handle successful login
//   const handleLogin = (newToken) => {
//     localStorage.setItem('token', newToken);
//     setToken(newToken);
//   };

//   // Function to handle logout
//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     setToken(null);
//   };

//   // This effect will run when the app loads to sync the state
//   // in case the token is manually removed from another tab.
//   useEffect(() => {
//       const handleStorageChange = () => {
//           setToken(localStorage.getItem('token'));
//       };
//       window.addEventListener('storage', handleStorageChange);
//       return () => {
//           window.removeEventListener('storage', handleStorageChange);
//       };
//   }, []);

//   return (
//     // The <BrowserRouter> is correctly placed in src/main.jsx
//     <Routes>
//       <Route path="/" element={<Navigate to={token ? "/login" : "/login"} />} />
//       <Route 
//         path="/login" 
//         element={!token ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
//       />
//       <Route 
//         path="/register" 
//         element={!token ? <RegistrationPage /> : <Navigate to="/dashboard" />} 
//       />
//       <Route 
//         path="/dashboard" 
//         element={token ? <DashboardPage onLogout={handleLogout} /> : <Navigate to="/login" />} 
//       />
//     </Routes>
//   );
// }

// export default App;



// ******************************************************************************************************************************************

// File: client/src/App.jsx
// This is the final, robust version that handles token expiration gracefully.

// import { useState, useEffect } from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';
// import LoginPage from './pages/LoginPage';
// import RegistrationPage from './pages/RegistrationPage';
// import DashboardPage from './pages/DashboardPage';
// import Loader from './components/Loader';
// import { verifyUserToken } from './services/api';

// function App() {
//   const [token, setToken] = useState(localStorage.getItem('token'));
//   const [isAuthenticating, setIsAuthenticating] = useState(true); // Start in loading state

//   useEffect(() => {
//     const checkToken = async () => {
//       const storedToken = localStorage.getItem('token');
//       if (storedToken) {
//         try {
//           // If verifyUserToken succeeds, the token is valid.
//           await verifyUserToken();
//           setToken(storedToken);
//         } catch (error) {
//           // If it fails, the token is expired/invalid. Log the user out.
//           console.log("Token verification failed, logging out.");
//           handleLogout();
//         }
//       }
//       setIsAuthenticating(false); // Finished checking, stop loading
//     };

//     checkToken();
//   }, []);

//   const handleLogin = (newToken) => {
//     localStorage.setItem('token', newToken);
//     setToken(newToken);
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     setToken(null);
//   };

//   // While checking the token, show a full-page loader
//   if (isAuthenticating) {
//     return <Loader />;
//   }

//   return (
//     <Routes>
//       <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
//       <Route path="/login" element={!token ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
//       <Route path="/register" element={!token ? <RegistrationPage /> : <Navigate to="/dashboard" />} />
//       <Route path="/dashboard" element={token ? <DashboardPage onLogout={handleLogout} /> : <Navigate to="/login" />} />
//     </Routes>
//   );
// }

// export default App;
// ******************************************************************************************************************************************

// File: client/src/App.jsx
// Final version for Phase 2 RBAC. Handles routing based on role.

import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import DashboardPage from './pages/DashboardPage';
import ClientSelectionPage from './pages/ClientSelectionPage'; // Import new page
import Loader from './components/Loader';
import { verifyUserToken } from './services/api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null); // Store user info { id, email, role }
  const [isAuthenticating, setIsAuthenticating] = useState(true); // Start loading

  // Effect to verify token on initial load
  useEffect(() => {
    const checkToken = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const verifiedUser = await verifyUserToken();
          setUser(verifiedUser); // Store user details { id, email, role }
          setToken(storedToken); // Confirm token is valid
        } catch (error) {
          console.log("Token verification failed, logging out.");
          handleLogout(); // Token invalid/expired
        }
      }
      setIsAuthenticating(false); // Finished check
    };
    checkToken();
  }, []);

  // Effect to listen for storage changes (e.g., logout in another tab)
  useEffect(() => {
      const handleStorageChange = () => {
          const currentToken = localStorage.getItem('token');
          setToken(currentToken);
          if (!currentToken) {
              setUser(null); // Clear user if token is removed
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
    setUser(loggedInUser); // Store user details { id, email, role }
  };

  // Called by DashboardPage or ClientSelectionPage
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Show loader while verifying token
  if (isAuthenticating) {
    return <Loader />;
  }

  // Component to protect routes that require authentication
  const ProtectedRoute = ({ children }) => {
    return token ? children : <Navigate to="/login" />;
  };

  // Component to determine the correct landing page after login/refresh
  const HomeRedirect = () => {
      if (!token || !user) return <Navigate to="/login" />;
      // Clients go to dashboard, others go to client selection
      return user.role === 'client' ? <Navigate to="/dashboard" /> : <Navigate to="/select-client" />;
  }

  return (
    // Note: <BrowserRouter> is correctly placed in src/main.jsx
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

