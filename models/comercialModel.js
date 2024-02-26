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
    const [rows] = await conn.query(`SELECT pf.*, u.name as 'vendedor', u2.name as 'cotador' FROM docspro.proposta_frete as pf left join users as u on pf.cotador_id = u.id left join users as u2 on pf.cotador_id_2 = u2.id  where revisao = (select Max(revisao) from proposta_frete as pf2 where pf2.pedido=pf.pedido) order by id desc`);
    conn.end();
    return rows;
};

const allSemRevisao = async(setor, designado)=>{
    const conn = await connect();
    const [rows] = await conn.query(`SELECT pf.*, u.name as 'vendedor', u2.name as 'cotador' FROM docspro.proposta_frete as pf left join users as u on pf.cotador_id = u.id left join users as u2 on pf.cotador_id_2 = u2.id`);
    conn.end();
    return rows;
};

const search = async(codigo, resultados)=>{
    const conn = await connect();
    const [rows] = await conn.query(`SELECT pf.*, u.name as 'vendedor', u2.name as 'cotador' FROM docspro.proposta_frete as pf left join users as u on pf.cotador_id = u.id left join users as u2 on pf.cotador_id_2 = u2.id  where revisao = (select Max(revisao) from proposta_frete as pf2 where pf2.pedido=pf.pedido) and pedido LIKE '%${codigo}%' order by id desc LIMIT ${resultados}`);
    conn.end();
    return rows;
};

const searchSemRevisao = async(codigo, resultados)=>{
    const conn = await connect();
    const [rows] = await conn.query(`SELECT pf.*, u.name as 'vendedor', u2.name as 'cotador' FROM docspro.proposta_frete as pf left join users as u on pf.cotador_id = u.id left join users as u2 on pf.cotador_id_2 = u2.id WHERE pedido LIKE '%${codigo}%' LIMIT ${resultados}`);
    conn.end();
    return rows;
};

const proposta = async(id)=>{
    const conn = await connect();
    const [rows] = await conn.query(`select * from proposta_frete WHERE id = ${id}`);
    conn.end();
    return rows;
};

const freteUpdate = async(body, id, today)=>{
    const conn = await connect();
    await conn.query(`
        UPDATE docspro.proposta_frete SET
        data_resp = ?,
        valor = ?,
        id_transportadora = ?,
        prazo = ?,
        nome_transportadora = ?,
        cotador_id_2 = ?
        WHERE id = ?
    `, [today, body.valor, body.transp_nome_select, body.prazo, body.transp_nome2_select, body.cotador_id_2, id]);
    conn.end();
};

const novaProposta = async(numped, cotador, today, revisao, cliente, valor_pedido)=>{
    const conn = await connect();
    await conn.query(
        `INSERT INTO docspro.proposta_frete (
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
            valor_pedido
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [numped, cotador, today, null, revisao, 0, 1, null, null, cliente, valor_pedido]);
    conn.end();
};

const novosItens = async(numped, body)=>{
    const conn = await connect();
    await conn.query(
        `INSERT INTO docspro.proposta_frete_itens (
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