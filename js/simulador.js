// js/simulador.js

class SimuladorCopom {
    constructor() {
        this.cenarioBase = {
            ipca: 4.25,
            hiato: -0.8,
            cambio: 5.20,
            jurosEUA: 5.50
        };

        this.cenarioAtual = { ...this.cenarioBase };
        this.resultadoBase = null;
        this.resultadoAtual = null;
        this.chart = null;
    }

    inicializar() {
        if (!window.modelosPreditivos) return false;
        this.resultadoBase = window.modelosPreditivos.getResultados();
        this.resultadoAtual = { ...this.resultadoBase };
        return true;
    }

    renderizar(container) {
        if (!container) return;

        container.innerHTML = `
            <div class="card">
                <h2>Simulador de Cenários</h2>
                <div class="form-grid">
                    ${this.renderizarSliders()}
                </div>
                <div class="botoes-simulador">
                    <button id="simular-btn">Simular</button>
                    <button id="resetar-btn" style="background-color:#64748b;">Resetar</button>
                </div>
                <div class="grafico-container">
                    <canvas id="grafico-simulador" height="200"></canvas>
                </div>
            </div>
        `;

        document.getElementById('simular-btn').addEventListener('click', () => this.simular());
        document.getElementById('resetar-btn').addEventListener('click', () => this.resetar());
        this.renderizarGrafico();
    }

    renderizarSliders() {
        return Object.entries(this.cenarioBase).map(([key, value]) => `
            <div>
                <label>${this.labelVariavel(key)}: <span id="valor-${key}">${value}</span></label>
                <input type="range" id="slider-${key}" min="0" max="10" step="0.1" value="${value}">
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

    simular() {
        Object.keys(this.cenarioBase).forEach(key => {
            const slider = document.getElementById(`slider-${key}`);
            if (slider) {
                this.cenarioAtual[key] = parseFloat(slider.value);
                document.getElementById(`valor-${key}`).innerText = slider.value;
            }
        });

        this.resultadoAtual = this.calcularResultadoSimulado();
        this.atualizarGrafico();
    }

    calcularResultadoSimulado() {
        const tendencia = (
            this.cenarioAtual.ipca * 0.5 +
            this.cenarioAtual.cambio * 0.3 -
            this.cenarioAtual.hiato * 0.4 +
            this.cenarioAtual.jurosEUA * 0.2
        );
        return {
            tendencia
        };
    }

    renderizarGrafico() {
        const ctx = document.getElementById('grafico-simulador').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Inflação', 'Hiato', 'Câmbio', 'Juros EUA'],
                datasets: [
                    {
                        label: 'Cenário Simulado',
                        backgroundColor: '#3182ce',
                        data: Object.values(this.cenarioAtual)
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
                    y: { ticks: { color: '#e2e8f0' } }
                }
            }
        });
    }

    atualizarGrafico() {
        if (this.chart) {
            this.chart.data.datasets[0].data = Object.values(this.cenarioAtual);
            this.chart.update();
        }
    }

    resetar() {
        this.cenarioAtual = { ...this.cenarioBase };
        this.simular();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const simuladorContainer = document.getElementById('simulador');
    if (simuladorContainer) {
        const simulador = new SimuladorCopom();
        if (simulador.inicializar()) {
            simulador.renderizar(simuladorContainer);
        }
    }
});