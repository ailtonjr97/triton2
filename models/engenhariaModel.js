const dotenv = require("dotenv");
dotenv.config();

async function connect(){
    const mysql = require("mysql2/promise");
    const pool = mysql.createPool({
        host: process.env.SQLHOST,
        port: '3306',
        user: 'docs_admin',
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

const all = async(setor, designado)=>{
    const conn = await connect();
    const [rows] = await conn.query(`SELECT ID, CODIGO, DESCRICAO FROM docspro.moldes`);
    conn.end();
    return rows;
}

const search = async(codigo, resultados, nome)=>{
    const conn = await connect();
    const [rows] = await conn.query(`SELECT ID, CODIGO, DESCRICAO FROM moldes WHERE CODIGO LIKE '%${codigo}%' AND DESCRICAO LIKE '%${nome}%' ORDER BY CODIGO LIMIT ${resultados}`);
    conn.end();
    return rows;
};

const molde = async(codigo)=>{
    const conn = await connect();
    const [rows] = await conn.query(`SELECT * FROM moldes WHERE ID = ${codigo}`);
    conn.end();
    return rows;
  };

module.exports = {
    all,
    search,
    molde
};