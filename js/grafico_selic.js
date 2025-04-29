// js/grafico_selic.js

document.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById('grafico-selic').getContext('2d');
    const graficoSelic = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [
                '2015', '2016', '2017', '2018', '2019',
                '2020', '2021', '2022', '2023', '2024'
            ],
            datasets: [{
                label: 'Taxa Selic (%)',
                data: [14.25, 13.75, 7.00, 6.50, 4.50, 2.00, 2.75, 13.75, 13.75, 11.75],
                fill: false,
                borderColor: '#38bdf8',
                tension: 0.3
            }]
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
});
