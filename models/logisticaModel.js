const dotenv = require("dotenv");
dotenv.config();
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
    port: process.env.SQLSERVER_PORT ? parseInt(process.env.SQLSERVER_PORT) : 1826
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

const produtosAll = async (codigo) => {
    const pool = await connectProtheus();
    const request = pool.request();
    try {
        const result = await request
            .input('codigo', sqlProtheus.VarChar, codigo)
            .query(`
                SELECT TOP 100 * FROM SB1010
                WHERE B1_COD LIKE '%' + @codigo + '%'
                ORDER BY R_E_C_N_O_ DESC
            `);
        return result.recordset;
    } catch (error) {
        console.log(error);
        throw new Error;
    }
};


const produtoOne = async (codigo) => {
    const pool = await connectProtheus();
    const request = pool.request();
    try {
        const result = await request
            .input('codigo', sqlProtheus.VarChar, codigo)  // 💬 passando o parâmetro de forma segura
            .query('SELECT * FROM SB1010 WHERE B1_COD = @codigo'); // 💬 usando o parâmetro
        return result.recordset;
    } catch (error) {
        console.log(error);
        throw new Error;
    }
};


module.exports = {
    produtosAll,
    produtoOne
};