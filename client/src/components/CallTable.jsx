// // File: src/components/CallTable.jsx

// import { useState, useMemo } from 'react';
// import { Search, List } from 'lucide-react';

// const CALLS_PER_PAGE = 10;

// const CallTable = ({ calls }) => {
//     const [searchTerm, setSearchTerm] = useState('');
//     const [currentPage, setCurrentPage] = useState(1);

//     const filteredCalls = useMemo(() => {
//         return calls.filter(call =>
//             (call.id?.toLowerCase().includes(searchTerm.toLowerCase())) ||
//             (call.customer?.number?.includes(searchTerm)) ||
//             (call.status?.toLowerCase().includes(searchTerm.toLowerCase()))
//         );
//     }, [calls, searchTerm]);

//     const paginatedCalls = useMemo(() => {
//         const startIndex = (currentPage - 1) * CALLS_PER_PAGE;
//         return filteredCalls.slice(startIndex, startIndex + CALLS_PER_PAGE);
//     }, [filteredCalls, currentPage]);

//     const totalPages = Math.ceil(filteredCalls.length / CALLS_PER_PAGE);

//     return (
//         <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
//             <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
//                 <h2 className="text-xl font-semibold text-white">Detailed Call Logs</h2>
//                 <div className="relative w-full sm:w-64">
//                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                     <input
//                         type="text"
//                         placeholder="Search by ID, number..."
//                         className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         value={searchTerm}
//                         onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
//                     />
//                 </div>
//             </div>
//             <div className="overflow-x-auto">
//                 <table className="w-full text-left">
//                     <thead className="bg-gray-700/50 text-sm text-gray-300 uppercase">
//                         <tr>
//                             <th className="p-3">Call ID</th>
//                             <th className="p-3">Customer</th>
//                             <th className="p-3">Status</th>
//                             <th className="p-3 text-right">Duration (s)</th>
//                             <th className="p-3 text-right">Cost ($)</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {paginatedCalls.map(call => (
//                             <tr key={call.id} className="border-b border-gray-700 hover:bg-gray-700/50">
//                                 <td className="p-3 font-mono text-xs">{call.id.substring(0, 12)}...</td>
//                                 <td className="p-3">{call.customer?.number || 'N/A'}</td>
//                                 <td className="p-3">
//                                     <span className={`px-2 py-1 text-xs rounded-full ${call.status === 'ended' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
//                                         {call.status}
//                                     </span>
//                                 </td>
//                                 <td className="p-3 text-right">{call.duration ? call.duration.toFixed(1) : 'N/A'}</td>
//                                 <td className="p-3 text-right font-medium">{call.cost ? call.cost.toFixed(4) : 'N/A'}</td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//              {paginatedCalls.length === 0 && (
//                 <div className="text-center py-8 text-gray-500">
//                     <List className="mx-auto h-12 w-12" />
//                     <p className="mt-4">No calls found matching your search.</p>
//                 </div>
//             )}
//             {totalPages > 1 && (
//                 <div className="flex justify-between items-center mt-4">
//                     <span className="text-sm text-gray-400">Page {currentPage} of {totalPages}</span>
//                     <div className="flex space-x-2">
//                         <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50 hover:bg-gray-600">Previous</button>
//                         <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50 hover:bg-gray-600">Next</button>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default CallTable;



// File: client/src/components/CallTable.jsx
// This component has been updated to display more detailed columns in the call log table.

import { useState, useMemo } from 'react';
import { Search, List, ChevronUp, ChevronDown } from 'lucide-react';

const CALLS_PER_PAGE = 10;

const CallTable = ({ calls }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'startedAt', direction: 'descending' });

    const sortedAndFilteredCalls = useMemo(() => {
        let filtered = calls.filter(call => 
            (call.id?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (call.customer?.number?.includes(searchTerm)) ||
            (call.type?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (call.assistantId?.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        if (sortConfig.key) {
            filtered.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Handle nested properties like customer.number
                if (sortConfig.key.includes('.')) {
                    const keys = sortConfig.key.split('.');
                    aValue = keys.reduce((obj, key) => obj && obj[key], a);
                    bValue = keys.reduce((obj, key) => obj && obj[key], b);
                }
                
                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return filtered;
    }, [calls, searchTerm, sortConfig]);

    const paginatedCalls = useMemo(() => {
        const startIndex = (currentPage - 1) * CALLS_PER_PAGE;
        return sortedAndFilteredCalls.slice(startIndex, startIndex + CALLS_PER_PAGE);
    }, [sortedAndFilteredCalls, currentPage]);

    const totalPages = Math.ceil(sortedAndFilteredCalls.length / CALLS_PER_PAGE);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const SortableHeader = ({ children, name }) => {
        const isSorted = sortConfig.key === name;
        return (
            <th className="p-3 cursor-pointer select-none" onClick={() => requestSort(name)}>
                <div className="flex items-center">
                    {children}
                    {isSorted ? (
                        sortConfig.direction === 'ascending' ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />
                    ) : null}
                </div>
            </th>
        );
    };
    
    // Helper to format date and time
    const formatDateTime = (isoString) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        return date.toLocaleString(); // Adjust format as needed
    };

    return (
        <div className="bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg mt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <h2 className="text-xl font-semibold text-white">Detailed Call Logs</h2>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                </div>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left min-w-[1024px]">
                   <thead className="bg-gray-700/50 text-xs text-gray-300 uppercase whitespace-nowrap">
                       <tr>
                           <SortableHeader name="id">Call ID</SortableHeader>
                           <SortableHeader name="assistantId">Assistant</SortableHeader>
                           <th className="p-3">Assistant Phone</th>
                           <SortableHeader name="customer.number">Customer Phone</SortableHeader>
                           <SortableHeader name="type">Type</SortableHeader>
                           <SortableHeader name="endedReason">Ended Reason</SortableHeader>
                           <th className="p-3">Success Eval.</th>
                           <SortableHeader name="startedAt">Start Time</SortableHeader>
                           <SortableHeader name="duration">Duration (s)</SortableHeader>
                           <SortableHeader name="cost">Cost ($)</SortableHeader>
                       </tr>
                   </thead>
                   <tbody className="text-sm">
                       {paginatedCalls.map(call => (
                           <tr key={call.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                               <td className="p-3 font-mono text-xs" title={call.id}>{call.id.substring(0, 12)}...</td>
                               <td className="p-3 font-mono text-xs" title={call.assistantId}>{call.assistantId ? `${call.assistantId.substring(0, 12)}...` : 'N/A'}</td>
                               <td className="p-3">{call.artifact?.variables?.phoneNumber?.number || 'N/A'}</td>
                               <td className="p-3">{call.customer?.number || 'N/A'}</td>
                               <td className="p-3">{call.type || 'N/A'}</td>
                               <td className="p-3">{call.endedReason || 'N/A'}</td>
                               <td className="p-3">{call.analysis?.successEvaluation?.success?.toString() ?? 'N/A'}</td>
                               <td className="p-3 text-xs">{formatDateTime(call.startedAt)}</td>
                               <td className="p-3 text-right">{call.duration ? call.duration.toFixed(1) : 'N/A'}</td>
                               <td className="p-3 text-right font-medium">{call.cost ? call.cost.toFixed(4) : 'N/A'}</td>
                           </tr>
                       ))}
                   </tbody>
               </table>
            </div>
            {paginatedCalls.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <List className="mx-auto h-12 w-12" />
                    <p className="mt-4">No calls found matching your search.</p>
                </div>
            )}
            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-gray-400">Page {currentPage} of {totalPages}</span>
                    <div className="flex space-x-2">
                        <button 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50 hover:bg-gray-600"
                        >Previous</button>
                        <button 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50 hover:bg-gray-600"
                        >Next</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CallTable;
