// // File: src/components/Charts.jsx

// import { useMemo } from 'react';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// const Charts = ({ calls }) => {
//     const outcomeChartData = useMemo(() => {
//         if (!calls.length) return [];
//         const outcomes = calls.reduce((acc, call) => {
//             const reason = call.endCallReason || 'Unknown';
//             acc[reason] = (acc[reason] || 0) + 1;
//             return acc;
//         }, {});
//         return Object.entries(outcomes).map(([name, count]) => ({ name, count }));
//     }, [calls]);

//     const callsOverTimeData = useMemo(() => {
//         if (!calls.length) return [];
//         const callsByDate = calls.reduce((acc, call) => {
//             if (call.startedAt) {
//                 const date = new Date(call.startedAt).toLocaleDateString();
//                 acc[date] = (acc[date] || 0) + 1;
//             }
//             return acc;
//         }, {});
//         return Object.entries(callsByDate)
//             .map(([date, count]) => ({ date, count }))
//             .sort((a, b) => new Date(a.date) - new Date(b.date));
//     }, [calls]);

//     return (
//         <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
//             <div className="lg:col-span-3 bg-gray-800 p-6 rounded-xl shadow-lg">
//                 <h2 className="text-xl font-semibold mb-4 text-white">Calls Over Time</h2>
//                 <ResponsiveContainer width="100%" height={300}>
//                     <AreaChart data={callsOverTimeData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
//                         <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
//                         <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
//                         <YAxis stroke="#9ca3af" fontSize={12} />
//                         <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
//                         <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Calls" />
//                     </AreaChart>
//                 </ResponsiveContainer>
//             </div>
//             <div className="lg:col-span-2 bg-gray-800 p-6 rounded-xl shadow-lg">
//                 <h2 className="text-xl font-semibold mb-4 text-white">Call Outcomes</h2>
//                 <ResponsiveContainer width="100%" height={300}>
//                     <BarChart data={outcomeChartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
//                         <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
//                         <XAxis type="number" stroke="#9ca3af" fontSize={12} />
//                         <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={12} width={100} tick={{ fill: '#d1d5db' }} />
//                         <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} cursor={{ fill: '#374151' }} />
//                         <Bar dataKey="count" fill="#3b82f6" name="Total Calls" barSize={20} />
//                     </BarChart>
//                 </ResponsiveContainer>
//             </div>
//         </div>
//     );
// };

// export default Charts;




// ***********************************************************************************************************************
  // File: client/src/components/Charts.jsx
// Updated outcomeChartData calculation to correctly handle endedReason.

import { useMemo } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,Cell, AreaChart, Area } from 'recharts';

const Charts = ({ calls }) => {

    // --- FIX: Updated logic to handle potentially missing/empty endedReason ---
    const outcomeChartData = useMemo(() => {
        if (!Array.isArray(calls) || calls.length === 0) return [];

        const outcomes = calls.reduce((acc, call) => {
            // Trim whitespace and default to 'Unknown' if reason is null, undefined, or empty string
            const reason = call.endedReason && typeof call.endedReason === 'string' && call.endedReason.trim()
                           ? call.endedReason.trim()
                           : 'Unknown';
            acc[reason] = (acc[reason] || 0) + 1;
            return acc;
        }, {});

        // Format for Recharts: [{ name: 'reason1', count: 10 }, { name: 'reason2', count: 5 }]
        return Object.entries(outcomes).map(([name, count]) => ({ name, count }));
    }, [calls]); // Recalculate when calls data changes

    // Calculation for Calls Over Time (remains the same)
    const callsOverTimeData = useMemo(() => {
        if (!Array.isArray(calls) || calls.length === 0) return [];
        const callsByDate = calls.reduce((acc, call) => {
            if (call.startedAt) {
                try {
                    // Group by date (YYYY-MM-DD format for consistent sorting)
                    const dateStr = new Date(call.startedAt).toISOString().split('T')[0];
                    acc[dateStr] = (acc[dateStr] || 0) + 1;
                } catch (e) {
                     console.error("Error parsing date:", call.startedAt, e);
                }
            }
            return acc;
        }, {});
        // Sort by date before returning
        return Object.entries(callsByDate)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date)); // Sort chronologically
    }, [calls]);

    // Custom Tooltip for Charts
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-700 p-2 rounded shadow-lg border border-gray-600">
                    <p className="label text-gray-300 text-sm">{`${label}`}</p>
                    <p className="intro text-white font-medium">{`${payload[0].name}: ${payload[0].value}`}</p>
                </div>
            );
        }
        return null;
    };


    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6 mb-6 md:mb-8">
            {/* Calls Over Time Chart */}
            <div className="lg:col-span-3 bg-[#2c2b65] p-4 sm:p-6 rounded-xl shadow-lg">
                   
                <h2 className="text-lg sm:text-xl font-semibold mb-4 text-white">Calls Over Time</h2>
                {callsOverTimeData.length > 0 ? (     
                    <ResponsiveContainer width="100%" height={300}  >
                        <AreaChart data={callsOverTimeData} margin={{ top: 5, right: 20, left: -15, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickFormatter={(tick) => tick.substring(5)} />{/* Show MM-DD */}
                            <YAxis stroke="#9ca3af" fontSize={10} allowDecimals={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Calls" />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                     <div className="h-[300px] flex items-center justify-center text-gray-500">No call data available for this period.</div>
                )}
                
            </div>

            {/* Call Outcomes Chart */}
            <div className="lg:col-span-2 bg-[#2c2b65] p-4 sm:p-6 rounded-xl shadow-lg">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 text-white">Call Outcomes</h2>
                 {outcomeChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={outcomeChartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />{/* Vertical grid lines */}
                            <XAxis type="number" stroke="#9ca3af" fontSize={10} allowDecimals={false} />
                            {/* Increased width for YAxis labels */}
                            <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={10} width={100} tick={{ fill: '#d1d5db' }} />
                            <Tooltip content={<CustomTooltip />} cursor={{fill: '#374151'}} />
                            <Bar dataKey="count" fill="#3b82f6" name="Total Calls" barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                 ) : (
                     <div className="h-[300px] flex items-center justify-center text-gray-500">No outcome data available.</div>
                 )}
            </div>
        </div>
    );
    
  
};

export default Charts;
