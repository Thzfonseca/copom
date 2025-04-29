// js/grafico_selic.js

(function () {
    function renderizarGraficoSelic() {
        const ctx = document.getElementById('grafico-selic').getContext('2d');

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: [
                    'Jan/15', 'Jan/16', 'Jan/17', 'Jan/18', 'Jan/19', 'Jan/20', 
                    'Jan/21', 'Jan/22', 'Jan/23', 'Jan/24'
                ],
                datasets: [{
                    label: 'Taxa Selic (%)',
                    data: [12.25, 14.25, 13.00, 6.50, 6.50, 4.50, 2.00, 11.75, 13.75, 11.25],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#1e40af',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: {
                            color: '#e2e8f0'
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1f2937',
                        titleColor: '#f8fafc',
                        bodyColor: '#f8fafc',
                        borderColor: '#3b82f6',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#cbd5e0'
                        },
                        grid: {
                            color: '#2d3748'
                        }
                    },
                    y: {
                        ticks: {
                            color: '#cbd5e0'
                        },
                        grid: {
                            color: '#2d3748'
                        },
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Disponibilizar no escopo global
    window.renderizarGraficoSelic = renderizarGraficoSelic;
})();
