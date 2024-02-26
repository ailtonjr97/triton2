const dotenv = require("dotenv");
dotenv.config();

async function connect(){
    const mysql = require("mysql2/promise");
    const pool = mysql.createPool({
        host: process.env.INTRANET_DB_HOMOLOG_IP,
        port: '3306',
        user: 'grafana',
        password: process.env.INTRANET_DB_HOMOLOG_PASSWORD,
        database: process.env.INTRANET_DB_HOMOLOG_DATABASE,
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
    const [rows] = await conn.query(`
    select chamados.id, users.name, 
    u_designado.name as designado, 
    chamados.descricao,
    areas_atuacaos.descricao as 'area',
    operacoes.descricao as 'operacoes',
    chamados.urgencia_id as 'urgencia',
    count(chat_chamados.lido) as "contagem",
    empresas.descricao as 'descri_filial'
    from chamados
    inner join users on chamados.usuario_id = users.id
    inner join users as u_designado on chamados.designado_id = u_designado.id
    inner join areas_atuacaos on chamados.area_id = areas_atuacaos.id
    inner join operacoes on chamados.operacao_id = operacoes.id
    left join chat_chamados on chamados.id = chat_chamados.chamado_id and chat_chamados.lido = 0
    left join empresas on empresas.id = users.empresa_id
    where chamados.status not in (6, 3) and
    chamados.chamado_setor_id = ${setor} and
    chamados.designado_id in(${designado}, 0) and
    chamados.ativo = 's' and
    chamados.operacao_id not in (13, 15) and 
    terceiro_id IS NULL
    group by chamados.id, chamados.descricao 
    order by chamados.id desc
    `);
    conn.end();
    return rows;
}

const one = async(id)=>{
    const conn = await connect();
    const [rows] = await conn.query(`
        select chamado_setors.descricao as 'setor',
        areas_atuacaos.descricao as 'area', chamados.area_id as 'areaId',
        operacoes.descricao as 'operacoes', chamados.operacao_id as 'tipoId',
        status_chamados.descricao as 'status',
        urgencias.descricao as 'urgencias', chamados.urgencia_id as 'urgenciaId',
        u_designado.name as 'designadoName', chamados.designado_id as 'designadoId',
        u_requisitante.name as 'requisitante', chamados.usuario_id as 'requisitanteId',
        chamados.nivel, chamados.impacto,
        chamados.data_agenda, chamados.hora_agenda,
        chamados.chamado_setor_id as 'setorId',
        chamados.anydesk
        from chamados
        inner join users on chamados.usuario_id = users.id
        inner join users as u_designado on chamados.designado_id = u_designado.id
        inner join users as u_requisitante on chamados.usuario_id = u_requisitante.id
        inner join chamado_setors on chamados.chamado_setor_id = chamado_setors.id
        inner join areas_atuacaos on chamados.area_id = areas_atuacaos.id
        inner join operacoes on chamados.operacao_id = operacoes.id
        inner join status_chamados on chamados.status = status_chamados.id
        inner join urgencias on chamados.urgencia_id = urgencias.id
        where chamados.id = ${id}
    `);
    conn.end();
    return rows;
}

const requisitante = async()=>{
    const conn = await connect();
    const [rows] = await conn.query(`
        select id, name, setor_chamados from users where active = 1
    `);
    conn.end();
    return rows;
}

const designado = async(id)=>{
    const conn = await connect();
    const [rows] = await conn.query(`
        select id, name from users where department_id = ${id} and active = 1
    `);
    conn.end();
    return rows;
}

const setores = async(id)=>{
    const conn = await connect();
    const [rows] = await conn.query(`
        select id, descricao from chamado_setors where ativo = 1
    `);
    conn.end();
    return rows;
}

const areas = async(id)=>{
    const conn = await connect();
    const [rows] = await conn.query(`
        select id, descricao from areas_atuacaos where chamado_setor_id = ${id}
    `);
    conn.end();
    return rows;
}

const tipos = async(id)=>{
    const conn = await connect();
    const [rows] = await conn.query(`
        select id, descricao from operacoes where area_id = ${id}
    `);
    conn.end();
    return rows;
}

const urgencias = async()=>{
    const conn = await connect();
    const [rows] = await conn.query(`
        select id, descricao from urgencias
    `);
    conn.end();
    return rows;
}

const chat = async(chamado_id)=>{
    const conn = await connect();
    const [rows] = await conn.query(`
        select chat_chamados.chamado_id, chat_chamados.descricao, chat_chamados.usuario_id, users.name as "userDestino", chat_chamados.lido from chat_chamados
        inner join users on chat_chamados.usuario_id = users.id
        where chamado_id = ${chamado_id}
    `);
    conn.end();
    return rows;
}

const update = async(body, id)=>{
    const conn = await connect();
    if(typeof body.designado_id == "object"){
        await conn.query(`
            UPDATE chamados SET usuario_id = ?, 
            designado_id = 0, 
            chamado_setor_id = ?, 
            area_id = ?, 
            operacao_id = ?,
            data_agenda = ?,
            hora_agenda = ?,
            nivel = ?,
            impacto = ?,
            urgencia_id = ?
            WHERE id = ?`,
        [body.usuario_id, body.chamado_setor_id, body.area_id, body.operacao_id, body.data_agenda, body.hora_agenda, body.nivel, body.impacto, body.urgencia_id, id]);
        conn.end();
    }else{
        await conn.query(`
            UPDATE chamados SET usuario_id = ?, 
            designado_id = ?, 
            chamado_setor_id = ?, 
            area_id = ?, 
            operacao_id = ?,
            data_agenda = ?,
            hora_agenda = ?,
            nivel = ?,
            impacto = ?,
            urgencia_id = ?
            WHERE id = ?`,
        [body.usuario_id, body.designado_id, body.chamado_setor_id, body.area_id, body.operacao_id, body.data_agenda, body.hora_agenda, body.nivel, body.impacto, body.urgencia_id, id]);
        conn.end();
    }
}

const fechar = async(body, id)=>{
    const conn = await connect();
    if(typeof body.designado_id == "object"){
        await conn.query(`
            UPDATE chamados SET usuario_id = ?, 
            designado_id = 0, 
            chamado_setor_id = ?, 
            area_id = ?, 
            operacao_id = ?,
            data_agenda = ?,
            hora_agenda = ?,
            nivel = ?,
            impacto = ?,
            urgencia_id = ?,
            definicao = ?,
            status = 3
            WHERE id = ?`,
        [body.usuario_id, body.chamado_setor_id, body.area_id, body.operacao_id, body.data_agenda, body.hora_agenda, body.nivel, body.impacto, body.urgencia_id, body.definicao, id]);
        conn.end();
    }else{
        await conn.query(`
            UPDATE chamados SET usuario_id = ?, 
            designado_id = ?, 
            chamado_setor_id = ?, 
            area_id = ?, 
            operacao_id = ?,
            data_agenda = ?,
            hora_agenda = ?,
            nivel = ?,
            impacto = ?,
            urgencia_id = ?,
            definicao = ?,
            status = 3
            WHERE id = ?`,
        [body.usuario_id, body.designado_id, body.chamado_setor_id, body.area_id, body.operacao_id, body.data_agenda, body.hora_agenda, body.nivel, body.impacto, body.urgencia_id, body.definicao, id]);
        conn.end();
    }
}

module.exports = {
    all,
    one,
    requisitante,
    update,
    designado,
    setores,
    areas,
    tipos,
    urgencias,
    fechar,
    chat,
};