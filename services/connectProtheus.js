const sqlProtheus = require('mssql');

const configProtheus = {
    user: process.env.SQLSERVER_USER,
    password: process.env.SQLSERVER_PASSWORD,
    server: process.env.SQLSERVER_HOST,
    database: process.env.SQLSERVER_DATABASE,
    connectionTimeout: 180000,
    requestTimeout: 180000,
    options: {
        encrypt: true,
        trustServerCertificate: true
    },
    port: process.env.SQLSERVER_PORT ? parseInt(process.env.DB_PORT) : 1826
};

let poolProtheus;

async function connectProtheus() {
    try {
        if (!poolProtheus) {
            poolProtheus = await new sqlProtheus.ConnectionPool(configProtheus).connect();
        }
        return poolProtheus;
    } catch (err) {
        console.error('Failed to connect to Protheus SQL Server', err);
        throw err;
    }
}

module.exports = {
    sqlProtheus,
    connectProtheus
};
