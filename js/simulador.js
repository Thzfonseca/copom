// simulador.js

class SimuladorCopom {
    constructor() {
        this.dadosBase = {
            ipca: 4.25,
            ipcaE12m: 4.5,
            hiato: -0.8,
            cambio: 5.20,
            cambioDelta: 0.15,
            jurosEUA: 5.50,
            commodities: -2.5,
            confConsumidor: 92.3,
            vix: 18.5
        };
        this.init();
    }

    init() {
        this.chart = null;
        this.montarInterface();
        this.plotarGrafico();
    }

    montarInterface() {
        const container = document.getElementById('simulador');
        container.innerHTML = `
            <h2>Simulador de Cenários - COPOM</h2>
            <div class="simulador-layout">
                <div class="controles-container">
                    ${this.criarControles()}
                    <div style="display: flex; justify-content: space-between;">
                        <button class="btn-simular" onclick="window.simuladorCopom.simular()">Simular</button>
                        <button class="btn-resetar" onclick="window.simuladorCopom.resetar()">Resetar</button>
                    </div>
                </div>
                <div class="resultados-container">
                    <h3>Resultados</h3>
                    <div class="chart-container">
                        <canvas id="grafico-simulador"></canvas>
                    </div>
                </div>
            </div>
        `;
    }

    criarControles() {
        return Object.keys(this.dadosBase).map(key => `
            <div class="controle-item">
                <label>${key.toUpperCase()}:</label>
                <input type="range" id="ctrl-${key}" min="0" max="10" step="0.1" value="${this.dadosBase[key]}">
            </div>
        `).join('');
    }

    coletarDadosAtualizados() {
        const novosDados = {};
        Object.keys(this.dadosBase).forEach(key => {
            const el = document.getElementById(`ctrl-${key}`);
            novosDados[key] = parseFloat(el.value);
        });
        return novosDados;
    }

    simular() {
        const novosDados = this.coletarDadosAtualizados();
        console.log('Simulando com dados:', novosDados);
        this.plotarGrafico(novosDados);
    }

    resetar() {
        console.log('Resetando para cenário base...');
        this.plotarGrafico(this.dadosBase);
        this.montarInterface();
        this.init();
    }

    plotarGrafico(dados = this.dadosBase) {
        const ctx = document.getElementById('grafico-simulador').getContext('2d');
        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: Object.keys(dados).map(k => k.toUpperCase()),
                datasets: [{
                    label: 'Níveis Econômicos',
                    data: Object.values(dados),
                    backgroundColor: 'rgba(49, 130, 206, 0.3)',
                    borderColor: '#3182ce',
                    borderWidth: 2,
                    pointBackgroundColor: '#63b3ed'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    r: {
                        angleLines: { color: '#4a5568' },
                        grid: { color: '#4a5568' },
                        pointLabels: { color: '#e2e8f0' }
                    }
                },
                plugins: {
                    legend: { labels: { color: '#e2e8f0' } }
                }
            }
        });
    }
}

// Criar instância global
window.addEventListener('DOMContentLoaded', () => {
    window.simuladorCopom = new SimuladorCopom();
});
