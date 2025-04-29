// js/modelos_preditivos_ui.js

(function () {
    function renderizarModelosPreditivos(resultados) {
        const container = document.getElementById('modelos-preditivos');
        if (!container) return;

        if (!resultados || !resultados.proximaReuniao) {
            container.innerHTML = `<div class="alert alert-warning mt-4">Resultados indisponíveis.</div>`;
            return;
        }

        const previsao = resultados.proximaReuniao.previsaoConsolidada;
        const taxaPrevista = resultados.taxaPrevista?.toFixed(2) || '-';

        container.innerHTML = `
            <div class="card">
                <h2>Modelos Preditivos</h2>
                <p><strong>Previsão Consolidada:</strong> ${previsao}</p>
                <p><strong>Taxa Selic Prevista:</strong> ${taxaPrevista}%</p>
            </div>
        `;
    }

    window.renderizarModelosPreditivos = function () {
        const resultados = window.modelosPreditivos.getResultados();
        renderizarModelosPreditivos(resultados);
    };
})();