// js/modelos_avancados_ui.js

(function () {
    function renderizarModelosAvancados(resultados) {
        const container = document.getElementById("modelos-avancados");
        if (!container) {
            console.error("Container modelos-avancados não encontrado.");
            return;
        }

        if (!resultados) {
            console.warn("Resultados dos modelos avançados não encontrados. Exibindo aviso.");
            container.innerHTML = `
                <div class="alert alert-warning mt-4" role="alert">
                    Dados dos modelos avançados não disponíveis no momento. Atualize o sistema ou verifique as integrações.
                </div>
            `;
            return;
        }

        const { modelos, proximaReuniao, taxaPrevista } = resultados;

        container.innerHTML = `
            <h2>Modelos Avançados</h2>
            ${proximaReuniao ? `<h5 class="mt-3">Próxima Reunião (${proximaReuniao.data})</h5>` : ""}
            ${taxaPrevista !== undefined ? `<p><strong>Taxa Selic Prevista:</strong> ${taxaPrevista.toFixed(2)}%</p>` : ""}
            
            <div class="row mt-4">
                ${modelos ? Object.values(modelos).map(modelo => `
                    <div class="col-md-6 mb-4">
                        <div class="card bg-dark text-white h-100">
                            <div class="card-body">
                                <h5 class="card-title">${modelo.nome || "Modelo Sem Nome"}</h5>
                                <p class="card-text">${modelo.descricao || "Descrição indisponível."}</p>
                                ${modelo.resultados && modelo.resultados.decisao ? `
                                    <p><strong>Decisão Sugerida:</strong> ${modelo.resultados.decisao}</p>
                                ` : `
                                    <p><em>Modelo ainda não inicializado.</em></p>
                                `}
                            </div>
                        </div>
                    </div>
                `).join('') : `
                    <p><em>Modelos ainda não disponíveis.</em></p>
                `}
            </div>
        `;
    }

    window.renderizarModelosAvancados = renderizarModelosAvancados;
})();
