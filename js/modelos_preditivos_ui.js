// js/modelos_preditivos_ui.js

/**
 * Renderiza a aba de Modelos Preditivos no COPOM Dashboard
 * @param {Object} resultados - Dados retornados pelos modelos
 */
function renderizarModelosPreditivos(resultados) {
    console.log("[COPOM Dashboard] Renderizando Modelos Preditivos...");

    const container = document.getElementById('modelos-preditivos');
    if (!container) {
        console.error("Tab de modelos preditivos não encontrada.");
        return;
    }

    container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'modelos-wrapper';
    wrapper.innerHTML = `
        <h2>Modelos Preditivos</h2>
        <p class="data-referencia">Atualizado em: ${resultados.modelos.regressaoLinear.dataReferencia}</p>

        <div class="previsao-principal">
            <h3>Próxima Reunião (${resultados.proximaReuniao.data})</h3>
            <p><strong>Decisão Consolidada:</strong> ${textoDecisao(resultados.proximaReuniao.previsaoConsolidada)}</p>
            <p><strong>Taxa Selic Prevista:</strong> ${resultados.taxaPrevista.toFixed(2)}%</p>
        </div>

        <div class="modelos-grid">
            ${Object.values(resultados.modelos).map(modelo => `
                <div class="modelo-card">
                    <h4>${modelo.nome}</h4>
                    <p>${modelo.descricao}</p>
                    <p><strong>Previsão:</strong> ${textoDecisao(modelo.previsao)}</p>
                </div>
            `).join('')}
        </div>
    `;

    container.appendChild(wrapper);
}

/**
 * Função para traduzir código de decisão para texto
 * @param {string} decisao
 * @returns {string}
 */
function textoDecisao(decisao) {
    const mapa = {
        reducao50: "Redução de 50 pontos-base",
        reducao25: "Redução de 25 pontos-base",
        manutencao: "Manutenção da taxa",
        aumento25: "Aumento de 25 pontos-base",
        aumento50: "Aumento de 50 pontos-base"
    };
    return mapa[decisao] || "Decisão indefinida";
}

// Disponibilizar no escopo global
window.renderizarModelosPreditivos = renderizarModelosPreditivos;
