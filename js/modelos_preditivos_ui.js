// modelos_preditivos_ui.js

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

        container.innerHTML = `
            <div class="modelos-preditivos-container">
                <h2>Modelos Preditivos</h2>
                <p><strong>Previsão Consolidada:</strong> ${previsao || 'Indefinido'}</p>
                <p><strong>Taxa Selic Prevista:</strong> ${taxaPrevista}%</p>
            </div>
        `;
    }

    // Expor no escopo global
    window.renderizarModelosPreditivos = function () {
        if (!window.ModelosPreditivos) {
            console.error('[COPOM Dashboard] ModelosPreditivos ainda não carregados.');
            return;
        }

        const resultados = ModelosPreditivos.getResultados();
        renderizarModelosPreditivos(resultados);
    };
})();
