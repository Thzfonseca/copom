// js/modelos_preditivos_ui.js (versão completa com gráfico)

(function () {
    function renderizarModelosPreditivos(resultados) {
        console.log('[COPOM Dashboard] Renderizando Modelos Preditivos...');

        const container = document.getElementById('modelos-preditivos');
        if (!container) {
            console.error('Tab de modelos preditivos não encontrada.');
            return;
        }

        if (!resultados || !resultados.proximaReuniao) {
            console.warn('Resultados dos modelos preditivos não encontrados.');
            container.innerHTML = `
                <div class="alert alert-warning mt-4">
                    Resultados dos modelos preditivos não disponíveis.
                </div>
            `;
            return;
        }

        const previsao = resultados.proximaReuniao.previsaoConsolidada;
        const taxaPrevista = resultados.taxaPrevista?.toFixed(2) || '-';
        const historico = resultados.historicoDecisoes || [];

        container.innerHTML = `
            <div class="modelos-preditivos-container">
                <h2>Modelos Preditivos</h2>
                <p><strong>Previsão Consolidada:</strong> ${previsao || 'Indefinido'}</p>
                <p><strong>Taxa Selic Prevista:</strong> ${taxaPrevista}%</p>
                <div class="grafico-selic-container">
                    <h4>Evolução Recente da Selic</h4>
                    <canvas id="grafico-selic"></canvas>
                </div>
            </div>
        `;

        // Renderiza o gráfico com Chart.js
        renderizarGraficoSelic(historico);
    }

    function renderizarGraficoSelic(historico) {
        if (!historico || !Array.isArray(historico)) return;

        const labels = historico.map(d => d.reuniao);
        const dados = historico.map(d => d.taxa);

        const ctx = document.getElementById('grafico-selic').getContext('2d');

        new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Taxa Selic (%)',
                    data: dados,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    fill: true,
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
    }

    window.renderizarModelosPreditivos = function () {
        if (!window.ModelosPreditivos) {
            console.error('[COPOM Dashboard] ModelosPreditivos ainda não carregados.');
            return;
        }

        const resultados = {
            ...ModelosPreditivos.getResultados(),
            proximaReuniao: {
                previsaoConsolidada: ModelosPreditivos.getResultados().decisaoPrevista,
                data: '07/05/2025'
            },
            taxaPrevista: ModelosPreditivos.getResultados().taxaPrevista,
            historicoDecisoes: ModelosPreditivos.historicoDecisoes
        };

        renderizarModelosPreditivos(resultados);
    };
})();
