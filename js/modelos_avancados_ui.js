// js/modelos_avancados_ui.js

(function () {
    function renderizarModelosAvancados(resultados) {
        const container = document.getElementById("modelos-avancados");
        if (!container) {
            console.error("Container modelos-avancados não encontrado.");
            return;
        }

        const { modelos, proximaReuniao, taxaPrevista } = resultados;

        container.innerHTML = `
            <h2>Modelos Avançados</h2>
            <h5 class="mt-3">Próxima Reunião (${proximaReuniao.data})</h5>
            <p><strong>Taxa Selic Prevista:</strong> ${taxaPrevista.toFixed(2)}%</p>
            
            <div class="row mt-4">
                ${Object.values(modelos).map(modelo => `
                    <div class="col-md-6 mb-4">
                        <div class="card bg-dark text-white h-100">
                            <div class="card-body">
                                <h5 class="card-title">${modelo.nome}</h5>
                                <p class="card-text">${modelo.descricao}</p>
                                ${modelo.resultados ? `
                                    <p><strong>Decisão Sugerida:</strong> ${modelo.resultados.decisao}</p>
                                ` : `
                                    <p><em>Modelo ainda não inicializado.</em></p>
                                `}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    window.renderizarModelosAvancados = renderizarModelosAvancados;
})();
