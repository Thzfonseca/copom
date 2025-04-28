/**
 * Sistema de monitoramento e diagnóstico para o COPOM Dashboard
 * 
 * Este módulo implementa mecanismos de controle, checagem e diagnóstico
 * para garantir o funcionamento adequado de todas as features do site.
 */

class DashboardMonitor {
    constructor() {
        this.features = [
            { id: 'dashboard', name: 'Dashboard Principal', status: 'unknown' },
            { id: 'atas', name: 'Atas do COPOM', status: 'unknown' },
            { id: 'comunicacao', name: 'Análise de Comunicação', status: 'unknown' },
            { id: 'correlacoes', name: 'Correlações', status: 'unknown' },
            { id: 'modelos', name: 'Modelos Preditivos', status: 'unknown' },
            { id: 'simulador', name: 'Simulador', status: 'unknown' },
            { id: 'modelos-avancados', name: 'Modelos Avançados', status: 'unknown' },
            { id: 'modelo-nlp', name: 'Análise NLP das Atas', status: 'unknown' },
            { id: 'juro-neutro', name: 'Juro Real Neutro', status: 'unknown' }
        ];
        
        this.errors = [];
        this.warnings = [];
        this.logs = [];
        
        this.lastCheck = null;
        this.checkInterval = 60000; // 1 minuto
        
        // Inicializar monitoramento
        this.init();
    }
    
    /**
     * Inicializa o sistema de monitoramento
     */
    init() {
        console.log('Inicializando sistema de monitoramento do COPOM Dashboard...');
        this.log('info', 'Sistema de monitoramento iniciado');
        
        // Adicionar listeners para navegação
        document.addEventListener('DOMContentLoaded', () => {
            this.setupNavListeners();
            this.checkAllFeatures();
            this.setupPeriodicChecks();
            this.injectStatusPanel();
        });
        
        // Capturar erros não tratados
        window.addEventListener('error', (event) => {
            this.logError('Erro não tratado', event.error?.message || 'Erro desconhecido', event.filename, event.lineno);
            return false;
        });
        
        // Capturar rejeições de promessas não tratadas
        window.addEventListener('unhandledrejection', (event) => {
            this.logError('Promessa rejeitada não tratada', event.reason?.message || 'Razão desconhecida');
            return false;
        });
    }
    
    /**
     * Configura listeners para os links de navegação
     */
    setupNavListeners() {
        const navLinks = document.querySelectorAll('.tab-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                const tabId = link.getAttribute('data-tab');
                this.log('info', `Navegação para: ${tabId}`);
                
                // Verificar se a tab foi carregada corretamente após um breve delay
                setTimeout(() => {
                    this.checkFeatureStatus(tabId);
                }, 500);
            });
        });
    }
    
    /**
     * Configura verificações periódicas de todas as features
     */
    setupPeriodicChecks() {
        setInterval(() => {
            this.checkAllFeatures();
        }, this.checkInterval);
    }
    
    /**
     * Verifica o status de todas as features
     */
    checkAllFeatures() {
        this.log('info', 'Iniciando verificação de todas as features');
        this.lastCheck = new Date();
        
        this.features.forEach(feature => {
            this.checkFeatureStatus(feature.id);
        });
        
        this.updateStatusPanel();
    }
    
    /**
     * Verifica o status de uma feature específica
     * @param {string} featureId - ID da feature a ser verificada
     */
    checkFeatureStatus(featureId) {
        const feature = this.features.find(f => f.id === featureId);
        if (!feature) return;
        
        const tabContent = document.getElementById(featureId);
        
        if (!tabContent) {
            feature.status = 'error';
            this.logError('Elemento não encontrado', `Tab content #${featureId} não existe no DOM`);
            return;
        }
        
        // Verificar se o conteúdo foi carregado corretamente
        if (tabContent.classList.contains('active')) {
            // Verificações específicas para cada tipo de feature
            switch (featureId) {
                case 'modelos':
                    feature.status = this.checkModelosPreditivos(tabContent);
                    break;
                case 'simulador':
                    feature.status = this.checkSimulador(tabContent);
                    break;
                case 'modelos-avancados':
                    feature.status = this.checkModelosAvancados(tabContent);
                    break;
                case 'modelo-nlp':
                    feature.status = this.checkModeloNLP(tabContent);
                    break;
                case 'juro-neutro':
                    feature.status = this.checkJuroNeutro(tabContent);
                    break;
                default:
                    // Verificação genérica: se tem conteúdo além do título
                    const hasContent = tabContent.querySelectorAll('*').length > 2;
                    feature.status = hasContent ? 'ok' : 'warning';
                    
                    if (!hasContent) {
                        this.logWarning(`Conteúdo insuficiente`, `A seção ${feature.name} parece não ter conteúdo suficiente`);
                    }
            }
        } else {
            // Se a tab não está ativa, não podemos verificar seu conteúdo
            this.log('info', `Tab ${featureId} não está ativa, não é possível verificar conteúdo`);
        }
        
        this.updateStatusPanel();
    }
    
    /**
     * Verifica o funcionamento dos modelos preditivos
     * @param {HTMLElement} container - Elemento contendo os modelos preditivos
     * @returns {string} Status da feature ('ok', 'warning', 'error')
     */
    checkModelosPreditivos(container) {
        // Verificar se existem cards de modelos
        const modelCards = container.querySelectorAll('.modelo-card');
        
        if (modelCards.length === 0) {
            this.logError('Modelos preditivos', 'Nenhum modelo encontrado na seção');
            return 'error';
        }
        
        // Verificar se há previsões nos modelos
        let hasValidPredictions = false;
        
        modelCards.forEach(card => {
            const previsao = card.querySelector('.modelo-previsao');
            if (previsao && previsao.textContent.trim() !== '') {
                hasValidPredictions = true;
            }
        });
        
        if (!hasValidPredictions) {
            this.logWarning('Modelos preditivos', 'Nenhuma previsão válida encontrada nos modelos');
            return 'warning';
        }
        
        return 'ok';
    }
    
    /**
     * Verifica o funcionamento do simulador
     * @param {HTMLElement} container - Elemento contendo o simulador
     * @returns {string} Status da feature ('ok', 'warning', 'error')
     */
    checkSimulador(container) {
        // Verificar se existem controles do simulador
        const controls = container.querySelectorAll('input, select, button');
        
        if (controls.length === 0) {
            this.logError('Simulador', 'Nenhum controle de simulação encontrado');
            return 'error';
        }
        
        // Verificar se há área de resultados
        const resultArea = container.querySelector('.simulador-resultados, .resultado-simulacao');
        
        if (!resultArea) {
            this.logWarning('Simulador', 'Área de resultados não encontrada');
            return 'warning';
        }
        
        return 'ok';
    }
    
    /**
     * Verifica o funcionamento dos modelos avançados
     * @param {HTMLElement} container - Elemento contendo os modelos avançados
     * @returns {string} Status da feature ('ok', 'warning', 'error')
     */
    checkModelosAvancados(container) {
        // Verificar se existem descrições de modelos
        const modelDescriptions = container.querySelectorAll('.modelo-card, .modelo-detalhes');
        
        if (modelDescriptions.length === 0) {
            this.logError('Modelos avançados', 'Nenhuma descrição de modelo encontrada');
            return 'error';
        }
        
        // Verificar se há gráficos ou visualizações
        const visualizations = container.querySelectorAll('canvas, svg, .chart, .grafico');
        
        if (visualizations.length === 0) {
            this.logWarning('Modelos avançados', 'Nenhuma visualização gráfica encontrada');
            return 'warning';
        }
        
        return 'ok';
    }
    
    /**
     * Verifica o funcionamento da análise NLP
     * @param {HTMLElement} container - Elemento contendo a análise NLP
     * @returns {string} Status da feature ('ok', 'warning', 'error')
     */
    checkModeloNLP(container) {
        // Verificar se existem resultados de análise
        const analysisResults = container.querySelectorAll('.topicos-container, .palavras-topico, .tom-chart, .frases-fg');
        
        if (analysisResults.length === 0) {
            this.logError('Análise NLP', 'Nenhum resultado de análise encontrado');
            return 'error';
        }
        
        // Verificar se há visualizações específicas de NLP
        const nlpVisualizations = container.querySelectorAll('.topico-card, .palavra-chip, .tom-item');
        
        if (nlpVisualizations.length === 0) {
            this.logWarning('Análise NLP', 'Nenhuma visualização específica de NLP encontrada');
            return 'warning';
        }
        
        return 'ok';
    }
    
    /**
     * Verifica o funcionamento da seção de juro neutro
     * @param {HTMLElement} container - Elemento contendo a seção de juro neutro
     * @returns {string} Status da feature ('ok', 'warning', 'error')
     */
    checkJuroNeutro(container) {
        // Verificar se existe o gauge de juro neutro
        const gauge = container.querySelector('.jn-gauge');
        
        if (!gauge) {
            this.logError('Juro Neutro', 'Gauge de juro neutro não encontrado');
            return 'error';
        }
        
        // Verificar se há tabela de modelos
        const modelTable = container.querySelector('table');
        
        if (!modelTable) {
            this.logWarning('Juro Neutro', 'Tabela de modelos não encontrada');
            return 'warning';
        }
        
        // Verificar se há datas de referência
        const refDates = container.querySelectorAll('.data-referencia');
        
        if (refDates.length === 0) {
            this.logWarning('Juro Neutro', 'Datas de referência não encontradas');
            return 'warning';
        }
        
        return 'ok';
    }
    
    /**
     * Injeta o painel de status no DOM
     */
    injectStatusPanel() {
        const statusPanel = document.createElement('div');
        statusPanel.id = 'status-panel';
        statusPanel.className = 'status-panel';
        statusPanel.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: #1a1f2c;
            border: 1px solid #2a3040;
            border-radius: 4px;
            padding: 10px;
            width: 300px;
            max-height: 400px;
            overflow-y: auto;
            z-index: 9999;
            color: #e2e8f0;
            font-family: monospace;
            font-size: 12px;
            display: none;
        `;
        
        const statusHeader = document.createElement('div');
        statusHeader.className = 'status-header';
        statusHeader.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <strong>Status do Sistema</strong>
                <div>
                    <button id="refresh-status" style="background: #2d3748; border: none; color: white; padding: 2px 5px; margin-right: 5px; border-radius: 3px; cursor: pointer;">↻</button>
                    <button id="toggle-status" style="background: #2d3748; border: none; color: white; padding: 2px 5px; border-radius: 3px; cursor: pointer;">×</button>
                </div>
            </div>
        `;
        
        const statusContent = document.createElement('div');
        statusContent.id = 'status-content';
        statusContent.className = 'status-content';
        
        const statusLogs = document.createElement('div');
        statusLogs.id = 'status-logs';
        statusLogs.className = 'status-logs';
        statusLogs.style.cssText = `
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid #2a3040;
            max-height: 150px;
            overflow-y: auto;
        `;
        
        statusPanel.appendChild(statusHeader);
        statusPanel.appendChild(statusContent);
        statusPanel.appendChild(statusLogs);
        
        document.body.appendChild(statusPanel);
        
        // Adicionar botão flutuante para mostrar/esconder o painel
        const toggleButton = document.createElement('button');
        toggleButton.id = 'show-status';
        toggleButton.innerHTML = '⚙️';
        toggleButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: #3182ce;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            font-size: 20px;
            color: white;
            cursor: pointer;
            z-index: 9998;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        document.body.appendChild(toggleButton);
        
        // Adicionar event listeners
        document.getElementById('show-status').addEventListener('click', () => {
            document.getElementById('status-panel').style.display = 'block';
            document.getElementById('show-status').style.display = 'none';
        });
        
        document.getElementById('toggle-status').addEventListener('click', () => {
            document.getElementById('status-panel').style.display = 'none';
            document.getElementById('show-status').style.display = 'flex';
        });
        
        document.getElementById('refresh-status').addEventListener('click', () => {
            this.checkAllFeatures();
        });
    }
    
    /**
     * Atualiza o conteúdo do painel de status
     */
    updateStatusPanel() {
        const statusContent = document.getElementById('status-content');
        if (!statusContent) return;
        
        let html = `<div style="margin-bottom: 5px;"><small>Última verificação: ${this.lastCheck ? this.lastCheck.toLocaleString() : 'Nunca'}</small></div>`;
        
        // Status geral
        const errorCount = this.features.filter(f => f.status === 'error').length;
        const warningCount = this.features.filter(f => f.status === 'warning').length;
        const okCount = this.features.filter(f => f.status === 'ok').length;
        const unknownCount = this.features.filter(f => f.status === 'unknown').length;
        
        let overallStatus = 'ok';
        if (errorCount > 0) overallStatus = 'error';
        else if (warningCount > 0) overallStatus = 'warning';
        else if (unknownCount === this.features.length) overallStatus = 'unknown';
        
        const statusColors = {
            'ok': '#38a169',
            'warning': '#ecc94b',
            'error': '#e53e3e',
            'unknown': '#718096'
        };
        
        html += `
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <div style="width: 10px; height: 10px; border-radius: 50%; background-color: ${statusColors[overallStatus]}; margin-right: 5px;"></div>
                <strong>Status Geral: ${overallStatus.toUpperCase()}</strong>
            </div>
        `;
        
        // Status de cada feature
        html += '<div style="margin-bottom: 10px;">';
        this.features.forEach(feature => {
            html += `
                <div style="display: flex; align-items: center; margin-bottom: 3px;">
                    <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${statusColors[feature.status]}; margin-right: 5px;"></div>
                    <span>${feature.name}</span>
                </div>
            `;
        });
        html += '</div>';
        
        // Resumo de erros e avisos
        if (errorCount > 0 || warningCount > 0) {
            html += '<div style="margin-top: 10px;">';
            
            if (errorCount > 0) {
                html += `<div style="color: ${statusColors.error}; margin-bottom: 5px;"><strong>Erros (${errorCount}):</strong></div>`;
                html += '<ul style="margin: 0 0 10px 20px; padding: 0;">';
                this.errors.slice(-5).forEach(error => {
                    html += `<li>${error.feature}: ${error.message}</li>`;
                });
                html += '</ul>';
            }
            
            if (warningCount > 0) {
                html += `<div style="color: ${statusColors.warning}; margin-bottom: 5px;"><strong>Avisos (${warningCount}):</strong></div>`;
                html += '<ul style="margin: 0 0 10px 20px; padding: 0;">';
                this.warnings.slice(-5).forEach(warning => {
                    html += `<li>${warning.feature}: ${warning.message}</li>`;
                });
                html += '</ul>';
            }
            
            html += '</div>';
        }
        
        statusContent.innerHTML = html;
        
        // Atualizar logs
        const statusLogs = document.getElementById('status-logs');
        if (statusLogs) {
            let logsHtml = '<div><strong>Logs recentes:</strong></div>';
            logsHtml += '<div style="margin-top: 5px;">';
            
            this.logs.slice(-10).reverse().forEach(log => {
                const logColor = log.level === 'error' ? statusColors.error : 
                                log.level === 'warning' ? statusColors.warning : '#718096';
                
                logsHtml += `
                    <div style="margin-bottom: 3px; font-size: 11px;">
                        <span style="color: ${logColor};">[${log.level.toUpperCase()}]</span>
                        <span style="color: #a0aec0;">${new Date(log.timestamp).toLocaleTimeString()}</span>
                        <span>${log.message}</span>
                    </div>
                `;
            });
            
            logsHtml += '</div>';
            statusLogs.innerHTML = logsHtml;
        }
    }
    
    /**
     * Registra um erro
     * @param {string} feature - Nome da feature relacionada ao erro
     * @param {string} message - Mensagem de erro
     * @param {string} [file] - Arquivo onde ocorreu o erro
     * @param {number} [line] - Linha onde ocorreu o erro
     */
    logError(feature, message, file, line) {
        const error = {
            feature,
            message,
            file,
            line,
            timestamp: new Date()
        };
        
        this.errors.push(error);
        if (this.errors.length > 100) this.errors.shift();
        
        this.log('error', `${feature}: ${message}${file ? ` em ${file}:${line}` : ''}`);
        console.error(`[COPOM Dashboard] ${feature}: ${message}`, file ? `em ${file}:${line}` : '');
    }
    
    /**
     * Registra um aviso
     * @param {string} feature - Nome da feature relacionada ao aviso
     * @param {string} message - Mensagem de aviso
     */
    logWarning(feature, message) {
        const warning = {
            feature,
            message,
            timestamp: new Date()
        };
        
        this.warnings.push(warning);
        if (this.warnings.length > 100) this.warnings.shift();
        
        this.log('warning', `${feature}: ${message}`);
        console.warn(`[COPOM Dashboard] ${feature}: ${message}`);
    }
    
    /**
     * Registra uma mensagem de log
     * @param {string} level - Nível do log ('info', 'warning', 'error')
     * @param {string} message - Mensagem de log
     */
    log(level, message) {
        const logEntry = {
            level,
            message,
            timestamp: new Date()
        };
        
        this.logs.push(logEntry);
        if (this.logs.length > 1000) this.logs.shift();
    }
    
    /**
     * Gera um relatório de diagnóstico
     * @returns {Object} Relatório de diagnóstico
     */
    generateDiagnosticReport() {
        return {
            timestamp: new Date(),
            features: this.features,
            errors: this.errors,
            warnings: this.warnings,
            logs: this.logs.slice(-100),
            userAgent: navigator.userAgent,
            screenSize: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };
    }
    
    /**
     * Exporta o relatório de diagnóstico como JSON
     * @returns {string} Relatório em formato JSON
     */
    exportDiagnosticReport() {
        const report = this.generateDiagnosticReport();
        return JSON.stringify(report, null, 2);
    }
}

// Inicializar o monitor quando o documento estiver pronto
let dashboardMonitor;
document.addEventListener('DOMContentLoaded', () => {
    dashboardMonitor = new DashboardMonitor();
    
    // Expor para debugging
    window.dashboardMonitor = dashboardMonitor;
    
    console.log('Sistema de monitoramento do COPOM Dashboard inicializado');
});

/**
 * Função para verificar o status do sistema a partir de qualquer lugar
 * @returns {Object} Status atual do sistema
 */
function checkDashboardStatus() {
    if (!dashboardMonitor) return { error: 'Monitor não inicializado' };
    
    dashboardMonitor.checkAllFeatures();
    return {
        features: dashboardMonitor.features,
        lastCheck: dashboardMonitor.lastCheck,
        errorCount: dashboardMonitor.errors.length,
        warningCount: dashboardMonitor.warnings.length
    };
}

/**
 * Função para gerar relatório de diagnóstico a partir de qualquer lugar
 * @returns {Object} Relatório de diagnóstico
 */
function getDashboardDiagnostics() {
    if (!dashboardMonitor) return { error: 'Monitor não inicializado' };
    return dashboardMonitor.generateDiagnosticReport();
}

// Exportar funções globais
window.checkDashboardStatus = checkDashboardStatus;
window.getDashboardDiagnostics = getDashboardDiagnostics;
