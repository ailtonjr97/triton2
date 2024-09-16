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
    const [rows] = await conn.query(`SELECT pf.*, u.name as 'vendedor', u2.name as 'cotador' FROM proposta_frete as pf left join users as u on pf.cotador_id = u.intranet_id left join users as u2 on pf.cotador_id_2 = u2.intranet_id  where revisao = (select Max(revisao) from proposta_frete as pf2 where pf2.pedido=pf.pedido) and status = 1 order by id desc limit 300`);
    conn.end();
    return rows;
};

const allConsulta = async(setor, designado)=>{
    const conn = await connect();
    const [rows] = await conn.query(`SELECT pf.*, u.name as 'vendedor', u2.name as 'cotador' FROM proposta_frete as pf left join users as u on pf.cotador_id = u.intranet_id left join users as u2 on pf.cotador_id_2 = u2.intranet_id`);
    conn.end();
    return rows;
};

const allArquivadas = async()=>{
    const conn = await connect();
    const [rows] = await conn.query(`SELECT pf.*, u.name as 'vendedor', u2.name as 'cotador' FROM proposta_frete as pf left join users as u on pf.cotador_id = u.intranet_id left join users as u2 on pf.cotador_id_2 = u2.intranet_id  where revisao = (select Max(revisao) from proposta_frete as pf2 where pf2.pedido=pf.pedido) and status = 0 order by id`);
    conn.end();
    return rows;
};

const allSemRevisao = async(setor, designado)=>{
    const conn = await connect();
    const [rows] = await conn.query(`SELECT pf.*, u.name as 'vendedor', u2.name as 'cotador' FROM proposta_frete as pf left join users as u on pf.cotador_id = u.intranet_id left join users as u2 on pf.cotador_id_2 = u2.intranet_id where status = 1`);
    conn.end();
    return rows;
};

const search = async(codigo, resultados, vendedor, identificador, filial)=>{
    const conn = await connect();
    const [rows] = await conn.query(`SELECT pf.*, u.name as 'vendedor', u2.name as 'cotador' FROM proposta_frete as pf left join users as u on pf.cotador_id = u.intranet_id left join users as u2 on pf.cotador_id_2 = u2.intranet_id  where revisao = (select Max(revisao) from proposta_frete as pf2 where pf2.pedido=pf.pedido) and pedido LIKE '%${codigo}%' and u.name LIKE '%${vendedor}%' and pf.id like '%${identificador}%' and status = 1 and pf.filial like '%${filial}%' order by id desc LIMIT ${resultados}`);
    conn.end();
    return rows;
};

const searchArquivadas = async(codigo, resultados, vendedor, identificador)=>{
    const conn = await connect();
    const [rows] = await conn.query(`SELECT pf.*, u.name as 'vendedor', u2.name as 'cotador' FROM proposta_frete as pf left join users as u on pf.cotador_id = u.intranet_id left join users as u2 on pf.cotador_id_2 = u2.intranet_id  where revisao = (select Max(revisao) from proposta_frete as pf2 where pf2.pedido=pf.pedido) and pedido LIKE '%${codigo}%' and u.name LIKE '%${vendedor}%' and pf.id like '%${identificador}%' and status = 0 order by id LIMIT ${resultados}`);
    conn.end();
    return rows;
};

const searchSemRevisao = async(codigo, resultados, vendedor)=>{
    const conn = await connect();
    const [rows] = await conn.query(`SELECT pf.*, u.name as 'vendedor', u2.name as 'cotador' FROM proposta_frete as pf left join users as u on pf.cotador_id = u.intranet_id left join users as u2 on pf.cotador_id_2 = u2.intranet_id WHERE pedido LIKE '%${codigo}%' and and u.name LIKE '%${vendedor}%' and status = 1 LIMIT ${resultados}`);
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
        CJ_FRTORI = ?
        WHERE id = ?
    `, [today, valorMaisImposto, body[0].transp_nome_select, body[0].prazo, body[0].transp_nome2_select, body[0].cotador_id_2, body[0].codcot, freteOriginal, id]);
    conn.end();
};

const novaProposta = async(numped, cotador, today, revisao, cliente, valor_pedido, filial, loja)=>{
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
            loja_cliente
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [numped, cotador, today, null, revisao, 0, 1, null, null, cliente, valor_pedido, filial, 0, loja]);
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
    allCentroCusto
};