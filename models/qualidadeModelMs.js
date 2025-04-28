const axios = require('axios');
const { sql: dbSql, connectToDatabase } = require('../services/dbConfig')

async function anexosHome() {
    try {
        // Conectar ao banco de dados
        await connectToDatabase();

        const result = await dbSql.query`SELECT * FROM ANEXOS WHERE HOME_ID IS NOT NULL AND ARQUIVADO = 0`;
        return result;

    } catch (error) {
        console.log(error)
        throw new Error
    }
};

async function anexosHomeUnico(id) {
    try {
        // Conectar ao banco de dados
        await connectToDatabase();

        const result = await dbSql.query`SELECT * FROM ANEXOS WHERE HOME_ID = ${id}`;
        return result;

    } catch (error) {
        console.log(error)
        throw new Error
    }
};

async function anexosHomeDelete(id) {
    try {
        // Conectar ao banco de dados
        await connectToDatabase();

        const result = await dbSql.query`UPDATE ANEXOS SET ARQUIVADO = 1 WHERE HOME_ID = ${id}`;
        return result;

    } catch (error) {
        console.log(error)
        throw new Error
    }
};

async function anexosHomePost(fieldname, originalname, encoding, mimetype, destination, filename, path, size, categoria) {
    try {
        // Conectar ao banco de dados
        await connectToDatabase();

        const result = await dbSql.query`
        BEGIN TRANSACTION;

        DECLARE @NovoValor INT;
        SELECT @NovoValor = ISNULL(MAX(HOME_ID), 0) + 1 FROM ANEXOS WITH (TABLOCKX);

        INSERT INTO ANEXOS (FIELDNAME, ORIGINAL_NAME, ENCODING, MIMETYPE, DESTINATION, FILENAME, PATH, SIZE, HOME_ID, ARQUIVADO, HOME_CATEGORIA) VALUES (${fieldname}, ${originalname}, ${encoding}, ${mimetype}, ${destination}, ${filename}, ${path}, ${size}, @NovoValor, 0, ${categoria})

        COMMIT TRANSACTION;
        `;
        return result;

    } catch (error) {
        console.log(error)
        throw new Error
    }
};

module.exports = { 
    anexosHome,
    anexosHomePost,
    anexosHomeUnico,
    anexosHomeDelete
};