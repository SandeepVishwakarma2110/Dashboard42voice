// // File: src/routes/authRoutes.js
// // ACTION: This file has been converted to use ES Modules (import/export).

// import express from 'express';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import { sql, poolPromise } from '../DB/db.js'; // Adjusted path to db.js

// const router = express.Router();

// // --- Registration Endpoint ---
// router.post('/register', async (req, res) => {
//     const { email, password, confirmPassword, key } = req.body;

//     if (!email || !password || !confirmPassword || !key) {
//         return res.status(400).json({ message: 'All fields are required.' });
//     }
//     if (password !== confirmPassword) {
//         return res.status(400).json({ message: 'Passwords do not match.' });
//     }

//     try {
//         const pool = await poolPromise;
//         const userExistsResult = await pool.request()
//             .input('email', sql.NVarChar, email)
//             .query('SELECT * FROM Users WHERE email = @email');

//         if (userExistsResult.recordset.length > 0) {
//             return res.status(409).json({ message: 'User with this email already exists.' });
//         }

//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         await pool.request()
//             .input('email', sql.NVarChar, email)
//             .input('password', sql.NVarChar, hashedPassword)
//             .input('apiKey', sql.NVarChar, key)
//             .query('INSERT INTO VapiUsers (email, password, apiKey) VALUES (@email, @password, @apiKey)');

//         res.status(201).json({ message: 'User registered successfully.' });
//     } catch (error) {
//         console.error('Registration error:', error.message);
//         res.status(500).json({ message: 'Server error during registration.' });
//     }
// });

// // --- Login Endpoint ---
// router.post('/login', async (req, res) => {
//     const { email, password } = req.body;

//     if (!email || !password) {
//         return res.status(400).json({ message: 'Email and password are required.' });
//     }

//     try {
//         const pool = await poolPromise;
//         const userResult = await pool.request()
//             .input('email', sql.NVarChar, email)
//             .query('SELECT * FROM VapiUsers WHERE email = @email');

//         if (userResult.recordset.length === 0) {
//             return res.status(401).json({ message: 'Invalid credentials.' });
//         }

//         const user = userResult.recordset[0];
//         const isMatch = await bcrypt.compare(password, user.password);

//         if (!isMatch) {
//             return res.status(401).json({ message: 'Invalid credentials.' });
//         }

//         const payload = { user: { id: user.id, email: user.email } };

//         jwt.sign(
//             payload,
//             process.env.JWT_SECRET,
//             { expiresIn: '1h' },
//             (err, token) => {
//                 if (err) throw err;
//                 res.status(200).json({ token });
//             }
//         );
//     } catch (error) {
//         console.error('Login error:', error.message);
//         res.status(500).json({ message: 'Server error during login.' });
//     }
// });

// export default router; // FIX: Changed from module.exports to export default


// *********************************************************************************************************************
// File: src/routes/authRoutes.js
// This file has been updated with detailed logging for debugging the registration process.

// File: src/routes/authRoutes.js
// This file has been updated with detailed logging for debugging the registration process.

// import express from 'express';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import { sql, poolPromise } from '../DB/db.js';
// import protect from '../middleware/authMiddleware.js';

// const router = express.Router();

// // --- Registration Endpoint ---
// router.post('/register', async (req, res) => {
//     console.log('--- New Registration Request ---');
//     console.log('Request Body:', req.body);
//     const { email, password, confirmPassword, key } = req.body;

//     if (!email || !password || !confirmPassword || !key) {
//         console.error('Validation failed: Missing fields.');
//         return res.status(400).json({ message: 'All fields are required.' });
//     }
//     if (password !== confirmPassword) {
//         console.error('Validation failed: Passwords do not match.');
//         return res.status(400).json({ message: 'Passwords do not match.' });
//     }

//     try {
//         const pool = await poolPromise;
//         console.log('✅ Database pool connected.');

//         // 2. Check if user already exists
//         console.log(`[1] Checking if user with email "${email}" exists...`);
//         const userExistsResult = await pool.request()
//             .input('email', sql.NVarChar, email)
//             .query('SELECT * FROM VapiUsers WHERE email = @email');

//         // --- CRUCIAL DEBUGGING STEP ---
//         console.log('[2] Database response for user check:', userExistsResult);
//         console.log(`[3] Found ${userExistsResult.recordset.length} user(s) with that email.`);

//         if (userExistsResult.recordset.length > 0) {
//             console.error('❌ Conflict: User already exists. Sending 409 response.');
//             return res.status(409).json({ message: 'User with this email already exists.' });
//         }

//         // 3. Hash the password
//         console.log('[4] User does not exist. Hashing password...');
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);
//         console.log('[5] Password hashed successfully.');

//         // 4. Insert the new user into the database
//         console.log('[6] Inserting new user into the database...');
//         await pool.request()
//             .input('email', sql.NVarChar, email)
//             .input('password', sql.NVarChar, hashedPassword)
//             .input('apiKey', sql.NVarChar, key)
//             .query('INSERT INTO VapiUsers (email, password, apiKey) VALUES (@email, @password, @apiKey)');

//         console.log('✅ [7] User registered successfully. Sending 201 response.');
//         res.status(201).json({ message: 'User registered successfully.' });

//     } catch (error) {
//         console.error('❌ Server error during registration:', error.message);
//         res.status(500).json({ message: 'Server error during registration.' });
//     }
// });

// // --- Login Endpoint ---
// router.post('/login', async (req, res) => {
//     // ... (login logic remains the same)
//     const { email, password } = req.body;

//     if (!email || !password) {
//         return res.status(400).json({ message: 'Email and password are required.' });
//     }

//     try {
//         const pool = await poolPromise;
//         const userResult = await pool.request()
//             .input('email', sql.NVarChar, email)
//             .query('SELECT * FROM VapiUsers WHERE email = @email');

//         if (userResult.recordset.length === 0) {
//             return res.status(401).json({ message: 'Invalid credentials.' });
//         }

//         const user = userResult.recordset[0];
//         const isMatch = await bcrypt.compare(password, user.password);

//         if (!isMatch) {
//             return res.status(401).json({ message: 'Invalid credentials.' });
//         }

//         const payload = { user: { id: user.id, email: user.email } };

//         jwt.sign(
//             payload,
//             process.env.JWT_SECRET,
//             { expiresIn: '1h' },
//             (err, token) => {
//                 if (err) throw err;
//                 res.status(200).json({ token });
//             }
//         );
//     } catch (error) {
//         console.error('Login error:', error.message);
//         res.status(500).json({ message: 'Server error during login.' });
//     }
// });
//  router.get('/verify', protect, (req, res) => {
//     // If the 'protect' middleware succeeds, it attaches the user to the request.
//     // We can then send it back to confirm a valid session.
//     res.status(200).json({ user: req.user });
// });

// export default router;


// *********************************************************************************************************************

// File: server/routes/authRoutes.js
// Updated to include 'name' in registration.

// import express from 'express';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import { sql, poolPromise } from '../DB/db.js';
// import protect from '../middleware/authMiddleware.js';

// const router = express.Router();

// // --- Registration Endpoint ---
// router.post('/register', async (req, res) => {
//     // 1. Add 'name' to the destructured body
//     const { name, email, password, confirmPassword, vapiKey } = req.body;

//     // 2. Update validation to include 'name'
//     if (!name || !email || !password || !confirmPassword || !vapiKey) {
//         return res.status(400).json({ message: 'Name, email, password, confirm password, and Vapi API key are required.' });
//     }
//     if (password !== confirmPassword) {
//         return res.status(400).json({ message: 'Passwords do not match.' });
//     }

//     try {
//         const pool = await poolPromise;
//         const userExistsResult = await pool.request()
//             .input('email', sql.NVarChar, email)
//             .query('SELECT * FROM VapiUsers WHERE email = @email');

//         if (userExistsResult.recordset.length > 0) {
//             return res.status(409).json({ message: 'User with this email already exists.' });
//         }

//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         // 3. Include 'name' in the INSERT query
//         await pool.request()
//             .input('name', sql.NVarChar, name) // Add name input
//             .input('email', sql.NVarChar, email)
//             .input('password', sql.NVarChar, hashedPassword)
//             .input('vapiKey', sql.NVarChar, vapiKey)
//             .query('INSERT INTO VapiUsers (name, email, password, vapiKey) VALUES (@name, @email, @password, @vapiKey)'); // Add name to query

//         res.status(201).json({ message: 'Client registered successfully.' });
//     } catch (error) {
//         console.error('Registration error:', error.message);
//         res.status(500).json({ message: 'Server error during registration.' });
//     }
// });

// // --- Login Endpoint ---
// // ... (No changes needed for login)
// router.post('/login', async (req, res) => {
//     const { email, password } = req.body;
//     if (!email || !password) {
//         return res.status(400).json({ message: 'Email and password are required.' });
//     }
//     try {
//         const pool = await poolPromise;
//         const userResult = await pool.request()
//             .input('email', sql.NVarChar, email)
//             .query('SELECT id, email, password, role FROM VapiUsers WHERE email = @email');

//         if (userResult.recordset.length === 0) {
//             return res.status(401).json({ message: 'Invalid credentials.' });
//         }
//         const user = userResult.recordset[0];
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(401).json({ message: 'Invalid credentials.' });
//         }

//         const payload = { user: { id: user.id, email: user.email, role: user.role } };
//         jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
//             if (err) throw err;
//             res.status(200).json({ token, role: user.role });
//         });
//     } catch (error) {
//         console.error('Login error:', error.message);
//         res.status(500).json({ message: 'Server error during login.' });
//     }
// });


// // --- Token Verification Endpoint ---
// // ... (No changes needed for verify)
// router.get('/verify', protect, (req, res) => {
//     res.status(200).json({ user: req.user });
// });

// export default router;

// *********************************************************************************************************************


// File: server/routes/authRoutes.js
// Updated /login endpoint to include user ID in the response body.

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sql, poolPromise } from '../DB/db.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Registration Endpoint ---
// ... (no changes needed)
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

        // Payload for JWT remains the same
        const payload = { user: { id: user.id, email: user.email, role: user.role } };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            // --- FIX: Include user.id in the response body ---
            res.status(200).json({
                token,
                id: user.id, // Add user ID here
                role: user.role
             });
        });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// --- Token Verification Endpoint ---
// ... (no changes needed)
router.get('/verify', protect, (req, res) => {
    res.status(200).json({ user: req.user });
});

export default router;

