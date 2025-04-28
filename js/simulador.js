// js/simulador.js

class SimuladorCopom {
    constructor() {
        this.cenarioBase = {
            ipca: 4.25,
            hiato: -0.8,
            cambio: 5.20,
            jurosEUA: 5.50
        };

        this.cenarios = []; // Cenários simulados
        this.chart = null;
    }

    inicializar() {
        if (!window.modelosPreditivos) {
            console.error('Modelos preditivos não carregados.');
            return false;
        }
        this.baseResultado = window.modelosPreditivos.getResultados();
        return true;
    }

    renderizar(container) {
        if (!container) return;

        container.innerHTML = `
            <div class="simulador-container">
                <h2>Simulador de Cenários</h2>
                <div class="grid grid-2">
                    <div class="card">
                        <h3>Ajuste de Variáveis Econômicas</h3>
                        ${this.renderizarSliders()}
                        <button class="button" id="simular-btn">Adicionar Cenário</button>
                        <button class="button" id="resetar-btn" style="background-color: #64748b;">Resetar Cenários</button>
                    </div>
                    <div class="card">
                        <h3>Projeções da Taxa Selic</h3>
                        <canvas id="grafico-selic"></canvas>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('simular-btn').addEventListener('click', () => this.simularCenario());
        document.getElementById('resetar-btn').addEventListener('click', () => this.resetarCenarios());

        this.inicializarGrafico();
    }

    renderizarSliders() {
        return Object.keys(this.cenarioBase).map(key => `
            <div class="slider-container">
                <label>${this.labelVariavel(key)}: <span id="valor-${key}">${this.cenarioBase[key]}</span></label>
                <input type="range" id="slider-${key}" min="0" max="10" step="0.1" value="${this.cenarioBase[key]}" />
            </div>
        `).join('');
    }

    labelVariavel(key) {
        const labels = {
            ipca: "Inflação IPCA",
            hiato: "Hiato do Produto",
            cambio: "Câmbio (USD/BRL)",
            jurosEUA: "Juros EUA"
        };
        return labels[key] || key;
    }

    obterCenarioAtual() {
        const cenario = {};
        Object.keys(this.cenarioBase).forEach(key => {
            const slider = document.getElementById(`slider-${key}`);
            if (slider) {
                cenario[key] = parseFloat(slider.value);
                document.getElementById(`valor-${key}`).innerText = slider.value;
            }
        });
        return cenario;
    }

    simularCenario() {
        const novoCenario = this.obterCenarioAtual();
        const tendencia = this.calcularTendencia(novoCenario);

        this.cenarios.push({
            nome: `Cenário ${this.cenarios.length + 1}`,
            taxaSelic: tendencia
        });

        this.atualizarGrafico();
    }

    calcularTendencia(cenario) {
        // Mesma lógica do modelo simplificado
        const { ipca, hiato, cambio, jurosEUA } = cenario;
        return (ipca * 0.5) + (cambio * 0.3) - (hiato * 0.4) + (jurosEUA * 0.2);
    }

    inicializarGrafico() {
        const ctx = document.getElementById('grafico-selic').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Base'],
                datasets: [
                    {
                        label: 'Projeções Selic (%)',
                        data: [this.baseResultado.taxaPrevista],
                        borderColor: '#3b82f6',
                        backgroundColor: 'transparent',
                        tension: 0.3,
                        pointBackgroundColor: '#3b82f6',
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { labels: { color: '#e2e8f0' } }
                },
                scales: {
                    x: { ticks: { color: '#e2e8f0' } },
                    y: { ticks: { color: '#e2e8f0' }, beginAtZero: true }
                }
            }
        });
    }

    atualizarGrafico() {
        if (!this.chart) return;
        this.chart.data.labels = ['Base', ...this.cenarios.map(c => c.nome)];
        this.chart.data.datasets[0].data = [this.baseResultado.taxaPrevista, ...this.cenarios.map(c => c.taxaSelic)];
        this.chart.update();
    }

    resetarCenarios() {
        this.cenarios = [];
        this.atualizarGrafico();
    }
}

// Inicializar no DOM
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('simulador');
    if (container) {
        const simulador = new SimuladorCopom();
        if (simulador.inicializar()) {
            simulador.renderizar(container);
        }
    }
});
