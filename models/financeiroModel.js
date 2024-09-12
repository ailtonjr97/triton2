const dotenv = require("dotenv");
dotenv.config();
const { sql, connectToDatabase } = require('../services/dbConfig.js');
const { getCurrentDateTimeForSQLServer } = require('../utils/dateUtils');

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

const consultaLuiz = async (orcamento, cliente) => {
  
  let conn;
  try {
    conn = await connect();
    const query = `
    select
      ac.ID,
      Case when ac.FILIAL in ('0101001') then 'FAB MATRIZ'
        when ac.FILIAL in ('0101004') then 'FAB LINHARES' 
        when ac.FILIAL in ('0101003') then 'CD LINHARES' else null
      end Filial, 
      STR_TO_DATE(CONCAT(cast(ac.DATA_SOLICIT as date), ' ', cast(ac.HORA_SOLICIT as time)),'%Y-%m-%d %H:%i:%s')  'Data e hora da solitação',
      ac.NUMERO_PEDIDO 'Orçamento',
      COD_CLIENTE 'Cod Cliente',
      LOJA 'Loja do Cliente',
      CLIENTE 'Nome do cliente',
      VENDEDOR 'Cod Vendedor',
      VALOR_PEDIDO 'Total do pedido',
      ifnull(LIMITE_ATUAL,0) 'Limite atual',
      ifnull(LIMITE_ATUAL,0) - VALOR_PEDIDO  Diferença,
      CONCAT(CAST(ifnull(PERCENTUAL_ADIANT,0) AS INT),' %')  'Perc. Adiantamento',
      VALOR_ADIANT 'Valor do adiantamento',
      ac.RESPONSAVEL_APROV 'Responsável pela aprovação',
      ac.DT_SOLICIT_DOCUMENTO 'Dt Solicitação de documento',
      ac.DATA_DOC_OK 'Documento Ok!',
      NOVO_LIMITE 'Novo limite',
      RESPOSTA_ANALISE 'Resposta da análise',
      ac.OBS_RESPOSTA 'Observção de resposta',
      ac.DATA_RESP 'Data da resposta',
      ac.PRAZO_RESPOSTA 'Prazo de resposta',
      ac.RESULTADO_ANALISE 'Resultado análise!',
      VALOR_PEDIDO 'Valor solicitado!' ,
        CASE 
            WHEN ac.RESULTADO_ANALISE = 'APROVADO' 
              AND (IFNULL(ac.LIMITE_ATUAL, 0) - ac.VALOR_PEDIDO) > 0 
              AND ac.NOVO_LIMITE = 0
            THEN ac.VALOR_PEDIDO
            WHEN ac.RESULTADO_ANALISE = 'APROVADO' 
              AND (IFNULL(ac.LIMITE_ATUAL, 0) - ac.VALOR_PEDIDO) > 0 
              AND ac.NOVO_LIMITE > 0 
            THEN IFNULL(ac.NOVO_LIMITE, 0)
            WHEN ac.RESULTADO_ANALISE = 'APROVADO' 
              AND (IFNULL(ac.LIMITE_ATUAL, 0) - ac.VALOR_PEDIDO) < 0 
              AND ac.NOVO_LIMITE = 0 
            THEN ac.VALOR_PEDIDO
            WHEN ac.RESULTADO_ANALISE = 'APROVADO' 
              AND (IFNULL(ac.LIMITE_ATUAL, 0) - ac.VALOR_PEDIDO) < 0 
              AND ac.NOVO_LIMITE > 0 
            THEN IFNULL(ac.NOVO_LIMITE, 0)
            WHEN ac.RESULTADO_ANALISE = 'PARCIAL' 
            THEN ABS(IFNULL(ac.LIMITE_ATUAL, 0) - ac.VALOR_PEDIDO) - ac.VALOR_ADIANT 
            ELSE 0
        END AS 'Valor aprovado!',
        year(ac.DATA_RESP) Ano,
      month(ac.DATA_RESP) Mes
      
      from ANALISE_CREDITO ac 
      
      INNER JOIN (
      SELECT FILIAL, NUMERO_PEDIDO PEDIDO, MAX(ID) ID FROM ANALISE_CREDITO 
      GROUP BY FILIAL, NUMERO_PEDIDO
      ) PED ON PED.FILIAL = ac.FILIAL 
        AND PED.PEDIDO = ac.NUMERO_PEDIDO
        AND PED.ID = ac.ID
      
      WHERE ac.RESULTADO_ANALISE IS NOT NULL 
      AND ac.ID NOT IN (9)
    `;
    const [rows] = await conn.query(query);
    return rows;
  } catch (error) {
    console.error('Erro ao executar a consulta:', error);
    throw error; // Propaga o erro para que o chamador possa tratá-lo
  } finally {
    if (conn) {
      try {
        await conn.end(); // Certifica-se de que a conexão será fechada
      } catch (error) {
        console.error('Erro ao fechar a conexão:', error);
      }
    }
  }
};

const analiseDeCredito = async (orcamento, cliente) => {
  
  let conn;
  try {
    conn = await connect();
    const query = `
      SELECT * 
      FROM ANALISE_CREDITO ac
      WHERE ac.id IN (
        SELECT MAX(sub_ac.ID) as id
        FROM ANALISE_CREDITO sub_ac
        GROUP BY sub_ac.NUMERO_PEDIDO
      ) and ac.ARQUIVADO = 0
      AND ac.NUMERO_PEDIDO LIKE ? 
      AND ac.CLIENTE LIKE ?
    `;
    const [rows] = await conn.query(query, [`%${orcamento}%`, `%${cliente}%`]);
    return rows;
  } catch (error) {
    console.error('Erro ao executar a consulta:', error);
    throw error; // Propaga o erro para que o chamador possa tratá-lo
  } finally {
    if (conn) {
      try {
        await conn.end(); // Certifica-se de que a conexão será fechada
      } catch (error) {
        console.error('Erro ao fechar a conexão:', error);
      }
    }
  }
};
  
const analiseDeCreditoArquivadas = async (orcamento, cliente) => {
  let conn;
  try {
    conn = await connect();
    const query = `
      SELECT * FROM ANALISE_CREDITO ac WHERE ac.ARQUIVADO = 1 AND ac.NUMERO_PEDIDO LIKE ? AND ac.CLIENTE LIKE ? ORDER BY ID DESC LIMIT 100`;
    const [rows] = await conn.query(query, [`%${orcamento}%`, `%${cliente}%`]);
    return rows;
  } catch (error) {
    console.error('Erro ao executar a consulta:', error);
    throw error; // Propaga o erro para que o chamador possa tratá-lo
  } finally {
    if (conn) {
      try {
        await conn.end(); // Certifica-se de que a conexão será fechada
      } catch (error) {
        console.error('Erro ao fechar a conexão:', error);
      }
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

  const trocaResp = async (id, resp) => {
    const query = `UPDATE ANALISE_CREDITO SET RESPONSAVEL_APROV = ? WHERE ID = ?`;
    let conn;
    try {
      conn = await connect();
      const [rows] = await conn.execute(query, [resp, id]);
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

const gridCteNf = async (arquivado, id, nf, cte, freteNf, freteCte) => {
  let conn;

  try {
      conn = await connect();
      const query = `
          SELECT * FROM cte_nf
          WHERE arquivado = ? 
          AND id LIKE ?
          AND chave_nf   LIKE ?
          AND chave_cte  LIKE ?
          AND (frete_nf  LIKE ? OR frete_nf IS NULL)
          AND (frete_cte LIKE ? OR frete_cte IS NULL)
          ORDER BY id DESC
      `;
      const values = [arquivado, `%${id}%`, `%${nf}%`, `%${cte}%`, `%${freteNf}%`, `%${freteCte}%`];
      const [result] = await conn.query(query, values);
      return result;
  } catch (error) {
      console.error('Erro ao executar consulta:', error);
      throw error; // Propaga o erro para que o chamador possa tratá-lo
  } finally {
      if (conn) {
          await conn.end(); // Certifica-se de que a conexão será fechada
      }
  }
};

const insertCteNf = async (chaveNf, chaveCte, freteNf, freteCte, numeroNf, numeroCte) => {
  let conn;

  try {
      conn = await connect();
      const query = `
          INSERT INTO cte_nf (chave_nf, chave_cte, frete_nf, frete_cte, numero_nf, numero_cte)
          VALUES (?, ?, ?, ?, ?, ?)
      `;
      const values = [chaveNf, chaveCte, freteNf, freteCte, numeroNf, numeroCte];
      const [result] = await conn.query(query, values);
      return result;
  } catch (error) {
      console.error('Erro ao executar a inserção:', error);
      throw error; // Propaga o erro para que o chamador possa tratá-lo
  } finally {
      if (conn) {
          await conn.end(); // Certifica-se de que a conexão será fechada
      }
  }
};

const arquivaCteNf = async (id) => {
  let conn;

  try {
      conn = await connect();
      const query = `UPDATE cte_nf SET arquivado = 1 WHERE id = ?`;
      const values = [id];
      const [result] = await conn.query(query, values);
      return result;
  } catch (error) {
      console.error('Erro ao executar a atualização:', error);
      throw error; // Propaga o erro para que o chamador possa tratá-lo
  } finally {
      if (conn) {
          await conn.end(); // Certifica-se de que a conexão será fechada
      }
  }
};

const guiasNf = async (numero) => {
  try {
    // Certifique-se de que a conexão com o banco de dados está aberta
    const pool = await connectToDatabase();
    const request = pool.request();

    const query = `SELECT DISTINCT TOP 100 D2_DOC, SUBSTRING(D2_CLASFIS, 2, 3) AS CLASFIS, D2_FILIAL, D2_PEDIDO, GUIA, GUIA_DATA, PASTA, PASTA_DATA, D2_CF FROM GUIA_NF WHERE SUBSTRING(D2_CLASFIS, 2, 3) IN ('70', '10') AND D2_DOC LIKE @numero`;
    const result = await request
      .input('numero', sql.NVarChar, `%${numero}%`)
      .query(query);

    return result.recordset;
  } catch (error) {
    console.error('Erro ao executar a consulta:', error);
    throw error; // Propaga o erro para que o chamador possa tratá-lo
  }
};

const marcarBox = async (body) => {
  try {
    // Certifique-se de que a conexão com o banco de dados está aberta
    const pool = await connectToDatabase();
    const request = pool.request();

    // Construa a consulta dinamicamente
    const query = `UPDATE GUIA_NF SET ${body.box} = 1, ${body.box}_DATA = @TIME WHERE D2_FILIAL = @FILIAL AND D2_DOC = @DOC`;
    const result = await request
      .input('TIME', sql.DateTime, getCurrentDateTimeForSQLServer())
      .input('FILIAL', sql.VarChar, body.filial)
      .input('DOC', sql.VarChar, body.doc)
      .query(query);

    return result.recordset;
  } catch (error) {
    console.error('Erro ao executar UPDATE:', error);
    throw error; // Propaga o erro para que o chamador possa tratá-lo
  }
};


const cliente = async (cod, loja) => {
  try {
    // Certifique-se de que a conexão com o banco de dados está aberta
    const pool = await connectToDatabase();
    const request = pool.request();

    const query = `SELECT * FROM SA1010 WHERE A1_COD = @COD AND A1_LOJA = @LOJA`;
    const result = await request
      .input('COD', sql.VarChar, `${cod}`)
      .input('LOJA', sql.VarChar, `${loja}`)
      .query(query);

    return result.recordset;
  } catch (error) {
    console.error('Erro ao executar a consulta:', error);
    throw error; // Propaga o erro para que o chamador possa tratá-lo
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
    analiseDeCreditoArquivadas,
    trocaResp,
    gridCteNf,
    insertCteNf,
    arquivaCteNf,
    guiasNf,
    marcarBox,
    cliente,
    consultaLuiz
};