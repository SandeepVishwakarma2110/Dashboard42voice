// // File: src/pages/DashboardPage.jsx
// // ACTION: Create this new file. This contains your original App.jsx logic.

// import { useState, useEffect, useMemo } from 'react';
// import { fetchDashboardData } from '../services/api';
// import KpiCard from '../components/KpiCard';
// import Charts from '../components/Charts';
// import CallTable from '../components/CallTable';
// import Loader from '../components/Loader';
// import ErrorMessage from '../components/ErrorMessage';
// import { Phone, DollarSign, Clock, BarChart3, LogOut } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

// const DashboardPage = () => {
//     const [analyticsData, setAnalyticsData] = useState(null);
//     const [calls, setCalls] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const navigate = useNavigate();

//     useEffect(() => {
//         const loadData = async () => {
//             try {
//                 const token = localStorage.getItem('token');
//                 const { analyticsData, callsData } = await fetchDashboardData(token);
//                 setAnalyticsData(analyticsData);
//                 setCalls(callsData);
//             } catch (err) {
//                 setError(err.message);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         loadData();
//     }, []);
    
//     const handleLogout = () => {
//         localStorage.removeItem('token');
//         navigate('/login');
//     };

//     const kpiValues = useMemo(() => {
//         // ... (kpi calculation logic remains the same)
//     }, [analyticsData]);
    
    
//     if (loading) return <Loader />;
//     if (error) return <ErrorMessage message={error} />;

//     return (
//         <div className="p-4 sm:p-6 lg:p-8">
//              <header className="mb-8 flex justify-between items-center">
//                 <div>
//                     <h1 className="text-4xl font-bold text-white">Vapi Call Analytics</h1>
//                     <p className="text-gray-400 mt-1">Real-time insights into your call logs.</p>
//                 </div>
//                 <button onClick={handleLogout} className="flex items-center px-4 py-2 space-x-2 text-white bg-red-600 rounded-md hover:bg-red-700">
//                     <LogOut size={18} />
//                     <span>Logout</span>
//                 </button>
//             </header>

//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//                 {/* KPI Cards here */}
//             </div>

//             <Charts calls={calls} />
//             <CallTable calls={calls} />
//         </div>
//     );
// };

// export default DashboardPage;


// File: src/pages/DashboardPage.jsx
// This component now sends the auth token when fetching data.

import { useState, useEffect, useMemo } from 'react';
import { fetchDashboardData } from '../services/api';
import KpiCard from '../components/KpiCard';
import Charts from '../components/Charts';
import CallTable from '../components/CallTable';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import { Phone, DollarSign, Clock, BarChart3, LogOut } from 'lucide-react';

const DashboardPage = ({ onLogout }) => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [calls, setCalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Get the token from localStorage
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error("Authentication token not found.");
                }

                const { analyticsData, callsData } = await fetchDashboardData(token);
                
                const augmentedCalls = callsData.map(call => {
                    if (call.startedAt && call.endedAt) {
                        const start = new Date(call.startedAt);
                        const end = new Date(call.endedAt);
                        const durationInSeconds = (end - start) / 1000;
                        return { ...call, duration: durationInSeconds };
                    }
                    return { ...call, duration: 0 };
                });

                setAnalyticsData(analyticsData);
                setCalls(augmentedCalls);
            } catch (err) {
                setError(err.message);
                console.error("Failed to load dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);
    
    // This is the completed logic for calculating KPI values
    const kpiValues = useMemo(() => {
        if (!analyticsData || !Array.isArray(analyticsData) || analyticsData.length === 0) {
            return { totalCalls: 0, totalCost: 0, totalDuration: 0, avgDuration: 0 };
        }
        const results = analyticsData[0]?.result?.[0] || {};
        return {
            totalCalls: Number(results.countId) || 0,
            totalCost: Number(results.sumCost) || 0,
            totalDuration: Number(results.sumDuration) || 0,
            avgDuration: Number(results.avgDuration) || 0,
        };
    }, [analyticsData]);

    if (loading) return <Loader />;
    if (error) return <ErrorMessage message={error} />;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold text-white">Vapi Call Analytics</h1>
                    <p className="text-gray-400 mt-1">Real-time insights into your call logs.</p>
                </div>
                <button 
                    onClick={onLogout}
                    className="flex items-center px-4 py-2 space-x-2 font-semibold text-white bg-gray-700 rounded-md hover:bg-red-600"
                >
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </header>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                 <KpiCard title="Total Calls" value={kpiValues.totalCalls.toLocaleString()} icon={Phone} color="bg-blue-600" />
                 <KpiCard title="Total Cost" value={`$${kpiValues.totalCost.toFixed(2)}`} icon={DollarSign} color="bg-green-600" />
                 <KpiCard title="Total Duration" value={`${(kpiValues.totalDuration / 60).toFixed(1)} min`} icon={Clock} color="bg-yellow-600" />
                 <KpiCard title="Avg. Duration" value={`${kpiValues.avgDuration.toFixed(1)} sec`} icon={BarChart3} color="bg-indigo-600" />
            </div>

            <Charts calls={calls} />
            <CallTable calls={calls} />
        </div>
    );
};

export default DashboardPage;

