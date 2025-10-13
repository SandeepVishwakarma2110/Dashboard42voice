// File: src/components/Charts.jsx

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const Charts = ({ calls }) => {
    const outcomeChartData = useMemo(() => {
        if (!calls.length) return [];
        const outcomes = calls.reduce((acc, call) => {
            const reason = call.endCallReason || 'Unknown';
            acc[reason] = (acc[reason] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(outcomes).map(([name, count]) => ({ name, count }));
    }, [calls]);

    const callsOverTimeData = useMemo(() => {
        if (!calls.length) return [];
        const callsByDate = calls.reduce((acc, call) => {
            if (call.startedAt) {
                const date = new Date(call.startedAt).toLocaleDateString();
                acc[date] = (acc[date] || 0) + 1;
            }
            return acc;
        }, {});
        return Object.entries(callsByDate)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [calls]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
            <div className="lg:col-span-3 bg-gray-800 p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-white">Calls Over Time</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={callsOverTimeData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                        <YAxis stroke="#9ca3af" fontSize={12} />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                        <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Calls" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            <div className="lg:col-span-2 bg-gray-800 p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-white">Call Outcomes</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={outcomeChartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                        <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={12} width={100} tick={{ fill: '#d1d5db' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} cursor={{ fill: '#374151' }} />
                        <Bar dataKey="count" fill="#3b82f6" name="Total Calls" barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Charts;

