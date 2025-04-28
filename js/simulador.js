/**
 * Simulador de cenários para decisões do COPOM
 */

class SimuladorCopom {
    constructor() {
        this.cenarioBase = {
            ipca: 4.25,
            ipcaE12m: 4.50,
            hiato: -0.8,
            cambio: 5.20,
            cambioDelta: 0.15,
            jurosEUA: 5.50,
            commodities: -2.5,
            confConsumidor: 92.3,
            vix: 18.5
        };
        
        this.cenarioAtual = { ...this.cenarioBase };
        this.resultadoBase = null;
        this.resultadoAtual = null;
        this.dataReferencia = "19/03/2025";
    }

    inicializar() {
        if (!window.modelosPreditivos) {
            console.error('Modelos preditivos não encontrados.');
            return false;
        }
        this.resultadoBase = window.modelosPreditivos.getResultados();
        this.resultadoAtual = { ...this.resultadoBase };
        return true;
    }

    renderizar(container) {
        if (!container) return;
        container.innerHTML = `
            <h2>Simulador de Cenários COPOM</h2>
            <p class="data-referencia">Dados: ${this.dataReferencia}</p>
            <div class="simulador-layout">
                <div class="controles-container">
                    <div class="cenarios-predefinidos">
                        <h3>Cenários Pré-definidos</h3>
                        <div class="cenarios-grid" id="cenarios-grid"></div>
                    </div>
                    <div class="controles-simulador">
                        <h3>Ajuste de Variáveis</h3>
                        <div class="controles-grid" id="controles-grid"></div>
                    </div>
                    <div class="acoes-simulador">
                        <button id="btn-simular" class="btn-simular">Simular</button>
                        <button id="btn-resetar" class="btn-resetar">Resetar</button>
                    </div>
                </div>
                <div class="resultados-container">
                    <h3>Resultados</h3>
                    <div class="comparacao-header">
                        <div>Cenário Base</div><div>Cenário Simulado</div>
                    </div>
                    <div class="resultado-principal">
                        <div class="comparacao-row">
                            <div id="decisao-base"></div>
                            <div id="decisao-simulada"></div>
                        </div>
                        <div class="comparacao-row">
                            <div id="taxa-base"></div>
                            <div id="taxa-simulada"></div>
                        </div>
                    </div>
                    <h4>Probabilidades</h4>
                    <div id="probabilidades-comparacao"></div>
                </div>
            </div>
        `;
        this.renderizarCenarios();
        this.renderizarControles();
        this.renderizarResultados();
        this.addEventListeners();
    }

    renderizarCenarios() {
        const cenarios = [
            { id: 'base', nome: 'Base', ajuste: {} },
            { id: 'inflacao', nome: 'Inflação Alta', ajuste: { ipca: 6, ipcaE12m: 5.8 } },
            { id: 'recessao', nome: 'Recessão', ajuste: { hiato: -2.5, confConsumidor: 78 } }
        ];
        const grid = document.getElementById('cenarios-grid');
        grid.innerHTML = '';
        cenarios.forEach(c => {
            const card = document.createElement('div');
            card.className = 'cenario-card';
            card.innerHTML = `<h4>${c.nome}</h4>`;
            card.onclick = () => this.carregarCenario(c.ajuste);
            grid.appendChild(card);
        });
    }

    renderizarControles() {
        const grid = document.getElementById('controles-grid');
        grid.innerHTML = '';
        Object.entries(this.cenarioBase).forEach(([key, value]) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'controle-item';
            wrapper.innerHTML = `
                <div class="controle-header">
                    <label>${key}</label>
                    <span id="valor-${key}">${value.toFixed(2)}</span>
                </div>
                <input type="range" min="0" max="10" step="0.1" value="${value}" id="ctrl-${key}">
            `;
            grid.appendChild(wrapper);
        });
    }

    renderizarResultados() {
        const decisaoBase = this.resultadoBase?.proximaReuniao?.previsaoConsolidada || 'Indefinido';
        const taxaBase = this.resultadoBase?.taxaPrevista || 0;
        const decisaoAtual = this.resultadoAtual?.proximaReuniao?.previsaoConsolidada || 'Indefinido';
        const taxaAtual = this.resultadoAtual?.taxaPrevista || 0;
        
        document.getElementById('decisao-base').innerText = this.textoDecisao(decisaoBase);
        document.getElementById('taxa-base').innerText = `${taxaBase.toFixed(2)}%`;
        document.getElementById('decisao-simulada').innerText = this.textoDecisao(decisaoAtual);
        document.getElementById('taxa-simulada').innerText = `${taxaAtual.toFixed(2)}%`;

        this.renderizarProbabilidades();
    }

    renderizarProbabilidades() {
        const container = document.getElementById('probabilidades-comparacao');
        container.innerHTML = '';

        const decisoes = [
            { id: 'reducao50', texto: 'Redução 50pb', cor: '#3498db' },
            { id: 'reducao25', texto: 'Redução 25pb', cor: '#2ecc71' },
            { id: 'manutencao', texto: 'Manutenção', cor: '#f1c40f' },
            { id: 'aumento25', texto: 'Aumento 25pb', cor: '#e67e22' },
            { id: 'aumento50', texto: 'Aumento 50pb', cor: '#e74c3c' }
        ];

        decisoes.forEach(decisao => {
            const probBase = (this.resultadoBase.proximaReuniao?.probabilidades[decisao.id] || 0) * 100;
            const probAtual = (this.resultadoAtual.proximaReuniao?.probabilidades[decisao.id] || 0) * 100;

            const item = document.createElement('div');
            item.className = 'probabilidade-comparacao-item';
            item.innerHTML = `
                <div class="probabilidade-decisao">${decisao.texto}</div>
                <div class="probabilidade-barras">
                    <div class="probabilidade-barra-container">
                        <div class="probabilidade-barra" data-final-width="${probBase}" style="width: 0; background:${decisao.cor}"></div>
                    </div>
                    <div class="probabilidade-barra-container">
                        <div class="probabilidade-barra" data-final-width="${probAtual}" style="width: 0; background:${decisao.cor}"></div>
                    </div>
                </div>
            `;
            container.appendChild(item);
        });

        // Ativa animação das barras
        setTimeout(() => {
            document.querySelectorAll('.probabilidade-barra').forEach(bar => {
                bar.style.width = `${bar.dataset.finalWidth}%`;
            });
        }, 150);
    }

    addEventListeners() {
        document.getElementById('btn-simular').onclick = () => this.simular();
        document.getElementById('btn-resetar').onclick = () => this.resetar();
        Object.keys(this.cenarioBase).forEach(key => {
            const slider = document.getElementById(`ctrl-${key}`);
            if (slider) {
                slider.oninput = (e) => {
                    this.cenarioAtual[key] = parseFloat(e.target.value);
                    document.getElementById(`valor-${key}`).innerText = parseFloat(e.target.value).toFixed(2);
                };
            }
        });
    }

    simular() {
        if (!window.modelosPreditivos) return;
        this.resultadoAtual = window.modelosPreditivos.atualizarIndicadores(this.cenarioAtual);
        this.renderizarResultados();
    }

    resetar() {
        this.cenarioAtual = { ...this.cenarioBase };
        this.resultadoAtual = { ...this.resultadoBase };
        this.renderizarControles();
        this.renderizarResultados();
        this.addEventListeners();
    }

    carregarCenario(ajuste) {
        Object.assign(this.cenarioAtual, ajuste);
        this.renderizarControles();
        this.addEventListeners();
    }

    textoDecisao(decisao) {
        const textos = {
            'reducao50': 'Redução de 50 pontos-base',
            'reducao25': 'Redução de 25 pontos-base',
            'manutencao': 'Manutenção da taxa',
            'aumento25': 'Aumento de 25 pontos-base',
            'aumento50': 'Aumento de 50 pontos-base'
        };
        return textos[decisao] || decisao;
    }
}

// Exporta global
window.SimuladorCopom = SimuladorCopom;
window.renderizarSimulador = (container) => {
    const sim = new SimuladorCopom();
    if (sim.inicializar()) {
        sim.renderizar(container);
    }
};
