// File: src/components/ErrorMessage.jsx

import { AlertTriangle } from 'lucide-react';

const ErrorMessage = ({ message }) => {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="bg-red-800/50 border border-red-700 text-red-200 px-6 py-4 rounded-lg text-center">
                <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
                <h2 className="text-xl font-bold mt-4">Failed to Load Dashboard</h2>
                <p className="mt-2">{message}</p>
                <p className="mt-2 text-sm text-red-300">Please ensure the backend server is running and CORS is enabled.</p>
            </div>
        </div>
    );
};

export default ErrorMessage;

