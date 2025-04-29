// js/grafico_rolagem.js

let graficoRolagem;

function atualizarGraficoRolagem(resultados) {
    const ctx = document.getElementById('grafico-rolagem')?.getContext('2d');
    if (!ctx) return;

    const data = {
        labels: ['Resultado Atual', 'Resultado Novo', 'CDI Médio'],
        datasets: [{
            label: 'Comparação de Retornos (%)',
            data: [
                resultados.rendimentoAtual,
                resultados.rendimentoNovo,
                resultados.retornoCDI
            ],
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b']
        }]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: context => `${context.parsed.y.toFixed(2)}%`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { color: '#e2e8f0' }
            },
            x: {
                ticks: { color: '#e2e8f0' }
            }
        }
    };

    if (graficoRolagem) {
        graficoRolagem.data = data;
        graficoRolagem.update();
    } else {
        graficoRolagem = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: options
        });
    }
}