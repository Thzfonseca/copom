// js/modelos_preditivos_ui.js

(function () {
    function renderizarModelosPreditivos() {
        const container = document.getElementById('modelos-preditivos');
        if (!container) {
            console.error('[COPOM Dashboard] Container modelos-preditivos não encontrado.');
            return;
        }

        const resultados = window.modelosPreditivos.getResultados();
        const previsao = resultados?.previsaoConsolidada || 'indefinido';
        const taxa = resultados?.taxaPrevista?.toFixed(2) || '-';

        container.innerHTML = `
            <div class="modelos-preditivos-container">
                <h2>Modelos Preditivos</h2>
                <p><strong>Previsão Consolidada:</strong> ${previsao}</p>
                <p><strong>Taxa Selic Prevista:</strong> ${taxa}%</p>
            </div>
        `;
    }

    window.renderizarModelosPreditivos = renderizarModelosPreditivos;
})();
