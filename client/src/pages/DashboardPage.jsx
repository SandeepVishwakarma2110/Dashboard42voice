
// *************************************************************************************************************
// File: client/src/pages/DashboardPage.jsx
// Final fix for timing issue after login.

// import { useState, useEffect, useMemo } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { fetchDashboardData, fetchManagedClients } from '../services/api';
// import KpiCard from '../components/KpiCard';
// import Charts from '../components/Charts';
// import CallTable from '../components/CallTable';
// import Loader from '../components/Loader';
// import ErrorMessage from '../components/ErrorMessage';
// import logo from '../assets/logo.jpeg';
// import { Phone, Timer, Clock, BarChart3, LogOut, ArrowLeft } from 'lucide-react';

// const DashboardPage = ({ user, onLogout }) => {
//     const [analyticsData, setAnalyticsData] = useState(null);
//     const [calls, setCalls] = useState([]);
//     // Start loading true, effect will set it false if needed
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [currentClientDisplayInfo, setCurrentClientDisplayInfo] = useState('Loading...');

//     const location = useLocation();
//     const navigate = useNavigate();

//     // Determine the client ID. Depends on user object being fully available.
//     const clientIdToFetch = useMemo(() => {
//         console.log("DashboardPage useMemo: Recalculating clientIdToFetch. User:", user);
//         if (!user || !user.id || !user.role) {
//             console.log("DashboardPage useMemo: User prop incomplete or null. Returning null.");
//             return null; // Explicitly return null if user data is not ready
//         }
//         if (user.role === 'client') {
//             console.log("DashboardPage useMemo: User is client. Returning ID:", user.id);
//             return user.id;
//         }
//         const selectedId = location.state?.selectedClientId;
//         console.log("DashboardPage useMemo: User is supervisor/admin. selectedClientId:", selectedId);
//         // Return selectedId (could be undefined/null if supervisor hasn't selected)
//         return selectedId || null; // Ensure we return null if no selection
//     }, [user, location.state]); // Depend on the whole user object and location state

//     useEffect(() => {
//         console.log("DashboardPage useEffect: Running effect. clientIdToFetch:", clientIdToFetch);

//         // --- FIX: Only proceed if clientIdToFetch has a valid ID value ---
//         // Handles initial render where user prop might not be ready, resulting in null.
//         if (clientIdToFetch === null || clientIdToFetch === undefined) {
//             console.log("DashboardPage useEffect: clientIdToFetch is null or undefined. Waiting or redirecting.");
//             // If user is loaded but role is wrong for this state, redirect
//             if (user && user.role !== 'client' && !location.state?.selectedClientId) {
//                 console.warn("DashboardPage useEffect: Supervisor/Admin landed without state. Redirecting.");
//                 navigate('/select-client');
//                 return; // Prevent fetching
//             }
//             // If still waiting for user prop, App.jsx loader should cover it.
//             // If client ID calculation failed unexpectedly, set error maybe? For now, just wait.
//             setLoading(false); // Stop loading if we determine we can't fetch yet.
//             return; // Stop the effect here
//         }

//         // Proceed with data loading only if clientIdToFetch is valid
//         console.log(`DashboardPage useEffect: Proceeding with data load for clientId: ${clientIdToFetch}`);
//         const loadData = async () => {
//             setLoading(true); // Ensure loading is true for the fetch
//             setError(null);
//             setAnalyticsData(null);
//             setCalls([]);
//             setCurrentClientDisplayInfo(`Client ID: ${clientIdToFetch}`);

//             try {
//                 const { analyticsData, callsData } = await fetchDashboardData(clientIdToFetch);
//                 console.log("DashboardPage useEffect: Data fetched successfully.", { analyticsData, callsData });

//                 const augmentedCalls = callsData.map(call => {
//                     if (call.startedAt && call.endedAt) {
//                         const start = new Date(call.startedAt);
//                         const end = new Date(call.endedAt);
//                         return { ...call, duration: (end - start) / 1000 };
//                     }
//                     return { ...call, duration: 0 };
//                 });

//                 setAnalyticsData(analyticsData);
//                 setCalls(augmentedCalls);

//                 if (user?.role === 'client') {
//                     setCurrentClientDisplayInfo(user.email);
//                 } else {
//                     try {
//                         const clients = await fetchManagedClients();
//                         const viewedClient = clients.find(c => c.id === clientIdToFetch);
//                         setCurrentClientDisplayInfo(viewedClient?.name || viewedClient?.email || `Client ID: ${clientIdToFetch}`);
//                     } catch (clientListError) {
//                         console.error("Failed to fetch client list for display name:", clientListError);
//                         setCurrentClientDisplayInfo(`Client ID: ${clientIdToFetch}`);
//                     }
//                 }
//             } catch (err) {
//                 const errorMsg = err.message || "An error occurred fetching dashboard data.";
//                 setError(errorMsg);
//                 console.error(`Failed to load dashboard data for client ${clientIdToFetch}:`, err);
//                 setCurrentClientDisplayInfo(`Error Loading Data`);
//             } finally {
//                 setLoading(false); // Stop loading after fetch attempt
//             }
//         };
//         loadData();
//         // Effect depends only on the actual ID changing or navigate function reference
//     }, [clientIdToFetch, navigate]); // Rely on clientIdToFetch changing from null/undefined to a value

//     const kpiValues = useMemo(() => {
//         if (!analyticsData || !Array.isArray(analyticsData) || analyticsData.length === 0) {
//             return { totalCalls: 0, totalCost: 0, totalDuration: 0, avgDuration: 0 };
//         }
//         const results = analyticsData[0]?.result?.[0] || {};
//         return {
//             totalCalls: Number(results.countId) || 0,
//             maxDuration: Number(results.maxDuration) || 0,
//            totalCost: Number(results.sumCost) || 0,
//             totalDuration: Number(results.sumDuration) || 0,
//             avgDuration: Number(results.avgDuration) || 0,
//         };
//     }, [analyticsData]);

//     // Show loader if the main loading state is true OR if we are still waiting for a valid client ID
//     if (loading || clientIdToFetch === null) {
//         console.log("DashboardPage render: Showing Loader. loading:", loading, "clientIdToFetch:", clientIdToFetch);
//         // Ensure user object exists before trying to access role for conditional rendering logic inside loader/error states
//         if (!user && loading) return <Loader message="Authenticating..." />; // Show generic loader if user object not yet available
//         if (loading) return <Loader message="Loading Dashboard Data..." />; // Show specific loader if fetching data

//         // If not loading but clientId is still null, it means we can't determine the client yet.
//         // This might happen briefly or if a supervisor hasn't selected. App.jsx handles supervisor redirect.
//         // For a client, if user exists but clientIdToFetch is null, show an error state.
//         if (user && user.role === 'client' && clientIdToFetch === null) {
//             return <ErrorMessage message="Could not determine Client ID for dashboard." />;
//         }
//         // Fallback loader if in an unexpected state
//         return <Loader />;
//     }


//     console.log("DashboardPage render: Rendering content. Error state:", error);
//     return (
//         <div className="p-4 sm:p-6 lg:p-8 bg-gray-900 min-h-screen text-gray-200">
//             {/* <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//                 <div>

//                         <img src={logo} alt="Vapi Logo" className="h-20 w-20" />

//                     <h1 className="text-3xl lg:text-4xl font-bold text-white"> Call Analytics</h1>
//                     <p className="text-gray-400 mt-1 text-sm sm:text-base">
//                         Viewing Dashboard for: <span className="font-semibold text-gray-100">{currentClientDisplayInfo}</span>
//                     </p>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                     {user && user.role !== 'client' && (
//                         <button
//                             onClick={() => navigate('/select-client')}
//                             className="flex items-center px-3 py-2 space-x-2 text-sm font-semibold text-white bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
//                             title="Back to Client Selection"
//                         >
//                             <ArrowLeft size={16} />
//                             <span>Select Client</span>
//                         </button>
//                     )}
//                     <button
//                         onClick={onLogout}
//                         className="flex items-center px-3 py-2 space-x-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
//                         title="Logout"
//                     >
//                         <LogOut size={16} />
//                         <span>Logout</span>
//                     </button>
//                 </div>
//             </header>
//          */}

//          <header className="mb-8 flex justify-between items-center">
//          <div className="flex items-center space-x-4">
//            <img src={logo} alt="Vapi Logo" className="h-20 w-20" />
//           <div>
//             <h1 className="text-4xl font-bold text-white leading-tight">Call Analytics</h1>
//             <p className="text-gray-400 mt-1 text-sm sm:text-base">
//                         Viewing Dashboard for: <span className="font-semibold text-gray-100">{currentClientDisplayInfo}</span>
//                     </p> 
//          </div>

//        </div>
//           <div className="flex items-center space-x-2">
//                     {user && user.role !== 'client' && (
//                         <button
//                             onClick={() => navigate('/select-client')}
//                             className="flex items-center px-3 py-2 space-x-2 text-sm font-semibold text-white bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
//                             title="Back to Client Selection"
//                         >
//                             <ArrowLeft size={16} />
//                             <span>Select Client</span>
//                         </button>
//                     )}
//                     <button
//                         onClick={onLogout}
//                         className="flex items-center px-3 py-2 space-x-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
//                         title="Logout"
//                     >
//                         <LogOut size={16} />
//                         <span>Logout</span>
//                     </button>
//                 </div>
//       </header>

//             {error && <ErrorMessage message={error} />}

//             {!loading && !error && clientIdToFetch !== null && (
//                 <>
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
//                         <KpiCard title="Total Calls" value={kpiValues.totalCalls.toLocaleString()} icon={Phone} color="bg-blue-600" />
//                         {/* <KpiCard title="Total Cost" value={`$${kpiValues.totalCost.toFixed(2)}`} icon={DollarSign} color="bg-green-600" /> */}
//                         <KpiCard title="Max Duration" value={formatDuration(kpiValues.maxDuration)} icon={Timer} color="bg-purple-600" />
//                         <KpiCard title="Total Duration" value={`${(kpiValues.totalDuration / 60).toFixed(1)} min`} icon={Clock} color="bg-yellow-600" />
//                         <KpiCard title="Avg. Duration" value={`${kpiValues.avgDuration.toFixed(1)} sec`} icon={BarChart3} color="bg-indigo-600" />
//                     </div>
//                     <Charts calls={calls} />
//                     <CallTable calls={calls} />
//                 </>
//             )}
//             {/* Message if loading finished but clientId determination failed */}
//             {!loading && !error && clientIdToFetch === null && (
//                 <div className="text-center text-gray-500 mt-10">
//                     <ErrorMessage message="Could not determine which client dashboard to load." />
//                 </div>
//             )}
//         </div>
//     );
// };

// export default DashboardPage;


// *************************************************************************************************************

// File: client/src/pages/DashboardPage.jsx
// Final Phase 2 version: Handles roles, selected client, Max Duration KPI, loading fix.

import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchDashboardData, fetchManagedClients } from '../services/api';
import KpiCard from '../components/KpiCard';
import Charts from '../components/Charts';
import CallTable from '../components/CallTable';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import logo from '../assets/logo.jpeg';
import { Phone, Timer, Clock, BarChart3, LogOut, ArrowLeft } from 'lucide-react';

const DashboardPage = ({ user, onLogout }) => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [calls, setCalls] = useState([]);
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null);
    const [currentClientDisplayInfo, setCurrentClientDisplayInfo] = useState('Loading...');

    const location = useLocation();
    const navigate = useNavigate();

    
    const clientIdToFetch = useMemo(() => {
        console.log("DashboardPage useMemo: Recalculating clientIdToFetch. User:", user);
        if (!user || !user.id || !user.role) {
            //console.log("DashboardPage useMemo: User prop incomplete or null. Returning null.");
            return null;
        }
        if (user.role === 'client') {
            //console.log("DashboardPage useMemo: User is client. Returning ID:", user.id);
            return user.id;
        }
        const selectedId = location.state?.selectedClientId;
        //console.log("DashboardPage useMemo: User is supervisor/admin. selectedClientId:", selectedId);
        return selectedId || null;
    }, [user, location.state]);

    
    useEffect(() => {
        console.log("DashboardPage useEffect: Running effect. clientIdToFetch:", clientIdToFetch);

        if (clientIdToFetch === null || clientIdToFetch === undefined) {
            //console.log("DashboardPage useEffect: clientIdToFetch is null or undefined. Waiting or redirecting.");
          
            if (user && user.role !== 'client' && !location.state?.selectedClientId) {
                //console.warn("DashboardPage useEffect: Supervisor/Admin landed without state. Redirecting.");
                navigate('/select-client');
                return;
            }
           
            if (user && user.role === 'client') {
                setError("Cannot load dashboard: Client ID could not be determined.");
            }
            setLoading(false); // Stop loading if we can't fetch
            return;
        }

        
       // console.log(`DashboardPage useEffect: Proceeding with data load for clientId: ${clientIdToFetch}`);
        const loadData = async () => {
            setLoading(true);
            setError(null);
            setAnalyticsData(null);
            setCalls([]);
            setCurrentClientDisplayInfo(`Client ID: ${clientIdToFetch}`);

            try {
               
                const { analyticsData, callsData } = await fetchDashboardData(clientIdToFetch);
                //console.log("DashboardPage useEffect: Data fetched successfully.", { analyticsData, callsData });

                
                const augmentedCalls = callsData.map(call => {
                    if (call.startedAt && call.endedAt) {
                        const start = new Date(call.startedAt);
                        const end = new Date(call.endedAt);
                        return { ...call, duration: (end - start) / 1000 };
                    }
                    return { ...call, duration: 0 };
                });

                setAnalyticsData(analyticsData);
                setCalls(augmentedCalls);

              
                if (user?.role === 'client') {
                    setCurrentClientDisplayInfo(user.email);
                } else {
                // Fetch client details for display if supervisor/admin
                    try {
                        const clients = await fetchManagedClients();
                        const viewedClient = clients.find(c => c.id === clientIdToFetch);
                        setCurrentClientDisplayInfo(viewedClient?.name || viewedClient?.email || `Client ID: ${clientIdToFetch}`);
                    } catch (clientListError) {
                        console.error("Failed to fetch client list for display name:", clientListError);
                        setCurrentClientDisplayInfo(`Client ID: ${clientIdToFetch}`); // Fallback
                    }
                }
            } catch (err) {
                const errorMsg = err.message || "An error occurred fetching dashboard data.";
                setError(errorMsg);
                //console.error(`Failed to load dashboard data for client ${clientIdToFetch}:`, err);
                setCurrentClientDisplayInfo(`Error Loading Data`);
            } finally {
                setLoading(false); 
            }
        };
        loadData();
    }, [clientIdToFetch, navigate, user]); 

 
    const kpiValues = useMemo(() => {
        if (!analyticsData || !Array.isArray(analyticsData) || analyticsData.length === 0) {
            return { totalCalls: 0, maxDuration: 0, totalDuration: 0, avgDuration: 0 };
        }
        const results = analyticsData[0]?.result?.[0] || {};
        //console.log("Analytics results for KPIs:", results);
        return {
            totalCalls: Number(results.countId) || 0,
            maxDuration: Number(results.maxDuration) || 0, // Assuming key is maxDuration
            totalDuration: Number(results.sumDuration) || 0,
            avgDuration: Number(results.avgDuration) || 0,
        };
    }, [analyticsData]);



    // Show loader if still authenticating in App.jsx or fetching data here
    if (loading || clientIdToFetch === null) {
        //console.log("DashboardPage render: Showing Loader. loading:", loading, "clientIdToFetch:", clientIdToFetch, "user:", user);
      
        if (!user && loading) return <Loader message="Authenticating..." />;
        if (loading) return <Loader message="Loading Dashboard Data..." />;
        
    }

    // Render the dashboard content
    //console.log("DashboardPage render: Rendering content. Error state:", error);
    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-[#181737] min-h-screen text-gray-200">

            <header className="mb-8 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <img src={logo} alt="Vapi Logo" className="h-20 w-20" />
                    <div>
                        <h1 className="text-4xl font-bold text-white leading-tight">Call Analytics</h1>
                        <p className="text-gray-400 mt-1 text-sm sm:text-base">
                            Viewing Dashboard for: <span className="font-semibold text-gray-100">{currentClientDisplayInfo}</span>
                        </p>
                    </div>

                </div>
                <div className="flex items-center space-x-2">
                    {user && user.role !== 'client' && (
                        <button
                            onClick={() => navigate('/select-client')}
                            className="flex items-center px-3 py-2 space-x-2 text-sm font-semibold text-white bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            title="Back to Client Selection"
                        >
                            <ArrowLeft size={16} />
                            <span>Select Client</span>
                        </button>
                    )}
                    <button
                        onClick={onLogout}
                        className="flex items-center px-3 py-2 space-x-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                        title="Logout"
                    >
                        <LogOut size={16} />
                        <span>Logout</span>
                    </button>
                </div>
            </header>

            {/* Display error if one occurred */}
            {error && <ErrorMessage message={error} />}

            {/* Only render dashboard sections if not loading, no error, and clientId is valid */}
            {!loading && !error && clientIdToFetch !== null && (
                <>
                    {/* KPI Cards including Max Duration */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                        <KpiCard title="Total Calls" value={kpiValues.totalCalls.toLocaleString()} icon={Phone} color="bg-[#15F39E]" />
                        <KpiCard title="Max Duration" value={`${(kpiValues.maxDuration).toFixed(2)} min`} icon={Timer} color="bg-[#3E39A1]" />
                        <KpiCard title="Total Duration" value={`${(kpiValues.totalDuration).toFixed(2)} min`} icon={Clock} color="bg-[#15F39E]" />
                        <KpiCard title="Avg. Duration" value={`${kpiValues.avgDuration.toFixed(2)} min`} icon={BarChart3} color="bg-[#3E39A1]" />
                    </div>
                    {/* Charts and Table */}
                    <Charts calls={calls} />
                    {/*<CallTable calls={calls} /> */}
                    <CallTable calls={calls} viewedClientId={clientIdToFetch} />
                </>
            )}
            {/* Show specific error if clientId couldn't be determined after loading */}
            {!loading && !error && clientIdToFetch === null && (
                <div className="text-center text-gray-500 mt-10">
                    <ErrorMessage message="Could not determine Client ID for dashboard." />
                </div>
            )}
        </div>
    );
};

export default DashboardPage;

