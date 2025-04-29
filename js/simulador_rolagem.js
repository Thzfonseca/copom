// js/simulador_rolagem.js

class SimuladorRolagemIPCA {
    constructor() {
        this.dados = {
            dataCompra: '2022-01-01',
            precoCompra: 2500.00,
            precoAtual: 3200.00,
            vencimento: '2030-01-01',
            ipcaAcumulado: 10.0, // em percentual
            taxaReinvestimento: 0.9 // % ao mês
        };
    }

    calcularResultados() {
        const { dataCompra, precoCompra, precoAtual, vencimento, ipcaAcumulado, taxaReinvestimento } = this.dados;

        const hoje = new Date();
        const vencimentoData = new Date(vencimento);
        const anosAteVencimento = (vencimentoData - hoje) / (1000 * 60 * 60 * 24 * 365.25);

        // Rentabilidade projetada até o vencimento se mantiver
        const taxaAnual = (precoAtual / precoCompra - 1 + ipcaAcumulado / 100) / ((new Date() - new Date(dataCompra)) / (1000 * 60 * 60 * 24 * 365.25));
        const taxaFinalManter = taxaAnual * anosAteVencimento;

        // Se vender hoje e reinvestir
        const taxaMensalReinv = taxaReinvestimento / 100;
        const mesesReinv = anosAteVencimento * 12;
        const valorReinvestido = precoAtual * Math.pow(1 + taxaMensalReinv, mesesReinv);
        const taxaFinalVender = (valorReinvestido / precoCompra) - 1;

        return {
            manter: {
                valorFinal: precoAtual * (1 + taxaFinalManter),
                taxaFinal: (taxaFinalManter * 100).toFixed(2)
            },
            vender: {
                valorFinal: valorReinvestido,
                taxaFinal: (taxaFinalVender * 100).toFixed(2)
            }
        };
    }

    atualizarDados(novosDados) {
        this.dados = { ...this.dados, ...novosDados };
    }
}

// Disponibilizar globalmente
window.simuladorRolagemIPCA = new SimuladorRolagemIPCA();
