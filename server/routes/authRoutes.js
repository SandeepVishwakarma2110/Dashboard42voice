// File: server/routes/authRoutes.js
// Updated /login endpoint to include user ID in the response body.

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sql, poolPromise } from '../DB/db.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Registration Endpoint ---
router.post('/register', async (req, res) => {
    const { name, email, password, confirmPassword, vapiKey } = req.body;
    if (!name || !email || !password || !confirmPassword || !vapiKey) {
        return res.status(400).json({ message: 'Name, email, password, confirm password, and Vapi API key are required.' });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match.' });
    }
    try {
        const pool = await poolPromise;
        const userExistsResult = await pool.request().input('email', sql.NVarChar, email).query('SELECT * FROM VapiUsers WHERE email = @email');
        if (userExistsResult.recordset.length > 0) {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await pool.request().input('name', sql.NVarChar, name).input('email', sql.NVarChar, email).input('password', sql.NVarChar, hashedPassword).input('vapiKey', sql.NVarChar, vapiKey).query('INSERT INTO VapiUsers (name, email, password, vapiKey) VALUES (@name, @email, @password, @vapiKey)');
        res.status(201).json({ message: 'Client registered successfully.' });
    } catch (error) {
        console.error('Registration error:', error.message);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});


// --- Login Endpoint ---
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    try {
        const pool = await poolPromise;
        const userResult = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT id, email, password, role FROM VapiUsers WHERE email = @email');

        if (userResult.recordset.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const user = userResult.recordset[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

      
        const payload = { user: { id: user.id, email: user.email, role: user.role } };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
         
            res.status(200).json({
                token,
                id: user.id, 
                role: user.role
             });
        });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// --- Token Verification Endpoint ---
router.get('/verify', protect, (req, res) => {
    res.status(200).json({ user: req.user });
});

export default router;

