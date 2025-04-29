// js/grafico_rolagem.js

class GraficoRolagem {
    constructor(containerId) {
        this.ctx = document.getElementById(containerId).getContext('2d');
        this.chart = null;
        this.inicializarGrafico();
    }

    inicializarGrafico() {
        this.chart = new Chart(this.ctx, {
            type: 'line',
            data: {
                labels: [], // anos
                datasets: [
                    {
                        label: 'Cenário Base',
                        borderColor: '#3b82f6',
                        backgroundColor: 'transparent',
                        data: []
                    },
                    {
                        label: 'Cenário Troca',
                        borderColor: '#f59e0b',
                        backgroundColor: 'transparent',
                        data: []
                    },
                    {
                        label: 'CDI',
                        borderColor: '#10b981',
                        backgroundColor: 'transparent',
                        data: []
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

    atualizarGrafico(dados) {
        this.chart.data.labels = dados.anos;
        this.chart.data.datasets[0].data = dados.saldoBase;
        this.chart.data.datasets[1].data = dados.saldoTroca;
        this.chart.data.datasets[2].data = dados.saldoCDI;
        this.chart.update();
    }
}

// Disponibilizar globalmente
window.GraficoRolagem = GraficoRolagem;
