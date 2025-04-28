const dotenv = require("dotenv");
dotenv.config();
const sqlProtheus = require('mssql');

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

async function connect2(){
    const mysql = require("mysql2/promise");
    const pool = mysql.createPool({
        host: process.env.SQLHOST2,
        port: '3306',
        user: process.env.SQLUSER2,
        password: process.env.SQLPASSWORD2,
        database: process.env.SQLDATABASE2,
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

connect();
connect2();

const allManutInd = async (id) => {
    let conn;
    try {
        conn = await connect2();
        const query = `
            select * from chamados where chamado_setor_id = 3
        `;
        const values = [id];
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

const allStatusChamados = async (id) => {
    let conn;
    try {
        conn = await connect2();
        const query = `
            select * from status_chamados 
        `;
        const values = [id];
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

const allUrgenciasChamados = async (id) => {
    let conn;
    try {
        conn = await connect2();
        const query = `
            select * from urgencias
        `;
        const values = [id];
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

const allAreasChamados = async (id) => {
    let conn;
    try {
        conn = await connect2();
        const query = `
            select * from areas_atuacaos
        `;
        const values = [id];
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

const allOperacoesChamados = async (id) => {
    let conn;
    try {
        conn = await connect2();
        const query = `
            select * from operacoes
        `;
        const values = [id];
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

const allUsers = async (id) => {
    let conn;
    try {
        conn = await connect2();
        const query = `
            select id, name, email from users
        `;
        const values = [id];
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

const allEmpresas = async (id) => {
    let conn;
    try {
        conn = await connect2();
        const query = `
            select * from empresas
        `;
        const values = [id];
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

const allTipoManuts = async (id) => {
    let conn;
    try {
        conn = await connect2();
        const query = `
            select * from chamado_tipo_manuts
        `;
        const values = [id];
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

const allSubTipoManuts = async (id) => {
    let conn;
    try {
        conn = await connect2();
        const query = `
            select * from chamado_sub_tipo_manuts
        `;
        const values = [id];
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

const allCentroCusto = async (id) => {
    let conn;
    try {
        conn = await connect2();
        const query = `
            select * from centro_custo
        `;
        const values = [id];
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

const vendedor = async (id) => {
    let conn;
    try {
        conn = await connect();
        const query = `
            SELECT pf.id as idpf, pf.valor as valor, u.email as email, pf.pedido as pedido, pf.cliente, pf.loja_cliente FROM proposta_frete pf
            inner join users u on pf.cotador_id = u.intranet_id
            where pf.id = ?
        `;
        const values = [id];
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


const preparaArquivaFrete = async(pedido, revisao)=>{
    const conn = await connect();
    await conn.query(`
        UPDATE proposta_frete SET
        arquivar = 1
        WHERE pedido = ? AND revisao = ?
    `, [pedido, revisao]);
    conn.end();
};

const arquivaFrete = async(id)=>{
    const conn = await connect();
    await conn.query(`
        UPDATE proposta_frete SET
        status = 0
        WHERE id = ?
    `, [id]);
    conn.end();
};

const all = async(setor, designado)=>{
    const conn = await connect();
    const [rows] = await conn.query(`
        WITH MaxRevisao AS (
            SELECT pedido, MAX(revisao) AS max_revisao
            FROM proposta_frete
            GROUP BY pedido
        )
        SELECT 
            pf.*, 
            u.name AS 'vendedor', 
            u2.name AS 'cotador'
        FROM proposta_frete pf
        LEFT JOIN users u ON pf.cotador_id = u.intranet_id
        LEFT JOIN users u2 ON pf.cotador_id_2 = u2.intranet_id
        JOIN MaxRevisao mr ON pf.pedido = mr.pedido AND pf.revisao = mr.max_revisao
        WHERE pf.status = 1
        ORDER BY pf.id DESC
        LIMIT 300;
        `);
    conn.end();
    return rows;
};

const allConsulta = async (setor, designado) => {
    const conn = await connect();
    const [rows] = await conn.query(`
        WITH MaxRevisao AS (
            SELECT pedido, MAX(revisao) AS max_revisao
            FROM proposta_frete
            GROUP BY pedido
        )
        SELECT pf.*, u.name AS 'vendedor', u2.name AS 'cotador'
        FROM proposta_frete pf
        LEFT JOIN users u ON pf.cotador_id = u.intranet_id
        LEFT JOIN users u2 ON pf.cotador_id_2 = u2.intranet_id
        JOIN MaxRevisao mr ON pf.pedido = mr.pedido AND pf.revisao = mr.max_revisao
    `);
    conn.end();
    return rows;
};

const allArquivadas = async () => {
    const conn = await connect();
    const [rows] = await conn.query(`
        WITH MaxRevisao AS (
            SELECT pedido, MAX(revisao) AS max_revisao
            FROM proposta_frete
            GROUP BY pedido
        )
        SELECT pf.*, u.name AS 'vendedor', u2.name AS 'cotador'
        FROM proposta_frete pf
        LEFT JOIN users u ON pf.cotador_id = u.intranet_id
        LEFT JOIN users u2 ON pf.cotador_id_2 = u2.intranet_id
        JOIN MaxRevisao mr ON pf.pedido = mr.pedido AND pf.revisao = mr.max_revisao
        WHERE pf.status = 0
        ORDER BY pf.id
    `);
    conn.end();
    return rows;
};

const allSemRevisao = async (setor, designado) => {
    const conn = await connect();
    const [rows] = await conn.query(`
        WITH MaxRevisao AS (
            SELECT pedido, MAX(revisao) AS max_revisao
            FROM proposta_frete
            GROUP BY pedido
        )
        SELECT pf.*, u.name AS 'vendedor', u2.name AS 'cotador'
        FROM proposta_frete pf
        LEFT JOIN users u ON pf.cotador_id = u.intranet_id
        LEFT JOIN users u2 ON pf.cotador_id_2 = u2.intranet_id
        WHERE pf.status = 1
    `);
    conn.end();
    return rows;
};

const search = async (codigo, resultados, vendedor, identificador, filial) => {
    const conn = await connect();
    const [rows] = await conn.query(`
        WITH MaxRevisao AS (
            SELECT pedido, MAX(revisao) AS max_revisao
            FROM proposta_frete
            GROUP BY pedido
        )
        SELECT pf.*, u.name AS 'vendedor', u2.name AS 'cotador'
        FROM proposta_frete pf
        LEFT JOIN users u ON pf.cotador_id = u.intranet_id
        LEFT JOIN users u2 ON pf.cotador_id_2 = u2.intranet_id
        JOIN MaxRevisao mr ON pf.pedido = mr.pedido AND pf.revisao = mr.max_revisao
        WHERE pf.pedido LIKE ? AND u.name LIKE ? AND pf.id LIKE ? AND pf.status = 1 AND pf.filial LIKE ?
        ORDER BY pf.id DESC
        LIMIT ?
    `, [`%${codigo}%`, `%${vendedor}%`, `%${identificador}%`, `%${filial}%`, parseInt(resultados)]);
    conn.end();
    return rows;
};

const searchArquivadas = async (codigo, resultados, vendedor, identificador) => {
    const conn = await connect();
    const [rows] = await conn.query(`
        WITH MaxRevisao AS (
            SELECT pedido, MAX(revisao) AS max_revisao
            FROM proposta_frete
            GROUP BY pedido
        )
        SELECT pf.*, u.name AS 'vendedor', u2.name AS 'cotador'
        FROM proposta_frete pf
        LEFT JOIN users u ON pf.cotador_id = u.intranet_id
        LEFT JOIN users u2 ON pf.cotador_id_2 = u2.intranet_id
        JOIN MaxRevisao mr ON pf.pedido = mr.pedido AND pf.revisao = mr.max_revisao
        WHERE pf.pedido LIKE ? AND u.name LIKE ? AND pf.id LIKE ? AND pf.status = 0
        ORDER BY pf.id
        LIMIT ?
    `, [`%${codigo}%`, `%${vendedor}%`, `%${identificador}%`, parseInt(resultados)]);
    conn.end();
    return rows;
};

const searchSemRevisao = async (codigo, resultados, vendedor) => {
    const conn = await connect();
    const [rows] = await conn.query(`
        SELECT pf.*, u.name AS 'vendedor', u2.name AS 'cotador'
        FROM proposta_frete pf
        LEFT JOIN users u ON pf.cotador_id = u.intranet_id
        LEFT JOIN users u2 ON pf.cotador_id_2 = u2.intranet_id
        WHERE pf.pedido LIKE ? AND u.name LIKE ? AND pf.status = 1
        LIMIT ?
    `, [`%${codigo}%`, `%${vendedor}%`, parseInt(resultados)]);
    conn.end();
    return rows;
};


const proposta = async(id)=>{
    const conn = await connect();
    const [rows] = await conn.query(`select * from proposta_frete WHERE id = ${id}`);
    conn.end();
    return rows;
};

const buscaValorOriginal = async(id)=>{
    const conn = await connect();
    const [rows] = await conn.query(`select * from proposta_frete pf where id = ${id}`);
    conn.end();
    return rows;
};

const statusAniversario = async(status, id)=>{
    const conn = await connect();
    await conn.query(`
        UPDATE proposta_frete SET
        aniversario_status = ?
        WHERE id = ?
    `, [status, id]);
    conn.end();
};

const freteUpdate = async(body, id, today, valorMaisImposto, freteOriginal)=>{
    const conn = await connect();
    await conn.query(`
        UPDATE proposta_frete SET
        data_resp = ?,
        valor = ?,
        id_transportadora = ?,
        prazo = ?,
        nome_transportadora = ?,
        cotador_id_2 = ?,
        cod_cot = ?,
        CJ_FRTORI = ?,
        datahora_resp = NOW()
        WHERE id = ?
    `, [today, valorMaisImposto, body[0].transp_nome_select, body[0].prazo, body[0].transp_nome2_select, body[0].cotador_id_2, body[0].codcot, freteOriginal, id]);
    conn.end();
};

const novaProposta = async(numped, cotador, today, revisao, cliente, valor_pedido, filial, loja, checkAniversario, checkStatus, valorAniversario)=>{
    const conn = await connect();
    await conn.query(
        `INSERT INTO proposta_frete (
            pedido,
            cotador_id,
            data_solicit,
            data_resp,
            revisao,
            valor,
            status,
            id_transportadora,
            prazo,
            cliente,
            valor_pedido,
            filial,
            arquivar,
            loja_cliente,
            check_aniversario,
            aniversario_status,
            aniversario_valor
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [numped, cotador, today, null, revisao, 0, 1, null, null, cliente, valor_pedido, filial, 0, loja, checkAniversario, checkStatus, valorAniversario]);
    conn.end();
};

const novosItens = async(numped, body, revisao)=>{
    const conn = await connect();
    await conn.query(
        `INSERT INTO proposta_frete_itens (
            proposta_frete_id,
            produto,
            qtdven,
            loja,
            descri,
            obs,
            proposta_frete_revisao
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [numped, body.produto, body.qtdven, body.loja, body.descri, body.obs, revisao]);
    conn.end();
};

const freteItens = async(numped, revisao)=>{
    const conn = await connect();
    const [rows] = await conn.query(`select * from proposta_frete_itens WHERE proposta_frete_id = ${numped} and proposta_frete_revisao = ${revisao}`);
    conn.end();
    return rows;
};

const revisaoCotacao = async(numped)=>{
    const conn = await connect();
    const [rows] = await conn.query(`select revisao from proposta_frete WHERE pedido = ${numped} order by id desc limit 1`);
    conn.end();
    return rows;
};

const insertLogSistema = async(nome, data, descricao, data_hora)=>{
    const conn = await connect();
    await conn.query(
        `INSERT INTO log_sistema (
            nome,
            data,
            descricao,
            data_hora
        )
        VALUES (?, ?, ?, ?)`,
        [nome, data, descricao, data_hora]);
    conn.end();
};

const getTrack = async (num, filial, vend, cliente, dt_entrega) => {
    const pool = await connectProtheus();
    const request = pool.request();

    const query = `
        SELECT TOP 100
            RET.C5_NOTA AS NOTA_RET, 
            VEND.A3_NREDUZ, 
            TAB.C5_XPEDTR, 
            TAB.C5_NOTA, 
            TAB.C5_FILIAL,
            TAB.C5_CLIENTE,
            TAB.C5_NUM,
            TAB.C5_XSEPCD,
            TAB.C5_XLIBCOM,
            TAB.C5_XLIBFAT,
            TAB.C5_XFATURD,
            TAB.C5_XLIBEXP,
            TAB.C5_XEXPEDI,
            TAB.C5_XNSEPCD,
            TAB.C5_XHSEPCD,
            TAB.C5_XHLIBCO,
            TAB.C5_XNLIBCO,
            TAB.C5_XHLIBFA,
            TAB.C5_XNLIBFA,
            TAB.C5_XHFATUR,
            TAB.C5_XNFATUR,
            TAB.C5_FECENT,
            TAB.C5_XNOTIMP,
            TAB.C5_XHNOTIM,
            TAB.C5_XNNOTIM,
            TAB.C5_XRETFIS,
            TAB.C5_XHRETFI,
            TAB.C5_XNRETFI,
            TAB.C5_XHLIBEX,
            TAB.C5_XNLIBEX,
            TAB.C5_XHEXPED,
            TAB.C5_XNEXPED,
            TAB.C5_VEND1,
            TAB.C5_LOJACLI,
            CLIENTE.A1_NOME AS CLI_NOME,
            TAB.C5_XOBSV,
            TAB.C5_XRECLAM,
            TAB.R_E_C_N_O_ AS TABREC,
            TAB.R_E_C_D_E_L_ AS RECDEL,
            TAB.S_T_A_M_P_ AS STAMP
        FROM SC5010 TAB WITH (NOLOCK)
        INNER JOIN SA1010 CLIENTE ON TAB.C5_CLIENTE = CLIENTE.A1_COD AND TAB.C5_LOJACLI = CLIENTE.A1_LOJA
        LEFT JOIN SA3010 VEND ON TAB.C5_VEND1 = VEND.A3_COD
        LEFT JOIN SC5010 RET ON RET.C5_NUM = TAB.C5_XPEDTR AND RET.C5_FILIAL = '0101002'
        WHERE
            TAB.R_E_C_D_E_L_ = 0
            AND TAB.C5_FILIAL LIKE '%${filial}%'
            AND TAB.C5_NUM LIKE '%${num}%'
            AND VEND.A3_NREDUZ LIKE '%${vend}%'
            AND CLIENTE.A1_NOME LIKE '%${cliente.toUpperCase()}%'
            AND TAB.C5_FECENT LIKE '%${dt_entrega}%'
        ORDER BY TABREC DESC;
    `;

    const result = await request.query(query);
    console.log(result)
    return result.recordset;
};


const getTrackFiltro = async (num, filial, vend, cliente, dt_entrega, lpcampo, lpvalor, lscampo, lsvalor) => {
    const pool = await connectProtheus();
    const request = pool.request();

    const query = `
        SELECT TOP 100 
            RET.C5_NOTA AS NOTA_RET,  
            VEND.A3_NREDUZ, 
            TAB.C5_XPEDTR, 
            TAB.C5_FILIAL,
            TAB.C5_CLIENTE, 
            TAB.C5_NUM, 
            TAB.C5_XSEPCD, 
            TAB.C5_XLIBCOM, 
            TAB.C5_XLIBFAT, 
            TAB.C5_XFATURD, 
            TAB.C5_XLIBEXP, 
            TAB.C5_XEXPEDI,
            TAB.C5_XNSEPCD, 
            TAB.C5_XHSEPCD, 
            TAB.C5_XHLIBCO, 
            TAB.C5_XNLIBCO, 
            TAB.C5_XHLIBFA, 
            TAB.C5_XNLIBFA, 
            TAB.C5_XHFATUR, 
            TAB.C5_XNFATUR, 
            TAB.C5_FECENT, 
            TAB.C5_XNOTIMP, 
            TAB.C5_XHNOTIM, 
            TAB.C5_XNNOTIM,
            TAB.C5_XRETFIS, 
            TAB.C5_XHRETFI, 
            TAB.C5_XNRETFI, 
            TAB.C5_XHLIBEX, 
            TAB.C5_XNLIBEX, 
            TAB.C5_XHEXPED, 
            TAB.C5_XNEXPED, 
            TAB.C5_VEND1, 
            TAB.C5_LOJACLI, 
            CLIENTE.A1_NOME AS CLI_NOME, 
            TAB.C5_XOBSV, 
            TAB.C5_XRECLAM,
            TAB.R_E_C_N_O_ AS TABREC, 
            TAB.R_E_C_D_E_L_ AS RECDEL, 
            TAB.S_T_A_M_P_ AS STAMP
        FROM 
            SC5010 TAB WITH (NOLOCK)
        INNER JOIN 
            SA1010 CLIENTE ON TAB.C5_CLIENTE = CLIENTE.A1_COD AND TAB.C5_LOJACLI = CLIENTE.A1_LOJA
        LEFT JOIN 
            SA3010 VEND ON TAB.C5_VEND1 = VEND.A3_COD
        LEFT JOIN 
            SC5010 RET ON RET.C5_NUM = TAB.C5_XPEDTR AND RET.C5_FILIAL = '0101002'
        WHERE 
            TAB.R_E_C_D_E_L_ = 0
            AND TAB.C5_FILIAL LIKE '%${filial}%'
            AND TAB.C5_NUM LIKE '%${num}%'
            AND VEND.A3_NREDUZ LIKE '%${vend.toUpperCase()}%'
            AND CLIENTE.A1_NOME LIKE '%${cliente.toUpperCase()}%'
            AND TAB.C5_FECENT LIKE '%${dt_entrega}%'
            AND TAB.${lpcampo} = '${lpvalor}' 
            AND TAB.${lscampo} = '${lsvalor}'
        ORDER BY 
            TABREC DESC;
    `;

    const result = await request.query(query);
    return result.recordset;
};


module.exports = {
    all,
    search,
    proposta,
    freteUpdate,
    novaProposta,
    novosItens,
    freteItens,
    revisaoCotacao,
    allSemRevisao,
    searchSemRevisao,
    arquivaFrete,
    preparaArquivaFrete,
    allArquivadas,
    searchArquivadas,
    insertLogSistema,
    vendedor,
    buscaValorOriginal,
    allConsulta,
    allManutInd,
    allStatusChamados,
    allUrgenciasChamados,
    allAreasChamados,
    allOperacoesChamados,
    allUsers,
    allEmpresas,
    allTipoManuts,
    allSubTipoManuts,
    allCentroCusto,
    statusAniversario,
    getTrack,
    getTrackFiltro
};