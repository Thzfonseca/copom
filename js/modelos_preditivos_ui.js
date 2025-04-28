/**
 * Interface dos Modelos Preditivos
 * 
 * Renderiza os modelos preditivos na tela.
 */

(function () {
    function renderizarModelosPreditivos() {
        console.log('Renderizando Modelos Preditivos...');

        // Verifica se existem resultados
        if (!window.modelosPreditivos || !window.modelosPreditivos.resultados) {
            console.error('Resultados dos modelos preditivos não encontrados.');
            return;
        }

        const resultados = window.modelosPreditivos.getResultados();
        const container = document.getElementById('modelos-preditivos');

        if (!container) {
            console.error('Tab de modelos preditivos não encontrada');
            return;
        }

        // Limpa o container
        container.innerHTML = '';

        // Header
        const header = document.createElement('div');
        header.innerHTML = `
            <h2>Modelos Preditivos - Próxima Reunião</h2>
            <p><strong>Data:</strong> ${resultados.proximaReuniao.data} (${resultados.proximaReuniao.reuniao})</p>
            <p><strong>Taxa Selic prevista:</strong> ${resultados.taxaPrevista.toFixed(2)}%</p>
            <p><strong>Previsão consolidada:</strong> ${textoDecisao(resultados.proximaReuniao.previsaoConsolidada)}</p>
        `;
        container.appendChild(header);

        // Cards de Modelos
        const grid = document.createElement('div');
        grid.className = 'grid-modelos-preditivos';

        Object.values(resultados.modelos).forEach(modelo => {
            const card = document.createElement('div');
            card.className = 'modelo-card';

            card.innerHTML = `
                <h3>${modelo.nome}</h3>
                <p>${modelo.descricao}</p>
                <p><strong>Previsão:</strong> ${textoDecisao(modelo.previsao)}</p>
                <p><strong>Atualizado em:</strong> ${modelo.dataReferencia}</p>
            `;

            grid.appendChild(card);
        });

        container.appendChild(grid);

        adicionarEstilos();
    }

    function textoDecisao(decisao) {
        const textos = {
            'reducao50': 'Redução de 50 pontos-base',
            'reducao25': 'Redução de 25 pontos-base',
            'manutencao': 'Manutenção da taxa',
            'aumento25': 'Aumento de 25 pontos-base',
            'aumento50': 'Aumento de 50 pontos-base'
        };
        return textos[decisao] || 'Indefinido';
    }

    function adicionarEstilos() {
        if (document.getElementById('estilos-modelos-preditivos')) return;

        const estilo = document.createElement('style');
        estilo.id = 'estilos-modelos-preditivos';
        estilo.textContent = `
            .grid-modelos-preditivos {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 20px;
                margin-top: 20px;
            }

            .modelo-card {
                background: #2d3748;
                padding: 20px;
                border-radius: 8px;
                color: #e2e8f0;
                box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                transition: 0.3s;
            }

            .modelo-card:hover {
                background: #4a5568;
            }

            .modelo-card h3 {
                margin-top: 0;
                color: #f8f9fa;
            }

            .modelo-card p {
                font-size: 0.9em;
            }
        `;
        document.head.appendChild(estilo);
    }

    // Disponibiliza a função globalmente
    window.renderizarModelosPreditivos = renderizarModelosPreditivos;
})();
