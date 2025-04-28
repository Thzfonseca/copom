/**
 * Simulador de cenários para decisões do COPOM
 * 
 * Este módulo implementa um simulador interativo que permite
 * aos usuários testar diferentes cenários econômicos e ver
 * o impacto nas previsões de decisões do COPOM.
 */

class SimuladorCopom {
    constructor() {
        this.cenarioBase = {
            ipca: 4.25,
            ipcaE12m: 4.50,
            hiato: -0.8,
            cambio: 5.20,
            cambioDelta: 0.15,
            jurosEUA: 5.50,
            commodities: -2.5,
            confConsumidor: 92.3,
            vix: 18.5
        };
        
        this.cenarioAtual = { ...this.cenarioBase };
        this.resultadoBase = null;
        this.resultadoAtual = null;
        this.dataReferencia = "19/03/2025";
        
        // Definições dos controles do simulador
        this.controles = [
            {
                id: 'ipca',
                nome: 'IPCA (% a.a.)',
                min: 2.0,
                max: 7.0,
                step: 0.1,
                valor: this.cenarioBase.ipca,
                formato: '0.0%',
                descricao: 'Inflação medida pelo IPCA acumulada em 12 meses'
            },
            {
                id: 'ipcaE12m',
                nome: 'Expectativa IPCA 12m',
                min: 2.0,
                max: 7.0,
                step: 0.1,
                valor: this.cenarioBase.ipcaE12m,
                formato: '0.0%',
                descricao: 'Expectativa de inflação para os próximos 12 meses (Focus)'
            },
            {
                id: 'hiato',
                nome: 'Hiato do Produto',
                min: -3.0,
                max: 3.0,
                step: 0.1,
                valor: this.cenarioBase.hiato,
                formato: '0.0%',
                descricao: 'Diferença percentual entre PIB efetivo e potencial'
            },
            {
                id: 'cambio',
                nome: 'Taxa de Câmbio (USD/BRL)',
                min: 4.0,
                max: 6.5,
                step: 0.05,
                valor: this.cenarioBase.cambio,
                formato: '0.00',
                descricao: 'Taxa de câmbio USD/BRL'
            },
            {
                id: 'cambioDelta',
                nome: 'Variação Cambial (% 3m)',
                min: -5.0,
                max: 5.0,
                step: 0.1,
                valor: this.cenarioBase.cambioDelta,
                formato: '0.0%',
                descricao: 'Variação percentual da taxa de câmbio nos últimos 3 meses'
            },
            {
                id: 'jurosEUA',
                nome: 'Taxa de Juros EUA (%)',
                min: 3.0,
                max: 7.0,
                step: 0.25,
                valor: this.cenarioBase.jurosEUA,
                formato: '0.00%',
                descricao: 'Taxa básica de juros dos EUA (Fed Funds Rate)'
            },
            {
                id: 'commodities',
                nome: 'Índice de Commodities (% a.a.)',
                min: -10.0,
                max: 10.0,
                step: 0.5,
                valor: this.cenarioBase.commodities,
                formato: '0.0%',
                descricao: 'Variação anual do índice de preços de commodities'
            },
            {
                id: 'confConsumidor',
                nome: 'Confiança do Consumidor',
                min: 70.0,
                max: 110.0,
                step: 1.0,
                valor: this.cenarioBase.confConsumidor,
                formato: '0.0',
                descricao: 'Índice de confiança do consumidor (FGV)'
            },
            {
                id: 'vix',
                nome: 'Índice VIX',
                min: 10.0,
                max: 40.0,
                step: 0.5,
                valor: this.cenarioBase.vix,
                formato: '0.0',
                descricao: 'Índice de volatilidade do mercado (CBOE VIX)'
            }
        ];
        
        // Cenários pré-definidos
        this.cenariosPredefinidos = [
            {
                id: 'base',
                nome: 'Cenário Base',
                descricao: 'Cenário atual com dados de referência',
                valores: { ...this.cenarioBase }
            },
            {
                id: 'inflacao_alta',
                nome: 'Inflação Alta',
                descricao: 'Cenário com pressão inflacionária elevada',
                valores: {
                    ...this.cenarioBase,
                    ipca: 6.0,
                    ipcaE12m: 5.8,
                    cambio: 5.6,
                    cambioDelta: 2.5,
                    commodities: 5.0
                }
            },
            {
                id: 'recessao',
                nome: 'Recessão Econômica',
                descricao: 'Cenário de contração econômica',
                valores: {
                    ...this.cenarioBase,
                    hiato: -2.5,
                    confConsumidor: 78.0,
                    vix: 30.0,
                    commodities: -8.0
                }
            },
            {
                id: 'externo_adverso',
                nome: 'Choque Externo',
                descricao: 'Cenário de deterioração das condições externas',
                valores: {
                    ...this.cenarioBase,
                    cambio: 6.2,
                    cambioDelta: 4.0,
                    jurosEUA: 6.5,
                    vix: 35.0
                }
            },
            {
                id: 'recuperacao',
                nome: 'Recuperação Econômica',
                descricao: 'Cenário de retomada do crescimento',
                valores: {
                    ...this.cenarioBase,
                    hiato: 1.2,
                    confConsumidor: 105.0,
                    cambio: 4.8,
                    cambioDelta: -1.5
                }
            }
        ];
    }
    
    /**
     * Inicializa o simulador
     */
    inicializar() {
        console.log('Inicializando simulador do COPOM...');
        
        // Verificar se temos acesso aos modelos preditivos
        if (!window.modelosPreditivos) {
            console.error('Modelos preditivos não encontrados. O simulador depende deles para funcionar.');
            return false;
        }
        
        // Obter resultado base
        this.resultadoBase = window.modelosPreditivos.getResultados();
        this.resultadoAtual = { ...this.resultadoBase };
        
        return true;
    }
    
    /**
     * Renderiza a interface do simulador
     * @param {HTMLElement} container - Container onde o simulador será renderizado
     */
    renderizar(container) {
        if (!container) {
            console.error('Container para renderização do simulador não encontrado');
            return;
        }
        
        // Limpar container
        container.innerHTML = '';
        
        // Criar estrutura básica
        const simuladorEl = document.createElement('div');
        simuladorEl.className = 'simulador-container';
        simuladorEl.innerHTML = `
            <h2>Simulador de Cenários para Decisões do COPOM</h2>
            <p class="data-referencia">Dados de referência: ${this.dataReferencia}</p>
            
            <div class="simulador-layout">
                <div class="controles-container">
                    <div class="cenarios-predefinidos">
                        <h3>Cenários Pré-definidos</h3>
                        <div class="cenarios-grid" id="cenarios-grid"></div>
                    </div>
                    
                    <div class="controles-simulador">
                        <h3>Ajuste de Variáveis</h3>
                        <div class="controles-grid" id="controles-grid"></div>
                    </div>
                    
                    <div class="acoes-simulador">
                        <button id="btn-simular" class="btn-simular">Simular Cenário</button>
                        <button id="btn-resetar" class="btn-resetar">Resetar para Base</button>
                    </div>
                </div>
                
                <div class="resultados-container">
                    <h3>Resultados da Simulação</h3>
                    <div class="comparacao-header">
                        <div class="comparacao-col">Cenário Base</div>
                        <div class="comparacao-col">Cenário Simulado</div>
                    </div>
                    
                    <div class="resultado-principal">
                        <div class="comparacao-row">
                            <div class="comparacao-col" id="decisao-base"></div>
                            <div class="comparacao-col" id="decisao-simulada"></div>
                        </div>
                        <div class="comparacao-row">
                            <div class="comparacao-col" id="taxa-base"></div>
                            <div class="comparacao-col" id="taxa-simulada"></div>
                        </div>
                    </div>
                    
                    <h4>Probabilidades por Decisão</h4>
                    <div class="probabilidades-comparacao" id="probabilidades-comparacao"></div>
                    
                    <h4>Impacto nos Modelos</h4>
                    <div class="modelos-comparacao" id="modelos-comparacao"></div>
                </div>
            </div>
        `;
        
        container.appendChild(simuladorEl);
        
        // Renderizar componentes
        this.renderizarCenariosPredefinidos();
        this.renderizarControles();
        this.renderizarResultados();
        
        // Adicionar event listeners
        this.adicionarEventListeners();
        
        // Adicionar estilos
        this.adicionarEstilos();
    }
    
    /**
     * Renderiza os cenários pré-definidos
     */
    renderizarCenariosPredefinidos() {
        const container = document.getElementById('cenarios-grid');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.cenariosPredefinidos.forEach(cenario => {
            const card = document.createElement('div');
            card.className = 'cenario-card';
            card.dataset.cenarioId = cenario.id;
            card.innerHTML = `
                <h4>${cenario.nome}</h4>
                <p>${cenario.descricao}</p>
            `;
            
            container.appendChild(card);
        });
    }
    
    /**
     * Renderiza os controles do simulador
     */
    renderizarControles() {
        const container = document.getElementById('controles-grid');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.controles.forEach(controle => {
            const item = document.createElement('div');
            item.className = 'controle-item';
            item.innerHTML = `
                <div class="controle-header">
                    <label for="ctrl-${controle.id}">${controle.nome}</label>
                    <span class="controle-valor" id="valor-${controle.id}">${this.formatarValor(controle.valor, controle.formato)}</span>
                </div>
                <input 
                    type="range" 
                    id="ctrl-${controle.id}" 
                    class="controle-slider"
                    min="${controle.min}" 
                    max="${controle.max}" 
                    step="${controle.step}" 
                    value="${controle.valor}"
                    data-controle-id="${controle.id}"
                >
                <div class="controle-range">
                    <span>${this.formatarValor(controle.min, controle.formato)}</span>
                    <span>${this.formatarValor(controle.max, controle.formato)}</span>
                </div>
                <div class="controle-descricao">${controle.descricao}</div>
            `;
            
            container.appendChild(item);
        });
    }
    
    /**
     * Renderiza os resultados da simulação
     */
    renderizarResultados() {
        // Decisão e taxa base
        const decisaoBaseEl = document.getElementById('decisao-base');
        const taxaBaseEl = document.getElementById('taxa-base');
        
        if (decisaoBaseEl && this.resultadoBase) {
            const decisao = this.resultadoBase.proximaReuniao.previsaoConsolidada;
            decisaoBaseEl.textContent = this.textoDecisao(decisao);
        }
        
        if (taxaBaseEl && this.resultadoBase) {
            taxaBaseEl.textContent = `Taxa Selic: ${this.resultadoBase.taxaPrevista.toFixed(2)}%`;
        }
        
        // Decisão e taxa simulada (inicialmente igual à base)
        const decisaoSimuladaEl = document.getElementById('decisao-simulada');
        const taxaSimuladaEl = document.getElementById('taxa-simulada');
        
        if (decisaoSimuladaEl && this.resultadoAtual) {
            const decisao = this.resultadoAtual.proximaReuniao.previsaoConsolidada;
            decisaoSimuladaEl.textContent = this.textoDecisao(decisao);
        }
        
        if (taxaSimuladaEl && this.resultadoAtual) {
            taxaSimuladaEl.textContent = `Taxa Selic: ${this.resultadoAtual.taxaPrevista.toFixed(2)}%`;
        }
        
        // Renderizar comparação de probabilidades
        this.renderizarComparacaoProbabilidades();
        
        // Renderizar comparação de modelos
        this.renderizarComparacaoModelos();
    }
    
    /**
     * Renderiza a comparação de probabilidades
     */
    renderizarComparacaoProbabilidades() {
        const container = document.getElementById('probabilidades-comparacao');
        if (!container || !this.resultadoBase || !this.resultadoAtual) return;
        
        container.innerHTML = '';
        
        const decisoes = [
            { id: 'reducao50', texto: 'Redução de 50pb', cor: '#3498db' },
            { id: 'reducao25', texto: 'Redução de 25pb', cor: '#2ecc71' },
            { id: 'manutencao', texto: 'Manutenção', cor: '#f1c40f' },
            { id: 'aumento25', texto: 'Aumento de 25pb', cor: '#e67e22' },
            { id: 'aumento50', texto: 'Aumento de 50pb', cor: '#e74c3c' }
        ];
        
        decisoes.forEach(decisao => {
            const probBase = this.resultadoBase.proximaReuniao.probabilidades[decisao.id] || 0;
            const probSimulada = this.resultadoAtual.proximaReuniao.probabilidades[decisao.id] || 0;
            
            const porcentagemBase = (probBase * 100).toFixed(0);
            const porcentagemSimulada = (probSimulada * 100).toFixed(0);
            
            const item = document.createElement('div');
            item.className = 'probabilidade-comparacao-item';
            item.innerHTML = `
                <div class="probabilidade-decisao">${decisao.texto}</div>
                <div class="probabilidade-barras">
                    <div class="probabilidade-barra-container">
                        <div class="probabilidade-barra base" style="width: ${porcentagemBase}%; background-color: ${decisao.cor};"></div>
                        <span class="probabilidade-valor">${porcentagemBase}%</span>
                    </div>
                    <div class="probabilidade-barra-container">
                        <div class="probabilidade-barra simulada" style="width: ${porcentagemSimulada}%; background-color: ${decisao.cor};"></div>
                        <span class="probabilidade-valor">${porcentagemSimulada}%</span>
                    </div>
                </div>
            `;
            
            container.appendChild(item);
        });
    }
    
    /**
     * Renderiza a comparação de modelos
     */
    renderizarComparacaoModelos() {
        const container = document.getElementById('modelos-comparacao');
        if (!container || !this.resultadoBase || !this.resultadoAtual) return;
        
        container.innerHTML = '';
        
        // Obter modelos
        const modelosBase = this.resultadoBase.modelos;
        const modelosSimulados = this.resultadoAtual.modelos;
        
        // Criar tabela de comparação
        const tabela = document.createElement('table');
        tabela.className = 'modelos-tabela';
        
        // Cabeçalho
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Modelo</th>
                <th>Cenário Base</th>
                <th>Cenário Simulado</th>
            </tr>
        `;
        tabela.appendChild(thead);
        
        // Corpo
        const tbody = document.createElement('tbody');
        
        for (const [id, modeloBase] of Object.entries(modelosBase)) {
            const modeloSimulado = modelosSimulados[id];
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${modeloBase.nome}</td>
                <td>${this.textoDecisao(modeloBase.previsao)}</td>
                <td>${this.textoDecisao(modeloSimulado.previsao)}</td>
            `;
            
            tbody.appendChild(row);
        }
        
        tabela.appendChild(tbody);
        container.appendChild(tabela);
    }
    
    /**
     * Adiciona event listeners aos elementos do simulador
     */
    adicionarEventListeners() {
        // Event listeners para sliders
        const sliders = document.querySelectorAll('.controle-slider');
        sliders.forEach(slider => {
            slider.addEventListener('input', (e) => {
                const controleId = e.target.dataset.controleId;
                const valor = parseFloat(e.target.value);
                
                // Atualizar valor exibido
                const valorEl = document.getElementById(`valor-${controleId}`);
                if (valorEl) {
                    const controle = this.controles.find(c => c.id === controleId);
                    if (controle) {
                        valorEl.textContent = this.formatarValor(valor, controle.formato);
                        
                        // Atualizar cenário atual
                        this.cenarioAtual[controleId] = valor;
                    }
                }
            });
        });
        
        // Event listener para botão de simulação
        const btnSimular = document.getElementById('btn-simular');
        if (btnSimular) {
            btnSimular.addEventListener('click', () => {
                this.simularCenario();
            });
        }
        
        // Event listener para botão de reset
        const btnResetar = document.getElementById('btn-resetar');
        if (btnResetar) {
            btnResetar.addEventListener('click', () => {
                this.resetarParaBase();
            });
        }
        
        // Event listeners para cenários pré-definidos
        const cenarioCards = document.querySelectorAll('.cenario-card');
        cenarioCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const cenarioId = e.currentTarget.dataset.cenarioId;
                this.carregarCenarioPredefinido(cenarioId);
            });
        });
    }
    
    /**
     * Simula o cenário atual
     */
    simularCenario() {
        console.log('Simulando cenário:', this.cenarioAtual);
        
        // Verificar se temos acesso aos modelos preditivos
        if (!window.modelosPreditivos) {
            console.error('Modelos preditivos não encontrados');
            return;
        }
        
        // Atualizar indicadores e obter novos resultados
        this.resultadoAtual = window.modelosPreditivos.atualizarIndicadores(this.cenarioAtual);
        
        // Atualizar interface
        this.renderizarResultados();
    }
    
    /**
     * Reseta para o cenário base
     */
    resetarParaBase() {
        console.log('Resetando para cenário base');
        
        // Restaurar cenário
        this.cenarioAtual = { ...this.cenarioBase };
        
        // Restaurar resultado
        this.resultadoAtual = { ...this.resultadoBase };
        
        // Atualizar sliders
        this.controles.forEach(controle => {
            const slider = document.getElementById(`ctrl-${controle.id}`);
            const valorEl = document.getElementById(`valor-${controle.id}`);
            
            if (slider) {
                slider.value = this.cenarioBase[controle.id];
            }
            
            if (valorEl) {
                valorEl.textContent = this.formatarValor(this.cenarioBase[controle.id], controle.formato);
            }
        });
        
        // Atualizar interface
        this.renderizarResultados();
    }
    
    /**
     * Carrega um cenário pré-definido
     * @param {string} cenarioId - ID do cenário a ser carregado
     */
    carregarCenarioPredefinido(cenarioId) {
        console.log(`Carregando cenário pré-definido: ${cenarioId}`);
        
        // Encontrar cenário
        const cenario = this.cenariosPredefinidos.find(c => c.id === cenarioId);
        if (!cenario) {
            console.error(`Cenário não encontrado: ${cenarioId}`);
            return;
        }
        
        // Atualizar cenário atual
        this.cenarioAtual = { ...cenario.valores };
        
        // Atualizar sliders
        this.controles.forEach(controle => {
            const slider = document.getElementById(`ctrl-${controle.id}`);
            const valorEl = document.getElementById(`valor-${controle.id}`);
            
            if (slider) {
                slider.value = this.cenarioAtual[controle.id];
            }
            
            if (valorEl) {
                valorEl.textContent = this.formatarValor(this.cenarioAtual[controle.id], controle.formato);
            }
        });
        
        // Simular cenário
        this.simularCenario();
    }
    
    /**
     * Formata um valor de acordo com o formato especificado
     * @param {number} valor - Valor a ser formatado
     * @param {string} formato - Formato desejado
     * @returns {string} Valor formatado
     */
    formatarValor(valor, formato) {
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
    textoDecisao(decisao) {
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
     * Adiciona estilos específicos para o simulador
     */
    adicionarEstilos() {
        // Verificar se os estilos já existem
        if (document.getElementById('simulador-copom-styles')) return;
        
        const estilos = document.createElement('style');
        estilos.id = 'simulador-copom-styles';
        estilos.textContent = `
            .simulador-container {
                padding: 20px;
                color: #e2e8f0;
            }
            
            .simulador-container h2 {
                margin-bottom: 10px;
                color: #f8f9fa;
            }
            
            .data-referencia {
                color: #a0aec0;
                font-size: 0.9em;
                margin-bottom: 20px;
            }
            
            .simulador-layout {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
            }
            
            @media (max-width: 1024px) {
                .simulador-layout {
                    grid-template-columns: 1fr;
                }
            }
            
            .controles-container, .resultados-container {
                background-color: #2d3748;
                border-radius: 8px;
                padding: 20px;
            }
            
            .cenarios-predefinidos {
                margin-bottom: 30px;
            }
            
            .cenarios-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 15px;
                margin-top: 15px;
            }
            
            .cenario-card {
                background-color: #4a5568;
                border-radius: 6px;
                padding: 15px;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            
            .cenario-card:hover {
                background-color: #718096;
            }
            
            .cenario-card h4 {
                margin: 0 0 10px 0;
                color: #f8f9fa;
            }
            
            .cenario-card p {
                margin: 0;
                font-size: 0.9em;
                color: #cbd5e0;
            }
            
            .controles-grid {
                display: grid;
                grid-template-columns: 1fr;
                gap: 20px;
                margin-top: 15px;
                margin-bottom: 30px;
            }
            
            .controle-item {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }
            
            .controle-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .controle-valor {
                font-weight: bold;
                color: #f8f9fa;
            }
            
            .controle-slider {
                -webkit-appearance: none;
                width: 100%;
                height: 8px;
                border-radius: 4px;
                background: #4a5568;
                outline: none;
            }
            
            .controle-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 18px;
                height: 18px;
                border-radius: 50%;
                background: #3182ce;
                cursor: pointer;
            }
            
            .controle-slider::-moz-range-thumb {
                width: 18px;
                height: 18px;
                border-radius: 50%;
                background: #3182ce;
                cursor: pointer;
            }
            
            .controle-range {
                display: flex;
                justify-content: space-between;
                font-size: 0.8em;
                color: #a0aec0;
            }
            
            .controle-descricao {
                font-size: 0.8em;
                color: #a0aec0;
                margin-top: 5px;
            }
            
            .acoes-simulador {
                display: flex;
                gap: 15px;
            }
            
            .btn-simular, .btn-resetar {
                padding: 10px 20px;
                border: none;
                border-radius: 6px;
                font-weight: bold;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            
            .btn-simular {
                background-color: #3182ce;
                color: white;
            }
            
            .btn-simular:hover {
                background-color: #2c5282;
            }
            
            .btn-resetar {
                background-color: #4a5568;
                color: white;
            }
            
            .btn-resetar:hover {
                background-color: #2d3748;
            }
            
            .comparacao-header {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin-bottom: 10px;
                font-weight: bold;
                color: #f8f9fa;
            }
            
            .resultado-principal {
                margin-bottom: 30px;
            }
            
            .comparacao-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin-bottom: 10px;
            }
            
            .comparacao-col {
                background-color: #4a5568;
                border-radius: 6px;
                padding: 15px;
                text-align: center;
            }
            
            .probabilidade-comparacao-item {
                display: grid;
                grid-template-columns: 150px 1fr;
                gap: 15px;
                margin-bottom: 15px;
                align-items: center;
            }
            
            .probabilidade-decisao {
                font-size: 0.9em;
            }
            
            .probabilidade-barras {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
            }
            
            .probabilidade-barra-container {
                position: relative;
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
            
            .probabilidade-valor {
                position: absolute;
                right: 5px;
                top: 50%;
                transform: translateY(-50%);
                font-size: 0.8em;
                color: white;
                text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
            }
            
            .modelos-tabela {
                width: 100%;
                border-collapse: collapse;
                margin-top: 15px;
            }
            
            .modelos-tabela th, .modelos-tabela td {
                padding: 10px;
                text-align: left;
                border-bottom: 1px solid #4a5568;
            }
            
            .modelos-tabela th {
                background-color: #4a5568;
                color: #f8f9fa;
            }
            
            .modelos-tabela tr:hover {
                background-color: #4a5568;
            }
        `;
        
        document.head.appendChild(estilos);
    }
}

// Exportar a classe para uso global
window.SimuladorCopom = SimuladorCopom;

// Função para renderizar o simulador
function renderizarSimulador(container) {
    console.log('Renderizando simulador do COPOM...');
    
    // Verificar se já temos uma instância do simulador
    if (!window.simuladorCopom) {
        window.simuladorCopom = new SimuladorCopom();
    }
    
    // Inicializar simulador
    const inicializado = window.simuladorCopom.inicializar();
    
    if (!inicializado) {
        console.error('Falha ao inicializar o simulador');
        if (container) {
            container.innerHTML = `
                <div class="erro-simulador">
                    <h3>Erro ao inicializar o simulador</h3>
                    <p>Não foi possível carregar os modelos preditivos necessários.</p>
                </div>
            `;
        }
        return;
    }
    
    // Renderizar interface
    window.simuladorCopom.renderizar(container);
}

// Inicializar quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se estamos na tab do simulador
    const simuladorTab = document.getElementById('simulador');
    if (simuladorTab) {
        renderizarSimulador(simuladorTab);
    }
    
    // Exportar função para uso global
    window.renderizarSimulador = renderizarSimulador;
    
    console.log('Módulo do simulador do COPOM inicializado');
});
