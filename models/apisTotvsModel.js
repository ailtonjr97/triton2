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

const all = async()=>{
    const conn = await connect();
    const [rows] = await conn.query('SELECT * FROM docspro.apis_totvs');
    conn.end();
    return rows;
}

const create = async(body)=>{
    const conn = await connect();
    await conn.query(`INSERT INTO docspro.apis_totvs(metodo, descricao, caminho) VALUES (?, ?, ?)`, [body.metodo, body.descricao, body.caminho]);
    conn.end();
}

const get = async(tableName)=>{
    const conn = await connect();
    const [rows] = await conn.query(`SELECT * FROM docspro.${tableName}`);
    conn.end();
    return rows;
}

const getOne = async(tableName, id)=>{
    const conn = await connect();
    const [rows] = await conn.query(`SELECT * FROM docspro.${tableName} WHERE id = ${id}`);
    conn.end();
    return rows;
}

const updateAcy = async(values)=>{
    const conn = await connect();
    await conn.query("TRUNCATE docspro.acy");
    await conn.query("INSERT INTO docspro.acy (grpven, descri) VALUES ?", [values], function(err) {
        if (err) throw err;
    });
    conn.end();
}

const updateD12 = async(values)=>{
    const conn = await connect();
    await conn.query("TRUNCATE docspro.d12");
    await conn.query(`INSERT INTO docspro.d12 (
        filial, 
        produt,
        lotect,
        doc,
        serie,
        clifor,
        loja,
        status,
        servic,
        qtdori,
        qtdlid,
        endori,
        locdes,
        enddes,
        rechum
    ) VALUES ?`, [values]);
    conn.end();
}

const updateD14 = async(values)=>{
    const conn = await connect();
    await conn.query("TRUNCATE docspro.d14");
    await conn.query(`INSERT INTO docspro.d14 (
        filial, 
        local,
        ender,
        produt,
        lotect,
        dtvald,
        dtfabr,
        estfis,
        qtdest,
        qtdepr,
        qtdspr,
        qtdblq,
        idunit
    ) VALUES ?`, [values]);
    conn.end();
}

const updateDcf = async(values)=>{
    const conn = await connect();
    await conn.query("TRUNCATE docspro.dcf");
    await conn.query(`INSERT INTO docspro.dcf (
        filial, 
        lotect,
        servic,
        docto,
        serie,
        codpro,
        clifor,
        loja,
        quant,
        qtdori,
        local,
        ender,
        locdes,
        enddes,
        stserver
    ) VALUES ?`, [values]);
    conn.end();
}

const updateSe4 = async(values)=>{
    const conn = await connect();
    await conn.query("TRUNCATE docspro.se4");
    await conn.query(`INSERT INTO docspro.se4 (
        filial, 
        codigo,
        tipo,
        cond,
        descri
    ) VALUES ?`, [values]);
    conn.end();
}

const updateSb1 = async(values)=>{
    const conn = await connect();
    await conn.query("TRUNCATE docspro.sb1");
    await conn.query(`INSERT INTO docspro.sb1 (
        cod, 
        tipo,
        um,
        grupo,
        peso,
        urev,
        descri,
        pesbru
    ) VALUES ?`, [values]);
    conn.end();
}

const updateSa1 = async(values)=>{
    const conn = await connect();
    await conn.query("TRUNCATE docspro.sa1");
    await conn.query(`INSERT INTO docspro.sa1 (
        cod, 
        nome,
        cod_mun,
        mun,
        nreduz,
        grpven,
        loja,
        end,
        codpais,
        est,
        cep,
        tipo,
        cgc,
        filial,
        xcartei
    ) VALUES ?`, [values]);
    conn.end();
}

const updateSc5 = async(values)=>{
    const conn = await connect();
    await conn.query("TRUNCATE docspro.sc5");
    await conn.query(`INSERT INTO docspro.sc5(
        nota, 
        tpfrete,
        condpag,
        tipocli,
        blq,
        liberok,
        lojacli,
        vend1,
        cliente,
        tipo,
        num,
        emissao,
        xflagtr,
        filial,
        xpedtr
    ) VALUES ?`, [values]);
    conn.end();
}

const updateSc6 = async(values)=>{
    const conn = await connect();
    await conn.query("TRUNCATE docspro.sc6");
    await conn.query(`INSERT INTO docspro.sc6(
        loja,
        num,
        item,
        produto,
        qtdven,
        qtdent,
        prcven,
        descont,
        valor,
        oper,
        tes,
        cf,
        cli,
        entreg,
        datfat,
        nota,
        blq,
        filial
    ) VALUES ?`, [values]);
    conn.end();
}

const updateSc9 = async(values)=>{
    const conn = await connect();
    await conn.query("TRUNCATE docspro.sc9");
    await conn.query(`INSERT INTO docspro.sc9(
        filial,
        pedido,
        item,
        cliente,
        loja,
        produto,
        qtdlib,
        nfiscal,
        datalib,
        bloquei,
        blest,
        datent
    ) VALUES ?`, [values]);
    conn.end();
}

const updateSf2 = async(values)=>{
    const conn = await connect();
    await conn.query("TRUNCATE docspro.sf2");
    await conn.query(`INSERT INTO docspro.sf2(
        emissao,
        filial,
        chvnfe,
        doc,
        serie,
        cliente,
        loja,
        tipocli,
        vend1,
        fimp
    ) VALUES ?`, [values]);
    conn.end();
}

//API exclusiva para o Volmar consultar a SX5 com parametro
const getSx5 = async(tabela, chave)=>{
    if(tabela == undefined){
        tabela = '';
        const conn = await connect();
        const [rows] = await conn.query(`select * from sx5 s where tabela like '%${tabela}%' and chave like '%${chave}%'`);
        conn.end();
        return rows;
    }else if(chave == undefined){
        chave = '';
        const conn = await connect();
        const [rows] = await conn.query(`select * from sx5 s where tabela like '%${tabela}%' and chave like '%${chave}%'`);
        conn.end();
        return rows;
    }else if(tabela == undefined && chave == undefined){
        const conn = await connect();
        const [rows] = await conn.query(`select * from sx5 s where tabela like '%${tabela}%' and chave like '%${chave}%'`);
        conn.end();
        return rows;
    }else{
        const conn = await connect();
        const [rows] = await conn.query(`select * from sx5 s where tabela like '%${tabela}%' and chave like '%${chave}%'`);
        conn.end();
        return rows;
    }
}

const updateSx5 = async(values)=>{
    const conn = await connect();
    await conn.query("TRUNCATE docspro.sx5");
    await conn.query(`INSERT INTO docspro.sx5(
        filial,
        tabela,
        chave,
        descri,
        descspa,
        desceng
    ) VALUES ?`, [values]);
    conn.end();
}


module.exports = {
    all,
    create,
    get,
    updateAcy,
    updateD12,
    updateD14,
    updateDcf,
    updateSe4,
    updateSb1,
    updateSa1,
    updateSc5,
    updateSc6,
    updateSc9,
    updateSf2,
    updateSx5,
    getSx5,
    getOne
};