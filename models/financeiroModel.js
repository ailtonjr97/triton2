const dotenv = require("dotenv");
dotenv.config();

async function connect(){
    const mysql = require("mysql2/promise");
    const pool = mysql.createPool({
        host: process.env.SQLHOST,
        port: '3306',
        user: process.env.SQLUSER,
        password: process.env.SQLPASSWORD,
        database: process.env.SQLDATABASE,
        waitForConnections: true,
        connectionLimit: 100,
        maxIdle: 100, // max idle connections, the default value is the same as `connectionLimit`
        idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000
      });
    return pool;
}

connect();

const analiseDeCredito = async()=>{
    const conn = await connect();
    const [rows] = await conn.query(`select * from ANALISE_CREDITO`);
    conn.end();
    return rows;
};

const documento = async(id)=>{
    const conn = await connect();
    const [rows] = await conn.query(`select * from ANALISE_CREDITO WHERE ID = ${id}`);
    conn.end();
    return rows;
};

const solicitCliente = async(id, data)=>{
    const conn = await connect();
    const [rows] = await conn.query(`UPDATE ANALISE_CREDITO SET DT_SOLICIT_DOCUMENTO = '${data}' WHERE ID = ${id}`);
    conn.end();
    return rows;
};

const dataDocOk = async(id, data, aprovador)=>{
    const query = `UPDATE ANALISE_CREDITO SET DATA_DOC_OK = ?, RESPONSAVEL_APROV = ? WHERE ID = ?`;
    const conn = await connect();
    const [rows] = await conn.execute(query, [data, aprovador, id]);
    conn.end();
};

module.exports = {
    analiseDeCredito,
    documento,
    solicitCliente,
    dataDocOk
};