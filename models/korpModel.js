const sql = require('mssql');
const dotenv = require("dotenv");
dotenv.config();

const sqlConfig = {
    user: process.env.MSUSER,
    password: process.env.MSPASSWORD,
    database: process.env.MSDATABASE,
    server: process.env.MSSERVER,
    pool: {
      max: 40,
      min: 0,
      idleTimeoutMillis: 30000
    },
    options: {
      encrypt: false, // for azure
      trustServerCertificate: true // change to true for local dev / self-signed certs
    }
};

const all = async()=>{
    await sql.connect(sqlConfig);
    const estoqueQuery = `SELECT TOP (1000) ID, CODIGO, DESCRI FROM ESTOQUE`;
    const estoque = await sql.query(estoqueQuery);
    return estoque.recordset;
};

const search = async(codigo, resultados, nome)=>{
    await sql.connect(sqlConfig);
    const estoqueQuery = `SELECT TOP (${resultados}) CODIGO, DESCRI FROM ESTOQUE WHERE CODIGO LIKE '%${codigo}%' AND DESCRI LIKE '%${nome}%' ORDER BY CODIGO`;
    const estoque = await sql.query(estoqueQuery);
    return estoque.recordset;
};

const product = async(codigo)=>{
  await sql.connect(sqlConfig);
  const productQuery = `SELECT * FROM ESTOQUE WHERE CODIGO = '${codigo}'`;
  const product = await sql.query(productQuery);
  return product.recordset;
};

const allPedidosDeCompra = async()=>{
  await sql.connect(sqlConfig);
  const estoqueQuery = `SELECT TOP (1000) NUMERO_PEDIDO, RASSOC, REQUISITANTE FROM PEDIDO_FOR ORDER BY NUMERO_PEDIDO DESC`;
  const estoque = await sql.query(estoqueQuery);
  return estoque.recordset;
};

const searchPedidosDeCompra = async(codigo, resultados, rassoc)=>{
  await sql.connect(sqlConfig);
  const estoqueQuery = `SELECT TOP (${resultados}) NUMERO_PEDIDO, RASSOC, REQUISITANTE FROM PEDIDO_FOR WHERE NUMERO_PEDIDO LIKE '%${codigo}%' AND RASSOC LIKE '%${rassoc}%' ORDER BY NUMERO_PEDIDO DESC`;
  const estoque = await sql.query(estoqueQuery);
  return estoque.recordset;
};

const pedidoDeCompra = async(codigo)=>{
  await sql.connect(sqlConfig);
  const productQuery = `SELECT * FROM PEDIDO_FOR WHERE NUMERO_PEDIDO = '${codigo}'`;
  const product = await sql.query(productQuery);
  return product.recordset;
};

const uncryptObs = async(codigo)=>{
  await sql.connect(sqlConfig);
  const productQuery = `SELECT CAST(CAST (OBS1 AS varbinary(MAX)) AS VARCHAR(MAX)) as obs FROM PEDIDO_FOR WHERE NUMERO_PEDIDO = ${codigo}`;
  const product = await sql.query(productQuery);
  return product.recordset;
};

const categoria = async(categoria)=>{
  await sql.connect(sqlConfig);
  const selectQuery = `select DESC_CAT from CST_CADASTRO_PRODUTO_CAB WHERE CATEGORIA = '${categoria}'`;
  const select = await sql.query(selectQuery);
  return select.recordset;
};

const familia = async(familia)=>{
  await sql.connect(sqlConfig);
  const selectQuery = `select DESGRUPO from GRUPOE WHERE GRUPO = '${familia}'`;
  const select = await sql.query(selectQuery);
  return select.recordset;
};

const grupo = async(grupo)=>{
  await sql.connect(sqlConfig);
  const selectQuery = `select DESCRICAO from GRUPO_EST WHERE CODIGO = '${grupo}'`;
  const select = await sql.query(selectQuery);
  return select.recordset;
};

const subgrupo = async(subgrupo)=>{
  await sql.connect(sqlConfig);
  const selectQuery = `select DESCRICAO from ESTOQUE_SUBGRUPO WHERE CODIGO = '${subgrupo}'`;
  const select = await sql.query(selectQuery);
  return select.recordset;
};

const genero = async(genero)=>{
  await sql.connect(sqlConfig);
  const selectQuery = `select DESC_GENERO from SPD_GENERO WHERE CODIGO = '${genero}'`;
  const select = await sql.query(selectQuery);
  return select.recordset;
};

const tipo = async(tipo)=>{
  await sql.connect(sqlConfig);
  const selectQuery = `select DESC_TIPO_ITEM from CT_TIPO_ITEM WHERE CODIGO = '${tipo}'`;
  const select = await sql.query(selectQuery);
  return select.recordset;
};

module.exports = {
    all,
    search,
    product,
    allPedidosDeCompra,
    searchPedidosDeCompra,
    pedidoDeCompra,
    uncryptObs,
    categoria,
    familia,
    grupo,
    subgrupo,
    genero,
    tipo
};