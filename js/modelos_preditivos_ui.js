(function () {
    function renderizarModelosPreditivos(resultados) {
        const container = document.getElementById('modelos-preditivos');
        if (!container) return;

        const previsao = resultados.proximaReuniao.previsaoConsolidada;
        const taxa = resultados.taxaPrevista?.toFixed(2) || '-';

        container.innerHTML = `
            <div class="modelos-preditivos-container">
                <h2>Modelos Preditivos</h2>
                <p><strong>Previsão Consolidada:</strong> ${previsao || 'Indefinida'}</p>
                <p><strong>Taxa Selic Prevista:</strong> ${taxa}%</p>
            </div>
        `;
    }

    window.renderizarModelosPreditivos = function () {
        if (!window.modelosPreditivos) return;
        const resultados = window.modelosPreditivos.getResultados();
        renderizarModelosPreditivos(resultados);
    };
})();
