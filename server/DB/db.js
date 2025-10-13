// File: db.js
// This file manages the connection to your Azure SQL database.

// if (process.env.NODE_ENV !== 'production') {
//     require('dotenv').config();
// }
// const sql = require('mssql');

// const dbConfig = {
//     user: process.env.SQL_USER,
//     password: process.env.SQL_PASSWORD,
//     server: process.env.SQL_SERVER, // e.g., yourserver.database.windows.net
//     database: process.env.SQL_DATABASE,
//     options: {
//         encrypt: true, // Required for Azure
//         trustServerCertificate: false,
//     },
// };

// const poolPromise = new sql.ConnectionPool(dbConfig)
//     .connect()
//     .then(pool => {
//         console.log("✅ Azure SQL connected (via db.js)");
//         return pool;
//     })
//     .catch(err => {
//         console.error("❌ Azure SQL connection error:", err.message);
//         // Log the config being used, but redact sensitive info for security
//         console.error("🔍 Azure SQL Config Used:", { 
//             ...dbConfig, 
//             user: dbConfig.user ? 'provided' : 'not-provided',
//             password: dbConfig.password ? 'provided' : 'not-provided',
//             database: dbConfig.database ? 'provided' : 'not-provided',
//         });
//     });

// module.exports = { sql, poolPromise };


// File: db.js
// Converted to use ES6 module syntax (import/export).

import dotenv from 'dotenv';
import sql from 'mssql';

// Load environment variables in development
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

const dbConfig = {
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    server: process.env.SQL_SERVER,
    database: process.env.SQL_DATABASE,
    options: {
        encrypt: true, // Required for Azure
        trustServerCertificate: false,
    },
};

const poolPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then(pool => {
        console.log("✅ Azure SQL connected (via db.js)");
        return pool;
    })
    .catch(err => {
        console.error("❌ Azure SQL connection error:", err.message);
        // Exit the process if the database connection fails, as the app cannot run without it.
        process.exit(1);
    });

// Export the sql object and the pool promise
export { sql, poolPromise };

