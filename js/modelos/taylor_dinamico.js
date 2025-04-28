// js/modelos/taylor_dinamico.js

class TaylorDinamico {
    constructor() {
        this.parametrosBase = {
            pesoInflacao: 0.5,
            pesoHiato: 0.5,
            metaInflacao: 3.0,
            juroNeutro: 4.5
        };
        
        this.cenarioAtual = {
            inflacaoAtual: 4.5, // IPCA atual
            hiatoProduto: -1.0  // Hiato atual
        };
    }

    /**
     * Atualiza os parâmetros da regra de Taylor
     * @param {Object} novosParametros 
     */
    atualizarParametros(novosParametros) {
        this.parametrosBase = { ...this.parametrosBase, ...novosParametros };
    }

    /**
     * Atualiza o cenário atual
     * @param {Object} novoCenario 
     */
    atualizarCenario(novoCenario) {
        this.cenarioAtual = { ...this.cenarioAtual, ...novoCenario };
    }

    /**
     * Calcula a taxa Selic sugerida pela regra de Taylor
     * @returns {number} Taxa sugerida
     */
    calcularTaxaTaylor() {
        const { pesoInflacao, pesoHiato, metaInflacao, juroNeutro } = this.parametrosBase;
        const { inflacaoAtual, hiatoProduto } = this.cenarioAtual;

        const taxaTaylor = inflacaoAtual
            + pesoInflacao * (inflacaoAtual - metaInflacao)
            + pesoHiato * hiatoProduto
            + juroNeutro;

        return parseFloat(taxaTaylor.toFixed(2));
    }

    /**
     * Gera um diagnóstico textual do cenário atual
     * @returns {string}
     */
    diagnosticoTaylor() {
        const taxaCalculada = this.calcularTaxaTaylor();
        return `
            🧠 Diagnóstico Taylor Dinâmico:
            - IPCA Atual: ${this.cenarioAtual.inflacaoAtual}%
            - Hiato do Produto: ${this.cenarioAtual.hiatoProduto}%
            - Meta de Inflação: ${this.parametrosBase.metaInflacao}%
            - Juro Neutro: ${this.parametrosBase.juroNeutro}%
            ➔ Taxa Selic sugerida: ${taxaCalculada}%
        `.trim();
    }
}

// Exporta a classe para o browser
window.TaylorDinamico = TaylorDinamico;
