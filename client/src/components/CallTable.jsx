
//  ********
// *************************************************************************************************************

// File: client/src/components/CallTable.jsx
// Updated table width and ensured horizontal scrolling.  working
// File: client/src/components/CallTable.jsx
// Updated RecordingModal to force re-render of audio player.
// File: client/src/components/CallTable.jsx
// Added type and preload attributes to the audio element.
// File: client/src/components/CallTable.jsx
// Updated RecordingModal to fetch audio as blob and play locally.
// File: client/src/components/CallTable.jsx
// RecordingModal updated to fetch audio via the backend proxy.
// File: client/src/components/CallTable.jsx
// Added event listeners (onLoadedMetadata, onError) to audio element for debugging.
// File: client/src/components/CallTable.jsx
// Updated RecordingModal download button to use the fetched blob data.
// File: client/src/components/CallTable.jsx
// Updated to receive viewedClientId and pass it to RecordingModal/fetchAudio.

import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, List, ChevronUp, ChevronDown, PlayCircle, MessageSquare, X, Download, Loader2, AlertTriangle } from 'lucide-react';

// --- Modal Component for Recording ---
// --- FIX: Accept viewedClientId as a prop ---
const RecordingModal = ({ call, onClose, viewedClientId }) => {
    const [audioSrc, setAudioSrc] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const audioRef = useRef(null);

    useEffect(() => {
        if (!call || !call.id) {
            setError("Call ID missing."); setIsLoading(false); return;
        }
         // --- FIX: Check if viewedClientId is available ---
        if (!viewedClientId) {
             setError("Cannot fetch recording: Viewed Client ID is missing.");
             setIsLoading(false);
             return;
        }

        setIsLoading(true); setError(null); setAudioSrc(null);
        let objectUrl = null;
        const fetchAudio = async () => {
            const token = localStorage.getItem('token');
            if (!token) { setError("Authentication token not found."); setIsLoading(false); return; }
            try {
                // --- FIX: Add clientId as query parameter to proxy URL ---
                const proxyUrl = `/api/calls/recording/${call.id}?clientId=${viewedClientId}`;
                console.log("Fetching audio via proxy:", proxyUrl);
                const response = await fetch(proxyUrl, { headers: { 'Authorization': `Bearer ${token}` } });
                if (!response.ok) {
                    let errorBody = `HTTP error! status: ${response.status}`;
                    try { const errorJson = await response.json(); errorBody = errorJson.message || errorBody; } catch (_) {}
                    throw new Error(errorBody);
                }
                const audioBlob = await response.blob();
                console.log("Audio blob received via proxy, size:", audioBlob.size, "type:", audioBlob.type);
                if (!audioBlob.type.startsWith('audio/')) { console.warn("Blob type might not be playable:", audioBlob.type); }
                objectUrl = URL.createObjectURL(audioBlob);
                console.log("Created object URL:", objectUrl);
                setAudioSrc(objectUrl);
                setIsLoading(false);
            } catch (err) {
                console.error("Error fetching or processing audio via proxy:", err);
                setError(err.message || "Could not load audio recording via proxy.");
                setIsLoading(false);
            }
        };
        fetchAudio();
        return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
    // --- FIX: Add viewedClientId to dependencies ---
    }, [call, viewedClientId]);

    // ... (rest of RecordingModal remains the same)
    const handleDownload = () => { if (!audioSrc || !call || !call.id) { console.error("Cannot download: Audio source or call ID missing."); return; } const link = document.createElement('a'); link.href = audioSrc; link.download = `recording-${call.id}.wav`; document.body.appendChild(link); link.click(); document.body.removeChild(link); console.log("Download initiated for:", link.download); };
    if (!call) return null;
    const callId = call.id?.substring(0, 12) + '...' || 'N/A'; const totalSeconds = call.duration ? Math.round(call.duration) : 0; const minutes = Math.floor(totalSeconds / 60); const seconds = String(totalSeconds % 60).padStart(2, '0'); const durationDisplay = totalSeconds > 0 ? `${minutes}:${seconds}` : 'N/A'; const date = call.startedAt ? new Date(call.startedAt).toLocaleString() : 'N/A'; const type = call.type || 'N/A';
    return ( <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm"> <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-xl p-6 relative"> <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white" title="Close"><X size={24} /></button> <h2 className="text-xl font-semibold text-white mb-4">Call Recording</h2> <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-6 text-sm text-gray-300 border-b border-gray-700 pb-4"> <p><strong className="text-gray-400 font-medium">Call ID:</strong> {callId}</p> <p><strong className="text-gray-400 font-medium">Date:</strong> {date}</p> <p><strong className="text-gray-400 font-medium">Duration:</strong> {durationDisplay}</p> <p><strong className="text-gray-400 font-medium">Type:</strong> {type}</p> </div> <div className="h-10 flex items-center justify-center mb-4"> {isLoading && ( <div className="flex items-center text-gray-400"><Loader2 size={20} className="animate-spin mr-2" /><span>Loading audio...</span></div> )} {error && !isLoading && ( <div className="flex items-center text-red-400 text-sm"><AlertTriangle size={20} className="mr-2 flex-shrink-0" /><span>{error}</span></div> )} {!isLoading && !error && audioSrc && ( <audio ref={audioRef} key={audioSrc} controls preload="auto" className="w-full" src={audioSrc} onLoadedMetadata={(e) => console.log("Audio metadata loaded", e.target.duration)} onError={(e) => console.error("Audio Element Error:", e.target.error)}> Your browser does not support the audio element. </audio> )} {!isLoading && !error && !audioSrc && ( <div className="text-gray-500">Audio not available.</div> )} </div> <button onClick={handleDownload} disabled={!audioSrc || isLoading || error} className="mt-4 inline-flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"> <Download size={18} className="mr-2"/> Download Recording </button> </div> </div> );
};

// --- TranscriptModal remains unchanged ---
const TranscriptModal = ({ call, onClose }) => { /* ... */ if (!call || !call.transcript) return null; const parsedTranscript = useMemo(() => { return call.transcript.split('\n').map((line, index) => { const trimmedLine = line.trim(); if (!trimmedLine) return null; const speakerMatch = trimmedLine.match(/^(AI|User):\s*/); let speaker = 'Unknown'; let message = trimmedLine; if (speakerMatch) { speaker = speakerMatch[1]; message = trimmedLine.substring(speakerMatch[0].length).trim(); } else { speaker = (index % 2 === 0 ? 'System/AI' : 'User'); } if (!message) return null; return { speaker, message }; }).filter(Boolean); }, [call.transcript]); return ( <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm"> <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6 relative flex flex-col h-[80vh]"> <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white z-20" title="Close"><X size={24} /></button> <h2 className="text-xl font-semibold text-white mb-4 sticky top-0 bg-gray-800 pb-2 z-10">Call Transcript</h2> <div className="flex-grow overflow-y-auto space-y-4 pr-2 custom-scrollbar"> {parsedTranscript.map((entry, index) => ( <div key={index} className={`flex ${entry.speaker === 'User' ? 'justify-end' : 'justify-start'}`}> <div className={`max-w-[75%] p-3 rounded-lg shadow ${entry.speaker === 'User' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-200'}`}> <p className="text-xs font-semibold mb-1 opacity-80">{entry.speaker}</p> <p className="text-sm break-words">{entry.message}</p> </div> </div> ))} {parsedTranscript.length === 0 && ( <p className="text-center text-gray-500">No transcript content found.</p> )} </div> </div> </div> ); };

// --- Main CallTable Component ---
// --- FIX: Accept viewedClientId prop ---
const CallTable = ({ calls, viewedClientId }) => {
    // ... (state and sorting logic remains the same)
    const [searchTerm, setSearchTerm] = useState(''); const [sortConfig, setSortConfig] = useState({ key: 'startedAt', direction: 'descending' }); const [selectedCallForRecording, setSelectedCallForRecording] = useState(null); const [selectedCallForTranscript, setSelectedCallForTranscript] = useState(null);
     const sortedAndFilteredCalls = useMemo(() => { let filtered = calls.filter(call => (call.id?.toLowerCase().includes(searchTerm.toLowerCase())) || (call.customer?.number?.includes(searchTerm)) || (call.type?.toLowerCase().includes(searchTerm.toLowerCase())) || (call.assistantId?.toLowerCase().includes(searchTerm.toLowerCase())) || (call.endedReason?.toLowerCase().includes(searchTerm.toLowerCase())) ); if (sortConfig.key) { filtered.sort((a, b) => { let aValue = a[sortConfig.key]; let bValue = b[sortConfig.key]; if (sortConfig.key.includes('.')) { const keys = sortConfig.key.split('.'); aValue = keys.reduce((obj, key) => obj && obj[key], a); bValue = keys.reduce((obj, key) => obj && obj[key], b); } if (sortConfig.key === 'startedAt') { aValue = aValue ? new Date(aValue).getTime() : 0; bValue = bValue ? new Date(bValue).getTime() : 0; } aValue = aValue ?? (typeof aValue === 'number' ? 0 : ''); bValue = bValue ?? (typeof bValue === 'number' ? 0 : ''); if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1; if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1; return 0; }); } return filtered; }, [calls, searchTerm, sortConfig]);
    const requestSort = (key) => { let direction = 'ascending'; if (sortConfig.key === key && sortConfig.direction === 'ascending') { direction = 'descending'; } setSortConfig({ key, direction }); };
    const SortableHeader = ({ children, name }) => { const isSorted = sortConfig.key === name; return ( <th className="p-3 cursor-pointer select-none sticky top-0 bg-gray-700/80 backdrop-blur-sm z-10 whitespace-nowrap" onClick={() => requestSort(name)}> <div className="flex items-center"> {children} {isSorted ? ( sortConfig.direction === 'ascending' ? <ChevronUp size={14} className="ml-1 flex-shrink-0" /> : <ChevronDown size={14} className="ml-1 flex-shrink-0" /> ) : <div className="w-[14px] ml-1"></div>} </div> </th> ); }; const NonSortableHeader = ({ children }) => ( <th className="p-3 sticky top-0 bg-gray-700/80 backdrop-blur-sm z-10 whitespace-nowrap">{children}</th> );
    const formatDateTime = (isoString) => { if (!isoString) return 'N/A'; try { const date = new Date(isoString); return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString(); } catch (e) { return 'Invalid Date'; } };

    return (
        <>
            <div className="bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg mt-8">
                 {/* ... (Search Bar remains the same) ... */}
                 <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4"> <h2 className="text-xl font-semibold text-white">Detailed Call Logs</h2> <div className="relative w-full sm:w-64"> <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /> <input type="text" placeholder="Search..." className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /> </div> </div>
                <div className="overflow-auto max-h-[60vh] custom-scrollbar relative">
                    <table className="w-full text-left min-w-[1600px]">
                        {/* ... (Table Header remains the same) ... */}
                        <thead className="text-xs text-gray-300 uppercase"> <tr> <SortableHeader name="id">Call ID</SortableHeader> <SortableHeader name="assistantId">Assistant</SortableHeader> <NonSortableHeader>Assistant Phone</NonSortableHeader> <SortableHeader name="customer.number">Customer Phone</SortableHeader> <SortableHeader name="type">Type</SortableHeader> <SortableHeader name="endedReason">Ended Reason</SortableHeader> <NonSortableHeader>Success Eval.</NonSortableHeader> <SortableHeader name="startedAt">Start Time</SortableHeader> <SortableHeader name="duration">Duration (s)</SortableHeader> <SortableHeader name="cost">Cost ($)</SortableHeader> <NonSortableHeader><div className="text-center">Recording</div></NonSortableHeader> <NonSortableHeader><div className="text-center">Transcript</div></NonSortableHeader> </tr> </thead>
                        <tbody className="text-sm divide-y divide-gray-700">
                            {sortedAndFilteredCalls.map(call => (
                                <tr key={call.id} className="hover:bg-gray-700/50">
                                    {/* ... (Table Data Cells remain the same) ... */}
                                     <td className="p-3 font-mono text-xs" title={call.id}>{call.id?.substring(0, 12) ?? 'N/A'}...</td> <td className="p-3 font-mono text-xs" title={call.assistantId}>{call.assistantId ? `${call.assistantId.substring(0, 12)}...` : 'N/A'}</td> <td className="p-3 whitespace-nowrap">{call.artifact?.variables?.phoneNumber?.number || 'N/A'}</td> <td className="p-3 whitespace-nowrap">{call.customer?.number || 'N/A'}</td> <td className="p-3 whitespace-nowrap">{call.type || 'N/A'}</td> <td className="p-3">{call.endedReason || 'N/A'}</td> <td className="p-3 text-center">{call.analysis?.successEvaluation?.success?.toString() ?? 'N/A'}</td> <td className="p-3 text-xs whitespace-nowrap">{formatDateTime(call.startedAt)}</td> <td className="p-3 text-right">{call.duration ? call.duration.toFixed(1) : 'N/A'}</td> <td className="p-3 text-right font-medium">{call.cost ? call.cost.toFixed(4) : 'N/A'}</td>
                                    {/* Recording Button */}
                                    <td className="p-3 text-center">
                                        {call.recordingUrl ? (
                                            // --- FIX: Pass viewedClientId to RecordingModal ---
                                            <button onClick={() => setSelectedCallForRecording(call)} className="text-blue-400 hover:text-blue-300 px-1" title="Play Recording"><PlayCircle size={18} /></button>
                                        ) : ( <span className="text-gray-500">-</span> )}
                                    </td>
                                    {/* Transcript Button (no change needed here) */}
                                    <td className="p-3 text-center">
                                        {call.transcript ? (
                                             <button onClick={() => setSelectedCallForTranscript(call)} className="text-purple-400 hover:text-purple-300 px-1" title="View Transcript"><MessageSquare size={18} /></button>
                                        ) : ( <span className="text-gray-500">-</span> )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {/* ... (No calls messages remain the same) ... */}
                 {calls.length > 0 && sortedAndFilteredCalls.length === 0 && ( <div className="text-center py-8 text-gray-500"> <List className="mx-auto h-12 w-12" /> <p className="mt-4">No calls found matching your search term.</p> </div> )} {calls.length === 0 && ( <div className="text-center py-8 text-gray-500"> <List className="mx-auto h-12 w-12" /> <p className="mt-4">No call data available.</p> </div> )}
            </div>

            {/* Render Modals when selected */}
            {/* --- FIX: Pass viewedClientId to RecordingModal --- */}
            {selectedCallForRecording && <RecordingModal call={selectedCallForRecording} onClose={() => setSelectedCallForRecording(null)} viewedClientId={viewedClientId} />}
            {selectedCallForTranscript && <TranscriptModal call={selectedCallForTranscript} onClose={() => setSelectedCallForTranscript(null)} />}
        </>
    );
};

// ... (Scrollbar styling remains the same) ...
const styles = ` .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; } .custom-scrollbar::-webkit-scrollbar-track { background: #1f2937; border-radius: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6b7280; } `; const styleSheet = document.getElementById('custom-scrollbar-styles') || document.createElement("style"); styleSheet.id = 'custom-scrollbar-styles'; styleSheet.innerText = styles; if (!document.getElementById('custom-scrollbar-styles')) { document.head.appendChild(styleSheet); }

export default CallTable;

