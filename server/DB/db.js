

// File: db.js


import dotenv from 'dotenv';
import sql from 'mssql';


if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

const dbConfig = {
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    server: process.env.SQL_SERVER,
    database: process.env.SQL_DATABASE,
    options: {
        encrypt: true, 
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
        
        process.exit(1);
    });


export { sql, poolPromise };

