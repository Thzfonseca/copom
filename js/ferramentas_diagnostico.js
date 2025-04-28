/**
 * Ferramentas de suporte e diagnóstico para o COPOM Dashboard
 * 
 * Este módulo implementa ferramentas para verificar o funcionamento
 * correto de todas as features do sistema e diagnosticar problemas.
 */

class FerramentasDiagnostico {
    constructor() {
        this.dataVerificacao = new Date().toLocaleString('pt-BR');
        this.statusComponentes = {};
        this.errosDetectados = [];
        this.logOperacoes = [];
        
        // Componentes a serem verificados
        this.componentesObrigatorios = [
            { id: 'modelosPreditivos', nome: 'Modelos Preditivos', arquivo: 'modelos_preditivos.js' },
            { id: 'simuladorCopom', nome: 'Simulador de Cenários', arquivo: 'simulador.js' },
            { id: 'modelosAvancados', nome: 'Modelos Avançados', arquivo: 'modelos_avancados.js' },
            { id: 'analisadorAtas', nome: 'Análise NLP de Atas', arquivo: 'analise_atas.js' },
            { id: 'juroNeutro', nome: 'Modelos de Juro Neutro', arquivo: 'juro_neutro/juro_neutro.js' },
            { id: 'monitor', nome: 'Sistema de Monitoramento', arquivo: 'monitor.js' },
            { id: 'dataIntegrity', nome: 'Verificador de Integridade', arquivo: 'data_integrity.js' }
        ];
        
        // Funções de renderização a serem verificadas
        this.funcoesRenderizacao = [
            { id: 'renderizarModelosPreditivos', componente: 'modelosPreditivos' },
            { id: 'renderizarSimulador', componente: 'simuladorCopom' },
            { id: 'renderizarModelosAvancados', componente: 'modelosAvancados' },
            { id: 'renderizarAnaliseAtas', componente: 'analisadorAtas' },
            { id: 'renderizarJuroNeutro', componente: 'juroNeutro' }
        ];
        
        // Elementos da interface a serem verificados
        this.elementosInterface = [
            { id: 'dashboard', nome: 'Dashboard Principal' },
            { id: 'modelos', nome: 'Modelos Preditivos' },
            { id: 'simulador', nome: 'Simulador de Cenários' },
            { id: 'modelos-avancados', nome: 'Modelos Avançados' },
            { id: 'analise-nlp', nome: 'Análise NLP de Atas' },
            { id: 'juro-neutro', nome: 'Juro Real Neutro' }
        ];
    }
    
    /**
     * Executa verificação completa do sistema
     * @returns {Object} Resultado da verificação
     */
    verificarSistema() {
        console.log('Iniciando verificação completa do sistema...');
        this.logOperacao('Iniciando verificação completa do sistema');
        
        // Limpar resultados anteriores
        this.statusComponentes = {};
        this.errosDetectados = [];
        
        // Verificar componentes obrigatórios
        this.verificarComponentesObrigatorios();
        
        // Verificar funções de renderização
        this.verificarFuncoesRenderizacao();
        
        // Verificar elementos da interface
        this.verificarElementosInterface();
        
        // Verificar integridade de dados
        this.verificarIntegridadeDados();
        
        // Verificar consistência entre componentes
        this.verificarConsistenciaComponentes();
        
        // Gerar relatório
        const relatorio = this.gerarRelatorio();
        
        console.log('Verificação completa do sistema concluída');
        this.logOperacao('Verificação completa do sistema concluída');
        
        return relatorio;
    }
    
    /**
     * Verifica a presença dos componentes obrigatórios
     */
    verificarComponentesObrigatorios() {
        this.logOperacao('Verificando componentes obrigatórios');
        
        this.componentesObrigatorios.forEach(componente => {
            const status = {
                nome: componente.nome,
                arquivo: componente.arquivo,
                presente: window[componente.id] !== undefined,
                funcional: false
            };
            
            if (status.presente) {
                try {
                    // Verificar funcionalidade básica
                    if (componente.id === 'modelosPreditivos') {
                        status.funcional = typeof window[componente.id].getResultados === 'function';
                    } else if (componente.id === 'simuladorCopom') {
                        status.funcional = typeof window[componente.id].inicializar === 'function';
                    } else if (componente.id === 'modelosAvancados') {
                        status.funcional = typeof window[componente.id].getResultados === 'function';
                    } else if (componente.id === 'analisadorAtas') {
                        status.funcional = typeof window[componente.id].getResultados === 'function';
                    } else if (componente.id === 'juroNeutro') {
                        status.funcional = typeof window[componente.id].getModelos === 'function';
                    } else if (componente.id === 'monitor') {
                        status.funcional = typeof window[componente.id].verificarStatus === 'function';
                    } else if (componente.id === 'dataIntegrity') {
                        status.funcional = typeof window[componente.id].verificarIntegridade === 'function';
                    }
                } catch (error) {
                    status.funcional = false;
                    this.registrarErro(`Erro ao verificar funcionalidade de ${componente.nome}: ${error.message}`);
                }
            } else {
                this.registrarErro(`Componente obrigatório não encontrado: ${componente.nome} (${componente.arquivo})`);
            }
            
            this.statusComponentes[componente.id] = status;
        });
    }
    
    /**
     * Verifica a presença das funções de renderização
     */
    verificarFuncoesRenderizacao() {
        this.logOperacao('Verificando funções de renderização');
        
        this.funcoesRenderizacao.forEach(funcao => {
            const status = {
                nome: funcao.id,
                componente: funcao.componente,
                presente: typeof window[funcao.id] === 'function',
                funcional: false
            };
            
            if (status.presente) {
                try {
                    // Verificar se a função pode ser chamada sem erros
                    // Não executamos realmente para evitar alterações na interface
                    status.funcional = window[funcao.id].toString().includes('render');
                } catch (error) {
                    status.funcional = false;
                    this.registrarErro(`Erro ao verificar função de renderização ${funcao.id}: ${error.message}`);
                }
            } else {
                this.registrarErro(`Função de renderização não encontrada: ${funcao.id}`);
            }
            
            this.statusComponentes[funcao.id] = status;
        });
    }
    
    /**
     * Verifica a presença dos elementos da interface
     */
    verificarElementosInterface() {
        this.logOperacao('Verificando elementos da interface');
        
        this.elementosInterface.forEach(elemento => {
            const status = {
                nome: elemento.nome,
                presente: document.getElementById(elemento.id) !== null,
                visivel: false
            };
            
            if (status.presente) {
                try {
                    const el = document.getElementById(elemento.id);
                    // Verificar se o elemento está visível
                    const style = window.getComputedStyle(el);
                    status.visivel = style.display !== 'none' && style.visibility !== 'hidden';
                } catch (error) {
                    status.visivel = false;
                    this.registrarErro(`Erro ao verificar visibilidade do elemento ${elemento.nome}: ${error.message}`);
                }
            } else {
                this.registrarErro(`Elemento de interface não encontrado: ${elemento.nome} (id: ${elemento.id})`);
            }
            
            this.statusComponentes[`elemento_${elemento.id}`] = status;
        });
    }
    
    /**
     * Verifica a integridade dos dados
     */
    verificarIntegridadeDados() {
        this.logOperacao('Verificando integridade de dados');
        
        // Verificar se o verificador de integridade está disponível
        if (window.dataIntegrity && typeof window.dataIntegrity.verificarIntegridade === 'function') {
            try {
                const resultadoIntegridade = window.dataIntegrity.verificarIntegridade();
                
                if (!resultadoIntegridade.integro) {
                    resultadoIntegridade.problemas.forEach(problema => {
                        this.registrarErro(`Problema de integridade de dados: ${problema}`);
                    });
                }
                
                this.statusComponentes.integridadeDados = {
                    nome: 'Integridade de Dados',
                    integro: resultadoIntegridade.integro,
                    problemas: resultadoIntegridade.problemas
                };
            } catch (error) {
                this.registrarErro(`Erro ao verificar integridade de dados: ${error.message}`);
                this.statusComponentes.integridadeDados = {
                    nome: 'Integridade de Dados',
                    integro: false,
                    problemas: [`Erro na verificação: ${error.message}`]
                };
            }
        } else {
            // Verificação manual básica
            this.statusComponentes.integridadeDados = {
                nome: 'Integridade de Dados',
                integro: true,
                problemas: []
            };
            
            // Verificar modelos preditivos
            if (window.modelosPreditivos) {
                try {
                    const resultados = window.modelosPreditivos.getResultados();
                    
                    if (!resultados || !resultados.proximaReuniao || !resultados.proximaReuniao.previsaoConsolidada) {
                        this.registrarErro('Dados incompletos nos modelos preditivos');
                        this.statusComponentes.integridadeDados.integro = false;
                        this.statusComponentes.integridadeDados.problemas.push('Dados incompletos nos modelos preditivos');
                    }
                } catch (error) {
                    this.registrarErro(`Erro ao verificar dados dos modelos preditivos: ${error.message}`);
                    this.statusComponentes.integridadeDados.integro = false;
                    this.statusComponentes.integridadeDados.problemas.push(`Erro nos modelos preditivos: ${error.message}`);
                }
            }
            
            // Verificar análise NLP
            if (window.analisadorAtas) {
                try {
                    const resultados = window.analisadorAtas.getResultados();
                    
                    if (!resultados || !resultados.resultados || !resultados.resultados.sentimento) {
                        this.registrarErro('Dados incompletos na análise NLP');
                        this.statusComponentes.integridadeDados.integro = false;
                        this.statusComponentes.integridadeDados.problemas.push('Dados incompletos na análise NLP');
                    }
                } catch (error) {
                    this.registrarErro(`Erro ao verificar dados da análise NLP: ${error.message}`);
                    this.statusComponentes.integridadeDados.integro = false;
                    this.statusComponentes.integridadeDados.problemas.push(`Erro na análise NLP: ${error.message}`);
                }
            }
        }
    }
    
    /**
     * Verifica a consistência entre componentes
     */
    verificarConsistenciaComponentes() {
        this.logOperacao('Verificando consistência entre componentes');
        
        // Verificar consistência de datas de referência
        const datasReferencia = {};
        
        // Coletar datas de referência
        if (window.modelosPreditivos && typeof window.modelosPreditivos.getResultados === 'function') {
            try {
                const resultados = window.modelosPreditivos.getResultados();
                datasReferencia.modelosPreditivos = resultados.modelos.regressaoLinear.dataReferencia;
            } catch (error) {
                this.registrarErro(`Erro ao obter data de referência dos modelos preditivos: ${error.message}`);
            }
        }
        
        if (window.analisadorAtas && typeof window.analisadorAtas.getResultados === 'function') {
            try {
                const resultados = window.analisadorAtas.getResultados();
                datasReferencia.analisadorAtas = resultados.ultimaAtualizacao;
            } catch (error) {
                this.registrarErro(`Erro ao obter data de referência da análise NLP: ${error.message}`);
            }
        }
        
        // Verificar consistência de próxima reunião
        const proximasReunioes = {};
        
        if (window.modelosPreditivos && typeof window.modelosPreditivos.getResultados === 'function') {
            try {
                const resultados = window.modelosPreditivos.getResultados();
                proximasReunioes.modelosPreditivos = resultados.proximaReuniao.data;
            } catch (error) {
                this.registrarErro(`Erro ao obter próxima reunião dos modelos preditivos: ${error.message}`);
            }
        }
        
        if (window.analisadorAtas && typeof window.analisadorAtas.getResultados === 'function') {
            try {
                const resultados = window.analisadorAtas.getResultados();
                proximasReunioes.analisadorAtas = resultados.proximaReuniao.data;
            } catch (error) {
                this.registrarErro(`Erro ao obter próxima reunião da análise NLP: ${error.message}`);
            }
        }
        
        // Verificar consistência
        const datasReferenciaDiferentes = Object.values(datasReferencia).filter((v, i, a) => a.indexOf(v) === i).length > 1;
        const proximasReunioesDiferentes = Object.values(proximasReunioes).filter((v, i, a) => a.indexOf(v) === i).length > 1;
        
        if (datasReferenciaDiferentes) {
            this.registrarErro('Inconsistência nas datas de referência entre componentes');
        }
        
        if (proximasReunioesDiferentes) {
            this.registrarErro('Inconsistência nas datas da próxima reunião entre componentes');
        }
        
        this.statusComponentes.consistencia = {
            nome: 'Consistência entre Componentes',
            consistente: !datasReferenciaDiferentes && !proximasReunioesDiferentes,
            problemas: []
        };
        
        if (datasReferenciaDiferentes) {
            this.statusComponentes.consistencia.problemas.push('Datas de referência inconsistentes');
        }
        
        if (proximasReunioesDiferentes) {
            this.statusComponentes.consistencia.problemas.push('Datas da próxima reunião inconsistentes');
        }
    }
    
    /**
     * Registra um erro detectado
     * @param {string} mensagem - Mensagem de erro
     */
    registrarErro(mensagem) {
        console.error(mensagem);
        this.errosDetectados.push({
            timestamp: new Date().toLocaleString('pt-BR'),
            mensagem
        });
        this.logOperacao(`ERRO: ${mensagem}`);
    }
    
    /**
     * Registra uma operação no log
     * @param {string} mensagem - Mensagem de log
     */
    logOperacao(mensagem) {
        this.logOperacoes.push({
            timestamp: new Date().toLocaleString('pt-BR'),
            mensagem
        });
    }
    
    /**
     * Gera um relatório completo da verificação
     * @returns {Object} Relatório de verificação
     */
    gerarRelatorio() {
        const componentesOK = Object.values(this.statusComponentes)
            .filter(c => c.presente !== undefined && c.funcional !== undefined)
            .every(c => c.presente && c.funcional);
        
        const elementosOK = Object.values(this.statusComponentes)
            .filter(c => c.presente !== undefined && c.visivel !== undefined)
            .every(c => c.presente && c.visivel);
        
        const integridadeOK = this.statusComponentes.integridadeDados && 
                             this.statusComponentes.integridadeDados.integro;
        
        const consistenciaOK = this.statusComponentes.consistencia && 
                              this.statusComponentes.consistencia.consistente;
        
        const statusGeral = componentesOK && elementosOK && integridadeOK && consistenciaOK;
        
        return {
            dataVerificacao: this.dataVerificacao,
            statusGeral,
            statusComponentes: this.statusComponentes,
            errosDetectados: this.errosDetectados,
            logOperacoes: this.logOperacoes
        };
    }
    
    /**
     * Corrige problemas detectados automaticamente
     * @returns {Object} Resultado da correção
     */
    corrigirProblemas() {
        this.logOperacao('Iniciando correção automática de problemas');
        
        const problemasCorrigidos = [];
        const problemasNaoCorrigidos = [];
        
        // Verificar se há problemas para corrigir
        if (this.errosDetectados.length === 0) {
            this.logOperacao('Nenhum problema detectado para corrigir');
            return {
                sucesso: true,
                problemasCorrigidos,
                problemasNaoCorrigidos
            };
        }
        
        // Tentar corrigir problemas de consistência
        if (this.statusComponentes.consistencia && !this.statusComponentes.consistencia.consistente) {
            try {
                this.logOperacao('Tentando corrigir problemas de consistência');
                
                // Corrigir datas de próxima reunião
                if (window.modelosPreditivos && window.analisadorAtas) {
                    const dataModelosPreditivos = window.modelosPreditivos.getResultados().proximaReuniao.data;
                    window.analisadorAtas.proximaReuniao.data = dataModelosPreditivos;
                    
                    problemasCorrigidos.push('Consistência de datas da próxima reunião');
                    this.logOperacao('Datas da próxima reunião sincronizadas');
                }
            } catch (error) {
                problemasNaoCorrigidos.push(`Consistência: ${error.message}`);
                this.registrarErro(`Erro ao corrigir problemas de consistência: ${error.message}`);
            }
        }
        
        // Verificar novamente após correções
        this.verificarSistema();
        
        this.logOperacao('Correção automática de problemas concluída');
        
        return {
            sucesso: problemasNaoCorrigidos.length === 0,
            problemasCorrigidos,
            problemasNaoCorrigidos
        };
    }
    
    /**
     * Renderiza o relatório de diagnóstico na interface
     * @param {HTMLElement} container - Container onde o relatório será renderizado
     * @param {Object} relatorio - Relatório de verificação
     */
    renderizarRelatorio(container, relatorio) {
        if (!container) {
            console.error('Container para renderização do relatório não encontrado');
            return;
        }
        
        // Limpar container
        container.innerHTML = '';
        
        // Criar estrutura básica
        const relatorioEl = document.createElement('div');
        relatorioEl.className = 'relatorio-container';
        
        // Cabeçalho
        const header = document.createElement('div');
        header.className = 'relatorio-header';
        header.innerHTML = `
            <h2>Relatório de Diagnóstico do Sistema</h2>
            <p class="relatorio-data">Data da verificação: ${relatorio.dataVerificacao}</p>
            <div class="relatorio-status ${relatorio.statusGeral ? 'status-ok' : 'status-erro'}">
                Status Geral: ${relatorio.statusGeral ? 'Sistema Operacional' : 'Problemas Detectados'}
            </div>
        `;
        relatorioEl.appendChild(header);
        
        // Resumo
        const resumo = document.createElement('div');
        resumo.className = 'relatorio-resumo';
        resumo.innerHTML = `
            <h3>Resumo da Verificação</h3>
            <div class="resumo-grid">
                <div class="resumo-item ${Object.values(relatorio.statusComponentes).filter(c => c.presente !== undefined && c.funcional !== undefined).every(c => c.presente && c.funcional) ? 'status-ok' : 'status-erro'}">
                    <div class="resumo-titulo">Componentes</div>
                    <div class="resumo-valor">${Object.values(relatorio.statusComponentes).filter(c => c.presente !== undefined && c.funcional !== undefined).filter(c => c.presente && c.funcional).length} / ${Object.values(relatorio.statusComponentes).filter(c => c.presente !== undefined && c.funcional !== undefined).length}</div>
                </div>
                <div class="resumo-item ${Object.values(relatorio.statusComponentes).filter(c => c.presente !== undefined && c.visivel !== undefined).every(c => c.presente && c.visivel) ? 'status-ok' : 'status-erro'}">
                    <div class="resumo-titulo">Interface</div>
                    <div class="resumo-valor">${Object.values(relatorio.statusComponentes).filter(c => c.presente !== undefined && c.visivel !== undefined).filter(c => c.presente && c.visivel).length} / ${Object.values(relatorio.statusComponentes).filter(c => c.presente !== undefined && c.visivel !== undefined).length}</div>
                </div>
                <div class="resumo-item ${relatorio.statusComponentes.integridadeDados && relatorio.statusComponentes.integridadeDados.integro ? 'status-ok' : 'status-erro'}">
                    <div class="resumo-titulo">Integridade</div>
                    <div class="resumo-valor">${relatorio.statusComponentes.integridadeDados && relatorio.statusComponentes.integridadeDados.integro ? 'OK' : 'Erro'}</div>
                </div>
                <div class="resumo-item ${relatorio.statusComponentes.consistencia && relatorio.statusComponentes.consistencia.consistente ? 'status-ok' : 'status-erro'}">
                    <div class="resumo-titulo">Consistência</div>
                    <div class="resumo-valor">${relatorio.statusComponentes.consistencia && relatorio.statusComponentes.consistencia.consistente ? 'OK' : 'Erro'}</div>
                </div>
            </div>
        `;
        relatorioEl.appendChild(resumo);
        
        // Erros detectados
        if (relatorio.errosDetectados.length > 0) {
            const erros = document.createElement('div');
            erros.className = 'relatorio-erros';
            erros.innerHTML = `<h3>Problemas Detectados (${relatorio.errosDetectados.length})</h3>`;
            
            const listaErros = document.createElement('ul');
            listaErros.className = 'erros-lista';
            
            relatorio.errosDetectados.forEach(erro => {
                const item = document.createElement('li');
                item.className = 'erro-item';
                item.innerHTML = `
                    <span class="erro-timestamp">${erro.timestamp}</span>
                    <span class="erro-mensagem">${erro.mensagem}</span>
                `;
                listaErros.appendChild(item);
            });
            
            erros.appendChild(listaErros);
            
            // Botão de correção automática
            const btnCorrigir = document.createElement('button');
            btnCorrigir.className = 'btn-corrigir';
            btnCorrigir.textContent = 'Tentar Correção Automática';
            btnCorrigir.addEventListener('click', () => {
                const resultado = this.corrigirProblemas();
                
                if (resultado.sucesso) {
                    alert(`Correção automática concluída com sucesso!\nProblemas corrigidos: ${resultado.problemasCorrigidos.join(', ')}`);
                } else {
                    alert(`Correção automática parcial.\nProblemas corrigidos: ${resultado.problemasCorrigidos.join(', ')}\nProblemas não corrigidos: ${resultado.problemasNaoCorrigidos.join(', ')}`);
                }
                
                // Atualizar relatório
                this.renderizarRelatorio(container, this.gerarRelatorio());
            });
            
            erros.appendChild(btnCorrigir);
            relatorioEl.appendChild(erros);
        }
        
        // Detalhes dos componentes
        const detalhes = document.createElement('div');
        detalhes.className = 'relatorio-detalhes';
        detalhes.innerHTML = `<h3>Detalhes dos Componentes</h3>`;
        
        // Componentes obrigatórios
        const componentesObrigatorios = document.createElement('div');
        componentesObrigatorios.className = 'detalhes-secao';
        componentesObrigatorios.innerHTML = `<h4>Componentes Obrigatórios</h4>`;
        
        const tabelaComponentes = document.createElement('table');
        tabelaComponentes.className = 'detalhes-tabela';
        tabelaComponentes.innerHTML = `
            <thead>
                <tr>
                    <th>Componente</th>
                    <th>Arquivo</th>
                    <th>Presente</th>
                    <th>Funcional</th>
                </tr>
            </thead>
            <tbody id="tabela-componentes-body"></tbody>
        `;
        
        componentesObrigatorios.appendChild(tabelaComponentes);
        detalhes.appendChild(componentesObrigatorios);
        
        // Elementos da interface
        const elementosInterface = document.createElement('div');
        elementosInterface.className = 'detalhes-secao';
        elementosInterface.innerHTML = `<h4>Elementos da Interface</h4>`;
        
        const tabelaElementos = document.createElement('table');
        tabelaElementos.className = 'detalhes-tabela';
        tabelaElementos.innerHTML = `
            <thead>
                <tr>
                    <th>Elemento</th>
                    <th>Presente</th>
                    <th>Visível</th>
                </tr>
            </thead>
            <tbody id="tabela-elementos-body"></tbody>
        `;
        
        elementosInterface.appendChild(tabelaElementos);
        detalhes.appendChild(elementosInterface);
        
        relatorioEl.appendChild(detalhes);
        
        // Log de operações
        const log = document.createElement('div');
        log.className = 'relatorio-log';
        log.innerHTML = `
            <h3>Log de Operações</h3>
            <div class="log-container">
                <pre id="log-operacoes"></pre>
            </div>
        `;
        
        relatorioEl.appendChild(log);
        
        container.appendChild(relatorioEl);
        
        // Preencher tabelas
        const tabelaComponentesBody = document.getElementById('tabela-componentes-body');
        if (tabelaComponentesBody) {
            Object.values(relatorio.statusComponentes)
                .filter(c => c.arquivo !== undefined)
                .forEach(componente => {
                    const row = document.createElement('tr');
                    row.className = componente.presente && componente.funcional ? 'status-ok' : 'status-erro';
                    row.innerHTML = `
                        <td>${componente.nome}</td>
                        <td>${componente.arquivo}</td>
                        <td>${componente.presente ? '✓' : '✗'}</td>
                        <td>${componente.funcional ? '✓' : '✗'}</td>
                    `;
                    tabelaComponentesBody.appendChild(row);
                });
        }
        
        const tabelaElementosBody = document.getElementById('tabela-elementos-body');
        if (tabelaElementosBody) {
            Object.values(relatorio.statusComponentes)
                .filter(c => c.visivel !== undefined)
                .forEach(elemento => {
                    const row = document.createElement('tr');
                    row.className = elemento.presente && elemento.visivel ? 'status-ok' : 'status-erro';
                    row.innerHTML = `
                        <td>${elemento.nome}</td>
                        <td>${elemento.presente ? '✓' : '✗'}</td>
                        <td>${elemento.visivel ? '✓' : '✗'}</td>
                    `;
                    tabelaElementosBody.appendChild(row);
                });
        }
        
        // Preencher log
        const logOperacoes = document.getElementById('log-operacoes');
        if (logOperacoes) {
            logOperacoes.textContent = relatorio.logOperacoes
                .map(log => `[${log.timestamp}] ${log.mensagem}`)
                .join('\n');
        }
        
        // Adicionar estilos
        this.adicionarEstilos();
    }
    
    /**
     * Adiciona estilos específicos para o relatório de diagnóstico
     */
    adicionarEstilos() {
        // Verificar se os estilos já existem
        if (document.getElementById('diagnostico-styles')) return;
        
        const estilos = document.createElement('style');
        estilos.id = 'diagnostico-styles';
        estilos.textContent = `
            .relatorio-container {
                padding: 20px;
                color: #e2e8f0;
            }
            
            .relatorio-header {
                margin-bottom: 20px;
            }
            
            .relatorio-header h2 {
                margin-top: 0;
                margin-bottom: 10px;
                color: #f8f9fa;
            }
            
            .relatorio-data {
                color: #a0aec0;
                font-size: 0.9em;
                margin-bottom: 10px;
            }
            
            .relatorio-status {
                display: inline-block;
                padding: 8px 15px;
                border-radius: 4px;
                font-weight: bold;
            }
            
            .status-ok {
                background-color: rgba(46, 204, 113, 0.2);
                color: #2ecc71;
            }
            
            .status-erro {
                background-color: rgba(231, 76, 60, 0.2);
                color: #e74c3c;
            }
            
            .relatorio-resumo {
                background-color: #2d3748;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 20px;
            }
            
            .relatorio-resumo h3 {
                margin-top: 0;
                margin-bottom: 15px;
                color: #f8f9fa;
            }
            
            .resumo-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 15px;
            }
            
            .resumo-item {
                padding: 15px;
                border-radius: 6px;
                text-align: center;
            }
            
            .resumo-titulo {
                font-size: 0.9em;
                margin-bottom: 5px;
            }
            
            .resumo-valor {
                font-size: 1.2em;
                font-weight: bold;
            }
            
            .relatorio-erros {
                background-color: #2d3748;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 20px;
            }
            
            .relatorio-erros h3 {
                margin-top: 0;
                margin-bottom: 15px;
                color: #f8f9fa;
            }
            
            .erros-lista {
                list-style-type: none;
                padding: 0;
                margin: 0 0 15px 0;
            }
            
            .erro-item {
                padding: 10px;
                border-radius: 4px;
                background-color: rgba(231, 76, 60, 0.1);
                margin-bottom: 5px;
                display: flex;
                flex-direction: column;
            }
            
            .erro-timestamp {
                font-size: 0.8em;
                color: #a0aec0;
                margin-bottom: 5px;
            }
            
            .erro-mensagem {
                color: #f8f9fa;
            }
            
            .btn-corrigir {
                padding: 10px 20px;
                border: none;
                border-radius: 4px;
                background-color: #3182ce;
                color: white;
                font-weight: bold;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            
            .btn-corrigir:hover {
                background-color: #2c5282;
            }
            
            .relatorio-detalhes {
                background-color: #2d3748;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 20px;
            }
            
            .relatorio-detalhes h3 {
                margin-top: 0;
                margin-bottom: 15px;
                color: #f8f9fa;
            }
            
            .detalhes-secao {
                margin-bottom: 20px;
            }
            
            .detalhes-secao h4 {
                margin-top: 0;
                margin-bottom: 10px;
                color: #f8f9fa;
            }
            
            .detalhes-tabela {
                width: 100%;
                border-collapse: collapse;
            }
            
            .detalhes-tabela th, .detalhes-tabela td {
                padding: 10px;
                text-align: left;
                border-bottom: 1px solid #4a5568;
            }
            
            .detalhes-tabela th {
                color: #f8f9fa;
                background-color: #4a5568;
            }
            
            .detalhes-tabela tr.status-ok {
                background-color: rgba(46, 204, 113, 0.1);
            }
            
            .detalhes-tabela tr.status-erro {
                background-color: rgba(231, 76, 60, 0.1);
            }
            
            .relatorio-log {
                background-color: #2d3748;
                border-radius: 8px;
                padding: 15px;
            }
            
            .relatorio-log h3 {
                margin-top: 0;
                margin-bottom: 15px;
                color: #f8f9fa;
            }
            
            .log-container {
                background-color: #1a202c;
                border-radius: 4px;
                padding: 10px;
                max-height: 300px;
                overflow-y: auto;
            }
            
            #log-operacoes {
                margin: 0;
                color: #a0aec0;
                font-family: monospace;
                font-size: 0.9em;
                white-space: pre-wrap;
            }
        `;
        
        document.head.appendChild(estilos);
    }
}

// Exportar a classe para uso global
window.FerramentasDiagnostico = FerramentasDiagnostico;

// Inicializar quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.ferramentasDiagnostico = new FerramentasDiagnostico();
    
    // Verificar se estamos na tab de diagnóstico
    const diagnosticoTab = document.getElementById('diagnostico');
    if (diagnosticoTab) {
        // Executar verificação e renderizar relatório
        const relatorio = window.ferramentasDiagnostico.verificarSistema();
        window.ferramentasDiagnostico.renderizarRelatorio(diagnosticoTab, relatorio);
    }
    
    console.log('Ferramentas de diagnóstico inicializadas');
});
