function quebraString(str) {
    return str.trimEnd();
}

function convertDateFormat(dateString) {
    const [year, month, day] = dateString.split('/');
    return `${day}/${month}/${year}`;
}

function formatarParaMoedaBrasileira(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function convertDateForInput(dateString) {
    // Verifica se a data está no formato YYYY/MM/DD ou YY/MM/DD
    const datePattern = /^\d{2,4}\/\d{2}\/\d{2}$/;
    if (!datePattern.test(dateString)) {
        throw new Error('Formato de data inválido. Use YYYY/MM/DD ou YY/MM/DD.');
    }

    // Verifica se a data é 00/00/00
    if (dateString === '00/00/00') {
        return '';
    }

    // Divide a string da data
    const parts = dateString.split('/');
    
    // Formata para YYYY-MM-DD se o ano estiver em YY
    if (parts[0].length === 2) {
        parts[0] = '20' + parts[0]; // Assume século 21
    }

    // Substitui as barras por hifens
    const formattedDate = parts.join('-');
    return formattedDate;
}

function formatCurrency(value) {
    // Verifica se o valor é nulo ou indefinido
    if (value === null || value === undefined) {
        return ''; // Retorna uma string vazia para valores nulos ou indefinidos
    }

    // Converte a string para um número float
    let number = parseFloat(value);

    // Verifica se a conversão para número foi bem-sucedida
    if (isNaN(number)) {
        return ''; // Retorna uma string vazia para valores inválidos
    }

    // Formata o número para a moeda brasileira
    return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}


module.exports = {
    quebraString,
    convertDateFormat,
    formatarParaMoedaBrasileira,
    convertDateForInput,
    formatCurrency
};