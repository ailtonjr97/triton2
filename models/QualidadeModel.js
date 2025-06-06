const dotenv = require("dotenv");
dotenv.config();
const { sqlQualidade: sql, connectQualidade: connectToDatabase } = require('../services/dbQualidade');

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

const all = async (cod, loja) => {
    try {
      // Certifique-se de que a conexão com o banco de dados está aberta
      const pool = await connectToDatabase();
      const request = pool.request();
  
      const query = `SELECT * FROM DOCS_QUALIDADE WHERE ACTIVE = 1`;
      const result = await request
        // .input('COD', sql.VarChar, `${cod}`)
        // .input('LOJA', sql.VarChar, `${loja}`)
        .query(query);
  
      return result.recordset;
    } catch (error) {
      console.error('Erro ao executar a consulta:', error);
      throw error; // Propaga o erro para que o chamador possa tratá-lo
    }
  };

const inspetores = async(setor)=>{
    const conn = await connect();
    const [rows] = await conn.query("SELECT id, name FROM users WHERE setor = ? AND active = 1", setor);
    conn.end();
    return rows;
}

const one = async (id) => {
    try {
        const pool = await connectToDatabase();
        const request = pool.request();

        const query = 'SELECT * FROM DOCS_QUALIDADE WHERE ID = @ID';

        const result = await request
            .input('ID', sql.Int, id)
            .query(query);

        return result.recordset;
    } catch (error) {
        console.error('Erro ao executar SELECT:', error);
        throw error; // Propaga o erro para que o chamador possa tratá-lo
    }
};

const create = async (body) => {
    try {
        const pool = await connectToDatabase();
        const request = pool.request();

        const query = `
            INSERT INTO DOCS_QUALIDADE (
                TIPO_DOC, 
                DATA, 
                INSPETOR, 
                COD_PROD, 
                DESCRI, 
                LOTE_ODF, 
                LANCE, 
                QUANTIDADE_METRAGEM, 
                CPNC_NUMERO,
                EDP_PREENCHIDO,
                PCP_PREENCHIDO,
                PRODUCAO_PREENCHIDO,
                QUALIDADE_PREENCHIDO,
                MOTIVO_NC_PREENCHIDO,
                ACTIVE,
                ANEXO
            )
            VALUES (
                'FOR-EDP-025', 
                @DATA, 
                @INSPETOR, 
                @COD_PROD, 
                @DESCRI, 
                @LOTE_ODF, 
                @LANCE, 
                @QUANTIDADE_METRAGEM, 
                @CPNC_NUMERO, 
                0, 
                0, 
                0, 
                0, 
                0, 
                1, 
                ''
            )`;

        const result = await request
            .input('DATA', sql.VarChar(255), body.data)
            .input('INSPETOR', sql.VarChar(255), body.inspetor)
            .input('COD_PROD', sql.VarChar(255), body.cod_prod)
            .input('DESCRI', sql.Text, body.descri)
            .input('LOTE_ODF', sql.VarChar(255), body.lote_odf)
            .input('LANCE', sql.VarChar(255), body.lance)
            .input('QUANTIDADE_METRAGEM', sql.VarChar(255), body.quantidade_metragem)
            .input('CPNC_NUMERO', sql.VarChar(255), body.cpnc_numero)
            .input('MOTIVO_NC', sql.Text, body.motivo_nc)
            .query(query);

        return result.recordset;
    } catch (error) {
        console.error('Erro ao executar INSERT:', error);
        throw error; // Propaga o erro para que o chamador possa tratá-lo
    }
};

const edpUpdate = async (body, id) => {
    let pool;
    try {
        pool = await connectToDatabase();
        const request = pool.request();

        const query = `
            UPDATE DOCS_QUALIDADE SET
                TEMPO_PREVISTO = @TEMPO_PREVISTO,
                INSTRUCAO_REPROCESSO = @INSTRUCAO_REPROCESSO,
                EDP_RESPONSAVEL = @EDP_RESPONSAVEL,
                EDP_DATA = @EDP_DATA,
                EDP_PREENCHIDO = 1,
                LINHA_PRODUTIVA = @LINHA_PRODUTIVA
            WHERE ID = @ID
        `;

        await request
            .input('TEMPO_PREVISTO', sql.VarChar(255), body.tempo_previsto)
            .input('INSTRUCAO_REPROCESSO', sql.Text, body.instrucao_reprocesso)
            .input('EDP_RESPONSAVEL', sql.VarChar(255), body.edp_responsavel)
            .input('EDP_DATA', sql.VarChar(255), body.edp_data)
            .input('LINHA_PRODUTIVA', sql.VarChar(255), body.linha_produtiva)
            .input('ID', sql.Int, id)
            .query(query);

        return { message: 'Update successful' };
    } catch (error) {
        console.error('Erro ao executar UPDATE:', error);
        throw error; // Propaga o erro para que o chamador possa tratá-lo
    }
};

const updateAnexo = async(anexoNome, id)=>{
    const conn = await connect();
    await conn.query(`
        UPDATE docs_qualidade SET
        anexo = ?
        WHERE id = ?
    `, [anexoNome, id]);
    conn.end();
}

const pcpUpdate = async (body, id) => {
    let pool;
    try {
        pool = await connectToDatabase();
        const request = pool.request();

        const query = `
            UPDATE DOCS_QUALIDADE SET
                PCP_ODF_RETRABALHO = @PCP_ODF_RETRABALHO,
                PCP_RESPONSAVEL = @PCP_RESPONSAVEL,
                PCP_DATA = @PCP_DATA,
                PCP_OBS = @PCP_OBS,
                PCP_PREENCHIDO = 1
            WHERE ID = @ID
        `;

        const result = await request
            .input('PCP_ODF_RETRABALHO', sql.VarChar(100), body.pcp_odf_retrabalho)
            .input('PCP_RESPONSAVEL', sql.VarChar(255), body.pcp_responsavel)
            .input('PCP_DATA', sql.VarChar(255), body.pcp_data)
            .input('PCP_OBS', sql.Text, body.pcp_obs)
            .input('ID', sql.Int, id)
            .query(query);

        return { message: 'Update successful' };
    } catch (error) {
        console.error('Erro ao executar UPDATE:', error);
        throw error; // Propaga o erro para que o chamador possa tratá-lo
    }
};

const producaoUpdate = async (body, id) => {
    let pool;
    try {
        pool = await connectToDatabase();
        const request = pool.request();

        const query = `
            UPDATE DOCS_QUALIDADE SET
                PROD_TEMPO_REALIZADO = @PROD_TEMPO_REALIZADO,
                PROD_INSUMOS = @PROD_INSUMOS,
                PROD_SUCATA = @PROD_SUCATA,
                PROD_OBS = @PROD_OBS,
                PROD_RESPONSAVEL = @PROD_RESPONSAVEL,
                PROD_DATA = @PROD_DATA,
                PROD_STATUS = @PROD_STATUS,
                PRODUCAO_PREENCHIDO = 1
            WHERE ID = @ID
        `;

        await request
            .input('PROD_TEMPO_REALIZADO', sql.VarChar(100), body.prod_tempo_realizado)
            .input('PROD_INSUMOS', sql.VarChar(255), body.prod_insumos)
            .input('PROD_SUCATA', sql.VarChar(255), body.prod_sucata)
            .input('PROD_OBS', sql.Text, body.prod_obs)
            .input('PROD_RESPONSAVEL', sql.VarChar(255), body.prod_responsavel)
            .input('PROD_DATA', sql.VarChar(255), body.prod_data)
            .input('PROD_STATUS', sql.VarChar(50), body.prod_status)
            .input('ID', sql.Int, id)
            .query(query);

        return { message: 'Update successful' };
    } catch (error) {
        console.error('Erro ao executar UPDATE:', error);
        throw error; // Propaga o erro para que o chamador possa tratá-lo
    }
};

const qualidadeUpdate = async (body, id) => {
    let pool;
    try {
        pool = await connectToDatabase();
        const request = pool.request();

        const query = `
            UPDATE DOCS_QUALIDADE SET
                QUALI_PARECER = @QUALI_PARECER,
                QUALI_RESPONSAVEL = @QUALI_RESPONSAVEL,
                QUALI_DATA = @QUALI_DATA,
                QUALI_STATUS = @QUALI_STATUS,
                QUALIDADE_PREENCHIDO = 1
            WHERE ID = @ID
        `;

        await request
            .input('QUALI_PARECER', sql.VarChar(255), body.quali_parecer)
            .input('QUALI_RESPONSAVEL', sql.VarChar(255), body.quali_responsavel)
            .input('QUALI_DATA', sql.VarChar(255), body.quali_data)
            .input('QUALI_STATUS', sql.VarChar(50), body.quali_status)
            .input('ID', sql.Int, id)
            .query(query);

        return { message: 'Update successful' };
    } catch (error) {
        console.error('Erro ao executar UPDATE:', error);
        throw error; // Propaga o erro para que o chamador possa tratá-lo
    }
};

const ncUpdate = async (body, id) => {
    let pool;
    try {
        pool = await connectToDatabase();
        const request = pool.request();

        const query = `
            UPDATE DOCS_QUALIDADE SET
                MOTIVO_NC = @MOTIVO_NC,
                MOTIVO_NC_PREENCHIDO = 1
            WHERE ID = @ID
        `;

        await request
            .input('MOTIVO_NC', sql.VarChar(255), body.motivo_nc)
            .input('ID', sql.Int, id)
            .query(query);

        return { message: 'Update successful' };
    } catch (error) {
        console.error('Erro ao executar UPDATE:', error);
        throw error; // Propaga o erro para que o chamador possa tratá-lo
    }
};

const inactiveDocuments = async () => {
    try {
        const pool = await connectToDatabase();
        const request = pool.request();

        const query = `SELECT * FROM DOCS_QUALIDADE WHERE ACTIVE = 0`;

        const result = await request.query(query);

        return result.recordset;
    } catch (error) {
        console.error('Erro ao executar SELECT:', error);
        throw error; // Propaga o erro para que o chamador possa tratá-lo
    }
};

const inactiveDocument = async(id)=>{
    const conn = await connect();
    const [rows] = await conn.query(`SELECT * FROM docs_qualidade WHERE id = ? AND active = 0`, [id]);
    conn.end();
    return rows;
}


const inactivateDocument = async (id) => {
    let pool;
    try {
        pool = await connectToDatabase();
        const request = pool.request();

        const query = `
            UPDATE DOCS_QUALIDADE SET
                ACTIVE = 0
            WHERE ID = @ID
        `;

        await request
            .input('ID', sql.Int, id)
            .query(query);

        return { message: 'Document inactivated successfully' };
    } catch (error) {
        console.error('Erro ao inativar documento:', error);
        throw error; // Propaga o erro para que o chamador possa tratá-lo
    }
};

const ultimoDocumento = async () => {
    try {
        const pool = await connectToDatabase();
        const request = pool.request();

        const query = `SELECT TOP 1 ID FROM DOCS_QUALIDADE ORDER BY ID DESC`;

        const result = await request.query(query);

        return result.recordset;
    } catch (error) {
        console.error('Erro ao executar SELECT:', error);
        throw error; // Propaga o erro para que o chamador possa tratá-lo
    }
};

const todosConsulta = async () => {
    try {
        const pool = await connectToDatabase();
        const request = pool.request();

        const query = `SELECT * FROM DOCS_QUALIDADE`;

        const result = await request.query(query);

        return result.recordset;
    } catch (error) {
        console.error('Erro ao executar SELECT:', error);
        throw error; // Propaga o erro para que o chamador possa tratá-lo
    }
};

const listaAnexos = async (id) => {
    try {
        const pool = await connectToDatabase();
        const request = pool.request();

        const query = `SELECT ID, ORIGINAL_NAME, FILENAME FROM ANEXOS WHERE DOCS_QUALIDADE_ID = @ID`;

        const result = await request
            .input('ID', sql.Int, id)
            .query(query);

        return result.recordset;
    } catch (error) {
        console.error('Erro ao executar SELECT:', error);
        throw error; // Propaga o erro para que o chamador possa tratá-lo
    }
};

const novoAnexo = async (file, id) => {
    let pool;
    try {
        pool = await connectToDatabase();
        const request = pool.request();

        const query = `
            INSERT INTO ANEXOS (
                FIELDNAME,
                ORIGINAL_NAME,
                ENCODING,
                MIMETYPE,
                DESTINATION,
                FILENAME,
                PATH,
                SIZE,
                DOCS_QUALIDADE_ID
            )
            VALUES (
                @FIELDNAME,
                @ORIGINAL_NAME,
                @ENCODING,
                @MIMETYPE,
                @DESTINATION,
                @FILENAME,
                @PATH,
                @SIZE,
                @DOCS_QUALIDADE_ID
            )`;

        const result = await request
            .input('FIELDNAME', sql.VarChar(100), file.fieldname)
            .input('ORIGINAL_NAME', sql.VarChar(255), file.originalname)
            .input('ENCODING', sql.VarChar(100), file.encoding)
            .input('MIMETYPE', sql.VarChar(100), file.mimetype)
            .input('DESTINATION', sql.VarChar(100), file.destination)
            .input('FILENAME', sql.VarChar(255), file.filename)
            .input('PATH', sql.VarChar(255), file.path)
            .input('SIZE', sql.Int, file.size)
            .input('DOCS_QUALIDADE_ID', sql.Int, id)
            .query(query);

        return result.recordset;
    } catch (error) {
        console.error('Erro ao executar INSERT:', error);
        throw error; // Propaga o erro para que o chamador possa tratá-lo
    }
};

const preencheAnexo = async (id) => {
    try {
        const pool = await connectToDatabase();
        const request = pool.request();

        const query = `UPDATE DOCS_QUALIDADE SET ANEXO = 1 WHERE ID = @ID`;
        const result = await request
        .input('ID', sql.Int, id)
        .query(query);

        return result.recordset;
    } catch (error) {
        console.error('Erro ao executar UPDATE:', error);
        throw error; // Propaga o erro para que o chamador possa tratá-lo
    }
}

const propriedades = async () => {
    try {
        const pool = await connectToDatabase();
        const request = pool.request();

        const query = `SELECT TOP 500 * FROM qualidade_propriedade WHERE arquivado = 0 ORDER BY id DESC`;
        const result = await request
        .query(query);

        return result.recordset;
    } catch (error) {
        console.error('Erro ao executar SELECT:', error);
        throw error; // Propaga o erro para que o chamador possa tratá-lo
    }
};

const propriedadesArquivados = async () => {
    try {
        const pool = await connectToDatabase();
        const request = pool.request();

        const query = `SELECT TOP 500 * FROM qualidade_propriedade WHERE arquivado = 1 ORDER BY id DESC`;
        const result = await request
        .query(query);

        return result.recordset;
    } catch (error) {
        console.error('Erro ao executar SELECT:', error);
        throw error; // Propaga o erro para que o chamador possa tratá-lo
    }
};

const propriedadesProdutos = async (id) => {
    try {
        const pool = await connectToDatabase();
        const request = pool.request();

        const query = `SELECT * FROM qualidade_propriedade_produtos WHERE qualidade_propriedade_id = @ID ORDER BY id ASC`;
        const result = await request
        .input('ID', sql.Int, id)
        .query(query);

        return result.recordset;
    } catch (error) {
        console.error('Erro ao executar SELECT:', error);
        throw error; // Propaga o erro para que o chamador possa tratá-lo
    }
};

const propriedade = async (id) => {
    try {
        const pool = await connectToDatabase();
        const request = pool.request();

        const query = `SELECT * FROM qualidade_propriedade WHERE id = @ID`;
        const result = await request
        .input('ID', sql.Int, id)
        .query(query);

        return result.recordset;
    } catch (error) {
        console.error('Erro ao executar SELECT:', error);
        throw error; // Propaga o erro para que o chamador possa tratá-lo
    }
};

const buscarAnexoPropriedades = async (id) => {
    try {
        const pool = await connectToDatabase();
        const request = pool.request();

        const query = `SELECT * FROM ANEXOS WHERE PROPRIEDADES_ID = @ID`;
        const result = await request
        .input('ID', sql.Int, id)
        .query(query);

        return result.recordset;
    } catch (error) {
        console.error('Erro ao executar SELECT:', error);
        throw error; // Propaga o erro para que o chamador possa tratá-lo
    }
};

const insertPropriedade = async (body) => {
    try {
        const pool = await connectToDatabase();
        const request = pool.request();

        const query = `
            INSERT INTO qualidade_propriedade 
                (nome, cliente_cod, cliente_nome, numero_nf, transportadora, rrc, CRIADO_EM, frete, motivo_devolucao, obs)
            OUTPUT inserted.id
            VALUES 
                (@NOME, @CLIENTE_COD, @CLIENTE_NOME, @NUMERO_NF, @TRANSPORTADORA, @RRC, GETDATE(), @FRETE, @MOT_DEV, @OBS);
        `;
        
        const result = await request
            .input('NOME', sql.VarChar(255), body.nome)
            .input('CLIENTE_COD', sql.VarChar(255), body.cliente_cod)
            .input('CLIENTE_NOME', sql.VarChar(255), body.cliente_nome)
            .input('NUMERO_NF', sql.VarChar(255), body.numero_nf)
            .input('TRANSPORTADORA', sql.VarChar(255), body.transportadora)
            .input('RRC', sql.VarChar(255), body.rrc)
            .input('FRETE', sql.VarChar(255), body.frete)
            .input('MOT_DEV', sql.VarChar(255), body.mot_dev)
            .input('OBS', sql.VarChar(255), body.obs)
            .query(query);

        return result;
    } catch (error) {
        console.error('Erro ao executar INSERT:', error);
        throw error;
    }
};

const insertPropriedadeProduto = async (e, id) => {
    try {
      const pool = await connectToDatabase();
      const request = pool.request();
  
      const query = `
        INSERT INTO qualidade_propriedade_produtos
          (codigo, descricao, qualidade_propriedade_id, quantidade)
        VALUES
          (@CODIGO, @DESCRICAO, @QUALIDADE_PROPRIEDADE_ID, @QUANTIDADE);
      `;
      
      const result = await request
        .input('CODIGO', sql.VarChar(255), e.cod_prod)
        .input('DESCRICAO', sql.VarChar(255), e.nome)
        .input('QUALIDADE_PROPRIEDADE_ID', sql.Int, id)
        .input('QUANTIDADE', sql.VarChar(255), e.quantidade)
        .query(query);
  
      return result;
    } catch (error) {
      console.error('Erro ao executar INSERT:', error);
      throw error;
    }
};

const statusPropriedadeProduto = async (id, status, arquiva) => {
    try {
      const pool = await connectToDatabase();
      const request = pool.request();
  
      const query = `
        UPDATE qualidade_propriedade
        SET status = @STATUS, arquiva = @ARQUIVA where id = @ID
      `;
      
      const result = await request
        .input('ID', sql.Int(255), id)
        .input('STATUS', sql.Int(255), status)
        .input('ARQUIVA', sql.Int(255), arquiva)
        .query(query);
  
      return result;
    } catch (error) {
      console.error('Erro ao executar INSERT:', error);
      throw error;
    }
};

const novoAnexoPropriedades = async (file, id) => {
    let pool;
    try {
        pool = await connectToDatabase();
        const request = pool.request();

        const query = `
            INSERT INTO ANEXOS (
                FIELDNAME,
                ORIGINAL_NAME,
                ENCODING,
                MIMETYPE,
                DESTINATION,
                FILENAME,
                PATH,
                SIZE,
                PROPRIEDADES_ID
            )
            VALUES (
                @FIELDNAME,
                @ORIGINAL_NAME,
                @ENCODING,
                @MIMETYPE,
                @DESTINATION,
                @FILENAME,
                @PATH,
                @SIZE,
                @PROPRIEDADES_ID
            )`;

        const result = await request
            .input('FIELDNAME', sql.VarChar(100), file.fieldname)
            .input('ORIGINAL_NAME', sql.VarChar(255), file.originalname)
            .input('ENCODING', sql.VarChar(100), file.encoding)
            .input('MIMETYPE', sql.VarChar(100), file.mimetype)
            .input('DESTINATION', sql.VarChar(100), file.destination)
            .input('FILENAME', sql.VarChar(255), file.filename)
            .input('PATH', sql.VarChar(255), file.path)
            .input('SIZE', sql.Int, file.size)
            .input('PROPRIEDADES_ID', sql.Int, id)
            .query(query);

        return result.recordset;
    } catch (error) {
        console.error('Erro ao executar INSERT:', error);
        throw error; // Propaga o erro para que o chamador possa tratá-lo
    }
};

const arquivarPropriedadeProduto = async (id) => {
    try {
      const pool = await connectToDatabase();
      const request = pool.request();
  
      const query = `
        UPDATE qualidade_propriedade
        SET arquivado = 1 where id = @ID
      `;
      
      const result = await request
        .input('ID', sql.Int(255), id)
        .query(query);
  
      return result;
    } catch (error) {
      console.error('Erro ao executar INSERT:', error);
      throw error;
    }
};

const checklistPropriedadeProduto = async (id, body) => {
    try {
        const pool = await connectToDatabase();
        const request = pool.request();

        // Convertendo datas, se existirem
        if (body.no_dia) {
            const [diaNoDia, mesNoDia, anoNoDia] = body.no_dia.split("/");
            body.no_dia = `${anoNoDia}-${mesNoDia}-${diaNoDia}`;
        }

        if (body.data_chegada) {
            const [diaChegada, mesChegada, anoChegada] = body.data_chegada.split("/");
            body.data_chegada = `${anoChegada}-${mesChegada}-${diaChegada}`;
        }

        const query = `
            UPDATE qualidade_propriedade
            SET 
                pergunta_1 = @PERGUNTA_1,
                pergunta_2 = @PERGUNTA_2,
                pergunta_3 = @PERGUNTA_3,
                pergunta_4 = @PERGUNTA_4,
                entregue_setor = @ENTREGUE_SETOR,
                no_dia = @NO_DIA,
                data_chegada = @DATA_CHEGADA,
                anali_mer = @ANALI_MER,
                mat_nece = @MAT_NECE,
                data_saida = @DATA_SAIDA,
                insp_final = @INSP_FINAL,
                arquiva = @ARQUIVA
            WHERE id = @ID
        `;

        const result = await request
            .input('PERGUNTA_1', sql.VarChar(255), body.pergunta_1)
            .input('PERGUNTA_2', sql.VarChar(255), body.pergunta_2)
            .input('PERGUNTA_3', sql.VarChar(255), body.pergunta_3)
            .input('PERGUNTA_4', sql.VarChar(255), body.pergunta_4)
            .input('ENTREGUE_SETOR', sql.VarChar(255), body.entregue_setor) // Permitindo null
            .input('NO_DIA', sql.Date, body.no_dia || null) // Permitindo null
            .input('DATA_CHEGADA', sql.Date, body.data_chegada || null) // Permitindo null
            .input('ANALI_MER', sql.Text, body.anali_mer || null) // Permitindo null
            .input('MAT_NECE', sql.Text, body.mat_nece || null) // Permitindo null
            .input('DATA_SAIDA', sql.Date, body.data_saida || null) // Permitindo null
            .input('INSP_FINAL', sql.Text, body.insp_final || null) // Permitindo null
            .input('ARQUIVA', sql.Int, 1) // Permitindo null
            .input('ID', sql.Int, id)
            .query(query);

        return result;
    } catch (error) {
        console.error('Erro ao executar UPDATE:', error);
        throw error;
    }
};


module.exports = {
    all,
    one,
    inspetores,
    create,
    ultimoDocumento,
    novoAnexo,
    preencheAnexo,
    inactiveDocuments,
    listaAnexos,
    edpUpdate,
    pcpUpdate,
    producaoUpdate,
    qualidadeUpdate,
    ncUpdate,
    inactivateDocument,
    todosConsulta,
    propriedades,
    propriedade,
    insertPropriedade,
    novoAnexoPropriedades,
    buscarAnexoPropriedades,
    insertPropriedadeProduto,
    propriedadesProdutos,
    statusPropriedadeProduto,
    arquivarPropriedadeProduto,
    propriedadesArquivados,
    checklistPropriedadeProduto
};