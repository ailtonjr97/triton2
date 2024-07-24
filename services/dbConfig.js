const sql = require('mssql');

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    connectionTimeout: 180000,
    requestTimeout: 180000,
    options: {
        encrypt: true, // Use this if you're on Windows Azure
        trustServerCertificate: true, // Change to true for local dev / self-signed certs
        connectionTimeout: 180000,
        requestTimeout: 180000,
    },
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 1433 // Adicione a porta, se necessário
};

let pool;

async function connectToDatabase() {
    try {
        if (!pool) {
            pool = await sql.connect(config);
        }
        return pool;
    } catch (err) {
        console.error('Failed to connect to SQL Server', err);
        throw err;
    }
}

module.exports = {
    sql,
    connectToDatabase
};
