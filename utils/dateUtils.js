const moment = require('moment');

function formatDateToMySQL(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function formatDate(date) {
    return moment(date).format('DD/MM/YYYY HH:mm');
}

function formatCurrentDateTimeForMySQL() {
    const date = new Date();
  
    // Extrai os componentes da data e hora
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Os meses são base 0
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
  
    // Formata a data e hora no padrão desejado
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  function convertDateFormat(dateString) {
    const [year, month, day] = dateString.split('/');
    return `${day}/${month}/${year}`;
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

function getCurrentDateTimeForSQLServer() {
    const now = new Date();
  
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
  
    const dateTimeForSQLServer = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
  
    return dateTimeForSQLServer;
  }

  function sqlServerDateTimeToString(sqlDateTime) {
    if (!sqlDateTime) {
      return '';
    }
  
    const date = new Date(sqlDateTime);
  
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();
  
    return `${hours}:${minutes} ${day}/${month}/${year}`;
  }

module.exports = { formatDateToMySQL, formatDate, formatCurrentDateTimeForMySQL, convertDateFormat, convertDateForInput, getCurrentDateTimeForSQLServer, sqlServerDateTimeToString};
