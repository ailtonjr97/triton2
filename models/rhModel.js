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

const novoAnexo = async(file, id, body)=>{
    const conn = await connect();
    if(body.titulo == undefined || body.titulo == null){
        body.titulo = ''
    }
    if(body.descritivo == undefined || body.descritivo == null){
        body.descritivo = ''
    }
    await conn.query(
        `INSERT INTO docspro.anexos (
            fieldname,
            original_name,
            encoding,
            mimetype,
            destination,
            filename,
            path,
            size,
            entidade_id,
            rh_docs_titulo,
            rh_docs_descritivo
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [file.fieldname, file.originalname, file.encoding, file.mimetype, file.destination, file.filename, file.path, file.size, id, body.titulo, body.descritivo]);
    conn.end();
}

const entidade = async(id)=>{
    const conn = await connect();
    const [rows] = await conn.query(`select * from entidades where id = ${id}`);
    conn.end();
    return rows;
}

const listaAnexos = async(id)=>{
    const conn = await connect();
    const [rows] = await conn.query(`select id, original_name, filename, rh_docs_titulo, rh_docs_descritivo from docspro.anexos where entidade_id = ${id}`);
    conn.end();
    return rows;
}

const all = async()=>{
    const conn = await connect();
    const [rows] = await conn.query(`
        select id, nome from entidades where active = 1 order by nome asc
    `);
    conn.end();
    return rows;
}

const inactive = async()=>{
    const conn = await connect();
    const [rows] = await conn.query(`
        select id, nome from entidades where active = 0 order by id desc
    `);
    conn.end();
    return rows;
}

const create = async(body)=>{
    const conn = await connect();
    await conn.query(
        `INSERT INTO docspro.entidades (
            natureza, 
            regime, 
            nome, 
            endereco, 
            endereco_numero, 
            bairro, 
            cidade, 
            pais,
            active,
            email
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
    [body.natureza, body.regime, body.nome, body.endereco, body.endereco_numero, body.bairro, body.cidade, body.pais, body.email]);
    conn.end();
}

const edit = async(body, id)=>{
    const conn = await connect();
    await conn.query(`
        UPDATE docspro.entidades SET
        natureza = ?,
        regime = ?,
        nome = ?,
        endereco = ?,
        endereco_numero = ?,
        bairro = ?,
        cidade = ?,
        pais = ?,
        email = ?
        WHERE id = ?
    `, [body.natureza, body.regime, body.nome, body.endereco, body.endereco_numero, body.bairro, body.cidade, body.pais, body.email, id]);
    conn.end();
}

const inactivate = async(id)=>{
    const conn = await connect();
    await conn.query(`
        UPDATE docspro.entidades SET
        active = 0
        WHERE id = ?
    `, [id]);
    conn.end();
}

const activate = async(id)=>{
    const conn = await connect();
    await conn.query(`
        UPDATE docspro.entidades SET
        active = 1
        WHERE id = ?
    `, [id]);
    conn.end();
}

module.exports = {
    all,
    create,
    novoAnexo,
    listaAnexos,
    entidade,
    edit,
    inactivate,
    inactive,
    activate
};