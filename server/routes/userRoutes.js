// File: server/routes/userRoutes.js
// Updated to return client name along with ID and email.

import express from 'express';
import { sql, poolPromise } from '../DB/db.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Get Managed Clients Endpoint ---
router.get('/clients', protect, async (req, res) => {
    const loggedInUserId = req.user.id;
    const loggedInUserRole = req.user.role;

    try {
        const pool = await poolPromise;
        let query;
        let params = {};

        // --- FIX: Add 'name' to the SELECT statement ---
        if (loggedInUserRole === 'admin') {
            query = "SELECT id, email, name FROM VapiUsers WHERE role = 'client'";
        } else if (loggedInUserRole === 'supervisor') {
            query = "SELECT id, email, name FROM VapiUsers WHERE role = 'client' AND supervisorId = @supervisorId";
            params = { supervisorId: loggedInUserId };
        } else {
            return res.status(403).json({ message: 'Forbidden: Insufficient privileges.' });
        }

        const request = pool.request();
        for (const key in params) {
            request.input(key, sql.Int, params[key]);
        }

        const result = await request.query(query);

        // Send back the list of clients { id, email, name }
        res.status(200).json(result.recordset);

    } catch (error) {
        console.error('Error fetching clients:', error.message);
        res.status(500).json({ message: 'Server error fetching client list.' });
    }
});

export default router;

