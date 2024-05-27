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

const analiseDeCredito = async (orcamento) => {
    let conn;
    try {
      conn = await connect();
      const [rows] = await conn.query(`SELECT * FROM ANALISE_CREDITO WHERE ARQUIVADO = 0 AND NUMERO_PEDIDO LIKE '%${orcamento}%'`);
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
  
  const analiseDeCreditoArquivadas = async (orcamento) => {
    let conn;
    try {
      conn = await connect();
      const [rows] = await conn.query(`SELECT * FROM ANALISE_CREDITO WHERE ARQUIVADO = 1 AND NUMERO_PEDIDO LIKE '%${orcamento}%'`);
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
  
  const dataDocOk = async (id, data, aprovador, obs, prazo_resposta) => {
    const query = `UPDATE ANALISE_CREDITO SET DATA_DOC_OK = ?, RESPONSAVEL_APROV = ?, OBS_CADASTRO = ?, PRAZO_RESPOSTA = ? WHERE ID = ?`;
    let conn;
    try {
      conn = await connect();
      const [rows] = await conn.execute(query, [data, aprovador, obs, prazo_resposta, id]);
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

const credFinaliza  = async (resultado_analise, limite_atual, respostaAnalise, obsResposta, id) => {
    const query = `UPDATE ANALISE_CREDITO SET RESULTADO_ANALISE = ?, NOVO_LIMITE = ?, RESPOSTA_ANALISE = ?, OBS_RESPOSTA = ? WHERE ID = ?`;

    let conn;
    try {
      conn = await connect();
      const [rows] = await conn.execute(query, [resultado_analise, limite_atual, respostaAnalise, obsResposta, id]);
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

const credFinalizaParcial  = async (resultado_analise, porcentagem, valor_adiant, respostaAnalise, obsResposta, id) => {
  const query = `UPDATE ANALISE_CREDITO SET RESULTADO_ANALISE = ?, PERCENTUAL_ADIANT = ?, VALOR_ADIANT = ?, RESPOSTA_ANALISE = ?, OBS_RESPOSTA = ? WHERE ID = ?`;

  let conn;
  try {
    conn = await connect();
    const [rows] = await conn.execute(query, [resultado_analise, porcentagem, valor_adiant, respostaAnalise, obsResposta, id]);
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

const credFinalizaReprov  = async (resultado_analise, respostaAnalise, obsResposta, id) => {
  const query = `UPDATE ANALISE_CREDITO SET RESULTADO_ANALISE = ?, RESPOSTA_ANALISE = ?, OBS_RESPOSTA = ? WHERE ID = ?`;

  let conn;
  try {
    conn = await connect();
    const [rows] = await conn.execute(query, [resultado_analise, respostaAnalise, obsResposta, id]);
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

const credFinalizaData  = async (agora, arquiva, id) => {
  const query = `UPDATE ANALISE_CREDITO SET DATA_RESP = ?, ARQUIVA = ? WHERE ID = ?`;

  let conn;
  try {
    conn = await connect();
    const [rows] = await conn.execute(query, [agora, arquiva, id]);
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

const arquivar  = async (id) => {
  const query = `UPDATE ANALISE_CREDITO SET ARQUIVADO = ? WHERE ID = ?`;

  let conn;
  try {
    conn = await connect();
    const [rows] = await conn.execute(query, [1, id]);
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
    credFinaliza,
    credFinalizaParcial,
    credFinalizaReprov,
    credFinalizaData,
    arquivar,
    analiseDeCreditoArquivadas
};