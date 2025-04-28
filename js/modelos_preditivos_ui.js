// js/modelos_preditivos_ui.js

(function () {
    function renderizarModelosPreditivosInterno(resultados) {
        console.log('[COPOM Dashboard] Renderizando Modelos Preditivos...');

        const container = document.getElementById('modelos-preditivos');
        if (!container) {
            console.error('Tab de modelos preditivos não encontrada.');
            return;
        }

        if (!resultados || !resultados.decisaoPrevista) {
            console.warn('Resultados dos modelos preditivos não encontrados.');
            container.innerHTML = `
                <div class="alert alert-warning mt-4">
                    Resultados dos modelos preditivos não disponíveis.
                </div>
            `;
            return;
        }

        const previsao = resultados.decisaoPrevista;
        const taxaPrevista = resultados.taxaPrevista?.toFixed(2) || '-';
        const dataReferencia = resultados.dataReferencia || '-';

        container.innerHTML = `
            <div class="modelos-preditivos-container">
                <h2>Modelos Preditivos</h2>
                <p><strong>Data de Referência:</strong> ${dataReferencia}</p>
                <p><strong>Previsão de Decisão:</strong> ${textoDecisao(previsao)}</p>
                <p><strong>Taxa Selic Prevista:</strong> ${taxaPrevista}%</p>
            </div>
        `;
    }

    function textoDecisao(decisao) {
        const textos = {
            'reducao50': 'Redução de 50 pontos-base',
            'reducao25': 'Redução de 25 pontos-base',
            'manutencao': 'Manutenção da taxa',
            'aumento25': 'Aumento de 25 pontos-base',
            'aumento50': 'Aumento de 50 pontos-base'
        };
        return textos[decisao] || 'Indefinida';
    }

    // Expor para o global
    window.renderizarModelosPreditivos = function () {
        if (!window.modelosPreditivos) {
            console.error('[COPOM Dashboard] ModelosPreditivos ainda não carregados.');
            return;
        }
        const resultados = window.modelosPreditivos.getResultados();
        renderizarModelosPreditivosInterno(resultados);
    };
})();
