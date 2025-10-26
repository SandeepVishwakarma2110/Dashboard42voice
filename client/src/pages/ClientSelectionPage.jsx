// File: client/src/pages/ClientSelectionPage.jsx
// Updated to display the client's name.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchManagedClients } from '../services/api';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import { Users, LogOut } from 'lucide-react';

const ClientSelectionPage = ({ onLogout }) => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadClients = async () => {
            try {
                const fetchedClients = await fetchManagedClients();
                setClients(fetchedClients);
            } catch (err) {
                setError(err.message);
                console.error("Failed to load client list:", err);
            } finally {
                setLoading(false);
            }
        };
        loadClients();
    }, []);

    const handleClientSelect = (clientId) => {
        navigate('/dashboard', { state: { selectedClientId: clientId } });
    };

    if (loading) return <Loader />;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-200 p-4">
             <div className="absolute top-4 right-4">
                <button
                    onClick={onLogout}
                    className="flex items-center px-4 py-2 space-x-2 font-semibold text-white bg-gray-700 rounded-md hover:bg-red-600"
                    title="Logout"
                >
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>
            <div className="w-full max-w-lg p-8 bg-gray-800 rounded-lg shadow-lg text-center">
                <Users className="mx-auto h-16 w-16 text-blue-500 mb-6" />
                <h1 className="text-3xl font-bold text-white mb-6">Select Client Dashboard</h1>

                {error && <ErrorMessage message={error} />}

                {clients.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {clients.map(client => (
                            <button
                                key={client.id}
                                onClick={() => handleClientSelect(client.id)}
                                className="w-full px-4 py-3 text-left bg-gray-700 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                            >
                                {/* --- FIX: Display client.name instead of ID --- */}
                                <span className="font-medium text-white">{client.name || `Client (ID: ${client.id})`}</span>
                                <span className="block text-sm text-gray-400">{client.email}</span>
                            </button>
                        ))}
                    </div>
                ) : (
                    !error && <p className="text-gray-400">No clients assigned or available.</p>
                )}
            </div>
        </div>
    );
};

export default ClientSelectionPage;

