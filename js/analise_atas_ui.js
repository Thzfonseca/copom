/**
 * Renderização da análise NLP das atas do COPOM
 * 
 * Este módulo implementa as funções para renderizar os resultados
 * da análise de processamento de linguagem natural das atas do COPOM.
 */

/**
 * Renderiza os resultados da análise NLP na interface
 * @param {Object} resultados - Resultados da análise NLP
 */
function renderizarAnaliseAtas(resultados) {
    console.log('Renderizando análise NLP com resultados:', resultados);
    
    // Verificar se estamos na tab correta
    const analiseTab = document.getElementById('analise-nlp');
    if (!analiseTab) {
        console.error('Tab de análise NLP não encontrada');
        return;
    }
    
    // Limpar conteúdo existente
    analiseTab.innerHTML = '';
    
    // Criar estrutura básica
    const container = document.createElement('div');
    container.className = 'analise-container';
    container.innerHTML = `
        <h2>Análise NLP das Atas do COPOM</h2>
        <div class="analise-header">
            <p class="data-referencia">Dados atualizados em: ${resultados.ultimaAtualizacao}</p>
            <p class="info-analise">Total de atas analisadas: ${resultados.totalAtasAnalisadas}</p>
        </div>
        
        <div class="analise-grid">
            <div class="analise-card sentimento-card">
                <h3>Análise de Sentimento</h3>
                <div class="sentimento-container" id="sentimento-container"></div>
                <div class="tendencia-container">
                    <h4>Tendência de Comunicação</h4>
                    <div class="tendencia-item">
                        <span class="tendencia-label">Curto prazo:</span>
                        <span class="tendencia-valor ${resultados.resultados.tendencia.curto}">${resultados.resultados.tendencia.curto}</span>
                    </div>
                    <div class="tendencia-item">
                        <span class="tendencia-label">Médio prazo:</span>
                        <span class="tendencia-valor ${resultados.resultados.tendencia.medio}">${resultados.resultados.tendencia.medio}</span>
                    </div>
                    <div class="tendencia-item">
                        <span class="tendencia-label">Longo prazo:</span>
                        <span class="tendencia-valor ${resultados.resultados.tendencia.longo}">${resultados.resultados.tendencia.longo}</span>
                    </div>
                </div>
            </div>
            
            <div class="analise-card palavras-card">
                <h3>Palavras-Chave</h3>
                <div class="palavras-container" id="palavras-container"></div>
            </div>
            
            <div class="analise-card topicos-card">
                <h3>Tópicos Relevantes</h3>
                <div class="topicos-container" id="topicos-container"></div>
            </div>
            
            <div class="analise-card evolucao-card">
                <h3>Evolução Temporal do Sentimento</h3>
                <div class="evolucao-container" id="evolucao-container"></div>
            </div>
            
            <div class="analise-card forward-card">
                <h3>Forward Guidance</h3>
                <div class="forward-container" id="forward-container"></div>
            </div>
            
            <div class="analise-card previsao-card">
                <h3>Previsão para Próxima Reunião</h3>
                <div class="previsao-container">
                    <div class="previsao-header">
                        <div class="previsao-data">${resultados.proximaReuniao.data} (${resultados.proximaReuniao.reuniao} Reunião)</div>
                        <div class="previsao-confianca">Confiança: ${(resultados.resultados.previsaoProximaReuniao.confianca * 100).toFixed(0)}%</div>
                    </div>
                    <div class="previsao-decisao">${textoDecisao(resultados.resultados.previsaoProximaReuniao.decisao)}</div>
                    <div class="previsao-taxa">Taxa Selic prevista: ${(resultados.historicoDecisoes[0].taxa + getAjusteTaxa(resultados.resultados.previsaoProximaReuniao.decisao)).toFixed(2)}%</div>
                    <div class="previsao-probabilidades" id="previsao-probabilidades"></div>
                </div>
            </div>
            
            <div class="analise-card metricas-card">
                <h3>Métricas de Análise</h3>
                <div class="metricas-container">
                    <div class="metrica-item">
                        <div class="metrica-nome">Precisão histórica</div>
                        <div class="metrica-valor">${(resultados.metricas.precisaoHistorica * 100).toFixed(0)}%</div>
                    </div>
                    <div class="metrica-item">
                        <div class="metrica-nome">Correlação sentimento-decisão</div>
                        <div class="metrica-valor">${(resultados.metricas.correlacaoSentimentoDecisao * 100).toFixed(0)}%</div>
                    </div>
                    <div class="metrica-item">
                        <div class="metrica-nome">Consistência forward guidance</div>
                        <div class="metrica-valor">${(resultados.metricas.consistenciaForwardGuidance * 100).toFixed(0)}%</div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="analise-busca">
            <h3>Busca em Atas</h3>
            <div class="busca-container">
                <div class="busca-form">
                    <input type="text" id="busca-termo" placeholder="Digite um termo para buscar nas atas...">
                    <button id="btn-buscar">Buscar</button>
                </div>
                <div class="busca-resultados" id="busca-resultados"></div>
            </div>
        </div>
    `;
    
    analiseTab.appendChild(container);
    
    // Renderizar componentes
    renderizarSentimento(resultados.resultados.sentimento);
    renderizarPalavrasChave(resultados.resultados.palavrasChave);
    renderizarTopicos(resultados.resultados.topicos);
    renderizarEvolucaoTemporal(resultados.resultados.evolucaoTemporal);
    renderizarForwardGuidance(resultados.resultados.forwardGuidance);
    renderizarProbabilidades(resultados.resultados.previsaoProximaReuniao.probabilidades);
    
    // Adicionar event listeners
    adicionarEventListeners();
    
    // Adicionar estilos
    adicionarEstilos();
}

/**
 * Renderiza o gráfico de sentimento
 * @param {Object} sentimento - Dados de sentimento
 */
function renderizarSentimento(sentimento) {
    const container = document.getElementById('sentimento-container');
    if (!container) return;
    
    const total = sentimento.hawkish + sentimento.neutral + sentimento.dovish;
    
    const hawkishWidth = (sentimento.hawkish / total * 100).toFixed(0);
    const neutralWidth = (sentimento.neutral / total * 100).toFixed(0);
    const dovishWidth = (sentimento.dovish / total * 100).toFixed(0);
    
    container.innerHTML = `
        <div class="sentimento-barras">
            <div class="sentimento-barra hawkish" style="width: ${hawkishWidth}%" title="Hawkish: ${hawkishWidth}%"></div>
            <div class="sentimento-barra neutral" style="width: ${neutralWidth}%" title="Neutral: ${neutralWidth}%"></div>
            <div class="sentimento-barra dovish" style="width: ${dovishWidth}%" title="Dovish: ${dovishWidth}%"></div>
        </div>
        <div class="sentimento-legenda">
            <div class="legenda-item">
                <span class="legenda-cor hawkish"></span>
                <span class="legenda-texto">Hawkish: ${hawkishWidth}%</span>
            </div>
            <div class="legenda-item">
                <span class="legenda-cor neutral"></span>
                <span class="legenda-texto">Neutral: ${neutralWidth}%</span>
            </div>
            <div class="legenda-item">
                <span class="legenda-cor dovish"></span>
                <span class="legenda-texto">Dovish: ${dovishWidth}%</span>
            </div>
        </div>
    `;
}

/**
 * Renderiza as palavras-chave
 * @param {Array} palavrasChave - Lista de palavras-chave
 */
function renderizarPalavrasChave(palavrasChave) {
    const container = document.getElementById('palavras-container');
    if (!container) return;
    
    // Ordenar palavras por contagem
    const palavrasOrdenadas = [...palavrasChave].sort((a, b) => b.contagem - a.contagem);
    
    // Criar tabela
    const tabela = document.createElement('table');
    tabela.className = 'palavras-tabela';
    
    // Cabeçalho
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Termo</th>
            <th>Contagem</th>
            <th>Sentimento</th>
            <th>Variação</th>
        </tr>
    `;
    tabela.appendChild(thead);
    
    // Corpo
    const tbody = document.createElement('tbody');
    
    palavrasOrdenadas.forEach(palavra => {
        const row = document.createElement('tr');
        row.className = `sentimento-${palavra.sentimento}`;
        
        // Determinar classe para variação
        let variacaoClass = '';
        if (palavra.variacao.startsWith('+')) variacaoClass = 'variacao-positiva';
        else if (palavra.variacao.startsWith('-')) variacaoClass = 'variacao-negativa';
        
        row.innerHTML = `
            <td class="palavra-termo">${palavra.termo}</td>
            <td class="palavra-contagem">${palavra.contagem}</td>
            <td class="palavra-sentimento">${palavra.sentimento}</td>
            <td class="palavra-variacao ${variacaoClass}">${palavra.variacao}</td>
        `;
        
        tbody.appendChild(row);
    });
    
    tabela.appendChild(tbody);
    container.appendChild(tabela);
}

/**
 * Renderiza os tópicos relevantes
 * @param {Array} topicos - Lista de tópicos
 */
function renderizarTopicos(topicos) {
    const container = document.getElementById('topicos-container');
    if (!container) return;
    
    // Ordenar tópicos por relevância
    const topicosOrdenados = [...topicos].sort((a, b) => b.relevancia - a.relevancia);
    
    topicosOrdenados.forEach(topico => {
        const item = document.createElement('div');
        item.className = `topico-item sentimento-${topico.sentimento}`;
        
        const relevanciaWidth = (topico.relevancia * 100).toFixed(0);
        
        item.innerHTML = `
            <div class="topico-header">
                <span class="topico-nome">${topico.nome}</span>
                <span class="topico-relevancia">${relevanciaWidth}%</span>
            </div>
            <div class="topico-barra-container">
                <div class="topico-barra" style="width: ${relevanciaWidth}%"></div>
            </div>
        `;
        
        container.appendChild(item);
    });
}

/**
 * Renderiza a evolução temporal do sentimento
 * @param {Array} evolucao - Dados de evolução temporal
 */
function renderizarEvolucaoTemporal(evolucao) {
    const container = document.getElementById('evolucao-container');
    if (!container) return;
    
    // Criar gráfico simplificado
    const grafico = document.createElement('div');
    grafico.className = 'evolucao-grafico';
    
    // Inverter array para mostrar do mais antigo para o mais recente
    const dadosInvertidos = [...evolucao].reverse();
    
    dadosInvertidos.forEach(item => {
        const coluna = document.createElement('div');
        coluna.className = 'evolucao-coluna';
        
        const hawkishHeight = (item.hawkish * 100).toFixed(0);
        const neutralHeight = (item.neutral * 100).toFixed(0);
        const dovishHeight = (item.dovish * 100).toFixed(0);
        
        coluna.innerHTML = `
            <div class="evolucao-barras">
                <div class="evolucao-barra hawkish" style="height: ${hawkishHeight}%" title="Hawkish: ${hawkishHeight}%"></div>
                <div class="evolucao-barra neutral" style="height: ${neutralHeight}%" title="Neutral: ${neutralHeight}%"></div>
                <div class="evolucao-barra dovish" style="height: ${dovishHeight}%" title="Dovish: ${dovishHeight}%"></div>
            </div>
            <div class="evolucao-data">${formatarData(item.data)}</div>
        `;
        
        grafico.appendChild(coluna);
    });
    
    container.appendChild(grafico);
    
    // Adicionar legenda
    const legenda = document.createElement('div');
    legenda.className = 'evolucao-legenda';
    legenda.innerHTML = `
        <div class="legenda-item">
            <span class="legenda-cor hawkish"></span>
            <span class="legenda-texto">Hawkish</span>
        </div>
        <div class="legenda-item">
            <span class="legenda-cor neutral"></span>
            <span class="legenda-texto">Neutral</span>
        </div>
        <div class="legenda-item">
            <span class="legenda-cor dovish"></span>
            <span class="legenda-texto">Dovish</span>
        </div>
    `;
    
    container.appendChild(legenda);
}

/**
 * Renderiza o forward guidance
 * @param {Array} forwardGuidance - Lista de forward guidance
 */
function renderizarForwardGuidance(forwardGuidance) {
    const container = document.getElementById('forward-container');
    if (!container) return;
    
    forwardGuidance.forEach(item => {
        const card = document.createElement('div');
        card.className = 'forward-card';
        
        // Determinar classe para impacto
        let impactoClass = 'impacto-medio';
        if (item.impacto === 'alto') impactoClass = 'impacto-alto';
        else if (item.impacto === 'baixo') impactoClass = 'impacto-baixo';
        
        card.innerHTML = `
            <div class="forward-header">
                <span class="forward-data">${formatarData(item.data)}</span>
                <span class="forward-impacto ${impactoClass}">Impacto: ${item.impacto}</span>
            </div>
            <div class="forward-texto">"${item.texto}"</div>
            <div class="forward-interpretacao">${item.interpretacao}</div>
        `;
        
        container.appendChild(card);
    });
}

/**
 * Renderiza as probabilidades de decisão
 * @param {Object} probabilidades - Probabilidades para cada decisão
 */
function renderizarProbabilidades(probabilidades) {
    const container = document.getElementById('previsao-probabilidades');
    if (!container) return;
    
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
                <span class="probabilidade-valor">${porcentagem}%</span>
            </div>
            <div class="probabilidade-texto">${decisao.texto}</div>
        `;
        
        container.appendChild(item);
    });
}

/**
 * Adiciona event listeners aos elementos da análise
 */
function adicionarEventListeners() {
    // Event listener para busca
    const btnBuscar = document.getElementById('btn-buscar');
    const inputTermo = document.getElementById('busca-termo');
    const resultadosContainer = document.getElementById('busca-resultados');
    
    if (btnBuscar && inputTermo && resultadosContainer) {
        btnBuscar.addEventListener('click', () => {
            const termo = inputTermo.value.trim();
            if (!termo) return;
            
            // Verificar se temos acesso ao analisador
            if (!window.analisadorAtas) {
                console.error('Analisador de atas não encontrado');
                return;
            }
            
            // Buscar trechos
            const trechos = window.analisadorAtas.buscarTrechos(termo);
            
            // Exibir resultados
            resultadosContainer.innerHTML = '';
            
            if (trechos.length === 0) {
                resultadosContainer.innerHTML = `
                    <div class="busca-sem-resultados">
                        Nenhum resultado encontrado para "${termo}".
                    </div>
                `;
                return;
            }
            
            trechos.forEach(trecho => {
                const item = document.createElement('div');
                item.className = 'busca-item';
                item.innerHTML = `
                    <div class="busca-header">
                        <span class="busca-data">${formatarData(trecho.data)}</span>
                        <span class="busca-ata">${trecho.ata}</span>
                    </div>
                    <div class="busca-texto">${destacarTermo(trecho.texto, termo)}</div>
                `;
                
                resultadosContainer.appendChild(item);
            });
        });
        
        // Permitir busca ao pressionar Enter
        inputTermo.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                btnBuscar.click();
            }
        });
    }
}

/**
 * Adiciona estilos específicos para a análise NLP
 */
function adicionarEstilos() {
    // Verificar se os estilos já existem
    if (document.getElementById('analise-nlp-styles')) return;
    
    const estilos = document.createElement('style');
    estilos.id = 'analise-nlp-styles';
    estilos.textContent = `
        .analise-container {
            padding: 20px;
            color: #e2e8f0;
        }
        
        .analise-container h2 {
            margin-bottom: 10px;
            color: #f8f9fa;
        }
        
        .analise-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
        }
        
        .data-referencia, .info-analise {
            color: #a0aec0;
            font-size: 0.9em;
        }
        
        .analise-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .analise-card {
            background-color: #2d3748;
            border-radius: 8px;
            padding: 15px;
            display: flex;
            flex-direction: column;
        }
        
        .analise-card h3 {
            margin-top: 0;
            margin-bottom: 15px;
            color: #f8f9fa;
            font-size: 1.1em;
        }
        
        .analise-card h4 {
            margin-top: 15px;
            margin-bottom: 10px;
            color: #f8f9fa;
            font-size: 1em;
        }
        
        /* Estilos para o card de sentimento */
        .sentimento-barras {
            display: flex;
            height: 30px;
            border-radius: 4px;
            overflow: hidden;
        }
        
        .sentimento-barra {
            height: 100%;
        }
        
        .sentimento-barra.hawkish {
            background-color: #e74c3c;
        }
        
        .sentimento-barra.neutral {
            background-color: #f1c40f;
        }
        
        .sentimento-barra.dovish {
            background-color: #2ecc71;
        }
        
        .sentimento-legenda {
            display: flex;
            justify-content: space-between;
            margin-top: 10px;
        }
        
        .legenda-item {
            display: flex;
            align-items: center;
        }
        
        .legenda-cor {
            display: inline-block;
            width: 12px;
            height: 12px;
            margin-right: 5px;
            border-radius: 2px;
        }
        
        .legenda-cor.hawkish {
            background-color: #e74c3c;
        }
        
        .legenda-cor.neutral {
            background-color: #f1c40f;
        }
        
        .legenda-cor.dovish {
            background-color: #2ecc71;
        }
        
        .tendencia-container {
            margin-top: 15px;
        }
        
        .tendencia-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
        }
        
        .tendencia-valor {
            font-weight: bold;
        }
        
        .tendencia-valor.hawkish {
            color: #e74c3c;
        }
        
        .tendencia-valor.neutral {
            color: #f1c40f;
        }
        
        .tendencia-valor.dovish {
            color: #2ecc71;
        }
        
        /* Estilos para o card de palavras-chave */
        .palavras-tabela {
            width: 100%;
            border-collapse: collapse;
        }
        
        .palavras-tabela th, .palavras-tabela td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #4a5568;
        }
        
        .palavras-tabela th {
            color: #f8f9fa;
        }
        
        .palavras-tabela tr.sentimento-hawkish {
            background-color: rgba(231, 76, 60, 0.1);
        }
        
        .palavras-tabela tr.sentimento-neutral {
            background-color: rgba(241, 196, 15, 0.1);
        }
        
        .palavras-tabela tr.sentimento-dovish {
            background-color: rgba(46, 204, 113, 0.1);
        }
        
        .variacao-positiva {
            color: #2ecc71;
        }
        
        .variacao-negativa {
            color: #e74c3c;
        }
        
        /* Estilos para o card de tópicos */
        .topico-item {
            margin-bottom: 15px;
        }
        
        .topico-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
        }
        
        .topico-nome {
            font-weight: bold;
        }
        
        .topico-relevancia {
            color: #a0aec0;
        }
        
        .topico-barra-container {
            width: 100%;
            height: 8px;
            background-color: #4a5568;
            border-radius: 4px;
            overflow: hidden;
        }
        
        .topico-barra {
            height: 100%;
            background-color: #3182ce;
        }
        
        .topico-item.sentimento-hawkish .topico-barra {
            background-color: #e74c3c;
        }
        
        .topico-item.sentimento-neutral .topico-barra {
            background-color: #f1c40f;
        }
        
        .topico-item.sentimento-dovish .topico-barra {
            background-color: #2ecc71;
        }
        
        /* Estilos para o card de evolução temporal */
        .evolucao-grafico {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            height: 150px;
        }
        
        .evolucao-coluna {
            display: flex;
            flex-direction: column;
            align-items: center;
            flex: 1;
        }
        
        .evolucao-barras {
            display: flex;
            flex-direction: column-reverse;
            width: 20px;
            height: 120px;
            background-color: #4a5568;
            border-radius: 4px;
            overflow: hidden;
            position: relative;
        }
        
        .evolucao-barra {
            width: 100%;
            position: absolute;
            bottom: 0;
        }
        
        .evolucao-barra.hawkish {
            background-color: #e74c3c;
            z-index: 3;
        }
        
        .evolucao-barra.neutral {
            background-color: #f1c40f;
            z-index: 2;
        }
        
        .evolucao-barra.dovish {
            background-color: #2ecc71;
            z-index: 1;
        }
        
        .evolucao-data {
            margin-top: 5px;
            font-size: 0.8em;
            color: #a0aec0;
            transform: rotate(-45deg);
            white-space: nowrap;
        }
        
        .evolucao-legenda {
            display: flex;
            justify-content: center;
            margin-top: 20px;
            gap: 15px;
        }
        
        /* Estilos para o card de forward guidance */
        .forward-card {
            background-color: #4a5568;
            border-radius: 6px;
            padding: 10px;
            margin-bottom: 10px;
        }
        
        .forward-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
        }
        
        .forward-data {
            font-size: 0.9em;
            color: #a0aec0;
        }
        
        .forward-impacto {
            font-size: 0.9em;
            font-weight: bold;
        }
        
        .impacto-alto {
            color: #e74c3c;
        }
        
        .impacto-medio {
            color: #f1c40f;
        }
        
        .impacto-baixo {
            color: #2ecc71;
        }
        
        .forward-texto {
            margin-bottom: 5px;
            font-style: italic;
            color: #f8f9fa;
        }
        
        .forward-interpretacao {
            font-size: 0.9em;
            color: #a0aec0;
        }
        
        /* Estilos para o card de previsão */
        .previsao-container {
            display: flex;
            flex-direction: column;
        }
        
        .previsao-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        
        .previsao-data {
            font-size: 0.9em;
            color: #a0aec0;
        }
        
        .previsao-confianca {
            font-size: 0.9em;
            color: #a0aec0;
        }
        
        .previsao-decisao {
            font-size: 1.2em;
            font-weight: bold;
            color: #f8f9fa;
            margin-bottom: 5px;
        }
        
        .previsao-taxa {
            font-size: 1.1em;
            color: #f8f9fa;
            margin-bottom: 15px;
        }
        
        .probabilidade-item {
            margin-bottom: 10px;
        }
        
        .probabilidade-barra-container {
            position: relative;
            width: 100%;
            height: 20px;
            background-color: #4a5568;
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 5px;
        }
        
        .probabilidade-barra {
            height: 100%;
            transition: width 0.5s ease;
        }
        
        .probabilidade-valor {
            position: absolute;
            right: 5px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 0.8em;
            color: white;
            text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
        }
        
        .probabilidade-texto {
            font-size: 0.9em;
            color: #a0aec0;
        }
        
        /* Estilos para o card de métricas */
        .metricas-container {
            display: grid;
            grid-template-columns: 1fr;
            gap: 15px;
        }
        
        .metrica-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .metrica-nome {
            font-size: 0.9em;
            color: #a0aec0;
        }
        
        .metrica-valor {
            font-size: 1.1em;
            font-weight: bold;
            color: #f8f9fa;
        }
        
        /* Estilos para a seção de busca */
        .analise-busca {
            background-color: #2d3748;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
        }
        
        .busca-form {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }
        
        #busca-termo {
            flex: 1;
            padding: 10px;
            border: none;
            border-radius: 4px;
            background-color: #4a5568;
            color: #f8f9fa;
        }
        
        #busca-termo:focus {
            outline: none;
            box-shadow: 0 0 0 2px #3182ce;
        }
        
        #btn-buscar {
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            background-color: #3182ce;
            color: white;
            font-weight: bold;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        
        #btn-buscar:hover {
            background-color: #2c5282;
        }
        
        .busca-sem-resultados {
            padding: 20px;
            text-align: center;
            color: #a0aec0;
        }
        
        .busca-item {
            background-color: #4a5568;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 15px;
        }
        
        .busca-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        
        .busca-data, .busca-ata {
            font-size: 0.9em;
            color: #a0aec0;
        }
        
        .busca-texto {
            line-height: 1.5;
        }
        
        .termo-destacado {
            background-color: rgba(241, 196, 15, 0.3);
            padding: 2px 0;
            border-radius: 2px;
        }
    `;
    
    document.head.appendChild(estilos);
}

/**
 * Formata uma data no formato DD/MM/YYYY
 * @param {string} data - Data no formato original
 * @returns {string} Data formatada
 */
function formatarData(data) {
    // Se a data já estiver no formato DD/MM/YYYY, retorna como está
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
        return data;
    }
    
    // Se a data estiver no formato DD-DD/MM/YYYY, extrai apenas o final
    if (/^\d{2}-\d{2}\/\d{2}\/\d{4}$/.test(data)) {
        return data.split('-')[1];
    }
    
    // Outros formatos, retorna como está
    return data;
}

/**
 * Destaca um termo em um texto
 * @param {string} texto - Texto original
 * @param {string} termo - Termo a ser destacado
 * @returns {string} Texto com termo destacado
 */
function destacarTermo(texto, termo) {
    const regex = new RegExp(termo, 'gi');
    return texto.replace(regex, match => `<span class="termo-destacado">${match}</span>`);
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

/**
 * Retorna o ajuste da taxa com base na decisão
 * @param {string} decisao - Código da decisão
 * @returns {number} Ajuste da taxa
 */
function getAjusteTaxa(decisao) {
    const ajustes = {
        'reducao50': -0.50,
        'reducao25': -0.25,
        'manutencao': 0,
        'aumento25': 0.25,
        'aumento50': 0.50
    };
    
    return ajustes[decisao] || 0;
}

// Exportar função para uso global
window.renderizarAnaliseAtas = renderizarAnaliseAtas;
