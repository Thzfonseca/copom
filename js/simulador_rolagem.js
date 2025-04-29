// js/simulador_rolagem.js

class SimuladorRolagem {
    constructor() {
        this.prazoAtual = 5.0; // Exemplo: 5 anos
        this.prazoNovo = 7.0; // Exemplo: 7 anos
        this.ipcaAtual = 4.0; // IPCA médio (%)
        this.cdiMedio = 10.5; // CDI médio (%)
        this.ipcaNovo = 3.5; // IPCA médio novo título
        this.cupomAtual = 5.5; // Cupom do título atual (%)
        this.cupomNovo = 5.2; // Cupom do novo título (%)
    }

    calcularResultados() {
        const rendimentoAtual = (this.ipcaAtual + this.cupomAtual) * (this.prazoAtual);
        const rendimentoNovo = (this.ipcaNovo + this.cupomNovo) * (this.prazoNovo);
        const retornoCDI = this.cdiMedio * this.prazoNovo;

        return {
            rendimentoAtual,
            rendimentoNovo,
            retornoCDI,
            vantagemRolagem: rendimentoNovo > rendimentoAtual,
            excessoSobreCDI: rendimentoNovo - retornoCDI
        };
    }
}

window.simuladorRolagem = new SimuladorRolagem();

// Função para atualizar inputs e gráfico
function atualizarSimuladorRolagem() {
    const get = id => parseFloat(document.getElementById(id)?.value || 0);

    simuladorRolagem.prazoAtual = get('prazo-atual');
    simuladorRolagem.prazoNovo = get('prazo-novo');
    simuladorRolagem.ipcaAtual = get('ipca-atual');
    simuladorRolagem.ipcaNovo = get('ipca-novo');
    simuladorRolagem.cdiMedio = get('cdi-medio');
    simuladorRolagem.cupomAtual = get('cupom-atual');
    simuladorRolagem.cupomNovo = get('cupom-novo');

    const resultados = simuladorRolagem.calcularResultados();
    atualizarGraficoRolagem(resultados);

    const info = document.getElementById('info-rolagem');
    if (info) {
        info.innerHTML = `
            <p><strong>Resultado Atual:</strong> ${resultados.rendimentoAtual.toFixed(2)}%</p>
            <p><strong>Resultado Novo:</strong> ${resultados.rendimentoNovo.toFixed(2)}%</p>
            <p><strong>Excesso sobre CDI:</strong> ${resultados.excessoSobreCDI.toFixed(2)}%</p>
            <p><strong>Vale a rolagem?</strong> ${resultados.vantagemRolagem ? 'Sim' : 'Não'}</p>
        `;
    }
}

// Inicializar no carregamento da página
document.addEventListener('DOMContentLoaded', () => {
    atualizarSimuladorRolagem();

    const inputs = document.querySelectorAll('.input-simulador-rolagem');
    inputs.forEach(input => {
        input.addEventListener('input', atualizarSimuladorRolagem);
    });
});