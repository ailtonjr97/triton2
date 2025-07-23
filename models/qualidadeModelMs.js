const { sqlQualidade, connectQualidade } = require('../services/dbQualidade');

async function anexosHome() {
    try {
        const pool = await connectQualidade();

        const result = await pool.request().query(`SELECT TOP 100 * FROM ANEXOS WHERE HOME_ID IS NOT NULL AND ARQUIVADO = 0`);
        console.log(result.recordset);
        return result.recordset;
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao buscar anexos');
    }
}

async function anexosHomeUnico(id) {
    try {
        const pool = await connectQualidade();

        const result = await pool.request()
            .input('id', sqlQualidade.Int, id)
            .query(`SELECT * FROM ANEXOS WHERE HOME_ID = @id`);
        return result.recordset;
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao buscar anexo único');
    }
}

async function anexosHomeDelete(id) {
    try {
        const pool = await connectQualidade();

        const result = await pool.request()
            .input('id', sqlQualidade.Int, id)
            .query(`UPDATE ANEXOS SET ARQUIVADO = 1 WHERE HOME_ID = @id`);
        return result.rowsAffected;
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao arquivar anexo');
    }
}

async function anexosHomePost(fieldname, originalname, encoding, mimetype, destination, filename, path, size, categoria) {
    try {
        const pool = await connectQualidade();

        const result = await pool.request()
            .input('fieldname', sqlQualidade.NVarChar, fieldname)
            .input('originalname', sqlQualidade.NVarChar, originalname)
            .input('encoding', sqlQualidade.NVarChar, encoding)
            .input('mimetype', sqlQualidade.NVarChar, mimetype)
            .input('destination', sqlQualidade.NVarChar, destination)
            .input('filename', sqlQualidade.NVarChar, filename)
            .input('path', sqlQualidade.NVarChar, path)
            .input('size', sqlQualidade.Int, size)
            .input('categoria', sqlQualidade.NVarChar, categoria)
            .query(`
                BEGIN TRANSACTION;

                DECLARE @NovoValor INT;
                SELECT @NovoValor = ISNULL(MAX(HOME_ID), 0) + 1 FROM ANEXOS WITH (TABLOCKX);

                INSERT INTO ANEXOS (FIELDNAME, ORIGINAL_NAME, ENCODING, MIMETYPE, DESTINATION, FILENAME, PATH, SIZE, HOME_ID, ARQUIVADO, HOME_CATEGORIA) 
                VALUES (@fieldname, @originalname, @encoding, @mimetype, @destination, @filename, @path, @size, @NovoValor, 0, @categoria);

                COMMIT TRANSACTION;
            `);
        return result.rowsAffected;
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
