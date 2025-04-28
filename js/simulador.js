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
        if (!window.modelosPreditivos) {
            console.error('Modelos preditivos não carregados.');
            return false;
        }
        this.resultadoBase = window.modelosPreditivos.getResultados();
        this.resultadoAtual = { ...this.resultadoBase };
        return true;
    }

    renderizar(container) {
        if (!container) return;

        container.innerHTML = `
            <div class="simulador-container">
                <h2>Simulador de Cenários</h2>
                <div class="grid grid-2">
                    <div class="card">
                        <h3>Variáveis Econômicas</h3>
                        ${this.renderizarSliders()}
                        <div class="buttons">
                            <button class="button" id="simular-btn">Simular</button>
                            <button class="button" id="resetar-btn" style="background-color: #64748b;">Resetar</button>
                        </div>
                    </div>
                    <div class="card">
                        <h3>Resultado</h3>
                        <p id="resultado-texto">Simule um cenário para ver o resultado.</p>
                        <div class="chart-container">
                            <canvas id="resultado-chart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('simular-btn').addEventListener('click', () => this.simular());
        document.getElementById('resetar-btn').addEventListener('click', () => this.resetar());
        this.renderizarGrafico();
    }

    renderizarSliders() {
        return Object.entries(this.cenarioBase).map(([key, value]) => `
            <div class="slider-control">
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
        this.atualizarTexto();
    }

    calcularResultadoSimulado() {
        const tendencia = (
            this.cenarioAtual.ipca * 0.5 +
            this.cenarioAtual.cambio * 0.3 -
            this.cenarioAtual.hiato * 0.4 +
            this.cenarioAtual.jurosEUA * 0.2
        );
        return { tendencia };
    }

    atualizarTexto() {
        const texto = this.resultadoAtual.tendencia > 10
            ? "Cenário indica aumento da Selic."
            : this.resultadoAtual.tendencia < 5
            ? "Cenário indica redução da Selic."
            : "Cenário sugere manutenção da Selic.";
        document.getElementById('resultado-texto').innerText = texto;
    }

    renderizarGrafico() {
        const ctx = document.getElementById('resultado-chart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Inflação', 'Hiato', 'Câmbio', 'Juros EUA'],
                datasets: [
                    {
                        label: 'Base',
                        backgroundColor: '#3b82f6',
                        data: Object.values(this.cenarioBase)
                    },
                    {
                        label: 'Simulado',
                        backgroundColor: '#f59e0b',
                        data: Object.values(this.cenarioAtual)
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: { color: '#e2e8f0' }
                    }
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
            this.chart.data.datasets[1].data = Object.values(this.cenarioAtual);
            this.chart.update();
        }
    }

    resetar() {
        this.cenarioAtual = { ...this.cenarioBase };
        this.simular();
    }
}

// Inicializar no DOM
document.addEventListener('DOMContentLoaded', () => {
    const simuladorContainer = document.getElementById('simulador');
    if (simuladorContainer) {
        const simulador = new SimuladorCopom();
        if (simulador.inicializar()) {
            simulador.renderizar(simuladorContainer);
        }
    }
});
