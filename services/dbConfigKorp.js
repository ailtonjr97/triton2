const sqlKorp = require('mssql');

const config = {
    user: process.env.DB_USER_KORP,
    password: process.env.DB_PASSWORD_KORP,
    server: process.env.DB_SERVER_KORP,
    database: process.env.DB_NAME_KORP,
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

async function connectToDatabaseKorp() {
    try {
        if (!pool) {
            pool = await sqlKorp.connect(config);
        }
        return pool;
    } catch (err) {
        console.error('Failed to connect to SQL Server', err);
        throw err;
    }
}

module.exports = {
    sqlKorp,
    connectToDatabaseKorp
};
