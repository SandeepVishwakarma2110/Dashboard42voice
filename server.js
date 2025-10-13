// import express from 'express';
// import dotenv from 'dotenv';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import cors from 'cors';
// import helmet from 'helmet';
// import morgan from 'morgan';
// import callRoutes from './routes/callRoutes.js';
// import authRoutes from './routes/authRoutes.js';

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 3000;


// // This is the standard and required way to get the directory name in an ES module.
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);


// // Middleware
// app.use(cors());
// // Add security headers
// app.use(helmet());
// // Log HTTP requests in development mode
// app.use(morgan('dev'));
// // Parse JSON bodies
// app.use(express.json());

// // --- API Routes ---
// //call and auth routes under the /api path
// app.use('/api', callRoutes);
// app.use('/api/auth', authRoutes);

// // --- Root Endpoint ---
// app.get('/', (req, res) => {
//   res.status(200).json({ message: 'Vapi Call Server is running!' });
// });

// // --- Serve Frontend ---
// // 2. Serve the static files from the React app's build directory
// app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));

// // 3. The "catchall" handler: for any request that doesn't match one above,
// // send back React's index.html file. This is crucial for SPA routing.
// // app.get('*', (req, res) => {
// //   res.sendFile(path.join(__dirname, '..', 'vapi-dashboard', 'dist', 'index.html'));
// // });
// app.get('/{*any}', (req, res)=>{
//   res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
// });


// // --- Start Server ---
// app.listen(PORT, () => {
//   console.log(`🚀 Server is listening on http://localhost:${PORT}`);
// });


// File: src/server.js
// This is the definitive version with the correct __dirname implementation for ES Modules.
// File: server.js
// This file is now located in the project root and has updated paths.

import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

// --- FIX: Updated paths to match the new '/server' folder structure ---
import callRoutes from './server/routes/callRoutes.js';
import authRoutes from './server/routes/authRoutes.js';

// --- Server Setup ---
const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Middleware ---
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));
app.use(cors());

// --- API Routes ---
app.use('/api/calls', callRoutes);
app.use('/api/auth', authRoutes);

// --- Serve Frontend ---
// --- FIX: Corrected path to the 'client/dist' folder from the root ---
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// The "catchall" handler
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`🚀 Server is listening on http://localhost:${PORT}`);
});
