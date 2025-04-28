// simulador.js

class SimuladorCopom {
    constructor() {
        this.resultadoBase = null;
        this.resultadoAtual = null;
    }

    inicializar() {
        console.log('Inicializando simulador do COPOM...');

        if (!window.ModelosPreditivos) {
            console.error('Modelos preditivos não encontrados. O simulador depende deles para funcionar.');
            return false;
        }

        this.resultadoBase = ModelosPreditivos.getResultados();
        this.resultadoAtual = { ...this.resultadoBase };
        return true;
    }

    renderizar(container) {
        if (!container) {
            console.error('Container para renderização do simulador não encontrado');
            return;
        }

        container.innerHTML = `
            <div class="simulador">
                <h2>Simulador do COPOM</h2>
                <p>Resultado Base: ${this.resultadoBase ? this.resultadoBase.taxaPrevista.toFixed(2) + '%' : '-'}</p>
                <p>Resultado Atual: ${this.resultadoAtual ? this.resultadoAtual.taxaPrevista.toFixed(2) + '%' : '-'}</p>
            </div>
        `;
    }
}

// Exporta a instância para ser usada globalmente
window.simuladorCopom = new SimuladorCopom();

// Função global para renderizar
function renderizarSimulador() {
    const simuladorTab = document.getElementById('simulador');
    if (!simuladorTab) {
        console.error('Elemento da aba simulador não encontrado.');
        return;
    }

    const inicializado = window.simuladorCopom.inicializar();

    if (!inicializado) {
        simuladorTab.innerHTML = `
            <div class="alert alert-danger">
                Não foi possível carregar o simulador. Modelos preditivos não encontrados.
            </div>
        `;
        return;
    }

    window.simuladorCopom.renderizar(simuladorTab);
}

window.renderizarSimulador = renderizarSimulador;
