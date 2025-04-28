/**
 * Módulo para exibir detalhes dos modelos preditivos para a taxa Selic.
 * 
 * Este módulo implementa as funções para exibir explicações detalhadas,
 * dados utilizados, fontes, resultados, testes de hipótese e mini-relatórios
 * para cada modelo preditivo.
 */

/**
 * Renderiza os detalhes de um modelo específico
 * @param {string} modeloId - ID do modelo a ser exibido
 */
function exibirDetalhesModelo(modeloId) {
    console.log(`Exibindo detalhes do modelo: ${modeloId}`);
    
    // Obter dados do modelo
    const modelo = ModelosPreditivos.getModelo(modeloId);
    if (!modelo) {
        console.error(`Modelo com ID '${modeloId}' não encontrado`);
        return;
    }
    
    // Obter container para os detalhes
    const container = document.getElementById('modelo-detalhes');
    if (!container) {
        console.error('Container para detalhes do modelo não encontrado');
        return;
    }
    
    // Limpar conteúdo existente
    container.innerHTML = '';
    
    // Criar estrutura de detalhes
    const detalhes = document.createElement('div');
    detalhes.className = 'modelo-detalhes';
    detalhes.innerHTML = `
        <div class="modelo-detalhes-header">
            <h3>${modelo.nome}</h3>
            <span class="data-referencia">Dados atualizados em: ${modelo.dataReferencia}</span>
            <button class="btn-fechar-detalhes" onclick="fecharDetalhesModelo()">×</button>
        </div>
        
        <div class="modelo-tabs">
            <button class="modelo-tab active" data-tab="explicacao">Explicação</button>
            <button class="modelo-tab" data-tab="dados">Dados Utilizados</button>
            <button class="modelo-tab" data-tab="resultados">Resultados</button>
            <button class="modelo-tab" data-tab="testes">Testes de Hipótese</button>
            <button class="modelo-tab" data-tab="relatorio">Mini-Relatório</button>
        </div>
        
        <div class="modelo-tab-content active" id="tab-explicacao">
            <h4>Metodologia</h4>
            <p>${modelo.explicacao.metodologia}</p>
            
            <h4>Funcionamento</h4>
            <p>${modelo.explicacao.funcionamento}</p>
            
            <h4>Limitações</h4>
            <p>${modelo.explicacao.limitacoes}</p>
            
            <h4>Referências</h4>
            <ul class="referencias-lista">
                ${modelo.explicacao.referencias.map(ref => `<li>${ref}</li>`).join('')}
            </ul>
        </div>
        
        <div class="modelo-tab-content" id="tab-dados">
            <h4>Variáveis de Entrada</h4>
            <div class="variaveis-grid">
                ${Object.entries(modelo.dados.variaveis).map(([nome, info]) => `
                    <div class="variavel-item">
                        <div class="variavel-nome">${nome}</div>
                        <div class="variavel-valor">${formatarValor(info.valor, info.formato)}</div>
                        <div class="variavel-descricao">${info.descricao}</div>
                    </div>
                `).join('')}
            </div>
            
            <h4>Fontes dos Dados</h4>
            <ul class="fontes-lista">
                ${modelo.dados.fontes.map(fonte => `
                    <li>
                        <strong>${fonte.nome}:</strong> ${fonte.descricao}
                        ${fonte.url ? `<a href="${fonte.url}" target="_blank" class="fonte-link">Acessar</a>` : ''}
                    </li>
                `).join('')}
            </ul>
            
            <h4>Período de Treinamento</h4>
            <p>${modelo.dados.periodoTreinamento}</p>
        </div>
        
        <div class="modelo-tab-content" id="tab-resultados">
            <h4>Previsão para a Próxima Reunião</h4>
            <div class="previsao-box">
                <div class="previsao-decisao">${textoDecisao(modelo.resultados.previsao)}</div>
                <div class="previsao-probabilidade">${(modelo.resultados.probabilidades[modelo.resultados.previsao] * 100).toFixed(1)}% de probabilidade</div>
                <div class="previsao-data">Reunião: ${modelo.resultados.proximaReuniao.data} (${modelo.resultados.proximaReuniao.reuniao})</div>
            </div>
            
            <h4>Probabilidades por Decisão</h4>
            <div class="probabilidades-detalhadas" id="prob-detalhadas-${modeloId}"></div>
            
            <h4>Métricas de Desempenho</h4>
            <div class="metricas-grid">
                ${Object.entries(modelo.resultados.metricas).map(([nome, valor]) => `
                    <div class="metrica-item">
                        <div class="metrica-nome">${nome}</div>
                        <div class="metrica-valor">${typeof valor === 'number' ? valor.toFixed(2) : valor}</div>
                    </div>
                `).join('')}
            </div>
            
            <h4>Histórico de Acertos</h4>
            <div class="historico-acertos-container">
                <div class="historico-acertos-chart" id="historico-chart-${modeloId}"></div>
                <div class="historico-acertos-info">
                    <div class="acertos-total">Total de acertos: ${modelo.resultados.historicoAcertos.acertos}/${modelo.resultados.historicoAcertos.total}</div>
                    <div class="acertos-taxa">${(modelo.resultados.historicoAcertos.acertos / modelo.resultados.historicoAcertos.total * 100).toFixed(1)}% de acertos</div>
                </div>
            </div>
        </div>
        
        <div class="modelo-tab-content" id="tab-testes">
            <h4>Testes de Hipótese</h4>
            <div class="testes-container">
                ${modelo.testes.map(teste => `
                    <div class="teste-item">
                        <div class="teste-header">
                            <div class="teste-nome">${teste.nome}</div>
                            <div class="teste-resultado ${teste.resultado ? 'teste-sucesso' : 'teste-falha'}">
                                ${teste.resultado ? 'Aprovado' : 'Reprovado'}
                            </div>
                        </div>
                        <div class="teste-descricao">${teste.descricao}</div>
                        <div class="teste-detalhes">
                            <strong>p-valor:</strong> ${teste.pValor.toFixed(4)}
                            <strong>Nível de significância:</strong> ${teste.nivelSignificancia}
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <h4>Análise de Robustez</h4>
            <p>${modelo.analiseRobustez}</p>
        </div>
        
        <div class="modelo-tab-content" id="tab-relatorio">
            <h4>Resumo Executivo</h4>
            <p>${modelo.miniRelatorio.resumo}</p>
            
            <h4>Análise Detalhada</h4>
            <p>${modelo.miniRelatorio.analise}</p>
            
            <h4>Conclusões</h4>
            <p>${modelo.miniRelatorio.conclusoes}</p>
            
            <h4>Recomendações</h4>
            <ul class="recomendacoes-lista">
                ${modelo.miniRelatorio.recomendacoes.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
    `;
    
    container.appendChild(detalhes);
    
    // Renderizar gráficos e elementos dinâmicos
    renderizarProbabilidadesDetalhadas(`prob-detalhadas-${modeloId}`, modelo.resultados.probabilidades);
    renderizarHistoricoAcertos(`historico-chart-${modeloId}`, modelo.resultados.historicoAcertos);
    
    // Adicionar event listeners para as tabs
    const tabs = container.querySelectorAll('.modelo-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remover classe active de todas as tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Adicionar classe active à tab clicada
            tab.classList.add('active');
            
            // Esconder todos os conteúdos
            const contents = container.querySelectorAll('.modelo-tab-content');
            contents.forEach(c => c.classList.remove('active'));
            
            // Mostrar o conteúdo correspondente
            const tabId = tab.getAttribute('data-tab');
            const content = container.querySelector(`#tab-${tabId}`);
            if (content) content.classList.add('active');
        });
    });
    
    // Mostrar o container de detalhes
    container.style.display = 'block';
    
    // Adicionar estilos específicos
    adicionarEstilosDetalhes();
}

/**
 * Fecha os detalhes do modelo
 */
function fecharDetalhesModelo() {
    const container = document.getElementById('modelo-detalhes');
    if (container) {
        container.style.display = 'none';
    }
}

/**
 * Renderiza gráfico detalhado de probabilidades
 * @param {string} containerId - ID do container para o gráfico
 * @param {Object} probabilidades - Probabilidades para cada decisão
 */
function renderizarProbabilidadesDetalhadas(containerId, probabilidades) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const decisoes = [
        { id: 'reducao50', texto: 'Redução de 50pb', cor: '#3498db' },
        { id: 'reducao25', texto: 'Redução de 25pb', cor: '#2ecc71' },
        { id: 'manutencao', texto: 'Manutenção', cor: '#f1c40f' },
        { id: 'aumento25', texto: 'Aumento de 25pb', cor: '#e67e22' },
        { id: 'aumento50', texto: 'Aumento de 50pb', cor: '#e74c3c' }
    ];
    
    // Criar canvas para o gráfico
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    
    // Preparar dados para o gráfico
    const labels = decisoes.map(d => d.texto);
    const data = decisoes.map(d => (probabilidades[d.id] || 0) * 100);
    const colors = decisoes.map(d => d.cor);
    
    // Criar gráfico
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Probabilidade (%)',
                data: data,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Probabilidade (%)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.raw.toFixed(1)}%`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Renderiza gráfico de histórico de acertos
 * @param {string} containerId - ID do container para o gráfico
 * @param {Object} historicoAcertos - Dados do histórico de acertos
 */
function renderizarHistoricoAcertos(containerId, historicoAcertos) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Criar canvas para o gráfico
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    
    // Preparar dados para o gráfico
    const labels = historicoAcertos.reunioes.map(r => r.data);
    const data = historicoAcertos.reunioes.map(r => r.acerto ? 1 : 0);
    
    // Criar gráfico
    new Chart(canvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Acertos',
                data: data,
                backgroundColor: '#2ecc71',
                borderColor: '#2ecc71',
                borderWidth: 2,
                pointBackgroundColor: data.map(d => d === 1 ? '#2ecc71' : '#e74c3c'),
                pointBorderColor: data.map(d => d === 1 ? '#2ecc71' : '#e74c3c'),
                pointRadius: 5,
                pointHoverRadius: 7,
                stepped: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1,
                    ticks: {
                        callback: function(value) {
                            return value === 1 ? 'Acerto' : 'Erro';
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const reuniao = historicoAcertos.reunioes[context.dataIndex];
                            return reuniao.acerto ? 'Acerto' : 'Erro';
                        },
                        afterLabel: function(context) {
                            const reuniao = historicoAcertos.reunioes[context.dataIndex];
                            return `Previsão: ${textoDecisao(reuniao.previsao)}\nReal: ${textoDecisao(reuniao.real)}`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Adiciona estilos específicos para os detalhes dos modelos
 */
function adicionarEstilosDetalhes() {
    // Verificar se os estilos já existem
    if (document.getElementById('modelos-detalhes-styles')) return;
    
    const estilos = document.createElement('style');
    estilos.id = 'modelos-detalhes-styles';
    estilos.textContent = `
        .modelo-detalhes {
            background-color: #1a202c;
            border-radius: 8px;
            padding: 20px;
            margin-top: 30px;
            position: relative;
        }
        
        .modelo-detalhes-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            position: relative;
        }
        
        .modelo-detalhes-header h3 {
            margin: 0;
            color: #f8f9fa;
        }
        
        .btn-fechar-detalhes {
            position: absolute;
            top: 0;
            right: 0;
            background: none;
            border: none;
            color: #a0aec0;
            font-size: 1.5em;
            cursor: pointer;
        }
        
        .btn-fechar-detalhes:hover {
            color: #f8f9fa;
        }
        
        .modelo-tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            border-bottom: 1px solid #4a5568;
            padding-bottom: 10px;
        }
        
        .modelo-tab {
            background: none;
            border: none;
            color: #a0aec0;
            padding: 8px 12px;
            cursor: pointer;
            border-radius: 4px;
        }
        
        .modelo-tab:hover {
            background-color: #2d3748;
            color: #f8f9fa;
        }
        
        .modelo-tab.active {
            background-color: #3182ce;
            color: #f8f9fa;
        }
        
        .modelo-tab-content {
            display: none;
        }
        
        .modelo-tab-content.active {
            display: block;
        }
        
        .modelo-tab-content h4 {
            color: #f8f9fa;
            margin-top: 20px;
            margin-bottom: 10px;
        }
        
        .modelo-tab-content p {
            color: #e2e8f0;
            line-height: 1.6;
            margin-bottom: 15px;
        }
        
        .referencias-lista, .fontes-lista, .recomendacoes-lista {
            color: #e2e8f0;
            line-height: 1.6;
            padding-left: 20px;
        }
        
        .referencias-lista li, .fontes-lista li, .recomendacoes-lista li {
            margin-bottom: 8px;
        }
        
        .fonte-link {
            color: #3182ce;
            margin-left: 10px;
            text-decoration: none;
        }
        
        .fonte-link:hover {
            text-decoration: underline;
        }
        
        .variaveis-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .variavel-item {
            background-color: #2d3748;
            border-radius: 8px;
            padding: 15px;
        }
        
        .variavel-nome {
            font-weight: bold;
            color: #f8f9fa;
            margin-bottom: 5px;
        }
        
        .variavel-valor {
            font-size: 1.2em;
            color: #3182ce;
            margin-bottom: 5px;
        }
        
        .variavel-descricao {
            color: #a0aec0;
            font-size: 0.9em;
        }
        
        .previsao-box {
            background-color: #2d3748;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .previsao-decisao {
            font-size: 1.5em;
            font-weight: bold;
            color: #f8f9fa;
            margin-bottom: 10px;
        }
        
        .previsao-probabilidade {
            font-size: 1.2em;
            color: #3182ce;
            margin-bottom: 10px;
        }
        
        .previsao-data {
            color: #a0aec0;
        }
        
        .probabilidades-detalhadas {
            height: 250px;
            margin-bottom: 20px;
        }
        
        .metricas-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .metrica-item {
            background-color: #2d3748;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
        }
        
        .metrica-nome {
            color: #a0aec0;
            margin-bottom: 5px;
        }
        
        .metrica-valor {
            font-size: 1.2em;
            font-weight: bold;
            color: #f8f9fa;
        }
        
        .historico-acertos-container {
            margin-bottom: 20px;
        }
        
        .historico-acertos-chart {
            height: 200px;
            margin-bottom: 15px;
        }
        
        .historico-acertos-info {
            display: flex;
            justify-content: space-between;
        }
        
        .acertos-total, .acertos-taxa {
            font-size: 1.1em;
            color: #f8f9fa;
        }
        
        .testes-container {
            display: flex;
            flex-direction: column;
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .teste-item {
            background-color: #2d3748;
            border-radius: 8px;
            padding: 15px;
        }
        
        .teste-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .teste-nome {
            font-weight: bold;
            color: #f8f9fa;
        }
        
        .teste-resultado {
            padding: 5px 10px;
            border-radius: 4px;
            font-weight: bold;
        }
        
        .teste-sucesso {
            background-color: #2ecc71;
            color: #1a202c;
        }
        
        .teste-falha {
            background-color: #e74c3c;
            color: #f8f9fa;
        }
        
        .teste-descricao {
            color: #e2e8f0;
            margin-bottom: 10px;
        }
        
        .teste-detalhes {
            color: #a0aec0;
            font-size: 0.9em;
        }
        
        .teste-detalhes strong {
            margin-right: 5px;
            margin-left: 10px;
        }
        
        .teste-detalhes strong:first-child {
            margin-left: 0;
        }
    `;
    
    document.head.appendChild(estilos);
}

// Exportar funções para uso global
window.exibirDetalhesModelo = exibirDetalhesModelo;
window.fecharDetalhesModelo = fecharDetalhesModelo;
