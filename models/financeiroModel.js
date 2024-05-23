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

const analiseDeCredito = async () => {
    let conn;
    try {
      conn = await connect();
      const [rows] = await conn.query(`SELECT * FROM ANALISE_CREDITO`);
      return rows;
    } catch (error) {
      console.error('Erro ao executar a consulta:', error);
      throw error; // Propaga o erro para que o chamador possa tratá-lo
    } finally {
      if (conn) {
        await conn.end(); // Certifica-se de que a conexão será fechada
      }
    }
  };
  
  const documento = async (id) => {
    let conn;
    try {
      conn = await connect();
      const [rows] = await conn.query(`SELECT * FROM ANALISE_CREDITO WHERE ID = ?`, [id]);
      return rows;
    } catch (error) {
      console.error('Erro ao executar a consulta:', error);
      throw error; // Propaga o erro para que o chamador possa tratá-lo
    } finally {
      if (conn) {
        await conn.end(); // Certifica-se de que a conexão será fechada
      }
    }
  };
  
  const solicitCliente = async (id, data) => {
    let conn;
    try {
      conn = await connect();
      const [rows] = await conn.query(`UPDATE ANALISE_CREDITO SET DT_SOLICIT_DOCUMENTO = ? WHERE ID = ?`, [data, id]);
      return rows;
    } catch (error) {
      console.error('Erro ao executar a consulta:', error);
      throw error; // Propaga o erro para que o chamador possa tratá-lo
    } finally {
      if (conn) {
        await conn.end(); // Certifica-se de que a conexão será fechada
      }
    }
  };
  
  const dataDocOk = async (id, data, aprovador, obs) => {
    const query = `UPDATE ANALISE_CREDITO SET DATA_DOC_OK = ?, RESPONSAVEL_APROV = ?, OBS_CADASTRO = ? WHERE ID = ?`;
    let conn;
    try {
      conn = await connect();
      const [rows] = await conn.execute(query, [data, aprovador, obs, id]);
      return rows;
    } catch (error) {
      console.error('Erro ao executar a consulta:', error);
      throw error; // Propaga o erro para que o chamador possa tratá-lo
    } finally {
      if (conn) {
        await conn.end(); // Certifica-se de que a conexão será fechada
      }
    }
  };

const credFinaliza  = async (resultado_analise, limite_atual, id) => {
    const query = `UPDATE ANALISE_CREDITO SET RESULTADO_ANALISE = ?, NOVO_LIMITE = ? WHERE ID = ?`;

    let conn;
    try {
      conn = await connect();
      const [rows] = await conn.execute(query, [resultado_analise, limite_atual, id]);
      return rows;
    } catch (error) {
      console.error('Erro ao executar a consulta:', error);
      throw error;
    } finally {
      if (conn) {
        await conn.end();
      }
    }
  };

module.exports = {
    analiseDeCredito,
    documento,
    solicitCliente,
    dataDocOk,
    credFinaliza
};