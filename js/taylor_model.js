// js/taylor_model.js

class TaylorModel {
    constructor(config = {}) {
        this.metaInflacao = config.metaInflacao ?? 3.00; // Meta de inflação (p*)
        this.juroRealNeutro = config.juroRealNeutro ?? 4.50; // Juro neutro (r*)
        this.coefInflacao = config.coefInflacao ?? 0.5; // Sensibilidade à inflação (a)
        this.coefHiato = config.coefHiato ?? 0.5; // Sensibilidade ao hiato (b)
    }

    /**
     * Calcula a taxa Selic sugerida pela Regra de Taylor
     * @param {Object} cenarios - Cenário com variáveis econômicas
     * @returns {number} - Taxa Selic sugerida
     */
    calcularSelicTaylor(cenarios) {
        if (!cenarios || typeof cenarios !== 'object') {
            console.error('Cenário inválido fornecido ao modelo de Taylor.');
            return null;
        }

        const ipca = cenarios.ipca ?? 4.25; // Inflação corrente
        const hiato = cenarios.hiato ?? 0;  // Hiato do produto (%)

        const taxaSelicSugerida = ipca
            + this.coefInflacao * (ipca - this.metaInflacao)
            + this.coefHiato * hiato
            + this.juroRealNeutro;

        return parseFloat(taxaSelicSugerida.toFixed(2));
    }

    /**
     * Atualiza os parâmetros da regra de Taylor
     * @param {Object} config - Configurações novas
     */
    atualizarParametros(config = {}) {
        if (config.metaInflacao !== undefined) this.metaInflacao = config.metaInflacao;
        if (config.juroRealNeutro !== undefined) this.juroRealNeutro = config.juroRealNeutro;
        if (config.coefInflacao !== undefined) this.coefInflacao = config.coefInflacao;
        if (config.coefHiato !== undefined) this.coefHiato = config.coefHiato;
    }
}

// Deixar disponível no window para acessar fácil
window.TaylorModel = TaylorModel;
