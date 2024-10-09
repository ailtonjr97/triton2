const dotenv = require("dotenv");
dotenv.config();
const { sql, connectToDatabase } = require('../services/dbConfig.js');

const produtosAll = async (codigo) => {

    await connectToDatabase();
    try {
        const result = await sql.query`
            SELECT TOP 100 * FROM SB1010 
            WHERE B1_COD LIKE '%' + ${codigo} + '%' 
            ORDER BY R_E_C_N_O_ DESC`;
        return result.recordset;
    } catch (error) {
        console.log(error);
        throw new Error;
    }
};

const produtoOne = async (filial, codigo) => {

    await connectToDatabase();
    try {
        const result = await sql.query`
            SELECT * FROM SB1010 WHERE B1_COD = ${filial, codigo}
        `;
        return result.recordset;
    } catch (error) {
        console.log(error);
        throw new Error;
    }
};

module.exports = {
    produtosAll,
    produtoOne
};