const axios = require('axios');
const { sqlQualidade, connectQualidade } = require('../services/dbQualidade'); // ajusta o caminho certo

async function anexosHome() {
    try {
        // Conectar ao banco de dados Qualidade
        await connectQualidade();

        const result = await sqlQualidade.query`SELECT * FROM ANEXOS WHERE HOME_ID IS NOT NULL AND ARQUIVADO = 0`;
        return result;
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao buscar anexos');
    }
}

async function anexosHomeUnico(id) {
    try {
        await connectQualidade();

        const result = await sqlQualidade.query`SELECT * FROM ANEXOS WHERE HOME_ID = ${id}`;
        return result;
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao buscar anexo único');
    }
}

async function anexosHomeDelete(id) {
    try {
        await connectQualidade();

        const result = await sqlQualidade.query`UPDATE ANEXOS SET ARQUIVADO = 1 WHERE HOME_ID = ${id}`;
        return result;
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao arquivar anexo');
    }
}

async function anexosHomePost(fieldname, originalname, encoding, mimetype, destination, filename, path, size, categoria) {
    try {
        await connectQualidade();

        const result = await sqlQualidade.query`
            BEGIN TRANSACTION;

            DECLARE @NovoValor INT;
            SELECT @NovoValor = ISNULL(MAX(HOME_ID), 0) + 1 FROM ANEXOS WITH (TABLOCKX);

            INSERT INTO ANEXOS (FIELDNAME, ORIGINAL_NAME, ENCODING, MIMETYPE, DESTINATION, FILENAME, PATH, SIZE, HOME_ID, ARQUIVADO, HOME_CATEGORIA) 
            VALUES (${fieldname}, ${originalname}, ${encoding}, ${mimetype}, ${destination}, ${filename}, ${path}, ${size}, @NovoValor, 0, ${categoria});

            COMMIT TRANSACTION;
        `;
        return result;
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao cadastrar anexo');
    }
}

module.exports = { 
    anexosHome,
    anexosHomePost,
    anexosHomeUnico,
    anexosHomeDelete
};
