/**
 * Renderização dos modelos preditivos para a taxa Selic
 * 
 * Este módulo implementa as funções para renderizar os resultados
 * dos modelos preditivos na interface do usuário.
 */

/**
 * Renderiza os resultados dos modelos preditivos na interface
 * @param {Object} resultados - Resultados dos modelos preditivos
 */
function renderizarModelosPreditivos(resultados) {
    console.log('Renderizando modelos preditivos com resultados:', resultados);
    
    // Verificar se estamos na tab correta
    const modelosTab = document.getElementById('modelos');
    if (!modelosTab) {
        console.error('Tab de modelos preditivos não encontrada');
        return;
    }
    
    // Limpar conteúdo existente
    modelosTab.innerHTML = '';
    
    // Criar estrutura básica
    const container = document.createElement('div');
    container.className = 'modelos-container';
    container.innerHTML = `
        <h2>Modelos Preditivos para a Taxa Selic</h2>
        <p class="data-referencia">Dados atualizados em: ${resultados.modelos.regressaoLinear.dataReferencia}</p>
        
        <div class="previsao-section">
            <h3>Próxima Reunião - Previsão</h3>
            <p class="data-previsao">Previsão para: ${resultados.proximaReuniao.data} (${resultados.proximaReuniao.reuniao} Reunião)</p>
            
            <div class="previsao-principal">
                <div class="decisao-prevista">${textoDecisao(resultados.proximaReuniao.previsaoConsolidada)}</div>
                <div class="taxa-prevista">Taxa Selic prevista: ${resultados.taxaPrevista.toFixed(2)}%</div>
            </div>
            
            <div class="probabilidades-container">
                <h4>Probabilidades:</h4>
                <div class="probabilidades-grid" id="probabilidades-grid"></div>
            </div>
        </div>
        
        <div class="modelos-grid" id="modelos-grid"></div>
        
        <div class="indicadores-section">
            <h3>Indicadores Econômicos Utilizados</h3>
            <div class="indicadores-grid" id="indicadores-grid"></div>
        </div>
        
        <div class="historico-section">
            <h3>Histórico Recente de Decisões</h3>
            <div class="historico-table-container">
                <table class="historico-table">
                    <thead>
                        <tr>
                            <th>Reunião</th>
                            <th>Data</th>
                            <th>Taxa Selic</th>
                            <th>Decisão</th>
                        </tr>
                    </thead>
                    <tbody id="historico-body"></tbody>
                </table>
            </div>
        </div>
    `;
    
    modelosTab.appendChild(container);
    
    // Renderizar probabilidades consolidadas
    renderizarProbabilidades(resultados.proximaReuniao.probabilidades);
    
    // Renderizar cards de modelos
    renderizarModelosCards(resultados.modelos);
    
    // Renderizar indicadores econômicos
    renderizarIndicadores(resultados.indicadores);
    
    // Renderizar histórico de decisões
    renderizarHistorico(resultados.historicoDecisoes);
    
    // Adicionar estilos específicos
    adicionarEstilos();
}

/**
 * Renderiza as probabilidades na interface
 * @param {Object} probabilidades - Probabilidades para cada decisão
 */
function renderizarProbabilidades(probabilidades) {
    const container = document.getElementById('probabilidades-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    const decisoes = [
        { id: 'reducao50', texto: 'Redução de 50pb', cor: '#3498db' },
        { id: 'reducao25', texto: 'Redução de 25pb', cor: '#2ecc71' },
        { id: 'manutencao', texto: 'Manutenção', cor: '#f1c40f' },
        { id: 'aumento25', texto: 'Aumento de 25pb', cor: '#e67e22' },
        { id: 'aumento50', texto: 'Aumento de 50pb', cor: '#e74c3c' }
    ];
    
    decisoes.forEach(decisao => {
        const prob = probabilidades[decisao.id] || 0;
        const porcentagem = (prob * 100).toFixed(0);
        
        const item = document.createElement('div');
        item.className = 'probabilidade-item';
        item.innerHTML = `
            <div class="probabilidade-barra-container">
                <div class="probabilidade-barra" style="width: ${porcentagem}%; background-color: ${decisao.cor};"></div>
            </div>
            <div class="probabilidade-info">
                <span class="probabilidade-texto">${decisao.texto}</span>
                <span class="probabilidade">${porcentagem}%</span>
            </div>
        `;
        
        container.appendChild(item);
    });
}

/**
 * Renderiza os cards de modelos na interface
 * @param {Object} modelos - Modelos preditivos
 */
function renderizarModelosCards(modelos) {
    const container = document.getElementById('modelos-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    for (const [id, modelo] of Object.entries(modelos)) {
        const card = document.createElement('div');
        card.className = 'modelo-card';
        card.innerHTML = `
            <div class="modelo-header">
                <h4>${modelo.nome}</h4>
                <span class="data-referencia">Ref: ${modelo.dataReferencia}</span>
            </div>
            <p class="modelo-descricao">${modelo.descricao}</p>
            <div class="modelo-previsao">
                <strong>Previsão:</strong> ${textoDecisao(modelo.previsao)}
            </div>
            <div class="modelo-probabilidades" id="prob-${id}"></div>
        `;
        
        container.appendChild(card);
        
        // Renderizar mini-gráfico de probabilidades
        const probContainer = card.querySelector(`#prob-${id}`);
        if (probContainer) {
            renderizarMiniProbabilidades(probContainer, modelo.probabilidades);
        }
    }
}

/**
 * Renderiza mini-gráficos de probabilidades nos cards de modelos
 * @param {HTMLElement} container - Container para o gráfico
 * @param {Object} probabilidades - Probabilidades para cada decisão
 */
function renderizarMiniProbabilidades(container, probabilidades) {
    const decisoes = [
        { id: 'reducao50', cor: '#3498db' },
        { id: 'reducao25', cor: '#2ecc71' },
        { id: 'manutencao', cor: '#f1c40f' },
        { id: 'aumento25', cor: '#e67e22' },
        { id: 'aumento50', cor: '#e74c3c' }
    ];
    
    const barras = document.createElement('div');
    barras.className = 'mini-probabilidades';
    
    decisoes.forEach(decisao => {
        const prob = probabilidades[decisao.id] || 0;
        const porcentagem = (prob * 100).toFixed(0);
        
        const barra = document.createElement('div');
        barra.className = 'mini-prob-barra';
        barra.style.width = `${porcentagem}%`;
        barra.style.backgroundColor = decisao.cor;
        barra.title = `${decisao.id}: ${porcentagem}%`;
        
        barras.appendChild(barra);
    });
    
    container.appendChild(barras);
}

/**
 * Renderiza os indicadores econômicos na interface
 * @param {Object} indicadores - Indicadores econômicos
 */
function renderizarIndicadores(indicadores) {
    const container = document.getElementById('indicadores-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    const indicadoresInfo = [
        { id: 'ipca', nome: 'IPCA', formato: '0.00%', cor: '#e74c3c' },
        { id: 'ipcaE12m', nome: 'IPCA E(12m)', formato: '0.00%', cor: '#e67e22' },
        { id: 'hiato', nome: 'Hiato do Produto', formato: '0.00%', cor: '#f1c40f' },
        { id: 'cambio', nome: 'USD/BRL', formato: '0.00', cor: '#2ecc71' },
        { id: 'cambioDelta', nome: 'Δ Câmbio', formato: '0.00%', cor: '#3498db' },
        { id: 'jurosEUA', nome: 'Juros EUA', formato: '0.00%', cor: '#9b59b6' },
        { id: 'commodities', nome: 'Índice Commodities', formato: '0.00%', cor: '#1abc9c' },
        { id: 'confConsumidor', nome: 'Confiança do Consumidor', formato: '0.0', cor: '#34495e' },
        { id: 'vix', nome: 'VIX', formato: '0.0', cor: '#7f8c8d' }
    ];
    
    indicadoresInfo.forEach(info => {
        const valor = indicadores[info.id];
        
        const item = document.createElement('div');
        item.className = 'indicador-item';
        item.innerHTML = `
            <div class="indicador-nome">${info.nome}</div>
            <div class="indicador-valor" style="color: ${info.cor};">
                ${formatarValor(valor, info.formato)}
            </div>
        `;
        
        container.appendChild(item);
    });
}

/**
 * Renderiza o histórico de decisões na interface
 * @param {Array} historico - Histórico de decisões
 */
function renderizarHistorico(historico) {
    const container = document.getElementById('historico-body');
    if (!container) return;
    
    container.innerHTML = '';
    
    historico.forEach(decisao => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${decisao.reuniao}</td>
            <td>${decisao.data}</td>
            <td>${decisao.taxa.toFixed(2)}%</td>
            <td>${decisao.decisao}</td>
        `;
        
        container.appendChild(row);
    });
}

/**
 * Adiciona estilos específicos para os modelos preditivos
 */
function adicionarEstilos() {
    // Verificar se os estilos já existem
    if (document.getElementById('modelos-preditivos-styles')) return;
    
    const estilos = document.createElement('style');
    estilos.id = 'modelos-preditivos-styles';
    estilos.textContent = `
        .modelos-container {
            padding: 20px;
            color: #e2e8f0;
        }
        
        .modelos-container h2 {
            margin-bottom: 10px;
            color: #f8f9fa;
        }
        
        .data-referencia, .data-previsao {
            color: #a0aec0;
            font-size: 0.9em;
            margin-bottom: 20px;
        }
        
        .previsao-section {
            background-color: #2d3748;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
        }
        
        .previsao-principal {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .decisao-prevista {
            font-size: 1.5em;
            font-weight: bold;
            color: #f8f9fa;
        }
        
        .taxa-prevista {
            font-size: 1.2em;
            color: #f8f9fa;
        }
        
        .probabilidades-container h4 {
            margin-bottom: 10px;
        }
        
        .probabilidades-grid {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .probabilidade-item {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        
        .probabilidade-barra-container {
            width: 100%;
            height: 20px;
            background-color: #4a5568;
            border-radius: 4px;
            overflow: hidden;
        }
        
        .probabilidade-barra {
            height: 100%;
            transition: width 0.5s ease;
        }
        
        .probabilidade-info {
            display: flex;
            justify-content: space-between;
        }
        
        .modelos-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .modelo-card {
            background-color: #2d3748;
            border-radius: 8px;
            padding: 15px;
            display: flex;
            flex-direction: column;
        }
        
        .modelo-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .modelo-header h4 {
            margin: 0;
            color: #f8f9fa;
        }
        
        .modelo-descricao {
            color: #a0aec0;
            font-size: 0.9em;
            margin-bottom: 15px;
            flex-grow: 1;
        }
        
        .modelo-previsao {
            margin-bottom: 10px;
        }
        
        .mini-probabilidades {
            display: flex;
            height: 10px;
            border-radius: 4px;
            overflow: hidden;
        }
        
        .mini-prob-barra {
            height: 100%;
        }
        
        .indicadores-section {
            margin-bottom: 30px;
        }
        
        .indicadores-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 15px;
        }
        
        .indicador-item {
            background-color: #2d3748;
            border-radius: 8px;
            padding: 15px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        .indicador-nome {
            font-size: 0.9em;
            color: #a0aec0;
            margin-bottom: 5px;
        }
        
        .indicador-valor {
            font-size: 1.2em;
            font-weight: bold;
        }
        
        .historico-table-container {
            overflow-x: auto;
        }
        
        .historico-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .historico-table th, .historico-table td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #4a5568;
        }
        
        .historico-table th {
            background-color: #2d3748;
            color: #f8f9fa;
        }
        
        .historico-table tr:hover {
            background-color: #2d3748;
        }
    `;
    
    document.head.appendChild(estilos);
}

/**
 * Formata um valor de acordo com o formato especificado
 * @param {number} valor - Valor a ser formatado
 * @param {string} formato - Formato desejado
 * @returns {string} Valor formatado
 */
function formatarValor(valor, formato) {
    if (formato.includes('%')) {
        return `${valor.toFixed(formato.includes('.00') ? 2 : 1)}%`;
    }
    
    return valor.toFixed(formato.includes('.00') ? 2 : 1);
}

/**
 * Retorna o texto descritivo da decisão
 * @param {string} decisao - Código da decisão
 * @returns {string} Texto descritivo
 */
function textoDecisao(decisao) {
    const textos = {
        'reducao50': 'Redução de 50 pontos-base',
        'reducao25': 'Redução de 25 pontos-base',
        'manutencao': 'Manutenção da taxa',
        'aumento25': 'Aumento de 25 pontos-base',
        'aumento50': 'Aumento de 50 pontos-base'
    };
    
    return textos[decisao] || 'Decisão indefinida';
}

// Exportar função para uso global
window.renderizarModelosPreditivos = renderizarModelosPreditivos;
