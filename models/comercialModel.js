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

const all = async(setor, designado)=>{
    const conn = await connect();
    const [rows] = await conn.query(`SELECT pf.*, u.name as 'vendedor', u2.name as 'cotador' FROM PRODUCAO.proposta_frete as pf left join users as u on pf.cotador_id = u.intranet_id left join users as u2 on pf.cotador_id_2 = u2.intranet_id  where revisao = (select Max(revisao) from proposta_frete as pf2 where pf2.pedido=pf.pedido) order by id desc`);
    conn.end();
    return rows;
};

const allSemRevisao = async(setor, designado)=>{
    const conn = await connect();
    const [rows] = await conn.query(`SELECT pf.*, u.name as 'vendedor', u2.name as 'cotador' FROM PRODUCAO.proposta_frete as pf left join users as u on pf.cotador_id = u.intranet_id left join users as u2 on pf.cotador_id_2 = u2.intranet_id`);
    conn.end();
    return rows;
};

const search = async(codigo, resultados)=>{
    const conn = await connect();
    const [rows] = await conn.query(`SELECT pf.*, u.name as 'vendedor', u2.name as 'cotador' FROM PRODUCAO.proposta_frete as pf left join users as u on pf.cotador_id = u.intranet_id left join users as u2 on pf.cotador_id_2 = u2.intranet_id  where revisao = (select Max(revisao) from proposta_frete as pf2 where pf2.pedido=pf.pedido) and pedido LIKE '%${codigo}%' order by id desc LIMIT ${resultados}`);
    conn.end();
    return rows;
};

const searchSemRevisao = async(codigo, resultados)=>{
    const conn = await connect();
    const [rows] = await conn.query(`SELECT pf.*, u.name as 'vendedor', u2.name as 'cotador' FROM PRODUCAO.proposta_frete as pf left join users as u on pf.cotador_id = u.intranet_id left join users as u2 on pf.cotador_id_2 = u2.intranet_id WHERE pedido LIKE '%${codigo}%' LIMIT ${resultados}`);
    conn.end();
    return rows;
};

const proposta = async(id)=>{
    const conn = await connect();
    const [rows] = await conn.query(`select * from proposta_frete WHERE id = ${id}`);
    conn.end();
    return rows;
};

const freteUpdate = async(body, id, today, valorMaisImposto)=>{
    const conn = await connect();
    await conn.query(`
        UPDATE PRODUCAO.proposta_frete SET
        data_resp = ?,
        valor = ?,
        id_transportadora = ?,
        prazo = ?,
        nome_transportadora = ?,
        cotador_id_2 = ?,
        cod_cot = ?
        WHERE id = ?
    `, [today, valorMaisImposto, body[0].transp_nome_select, body[0].prazo, body[0].transp_nome2_select, body[0].cotador_id_2, body[0].codcot, id]);
    conn.end();
};

const novaProposta = async(numped, cotador, today, revisao, cliente, valor_pedido, filial)=>{
    const conn = await connect();
    await conn.query(
        `INSERT INTO PRODUCAO.proposta_frete (
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
            filial
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [numped, cotador, today, null, revisao, 0, 1, null, null, cliente, valor_pedido, filial]);
    conn.end();
};

const novosItens = async(numped, body)=>{
    const conn = await connect();
    await conn.query(
        `INSERT INTO PRODUCAO.proposta_frete_itens (
            proposta_frete_id,
            produto,
            qtdven,
            loja,
            descri,
            obs
        )
        VALUES (?, ?, ?, ?, ?, ?)`,
        [numped, body.produto, body.qtdven, body.loja, body.descri, body.obs]);
    conn.end();
};

const freteItens = async(numped)=>{
    const conn = await connect();
    const [rows] = await conn.query(`select * from proposta_frete_itens WHERE proposta_frete_id = ${numped}`);
    conn.end();
    return rows;
};

const revisaoCotacao = async(numped)=>{
    const conn = await connect();
    const [rows] = await conn.query(`select revisao from proposta_frete WHERE pedido = ${numped} order by id desc limit 1`);
    conn.end();
    return rows;
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
    searchSemRevisao
};