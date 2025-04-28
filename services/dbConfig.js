const sqlQualidade = require('mssql');

const configQualidade = {
    user: process.env.DB_USER_QUALIDADE,
    password: process.env.DB_PASSWORD_QUALIDADE,
    server: process.env.DB_SERVER_QUALIDADE,
    database: process.env.DB_NAME_QUALIDADE,
    connectionTimeout: 180000,
    requestTimeout: 180000,
    options: {
        encrypt: true,
        trustServerCertificate: true
    },
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 1433
};

let poolQualidade;

async function connectQualidade() {
    try {
        if (!poolQualidade) {
            poolQualidade = await new sqlQualidade.ConnectionPool(configQualidade).connect();
        }
        return poolQualidade;
    } catch (err) {
        console.error('Failed to connect to Qualidade SQL Server', err);
        throw err;
    }
}

module.exports = {
    sqlQualidade,
    connectQualidade
};
