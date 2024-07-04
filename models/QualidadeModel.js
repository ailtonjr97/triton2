const dotenv = require("dotenv");
dotenv.config();
const { sql, connectToDatabase } = require('../services/dbConfig.js');

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
                EDP_PREENCHIDO = 1
            WHERE ID = @ID
        `;

        await request
            .input('TEMPO_PREVISTO', sql.VarChar(255), body.tempo_previsto)
            .input('INSTRUCAO_REPROCESSO', sql.Text, body.instrucao_reprocesso)
            .input('EDP_RESPONSAVEL', sql.VarChar(255), body.edp_responsavel)
            .input('EDP_DATA', sql.VarChar(255), body.edp_data)
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

const producaoUpdate = async(body, id)=>{
    const conn = await connect();
    await conn.query(`
        UPDATE docs_qualidade SET
        prod_tempo_realizado = ?,
        prod_insumos = ?,
        prod_sucata = ?,
        prod_obs = ?,
        prod_responsavel = ?,
        prod_data = ?,
        prod_status = ?,
        producao_preenchido = 1
        WHERE id = ?
    `, [body.prod_tempo_realizado, body.prod_insumos, body.prod_sucata, body.prod_obs, body.prod_responsavel, body.prod_data, body.prod_status, id]);
    conn.end();
}

const qualidadeUpdate = async(body, id)=>{
    const conn = await connect();
    await conn.query(`
        UPDATE docs_qualidade SET
        quali_parecer = ?,
        quali_responsavel = ?,
        quali_data = ?,
        quali_status = ?,
        qualidade_preenchido = 1
        WHERE id = ?
    `, [body.quali_parecer, body.quali_responsavel, body.quali_data, body.quali_status, id]);
    conn.end();
}

const NcUpdate = async(body, id)=>{
    const conn = await connect();
    await conn.query(`
        UPDATE docs_qualidade SET
        motivo_nc = ?,
        motivo_nc_preenchido = 1
        WHERE id = ?
    `, [body.motivo_nc, id]);
    conn.end();
}

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


const inactivateDocument = async(id)=>{
    const conn = await connect();
    await conn.query(`
        UPDATE docs_qualidade SET
        active = 0
        WHERE id = ?
    `, [id]);
    conn.end();
}

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
    pcpUpdate
};