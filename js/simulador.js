document.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById('grafico-historico-selic');
    if (!ctx || !window.modelosPreditivos) return;

    const dados = window.modelosPreditivos.getHistoricoSelic();
    const labels = dados.map(d => d.data);
    const taxas = dados.map(d => d.taxa);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Histórico da Selic',
                data: taxas,
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245,158,11,0.1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: { color: '#f8f9fa' }
                }
            },
            scales: {
                x: { ticks: { color: '#f8f9fa' } },
                y: { ticks: { color: '#f8f9fa' } }
            }
        }
    });
});
