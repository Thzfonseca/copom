/**
 * Ferramenta de diagnóstico e suporte para o COPOM Dashboard
 * 
 * Este módulo implementa ferramentas adicionais para diagnóstico
 * e suporte técnico, permitindo identificar e resolver problemas.
 */

class DashboardDiagnostic {
    constructor() {
        this.testResults = {};
        this.performanceMetrics = {};
        this.resourceUsage = {};
        this.networkRequests = [];
        
        // Inicializar captura de métricas
        this.initPerformanceMonitoring();
        this.initNetworkMonitoring();
    }
    
    /**
     * Inicializa monitoramento de performance
     */
    initPerformanceMonitoring() {
        if (window.performance && window.performance.memory) {
            setInterval(() => {
                this.resourceUsage = {
                    jsHeapSizeLimit: window.performance.memory.jsHeapSizeLimit,
                    totalJSHeapSize: window.performance.memory.totalJSHeapSize,
                    usedJSHeapSize: window.performance.memory.usedJSHeapSize,
                    timestamp: new Date()
                };
            }, 30000);
        }
        
        // Monitorar métricas de carregamento
        window.addEventListener('load', () => {
            setTimeout(() => {
                if (window.performance && window.performance.timing) {
                    const timing = window.performance.timing;
                    
                    this.performanceMetrics = {
                        loadTime: timing.loadEventEnd - timing.navigationStart,
                        domReadyTime: timing.domComplete - timing.domLoading,
                        readyStart: timing.fetchStart - timing.navigationStart,
                        redirectTime: timing.redirectEnd - timing.redirectStart,
                        appcacheTime: timing.domainLookupStart - timing.fetchStart,
                        unloadEventTime: timing.unloadEventEnd - timing.unloadEventStart,
                        lookupDomainTime: timing.domainLookupEnd - timing.domainLookupStart,
                        connectTime: timing.connectEnd - timing.connectStart,
                        requestTime: timing.responseEnd - timing.requestStart,
                        initDomTreeTime: timing.domInteractive - timing.responseEnd,
                        loadEventTime: timing.loadEventEnd - timing.loadEventStart,
                        timestamp: new Date()
                    };
                }
            }, 0);
        });
    }
    
    /**
     * Inicializa monitoramento de requisições de rede
     */
    initNetworkMonitoring() {
        if (window.PerformanceObserver) {
            try {
                const observer = new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) => {
                        if (entry.entryType === 'resource') {
                            this.networkRequests.push({
                                name: entry.name,
                                startTime: entry.startTime,
                                duration: entry.duration,
                                initiatorType: entry.initiatorType,
                                size: entry.transferSize,
                                timestamp: new Date()
                            });
                            
                            // Limitar o número de requisições armazenadas
                            if (this.networkRequests.length > 100) {
                                this.networkRequests.shift();
                            }
                        }
                    });
                });
                
                observer.observe({ entryTypes: ['resource'] });
            } catch (e) {
                console.error('Erro ao inicializar PerformanceObserver:', e);
            }
        }
    }
    
    /**
     * Executa testes em todas as features
     * @returns {Promise<Object>} Resultados dos testes
     */
    async runDiagnosticTests() {
        console.log('Iniciando testes de diagnóstico...');
        
        this.testResults = {
            timestamp: new Date(),
            navigation: await this.testNavigation(),
            tabs: await this.testTabs(),
            modelosPreditivos: await this.testModelosPreditivos(),
            simulador: await this.testSimulador(),
            modelosAvancados: await this.testModelosAvancados(),
            analiseNLP: await this.testAnaliseNLP(),
            juroNeutro: await this.testJuroNeutro()
        };
        
        return this.testResults;
    }
    
    /**
     * Testa a navegação do site
     * @returns {Promise<Object>} Resultado do teste
     */
    async testNavigation() {
        const result = {
            status: 'pending',
            details: [],
            errors: []
        };
        
        try {
            const navLinks = document.querySelectorAll('.tab-link');
            
            if (navLinks.length === 0) {
                result.status = 'error';
                result.errors.push('Nenhum link de navegação encontrado');
                return result;
            }
            
            // Verificar se todos os links têm atributos data-tab
            let allValid = true;
            navLinks.forEach(link => {
                const tabId = link.getAttribute('data-tab');
                if (!tabId) {
                    allValid = false;
                    result.errors.push(`Link sem atributo data-tab: ${link.textContent}`);
                } else {
                    result.details.push(`Link para tab "${tabId}" encontrado`);
                }
            });
            
            result.status = allValid ? 'ok' : 'warning';
        } catch (error) {
            result.status = 'error';
            result.errors.push(`Erro ao testar navegação: ${error.message}`);
        }
        
        return result;
    }
    
    /**
     * Testa as tabs do site
     * @returns {Promise<Object>} Resultado do teste
     */
    async testTabs() {
        const result = {
            status: 'pending',
            details: [],
            errors: []
        };
        
        try {
            const tabContents = document.querySelectorAll('.tab-content');
            
            if (tabContents.length === 0) {
                result.status = 'error';
                result.errors.push('Nenhum conteúdo de tab encontrado');
                return result;
            }
            
            // Verificar se todas as tabs têm conteúdo
            let allValid = true;
            tabContents.forEach(tab => {
                const id = tab.id;
                const hasContent = tab.innerHTML.trim().length > 0;
                
                if (!hasContent) {
                    allValid = false;
                    result.errors.push(`Tab "${id}" não tem conteúdo`);
                } else {
                    result.details.push(`Tab "${id}" tem conteúdo`);
                }
            });
            
            result.status = allValid ? 'ok' : 'warning';
        } catch (error) {
            result.status = 'error';
            result.errors.push(`Erro ao testar tabs: ${error.message}`);
        }
        
        return result;
    }
    
    /**
     * Testa os modelos preditivos
     * @returns {Promise<Object>} Resultado do teste
     */
    async testModelosPreditivos() {
        const result = {
            status: 'pending',
            details: [],
            errors: []
        };
        
        try {
            const modelosTab = document.getElementById('modelos');
            
            if (!modelosTab) {
                result.status = 'error';
                result.errors.push('Tab de modelos preditivos não encontrada');
                return result;
            }
            
            // Verificar se há cards de modelos
            const modelCards = modelosTab.querySelectorAll('.modelo-card');
            
            if (modelCards.length === 0) {
                result.status = 'error';
                result.errors.push('Nenhum card de modelo encontrado');
                return result;
            }
            
            result.details.push(`${modelCards.length} cards de modelos encontrados`);
            
            // Verificar se há previsões
            let hasValidPredictions = false;
            modelCards.forEach((card, index) => {
                const previsao = card.querySelector('.modelo-previsao');
                if (previsao && previsao.textContent.trim() !== '') {
                    hasValidPredictions = true;
                    result.details.push(`Modelo ${index + 1} tem previsão válida`);
                } else {
                    result.errors.push(`Modelo ${index + 1} não tem previsão válida`);
                }
            });
            
            result.status = hasValidPredictions ? 'ok' : 'error';
        } catch (error) {
            result.status = 'error';
            result.errors.push(`Erro ao testar modelos preditivos: ${error.message}`);
        }
        
        return result;
    }
    
    /**
     * Testa o simulador
     * @returns {Promise<Object>} Resultado do teste
     */
    async testSimulador() {
        const result = {
            status: 'pending',
            details: [],
            errors: []
        };
        
        try {
            const simuladorTab = document.getElementById('simulador');
            
            if (!simuladorTab) {
                result.status = 'error';
                result.errors.push('Tab de simulador não encontrada');
                return result;
            }
            
            // Verificar se há controles
            const controls = simuladorTab.querySelectorAll('input, select, button');
            
            if (controls.length === 0) {
                result.status = 'error';
                result.errors.push('Nenhum controle de simulação encontrado');
                return result;
            }
            
            result.details.push(`${controls.length} controles de simulação encontrados`);
            
            // Verificar se há área de resultados
            const resultArea = simuladorTab.querySelector('.simulador-resultados, .resultado-simulacao');
            
            if (!resultArea) {
                result.status = 'warning';
                result.errors.push('Área de resultados não encontrada');
            } else {
                result.details.push('Área de resultados encontrada');
            }
            
            // Verificar se há botão de simulação
            const simButton = simuladorTab.querySelector('button');
            
            if (!simButton) {
                result.status = 'warning';
                result.errors.push('Botão de simulação não encontrado');
            } else {
                result.details.push('Botão de simulação encontrado');
                result.status = 'ok';
            }
        } catch (error) {
            result.status = 'error';
            result.errors.push(`Erro ao testar simulador: ${error.message}`);
        }
        
        return result;
    }
    
    /**
     * Testa os modelos avançados
     * @returns {Promise<Object>} Resultado do teste
     */
    async testModelosAvancados() {
        const result = {
            status: 'pending',
            details: [],
            errors: []
        };
        
        try {
            const modelosAvancadosTab = document.getElementById('modelos-avancados');
            
            if (!modelosAvancadosTab) {
                result.status = 'error';
                result.errors.push('Tab de modelos avançados não encontrada');
                return result;
            }
            
            // Verificar se há descrições de modelos
            const modelDescriptions = modelosAvancadosTab.querySelectorAll('.modelo-card, .modelo-detalhes');
            
            if (modelDescriptions.length === 0) {
                result.status = 'error';
                result.errors.push('Nenhuma descrição de modelo avançado encontrada');
                return result;
            }
            
            result.details.push(`${modelDescriptions.length} descrições de modelos avançados encontradas`);
            
            // Verificar se há visualizações
            const visualizations = modelosAvancadosTab.querySelectorAll('canvas, svg, .chart, .grafico');
            
            if (visualizations.length === 0) {
                result.status = 'warning';
                result.errors.push('Nenhuma visualização gráfica encontrada');
            } else {
                result.details.push(`${visualizations.length} visualizações gráficas encontradas`);
                result.status = 'ok';
            }
        } catch (error) {
            result.status = 'error';
            result.errors.push(`Erro ao testar modelos avançados: ${error.message}`);
        }
        
        return result;
    }
    
    /**
     * Testa a análise NLP
     * @returns {Promise<Object>} Resultado do teste
     */
    async testAnaliseNLP() {
        const result = {
            status: 'pending',
            details: [],
            errors: []
        };
        
        try {
            const nlpTab = document.getElementById('modelo-nlp');
            
            if (!nlpTab) {
                result.status = 'error';
                result.errors.push('Tab de análise NLP não encontrada');
                return result;
            }
            
            // Verificar se há resultados de análise
            const analysisResults = nlpTab.querySelectorAll('.topicos-container, .palavras-topico, .tom-chart, .frases-fg');
            
            if (analysisResults.length === 0) {
                result.status = 'error';
                result.errors.push('Nenhum resultado de análise NLP encontrado');
                return result;
            }
            
            result.details.push(`${analysisResults.length} elementos de análise NLP encontrados`);
            
            // Verificar se há visualizações específicas de NLP
            const nlpVisualizations = nlpTab.querySelectorAll('.topico-card, .palavra-chip, .tom-item');
            
            if (nlpVisualizations.length === 0) {
                result.status = 'warning';
                result.errors.push('Nenhuma visualização específica de NLP encontrada');
            } else {
                result.details.push(`${nlpVisualizations.length} visualizações específicas de NLP encontradas`);
                result.status = 'ok';
            }
        } catch (error) {
            result.status = 'error';
            result.errors.push(`Erro ao testar análise NLP: ${error.message}`);
        }
        
        return result;
    }
    
    /**
     * Testa a seção de juro neutro
     * @returns {Promise<Object>} Resultado do teste
     */
    async testJuroNeutro() {
        const result = {
            status: 'pending',
            details: [],
            errors: []
        };
        
        try {
            const juroNeutroTab = document.getElementById('juro-neutro');
            
            if (!juroNeutroTab) {
                result.status = 'error';
                result.errors.push('Tab de juro neutro não encontrada');
                return result;
            }
            
            // Verificar se existe o gauge de juro neutro
            const gauge = juroNeutroTab.querySelector('.jn-gauge');
            
            if (!gauge) {
                result.status = 'error';
                result.errors.push('Gauge de juro neutro não encontrado');
                return result;
            }
            
            result.details.push('Gauge de juro neutro encontrado');
            
            // Verificar se há tabela de modelos
            const modelTable = juroNeutroTab.querySelector('table');
            
            if (!modelTable) {
                result.status = 'warning';
                result.errors.push('Tabela de modelos não encontrada');
            } else {
                const rows = modelTable.querySelectorAll('tbody tr');
                result.details.push(`Tabela de modelos encontrada com ${rows.length} linhas`);
            }
            
            // Verificar se há datas de referência
            const refDates = juroNeutroTab.querySelectorAll('.data-referencia');
            
            if (refDates.length === 0) {
                result.status = 'warning';
                result.errors.push('Datas de referência não encontradas');
            } else {
                result.details.push(`${refDates.length} datas de referência encontradas`);
                result.status = 'ok';
            }
        } catch (error) {
            result.status = 'error';
            result.errors.push(`Erro ao testar juro neutro: ${error.message}`);
        }
        
        return result;
    }
    
    /**
     * Verifica se há erros de JavaScript no console
     * @returns {Promise<Object>} Resultado da verificação
     */
    async checkConsoleErrors() {
        // Esta função é apenas um stub, pois não podemos acessar diretamente
        // os erros do console. Na prática, usamos o event listener de erro
        // no monitor.js para capturar erros.
        return {
            status: 'info',
            message: 'Verificação de erros do console deve ser feita através do monitor.js'
        };
    }
    
    /**
     * Verifica a compatibilidade do navegador
     * @returns {Object} Resultado da verificação
     */
    checkBrowserCompatibility() {
        const result = {
            status: 'pending',
            details: [],
            errors: []
        };
        
        try {
            const features = {
                localStorage: !!window.localStorage,
                sessionStorage: !!window.sessionStorage,
                cookies: navigator.cookieEnabled,
                es6: typeof Symbol !== 'undefined' && typeof Promise !== 'undefined',
                fetch: typeof fetch !== 'undefined',
                canvas: !!document.createElement('canvas').getContext,
                webgl: (function() {
                    try {
                        return !!window.WebGLRenderingContext && 
                               !!document.createElement('canvas').getContext('webgl');
                    } catch(e) {
                        return false;
                    }
                })(),
                flexbox: (function() {
                    const el = document.createElement('div');
                    return 'flexBasis' in el.style || 
                           'webkitFlexBasis' in el.style || 
                           'mozFlexBasis' in el.style;
                })()
            };
            
            let allCompatible = true;
            
            for (const [feature, supported] of Object.entries(features)) {
                if (supported) {
                    result.details.push(`${feature}: Suportado`);
                } else {
                    allCompatible = false;
                    result.errors.push(`${feature}: Não suportado`);
                }
            }
            
            // Adicionar informações do navegador
            result.details.push(`Navegador: ${navigator.userAgent}`);
            
            result.status = allCompatible ? 'ok' : 'warning';
        } catch (error) {
            result.status = 'error';
            result.errors.push(`Erro ao verificar compatibilidade: ${error.message}`);
        }
        
        return result;
    }
    
    /**
     * Gera um relatório completo de diagnóstico
     * @returns {Object} Relatório de diagnóstico
     */
    async generateFullReport() {
        await this.runDiagnosticTests();
        
        return {
            timestamp: new Date(),
            testResults: this.testResults,
            performanceMetrics: this.performanceMetrics,
            resourceUsage: this.resourceUsage,
            networkRequests: this.networkRequests.slice(-20),
            browserCompatibility: this.checkBrowserCompatibility(),
            userAgent: navigator.userAgent,
            screenSize: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };
    }
    
    /**
     * Exporta o relatório completo como JSON
     * @returns {string} Relatório em formato JSON
     */
    async exportFullReport() {
        const report = await this.generateFullReport();
        return JSON.stringify(report, null, 2);
    }
    
    /**
     * Cria um arquivo de log para download
     */
    async downloadDiagnosticReport() {
        try {
            const report = await this.exportFullReport();
            const blob = new Blob([report], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `copom-dashboard-diagnostic-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
            document.body.appendChild(a);
            a.click();
            
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
        } catch (error) {
            console.error('Erro ao gerar relatório para download:', error);
        }
    }
}

// Inicializar a ferramenta de diagnóstico quando o documento estiver pronto
let dashboardDiagnostic;
document.addEventListener('DOMContentLoaded', () => {
    dashboardDiagnostic = new DashboardDiagnostic();
    
    // Expor para debugging
    window.dashboardDiagnostic = dashboardDiagnostic;
    
    console.log('Ferramenta de diagnóstico do COPOM Dashboard inicializada');
    
    // Adicionar botão de diagnóstico ao painel de status
    setTimeout(() => {
        const statusPanel = document.getElementById('status-panel');
        if (statusPanel) {
            const statusHeader = statusPanel.querySelector('.status-header');
            if (statusHeader) {
                const diagButton = document.createElement('button');
                diagButton.id = 'run-diagnostics';
                diagButton.innerHTML = '🔍';
                diagButton.title = 'Executar diagnóstico completo';
                diagButton.style.cssText = `
                    background: #2d3748;
                    border: none;
                    color: white;
                    padding: 2px 5px;
                    margin-right: 5px;
                    border-radius: 3px;
                    cursor: pointer;
                `;
                
                const buttonContainer = statusHeader.querySelector('div');
                if (buttonContainer) {
                    buttonContainer.insertBefore(diagButton, buttonContainer.firstChild);
                    
                    // Adicionar event listener
                    document.getElementById('run-diagnostics').addEventListener('click', async () => {
                        alert('Executando diagnóstico completo. Isso pode levar alguns segundos...');
                        await dashboardDiagnostic.downloadDiagnosticReport();
                    });
                }
            }
        }
    }, 1000);
});

/**
 * Função para executar diagnóstico a partir de qualquer lugar
 * @returns {Promise<Object>} Resultado do diagnóstico
 */
async function runDashboardDiagnostic() {
    if (!dashboardDiagnostic) return { error: 'Ferramenta de diagnóstico não inicializada' };
    return await dashboardDiagnostic.runDiagnosticTests();
}

/**
 * Função para gerar relatório completo a partir de qualquer lugar
 * @returns {Promise<Object>} Relatório completo
 */
async function getFullDashboardReport() {
    if (!dashboardDiagnostic) return { error: 'Ferramenta de diagnóstico não inicializada' };
    return await dashboardDiagnostic.generateFullReport();
}

/**
 * Função para baixar relatório de diagnóstico a partir de qualquer lugar
 */
async function downloadDashboardReport() {
    if (!dashboardDiagnostic) {
        alert('Ferramenta de diagnóstico não inicializada');
        return;
    }
    await dashboardDiagnostic.downloadDiagnosticReport();
}

// Exportar funções globais
window.runDashboardDiagnostic = runDashboardDiagnostic;
window.getFullDashboardReport = getFullDashboardReport;
window.downloadDashboardReport = downloadDashboardReport;
