function formatarParaMoedaBrasileira(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  
module.exports = { formatarParaMoedaBrasileira };
  