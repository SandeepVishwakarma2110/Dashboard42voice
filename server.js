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

// ********************************************************************************************************************************************
// File: src/server.js
// This is the definitive version with the correct __dirname implementation for ES Modules.
// File: server.js
// This file is now located in the project root and has updated paths.

// import express from 'express';
// import helmet from 'helmet';
// import morgan from 'morgan';
// import cors from 'cors';
// import 'dotenv/config';
// import path from 'path';
// import { fileURLToPath } from 'url';

// // --- FIX: Updated paths to match the new '/server' folder structure ---
// import callRoutes from './server/routes/callRoutes.js';
// import authRoutes from './server/routes/authRoutes.js';

// // --- Server Setup ---
// const app = express();
// const PORT = process.env.PORT || 3000;

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // --- Middleware ---
// app.use(express.json());
// app.use(helmet());
// app.use(morgan('dev'));
// app.use(cors());

// // --- API Routes ---
// app.use('/api/calls', callRoutes);
// app.use('/api/auth', authRoutes);

// // --- Serve Frontend ---
// // --- FIX: Corrected path to the 'client/dist' folder from the root ---
// app.use(express.static(path.join(__dirname, 'client', 'dist')));

// // The "catchall" handler
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
// });

// // --- Start Server ---
// app.listen(PORT, () => {
//   console.log(`🚀 Server is listening on http://localhost:${PORT}`);
// });



// ********************************************************************************************************************************************

// File: server.js
// Updated to include userRoutes.

// import express from 'express';
// import helmet from 'helmet';
// import morgan from 'morgan';
// import cors from 'cors';
// import 'dotenv/config';
// import path from 'path';
// import { fileURLToPath } from 'url';

// import callRoutes from './server/routes/callRoutes.js';
// import authRoutes from './server/routes/authRoutes.js';
// import userRoutes from './server/routes/userRoutes.js'; // 1. Import user routes

// const app = express();
// const PORT = process.env.PORT || 3000;

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// app.use(express.json());
// //app.use(helmet());

// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         // Start with restrictive defaults
//         defaultSrc: ["'self'"], // Only allow resources from the same origin by default
//         // Specify allowed sources for different types
//         scriptSrc: ["'self'"], // Only scripts from self (adjust if needed for CDNs/inline)
//         styleSrc: ["'self'", "'unsafe-inline'"], // Allow styles from self and inline styles
//         imgSrc: ["'self'", "data:"], // Allow images from self and data URLs
//         connectSrc: ["'self'"], // Allow XHR/fetch only to self (your API)
//         fontSrc: ["'self'"],    // Allow fonts only from self
//         objectSrc: ["'none'"],  // Disallow plugins (Flash, etc.)
//         // --- FIX: Explicitly allow media from self and blob: ---
//         mediaSrc: ["'self'", "blob:"],
//         frameSrc: ["'none'"],   // Disallow embedding in frames
//         workerSrc: ["'self'", "blob:"], // Allow workers from self and blobs (needed for some libs)
//         upgradeInsecureRequests: [], // Automatically upgrade HTTP requests to HTTPS
//       },
//     },
//     // Keep other helmet defaults enabled unless they cause issues
//     // crossOriginEmbedderPolicy: false, // Uncomment ONLY if COEP causes issues
//   })
// );




// app.use(morgan('dev'));
// app.use(cors());

// // --- API Routes ---
// app.use('/api/calls', callRoutes);
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes); // 2. Use user routes

// // --- Serve Frontend ---
// app.use(express.static(path.join(__dirname, 'client', 'dist')));
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
// });

// // --- Start Server ---
// app.listen(PORT, () => {
//   console.log(`🚀 Server is listening on http://localhost:${PORT}`);
// });



// File: server.js
// Manually setting CSP header to allow blob: for media playback.

import express from 'express';
import helmet from 'helmet'; 
import morgan from 'morgan';
import cors from 'cors';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

import callRoutes from './server/routes/callRoutes.js';
import authRoutes from './server/routes/authRoutes.js';
import userRoutes from './server/routes/userRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(express.json());


app.use(helmet({ contentSecurityPolicy: false }));


app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " + 
    "script-src 'self'; " +   
    "style-src 'self' 'unsafe-inline'; " + 
    "img-src 'self' data:; " + 
    "connect-src 'self'; " + 
    "font-src 'self'; " +   
    "object-src 'none'; " +  
    "media-src 'self' blob:; " + 
    "frame-src 'none'; " +   
    "worker-src 'self' blob:; " + 
    "upgrade-insecure-requests;" 
  );
  next();
});


app.use(morgan('dev'));
app.use(cors());

// --- API Routes ---
app.use('/api/calls', callRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// --- Serve Frontend ---
app.use(express.static(path.join(__dirname, 'client', 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'), (err) => {
      if (err) {
          console.error("Error sending index.html:", err);
          if (!res.headersSent) {
               res.status(500).send("Error loading application.");
          }
      }
  });
});


// --- Start Server ---
app.listen(PORT, () => {
  console.log(`🚀 Server is listening on http://localhost:${PORT}`);
});

