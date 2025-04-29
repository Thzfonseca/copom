// js/simulador_rolagem_ui.js

(function () {
    function renderizarSimuladorRolagem() {
        const container = document.getElementById('simulador-rolagem');
        if (!container) {
            console.error('Container simulador-rolagem não encontrado.');
            return;
        }

        container.innerHTML = `
            <div class="simulador-container">
                <h2>Simulador de Rolagem IPCA+</h2>
                <div class="grid grid-2">
                    <div class="card">
                        <h3>Dados do Papel</h3>
                        <label>Data da Compra:</label>
                        <input type="date" id="input-data-compra" value="${window.simuladorRolagemIPCA.dados.dataCompra}"/>

                        <label>Preço de Compra (R$):</label>
                        <input type="number" id="input-preco-compra" value="${window.simuladorRolagemIPCA.dados.precoCompra}" />

                        <label>Preço Atual (R$):</label>
                        <input type="number" id="input-preco-atual" value="${window.simuladorRolagemIPCA.dados.precoAtual}" />

                        <label>Data de Vencimento:</label>
                        <input type="date" id="input-vencimento" value="${window.simuladorRolagemIPCA.dados.vencimento}" />

                        <label>IPCA Acumulado (%)</label>
                        <input type="number" id="input-ipca" value="${window.simuladorRolagemIPCA.dados.ipcaAcumulado}" step="0.01"/>

                        <label>Taxa de Reinvestimento (% ao mês)</label>
                        <input type="number" id="input-reinv" value="${window.simuladorRolagemIPCA.dados.taxaReinvestimento}" step="0.01"/>

                        <button class="button" id="btn-simular-rolagem">Simular</button>
                    </div>

                    <div class="card">
                        <h3>Resultado da Simulação</h3>
                        <div id="resultado-simulacao" style="margin-top: 15px;">
                            <p>Preencha os dados e clique em Simular.</p>
                        </div>
                        <div class="chart-container" style="margin-top: 20px;">
                            <canvas id="grafico-rolagem"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('btn-simular-rolagem').addEventListener('click', simularRolagem);

        inicializarGrafico();
    }

    function simularRolagem() {
        const novosDados = {
            dataCompra: document.getElementById('input-data-compra').value,
            precoCompra: parseFloat(document.getElementById('input-preco-compra').value),
            precoAtual: parseFloat(document.getElementById('input-preco-atual').value),
            vencimento: document.getElementById('input-vencimento').value,
            ipcaAcumulado: parseFloat(document.getElementById('input-ipca').value),
            taxaReinvestimento: parseFloat(document.getElementById('input-reinv').value)
        };

        window.simuladorRolagemIPCA.atualizarDados(novosDados);
        const resultados = window.simuladorRolagemIPCA.calcularResultados();

        document.getElementById('resultado-simulacao').innerHTML = `
            <p><strong>Manter até vencimento:</strong> Taxa final estimada de ${resultados.manter.taxaFinal}%</p>
            <p><strong>Vender e reinvestir:</strong> Taxa final estimada de ${resultados.vender.taxaFinal}%</p>
        `;

        atualizarGrafico(resultados);
    }

    let graficoRolagem = null;

    function inicializarGrafico() {
        const ctx = document.getElementById('grafico-rolagem').getContext('2d');
        graficoRolagem = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Manter', 'Vender/Reinvestir'],
                datasets: [{
                    label: 'Taxa Estimada (%)',
                    backgroundColor: ['#3b82f6', '#f59e0b'],
                    data: [0, 0]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
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
            }
        });
    }

    function atualizarGrafico(resultados) {
        if (graficoRolagem) {
            graficoRolagem.data.datasets[0].data = [
                parseFloat(resultados.manter.taxaFinal),
                parseFloat(resultados.vender.taxaFinal)
            ];
            graficoRolagem.update();
        }
    }

    // Expor globalmente
    window.renderizarSimuladorRolagem = renderizarSimuladorRolagem;
})();
