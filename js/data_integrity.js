/**
 * Verificador de integridade de dados para o COPOM Dashboard
 * 
 * Este módulo implementa verificações específicas para garantir
 * a integridade e consistência dos dados exibidos no dashboard.
 */

class DataIntegrityChecker {
    constructor() {
        this.dataChecks = {};
        this.referenceData = {};
        this.lastCheck = null;
        
        // Inicializar verificador
        this.init();
    }
    
    /**
     * Inicializa o verificador de integridade de dados
     */
    init() {
        console.log('Inicializando verificador de integridade de dados...');
        
        document.addEventListener('DOMContentLoaded', () => {
            // Carregar dados de referência
            this.loadReferenceData();
            
            // Configurar verificações periódicas
            setInterval(() => {
                this.runAllChecks();
            }, 60000); // Verificar a cada minuto
            
            // Executar verificação inicial após carregamento
            setTimeout(() => {
                this.runAllChecks();
            }, 2000);
        });
    }
    
    /**
     * Carrega dados de referência para comparação
     */
    loadReferenceData() {
        // Dados de referência para a taxa Selic
        this.referenceData.selic = [
            { reuniao: '269ª', data: '18-19/03/2025', taxa: 14.25, decisao: 'Aumento de 25 pontos-base' },
            { reuniao: '268ª', data: '29-30/01/2025', taxa: 14.00, decisao: 'Aumento de 25 pontos-base' },
            { reuniao: '267ª', data: '11-12/12/2024', taxa: 13.75, decisao: 'Aumento de 25 pontos-base' },
            { reuniao: '266ª', data: '06-07/11/2024', taxa: 13.50, decisao: 'Aumento de 25 pontos-base' },
            { reuniao: '265ª', data: '17-18/09/2024', taxa: 13.25, decisao: 'Aumento de 25 pontos-base' },
            { reuniao: '264ª', data: '30-31/07/2024', taxa: 13.00, decisao: 'Aumento de 25 pontos-base' }
        ];
        
        // Dados de referência para indicadores econômicos
        this.referenceData.indicadores = {
            ipca: { valor: 4.25, referencia: 'Abril/2025' },
            cambio: { valor: 5.20, referencia: 'Março/2025' },
            vix: { valor: 18.5, referencia: '28/04/2025' }
        };
        
        // Dados de referência para juro neutro
        this.referenceData.juroNeutro = {
            focusExAnte: { valor: 5.35, referencia: 'Junho/2024' },
            hiatoProduto: { valor: 4.90, referencia: 'Maio/2024' },
            ntnbPremio: { valor: 5.60, referencia: 'Junho/2024' },
            laubachWilliams: { valor: 4.80, referencia: 'Abril/2024' },
            samba: { valor: 4.60, referencia: 'Junho/2024' },
            paridadeDescoberta: { valor: 4.30, referencia: 'Junho/2024' },
            modelosBC: { valor: 4.40, referencia: 'Junho/2024' },
            qpc: { valor: 5.00, referencia: 'Junho/2024' },
            mediana: { valor: 4.85, referencia: 'Junho/2024' }
        };
    }
    
    /**
     * Executa todas as verificações de integridade de dados
     */
    runAllChecks() {
        console.log('Executando verificações de integridade de dados...');
        this.lastCheck = new Date();
        
        this.dataChecks = {
            timestamp: this.lastCheck,
            selic: this.checkSelicData(),
            indicadores: this.checkIndicadoresData(),
            juroNeutro: this.checkJuroNeutroData(),
            modelosPreditivos: this.checkModelosPreditivosData(),
            simulador: this.checkSimuladorData(),
            modelosAvancados: this.checkModelosAvancadosData(),
            analiseNLP: this.checkAnaliseNLPData()
        };
        
        // Registrar resultados no console
        console.log('Resultados das verificações de integridade:', this.dataChecks);
        
        // Notificar o monitor se estiver disponível
        if (window.dashboardMonitor) {
            const hasErrors = Object.values(this.dataChecks).some(check => 
                check && check.status === 'error');
                
            const hasWarnings = Object.values(this.dataChecks).some(check => 
                check && check.status === 'warning');
                
            if (hasErrors) {
                window.dashboardMonitor.logError('Integridade de Dados', 
                    'Detectados problemas críticos na integridade dos dados');
            } else if (hasWarnings) {
                window.dashboardMonitor.logWarning('Integridade de Dados', 
                    'Detectados possíveis problemas na integridade dos dados');
            }
        }
        
        return this.dataChecks;
    }
    
    /**
     * Verifica a integridade dos dados da taxa Selic
     * @returns {Object} Resultado da verificação
     */
    checkSelicData() {
        const result = {
            status: 'pending',
            details: [],
            errors: []
        };
        
        try {
            // Buscar tabela de histórico da Selic
            const selicTable = document.querySelector('table:not(.jn-table)');
            
            if (!selicTable) {
                result.status = 'error';
                result.errors.push('Tabela de histórico da Selic não encontrada');
                return result;
            }
            
            // Verificar linhas da tabela
            const rows = selicTable.querySelectorAll('tbody tr');
            
            if (rows.length === 0) {
                result.status = 'error';
                result.errors.push('Nenhum dado de histórico da Selic encontrado');
                return result;
            }
            
            result.details.push(`${rows.length} registros de histórico da Selic encontrados`);
            
            // Verificar consistência com dados de referência
            let inconsistencies = 0;
            
            rows.forEach((row, index) => {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 3) {
                    const reuniao = cells[0].textContent.trim();
                    const taxa = parseFloat(cells[2].textContent.trim().replace('%', ''));
                    
                    // Verificar se temos dados de referência para esta reunião
                    const refData = this.referenceData.selic.find(item => 
                        item.reuniao === reuniao || item.reuniao.replace('ª', '') === reuniao.replace('ª', ''));
                    
                    if (refData) {
                        if (Math.abs(refData.taxa - taxa) > 0.01) {
                            inconsistencies++;
                            result.errors.push(`Inconsistência na taxa Selic da reunião ${reuniao}: exibido ${taxa}%, referência ${refData.taxa}%`);
                        }
                    }
                }
            });
            
            if (inconsistencies > 0) {
                result.status = 'error';
                result.errors.push(`${inconsistencies} inconsistências encontradas nos dados da Selic`);
            } else {
                result.status = 'ok';
                result.details.push('Dados da Selic consistentes com referências');
            }
        } catch (error) {
            result.status = 'error';
            result.errors.push(`Erro ao verificar dados da Selic: ${error.message}`);
        }
        
        return result;
    }
    
    /**
     * Verifica a integridade dos indicadores econômicos
     * @returns {Object} Resultado da verificação
     */
    checkIndicadoresData() {
        const result = {
            status: 'pending',
            details: [],
            errors: []
        };
        
        try {
            // Verificar IPCA
            const ipcaElement = document.querySelector('.ipca-valor, [data-indicator="ipca"]');
            if (ipcaElement) {
                const ipcaText = ipcaElement.textContent.trim();
                const ipcaValue = parseFloat(ipcaText.replace('%', ''));
                
                if (Math.abs(ipcaValue - this.referenceData.indicadores.ipca.valor) > 0.01) {
                    result.errors.push(`Inconsistência no valor do IPCA: exibido ${ipcaValue}%, referência ${this.referenceData.indicadores.ipca.valor}%`);
                } else {
                    result.details.push('Valor do IPCA consistente com referência');
                }
            } else {
                result.errors.push('Elemento de exibição do IPCA não encontrado');
            }
            
            // Verificar Câmbio
            const cambioElement = document.querySelector('.cambio-valor, [data-indicator="cambio"]');
            if (cambioElement) {
                const cambioText = cambioElement.textContent.trim();
                const cambioValue = parseFloat(cambioText.replace('USD/BRL', '').trim());
                
                if (Math.abs(cambioValue - this.referenceData.indicadores.cambio.valor) > 0.01) {
                    result.errors.push(`Inconsistência no valor do câmbio: exibido ${cambioValue}, referência ${this.referenceData.indicadores.cambio.valor}`);
                } else {
                    result.details.push('Valor do câmbio consistente com referência');
                }
            } else {
                result.errors.push('Elemento de exibição do câmbio não encontrado');
            }
            
            // Verificar VIX
            const vixElement = document.querySelector('.vix-valor, [data-indicator="vix"]');
            if (vixElement) {
                const vixText = vixElement.textContent.trim();
                const vixValue = parseFloat(vixText);
                
                if (Math.abs(vixValue - this.referenceData.indicadores.vix.valor) > 0.1) {
                    result.errors.push(`Inconsistência no valor do VIX: exibido ${vixValue}, referência ${this.referenceData.indicadores.vix.valor}`);
                } else {
                    result.details.push('Valor do VIX consistente com referência');
                }
            } else {
                result.errors.push('Elemento de exibição do VIX não encontrado');
            }
            
            // Verificar datas de referência
            const refDateElements = document.querySelectorAll('.data-referencia, [data-ref-date]');
            if (refDateElements.length === 0) {
                result.errors.push('Nenhuma data de referência encontrada para indicadores');
            } else {
                result.details.push(`${refDateElements.length} datas de referência encontradas`);
            }
            
            // Determinar status geral
            if (result.errors.length > 0) {
                result.status = result.errors.length > 2 ? 'error' : 'warning';
            } else {
                result.status = 'ok';
            }
        } catch (error) {
            result.status = 'error';
            result.errors.push(`Erro ao verificar indicadores econômicos: ${error.message}`);
        }
        
        return result;
    }
    
    /**
     * Verifica a integridade dos dados de juro neutro
     * @returns {Object} Resultado da verificação
     */
    checkJuroNeutroData() {
        const result = {
            status: 'pending',
            details: [],
            errors: []
        };
        
        try {
            // Verificar tabela de modelos de juro neutro
            const jnTable = document.querySelector('.jn-table, table.juro-neutro');
            
            if (!jnTable) {
                result.status = 'error';
                result.errors.push('Tabela de modelos de juro neutro não encontrada');
                return result;
            }
            
            // Verificar linhas da tabela
            const rows = jnTable.querySelectorAll('tbody tr');
            
            if (rows.length === 0) {
                result.status = 'error';
                result.errors.push('Nenhum modelo de juro neutro encontrado na tabela');
                return result;
            }
            
            result.details.push(`${rows.length} modelos de juro neutro encontrados`);
            
            // Verificar consistência com dados de referência
            let inconsistencies = 0;
            const modelosVerificados = [];
            
            rows.forEach((row) => {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 2) {
                    const modelo = cells[0].textContent.trim();
                    const valorText = cells[1].textContent.trim();
                    const valor = parseFloat(valorText.replace('%', ''));
                    
                    modelosVerificados.push(modelo);
                    
                    // Verificar valor com referência
                    let refModelo = null;
                    
                    if (modelo.includes('Focus')) refModelo = 'focusExAnte';
                    else if (modelo.includes('Hiato')) refModelo = 'hiatoProduto';
                    else if (modelo.includes('NTN-B')) refModelo = 'ntnbPremio';
                    else if (modelo.includes('Laubach')) refModelo = 'laubachWilliams';
                    else if (modelo.includes('SAMBA')) refModelo = 'samba';
                    else if (modelo.includes('Paridade')) refModelo = 'paridadeDescoberta';
                    else if (modelo.includes('BC')) refModelo = 'modelosBC';
                    else if (modelo.includes('QPC')) refModelo = 'qpc';
                    else if (modelo.includes('Mediana')) refModelo = 'mediana';
                    
                    if (refModelo && this.referenceData.juroNeutro[refModelo]) {
                        const refValor = this.referenceData.juroNeutro[refModelo].valor;
                        
                        if (Math.abs(valor - refValor) > 0.1) {
                            inconsistencies++;
                            result.errors.push(`Inconsistência no valor do modelo ${modelo}: exibido ${valor}%, referência ${refValor}%`);
                        }
                    }
                }
            });
            
            // Verificar se todos os modelos esperados estão presentes
            const modelosEsperados = ['Focus', 'Hiato', 'NTN-B', 'Laubach', 'SAMBA', 'Paridade', 'BC', 'QPC', 'Mediana'];
            
            modelosEsperados.forEach(modelo => {
                const encontrado = modelosVerificados.some(m => m.includes(modelo));
                if (!encontrado) {
                    result.errors.push(`Modelo de juro neutro não encontrado: ${modelo}`);
                }
            });
            
            // Verificar datas de referência
            const refDateElements = jnTable.querySelectorAll('.data-referencia, [data-ref-date]');
            if (refDateElements.length === 0) {
                result.errors.push('Nenhuma data de referência encontrada para modelos de juro neutro');
            }
            
            // Determinar status geral
            if (inconsistencies > 0 || result.errors.length > 0) {
                result.status = inconsistencies > 2 || result.errors.length > 2 ? 'error' : 'warning';
            } else {
                result.status = 'ok';
                result.details.push('Dados de juro neutro consistentes com referências');
            }
        } catch (error) {
            result.status = 'error';
            result.errors.push(`Erro ao verificar dados de juro neutro: ${error.message}`);
        }
        
        return result;
    }
    
    /**
     * Verifica a integridade dos dados dos modelos preditivos
     * @returns {Object} Resultado da verificação
     */
    checkModelosPreditivosData() {
        const result = {
            status: 'pending',
            details: [],
            errors: []
        };
        
        try {
            // Verificar seção de previsão
            const previsaoSection = document.querySelector('.previsao-section, .proxima-reuniao');
            
            if (!previsaoSection) {
                result.status = 'error';
                result.errors.push('Seção de previsão não encontrada');
                return result;
            }
            
            // Verificar se há probabilidades
            const probabilidades = previsaoSection.querySelectorAll('.probabilidade, .probability');
            
            if (probabilidades.length === 0) {
                result.status = 'error';
                result.errors.push('Nenhuma probabilidade encontrada na seção de previsão');
                return result;
            }
            
            result.details.push(`${probabilidades.length} probabilidades encontradas`);
            
            // Verificar se a soma das probabilidades é aproximadamente 100%
            let somaProb = 0;
            
            probabilidades.forEach(prob => {
                const probText = prob.textContent.trim();
                const probValue = parseFloat(probText.replace('%', ''));
                
                if (!isNaN(probValue)) {
                    somaProb += probValue;
                }
            });
            
            if (Math.abs(somaProb - 100) > 5) {
                result.errors.push(`Soma das probabilidades (${somaProb}%) difere significativamente de 100%`);
            } else {
                result.details.push(`Soma das probabilidades: ${somaProb}%`);
            }
            
            // Verificar data de referência da previsão
            const previsaoDate = previsaoSection.querySelector('.data-previsao, .forecast-date');
            
            if (!previsaoDate) {
                result.errors.push('Data de referência da previsão não encontrada');
            } else {
                result.details.push(`Data de previsão: ${previsaoDate.textContent.trim()}`);
            }
            
            // Determinar status geral
            if (result.errors.length > 0) {
                result.status = result.errors.length > 1 ? 'error' : 'warning';
            } else {
                result.status = 'ok';
                result.details.push('Dados dos modelos preditivos parecem consistentes');
            }
        } catch (error) {
            result.status = 'error';
            result.errors.push(`Erro ao verificar dados dos modelos preditivos: ${error.message}`);
        }
        
        return result;
    }
    
    /**
     * Verifica a integridade dos dados do simulador
     * @returns {Object} Resultado da verificação
     */
    checkSimuladorData() {
        const result = {
            status: 'pending',
            details: [],
            errors: []
        };
        
        try {
            // Verificar seção do simulador
            const simuladorSection = document.getElementById('simulador');
            
            if (!simuladorSection) {
                result.status = 'warning';
                result.errors.push('Seção do simulador não encontrada');
                return result;
            }
            
            // Verificar controles do simulador
            const controls = simuladorSection.querySelectorAll('input, select, button');
            
            if (controls.length === 0) {
                result.status = 'error';
                result.errors.push('Nenhum controle encontrado no simulador');
                return result;
            }
            
            result.details.push(`${controls.length} controles encontrados no simulador`);
            
            // Verificar área de resultados
            const resultArea = simuladorSection.querySelector('.simulador-resultados, .resultado-simulacao');
            
            if (!resultArea) {
                result.status = 'warning';
                result.errors.push('Área de resultados do simulador não encontrada');
            } else {
                result.details.push('Área de resultados do simulador encontrada');
            }
            
            // Determinar status geral
            if (result.errors.length > 0) {
                result.status = result.errors.length > 1 ? 'error' : 'warning';
            } else {
                result.status = 'ok';
                result.details.push('Estrutura do simulador parece consistente');
            }
        } catch (error) {
            result.status = 'error';
            result.errors.push(`Erro ao verificar dados do simulador: ${error.message}`);
        }
        
        return result;
    }
    
    /**
     * Verifica a integridade dos dados dos modelos avançados
     * @returns {Object} Resultado da verificação
     */
    checkModelosAvancadosData() {
        const result = {
            status: 'pending',
            details: [],
            errors: []
        };
        
        try {
            // Verificar seção de modelos avançados
            const modelosAvancadosSection = document.getElementById('modelos-avancados');
            
            if (!modelosAvancadosSection) {
                result.status = 'warning';
                result.errors.push('Seção de modelos avançados não encontrada');
                return result;
            }
            
            // Verificar cards de modelos
            const modelCards = modelosAvancadosSection.querySelectorAll('.modelo-card, .modelo-avancado');
            
            if (modelCards.length === 0) {
                result.status = 'error';
                result.errors.push('Nenhum card de modelo avançado encontrado');
                return result;
            }
            
            result.details.push(`${modelCards.length} cards de modelos avançados encontrados`);
            
            // Verificar visualizações
            const visualizations = modelosAvancadosSection.querySelectorAll('canvas, svg, .chart, .grafico');
            
            if (visualizations.length === 0) {
                result.status = 'warning';
                result.errors.push('Nenhuma visualização encontrada nos modelos avançados');
            } else {
                result.details.push(`${visualizations.length} visualizações encontradas nos modelos avançados`);
            }
            
            // Verificar datas de referência
            const refDates = modelosAvancadosSection.querySelectorAll('.data-referencia, [data-ref-date]');
            
            if (refDates.length === 0) {
                result.errors.push('Nenhuma data de referência encontrada nos modelos avançados');
            } else {
                result.details.push(`${refDates.length} datas de referência encontradas nos modelos avançados`);
            }
            
            // Determinar status geral
            if (result.errors.length > 0) {
                result.status = result.errors.length > 1 ? 'error' : 'warning';
            } else {
                result.status = 'ok';
                result.details.push('Dados dos modelos avançados parecem consistentes');
            }
        } catch (error) {
            result.status = 'error';
            result.errors.push(`Erro ao verificar dados dos modelos avançados: ${error.message}`);
        }
        
        return result;
    }
    
    /**
     * Verifica a integridade dos dados da análise NLP
     * @returns {Object} Resultado da verificação
     */
    checkAnaliseNLPData() {
        const result = {
            status: 'pending',
            details: [],
            errors: []
        };
        
        try {
            // Verificar seção de análise NLP
            const nlpSection = document.getElementById('modelo-nlp');
            
            if (!nlpSection) {
                result.status = 'warning';
                result.errors.push('Seção de análise NLP não encontrada');
                return result;
            }
            
            // Verificar elementos de tópicos
            const topicos = nlpSection.querySelectorAll('.topico, .topic, .topico-card');
            
            if (topicos.length === 0) {
                result.status = 'error';
                result.errors.push('Nenhum tópico encontrado na análise NLP');
                return result;
            }
            
            result.details.push(`${topicos.length} tópicos encontrados na análise NLP`);
            
            // Verificar elementos de palavras-chave
            const palavras = nlpSection.querySelectorAll('.palavra, .keyword, .palavra-chip');
            
            if (palavras.length === 0) {
                result.status = 'warning';
                result.errors.push('Nenhuma palavra-chave encontrada na análise NLP');
            } else {
                result.details.push(`${palavras.length} palavras-chave encontradas na análise NLP`);
            }
            
            // Verificar visualizações
            const visualizations = nlpSection.querySelectorAll('canvas, svg, .chart, .grafico');
            
            if (visualizations.length === 0) {
                result.status = 'warning';
                result.errors.push('Nenhuma visualização encontrada na análise NLP');
            } else {
                result.details.push(`${visualizations.length} visualizações encontradas na análise NLP`);
            }
            
            // Verificar datas de referência
            const refDates = nlpSection.querySelectorAll('.data-referencia, [data-ref-date]');
            
            if (refDates.length === 0) {
                result.errors.push('Nenhuma data de referência encontrada na análise NLP');
            } else {
                result.details.push(`${refDates.length} datas de referência encontradas na análise NLP`);
            }
            
            // Determinar status geral
            if (result.errors.length > 0) {
                result.status = result.errors.length > 1 ? 'error' : 'warning';
            } else {
                result.status = 'ok';
                result.details.push('Dados da análise NLP parecem consistentes');
            }
        } catch (error) {
            result.status = 'error';
            result.errors.push(`Erro ao verificar dados da análise NLP: ${error.message}`);
        }
        
        return result;
    }
    
    /**
     * Gera um relatório de integridade de dados
     * @returns {Object} Relatório de integridade
     */
    generateIntegrityReport() {
        // Executar todas as verificações
        this.runAllChecks();
        
        // Contar problemas
        const errorCount = Object.values(this.dataChecks).filter(check => 
            check && check.status === 'error').length;
            
        const warningCount = Object.values(this.dataChecks).filter(check => 
            check && check.status === 'warning').length;
            
        // Determinar status geral
        let overallStatus = 'ok';
        if (errorCount > 0) overallStatus = 'error';
        else if (warningCount > 0) overallStatus = 'warning';
        
        return {
            timestamp: new Date(),
            overallStatus,
            errorCount,
            warningCount,
            checks: this.dataChecks
        };
    }
}

// Inicializar o verificador de integridade quando o documento estiver pronto
let dataIntegrityChecker;
document.addEventListener('DOMContentLoaded', () => {
    dataIntegrityChecker = new DataIntegrityChecker();
    
    // Expor para debugging
    window.dataIntegrityChecker = dataIntegrityChecker;
    
    console.log('Verificador de integridade de dados inicializado');
});

/**
 * Função para verificar integridade de dados a partir de qualquer lugar
 * @returns {Object} Resultado da verificação
 */
function checkDataIntegrity() {
    if (!dataIntegrityChecker) return { error: 'Verificador de integridade não inicializado' };
    return dataIntegrityChecker.runAllChecks();
}

/**
 * Função para gerar relatório de integridade a partir de qualquer lugar
 * @returns {Object} Relatório de integridade
 */
function getDataIntegrityReport() {
    if (!dataIntegrityChecker) return { error: 'Verificador de integridade não inicializado' };
    return dataIntegrityChecker.generateIntegrityReport();
}

// Exportar funções globais
window.checkDataIntegrity = checkDataIntegrity;
window.getDataIntegrityReport = getDataIntegrityReport;
