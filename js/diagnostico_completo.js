/**
 * Ferramenta de Diagnóstico Completo para COPOM Dashboard
 * 
 * Este módulo implementa uma ferramenta abrangente para diagnosticar
 * todos os componentes e funcionalidades do COPOM Dashboard, gerando
 * um relatório detalhado que pode ser copiado e compartilhado.
 */

// Configuração global
const DiagnosticoCompleto = {
    versao: '1.2.0', // Atualizado para refletir novas verificações
    dataExecucao: new Date().toISOString(),
    
    // Lista de todos os componentes que devem ser verificados
    componentesEsperados: [
        { id: 'script', caminho: 'script.js', obrigatorio: true },
        { id: 'modelos_preditivos', caminho: 'js/modelos_preditivos.js', obrigatorio: true },
        { id: 'modelos_preditivos_ui', caminho: 'js/modelos_preditivos_ui.js', obrigatorio: true },
        { id: 'modelos_preditivos_detalhes', caminho: 'js/modelos_preditivos_detalhes.js', obrigatorio: true },
        { id: 'simulador', caminho: 'js/simulador.js', obrigatorio: true },
        { id: 'modelos_avancados', caminho: 'js/modelos_avancados.js', obrigatorio: true },
        { id: 'analise_atas', caminho: 'js/analise_atas.js', obrigatorio: true },
        { id: 'analise_atas_ui', caminho: 'js/analise_atas_ui.js', obrigatorio: true },
        { id: 'juro_neutro', caminho: 'js/juro_neutro/juro_neutro.js', obrigatorio: true },
        { id: 'simulador_juro_neutro', caminho: 'js/juro_neutro/simulador_juro_neutro.js', obrigatorio: true },
        { id: 'juro_neutro_integrador', caminho: 'js/juro_neutro/juro_neutro_integrador.js', obrigatorio: true },
        { id: 'focus_analytics', caminho: 'js/focus/focus_analytics.js', obrigatorio: true },
        { id: 'agenda_copom', caminho: 'js/agenda_copom.js', obrigatorio: true },
        { id: 'monitor', caminho: 'js/monitor.js', obrigatorio: true },
        { id: 'diagnostic', caminho: 'js/diagnostic.js', obrigatorio: true },
        { id: 'data_integrity', caminho: 'js/data_integrity.js', obrigatorio: true },
        { id: 'ferramentas_diagnostico', caminho: 'js/ferramentas_diagnostico.js', obrigatorio: false },
        { id: 'diagnostico_completo', caminho: 'js/diagnostico_completo.js', obrigatorio: true } // Adicionado o próprio script
    ],
    
    // Lista de funções que devem estar disponíveis
    funcoesEsperadas: [
        { nome: 'inicializarDashboard', componente: 'script', obrigatoria: true },
        { nome: 'carregarSecao', componente: 'script', obrigatoria: true },
        { nome: 'renderizarModelosPreditivos', componente: 'modelos_preditivos_ui', obrigatoria: true },
        { nome: 'exibirDetalhesModelo', componente: 'modelos_preditivos_detalhes', obrigatoria: true },
        { nome: 'inicializarSimulador', componente: 'simulador', obrigatoria: true },
        { nome: 'renderizarModelosAvancados', componente: 'modelos_avancados', obrigatoria: true },
        { nome: 'analisarAtasCOPOM', componente: 'analise_atas', obrigatoria: true },
        { nome: 'renderizarAnaliseNLP', componente: 'analise_atas_ui', obrigatoria: true },
        { nome: 'renderizarJuroNeutro', componente: 'juro_neutro', obrigatoria: true },
        { nome: 'simularJuroNeutro', componente: 'simulador_juro_neutro', obrigatoria: true },
        { nome: 'integrarJuroNeutro', componente: 'juro_neutro_integrador', obrigatoria: true },
        { nome: 'analisarRelatoriosFocus', componente: 'focus_analytics', obrigatoria: true },
        { nome: 'renderizarAgendaCOPOM', componente: 'agenda_copom', obrigatoria: true },
        { nome: 'monitorarSistema', componente: 'monitor', obrigatoria: true },
        { nome: 'verificarIntegridade', componente: 'data_integrity', obrigatoria: true },
        { nome: 'diagnosticarSistema', componente: 'diagnostic', obrigatoria: true }
    ],
    
    // Lista de elementos DOM que devem estar presentes
    elementosEsperados: [
        { id: 'dashboard', descricao: 'Container do Dashboard Principal', obrigatorio: true },
        { id: 'modelos', descricao: 'Container dos Modelos Preditivos', obrigatorio: true },
        { id: 'simulador', descricao: 'Container do Simulador de Cenários', obrigatorio: true },
        { id: 'modelos-avancados', descricao: 'Container dos Modelos Avançados', obrigatorio: true },
        { id: 'analise-nlp', descricao: 'Container da Análise NLP', obrigatorio: true },
        { id: 'juro-neutro', descricao: 'Container do Juro Real Neutro', obrigatorio: true },
        { id: 'focus-analytics', descricao: 'Container da Análise Focus', obrigatorio: true },
        { id: 'agenda-copom', descricao: 'Container da Agenda COPOM', obrigatorio: true },
        { id: 'diagnostico', descricao: 'Container do Diagnóstico', obrigatorio: true },
        { id: 'modelo-detalhes', descricao: 'Container de Detalhes do Modelo', obrigatorio: true }
    ],

    // Lista de verificações de dados específicos
    verificacoesDados: [
        { id: 'modelos_preditivos_data', descricao: 'Dados dos Modelos Preditivos', verificar: () => typeof ModelosPreditivos !== 'undefined' && ModelosPreditivos.modelos && Object.keys(ModelosPreditivos.modelos).length > 0 },
        { id: 'simulador_data', descricao: 'Dados do Simulador de Cenários', verificar: () => typeof Simulador !== 'undefined' && Simulador.cenarios && Simulador.cenarios.length > 0 },
        { id: 'modelos_avancados_data', descricao: 'Dados dos Modelos Avançados', verificar: () => typeof ModelosAvancados !== 'undefined' && ModelosAvancados.modelos && ModelosAvancados.modelos.length > 0 },
        { id: 'analise_atas_data', descricao: 'Dados da Análise NLP de Atas', verificar: () => typeof AnaliseAtas !== 'undefined' && AnaliseAtas.dados && AnaliseAtas.dados.analiseSentimento },
        { id: 'juro_neutro_data', descricao: 'Dados do Juro Real Neutro', verificar: () => typeof JuroNeutro !== 'undefined' && JuroNeutro.modelos && JuroNeutro.modelos.length > 0 },
        { id: 'focus_analytics_data', descricao: 'Dados da Análise Focus', verificar: () => typeof FocusAnalytics !== 'undefined' && FocusAnalytics.dados && FocusAnalytics.dados.length > 0 },
        { id: 'agenda_copom_data', descricao: 'Dados da Agenda COPOM', verificar: () => typeof AgendaCOPOM !== 'undefined' && AgendaCOPOM.reunioes && AgendaCOPOM.reunioes.length > 0 }
    ],
    
    // Resultados do diagnóstico
    resultados: {
        componentes: [],
        funcoes: [],
        elementos: [],
        dados: [], // Adicionado para resultados de dados
        errosConsole: [],
        desempenho: {},
        problemas: [],
        sugestoes: []
    },
    
    /**
     * Inicializa a interface do usuário para o diagnóstico
     */
    inicializarUI: function() {
        console.log('Inicializando UI do diagnóstico...');
        
        // Configurar botão para gerar diagnóstico
        const btnGerarDiagnostico = document.getElementById('btn-gerar-diagnostico');
        if (btnGerarDiagnostico) {
            btnGerarDiagnostico.addEventListener('click', function() {
                // Mostrar um indicador de carregamento (opcional)
                const resultadoDiv = document.getElementById('diagnostico-resultado');
                if (resultadoDiv) {
                    resultadoDiv.innerHTML = '<p>Executando diagnóstico...</p>';
                }

                // Executar diagnóstico de forma assíncrona para não bloquear a UI
                setTimeout(() => {
                    try {
                        const resultados = DiagnosticoCompleto.iniciar();
                        // Renderizar resultados APENAS após o clique e execução
                        DiagnosticoCompleto.renderizarRelatorio(resultados);

                        // Mostrar botão de copiar
                        const btnCopiarDiagnostico = document.getElementById('btn-copiar-diagnostico');
                        if (btnCopiarDiagnostico) {
                            btnCopiarDiagnostico.style.display = 'inline-block';
                            // Garantir que o listener de cópia seja adicionado apenas uma vez ou que seja idempotente
                            if (!btnCopiarDiagnostico.dataset.listenerAdded) {
                                btnCopiarDiagnostico.addEventListener('click', function() {
                                    DiagnosticoCompleto.copiarRelatorio();
                                });
                                btnCopiarDiagnostico.dataset.listenerAdded = 'true';
                            }
                        }
                    } catch (error) {
                        console.error("Erro ao executar ou renderizar diagnóstico:", error);
                        if (resultadoDiv) {
                            resultadoDiv.innerHTML = `<p class="status-error">Erro ao executar diagnóstico: ${error.message}</p>`;
                        }
                    }
                }, 50); // Pequeno timeout para permitir atualização da UI
            });
        }
        // Remover qualquer chamada automática de renderização ou inicialização que possa estar causando o problema
        // Certificar que DiagnosticoCompleto.iniciar() e DiagnosticoCompleto.renderizarRelatorio() só são chamados no evento de clique acima.
    },
    
    /**
     * Inicia o diagnóstico completo
     */
    iniciar: function() {
        console.log('Iniciando diagnóstico completo...');
        
        // Limpar resultados anteriores
        this.resultados = {
            componentes: [],
            funcoes: [],
            elementos: [],
            dados: [],
            errosConsole: [],
            desempenho: {},
            problemas: [],
            sugestoes: []
        };
        
        // Registrar data e hora
        this.dataExecucao = new Date().toISOString();
        
        // Executar verificações
        this.verificarComponentes();
        this.verificarFuncoes();
        this.verificarElementos();
        this.verificarDados(); // Adicionado
        this.verificarErrosConsole();
        this.verificarDesempenho();
        this.analisarProblemas();
        this.gerarSugestoes();
        
        console.log('Diagnóstico completo finalizado.');
        return this.resultados;
    },
    
    /**
     * Verifica se todos os componentes (arquivos JS) estão carregados
     */
    verificarComponentes: function() {
        console.log('Verificando componentes...');
        
        this.componentesEsperados.forEach(componente => {
            const scripts = document.querySelectorAll('script');
            let encontrado = false;
            
            for (let i = 0; i < scripts.length; i++) {
                const src = scripts[i].getAttribute('src') || '';
                if (src.includes(componente.caminho)) {
                    encontrado = true;
                    break;
                }
            }
            
            this.resultados.componentes.push({
                id: componente.id,
                caminho: componente.caminho,
                encontrado: encontrado,
                obrigatorio: componente.obrigatorio,
                status: encontrado ? 'OK' : (componente.obrigatorio ? 'ERRO' : 'AVISO')
            });
            
            if (!encontrado && componente.obrigatorio) {
                this.resultados.problemas.push({
                    tipo: 'componente',
                    id: componente.id,
                    mensagem: `Componente obrigatório não encontrado: ${componente.id} (${componente.caminho})`,
                    gravidade: 'alta'
                });
            }
        });
    },
    
    /**
     * Verifica se todas as funções esperadas estão disponíveis
     */
    verificarFuncoes: function() {
        console.log('Verificando funções...');
        
        this.funcoesEsperadas.forEach(funcao => {
            let disponivel = false;
            
            // Verificar se a função está disponível no escopo global
            if (typeof window[funcao.nome] === 'function') {
                disponivel = true;
            }
            
            this.resultados.funcoes.push({
                nome: funcao.nome,
                componente: funcao.componente,
                disponivel: disponivel,
                obrigatoria: funcao.obrigatoria,
                status: disponivel ? 'OK' : (funcao.obrigatoria ? 'ERRO' : 'AVISO')
            });
            
            if (!disponivel && funcao.obrigatoria) {
                this.resultados.problemas.push({
                    tipo: 'funcao',
                    id: funcao.nome,
                    mensagem: `Função obrigatória não encontrada: ${funcao.nome}`,
                    gravidade: 'alta'
                });
            }
        });
    },
    
    /**
     * Verifica se todos os elementos DOM esperados estão presentes
     */
    verificarElementos: function() {
        console.log('Verificando elementos DOM...');
        
        this.elementosEsperados.forEach(elemento => {
            const el = document.getElementById(elemento.id);
            const presente = el !== null;
            
            this.resultados.elementos.push({
                id: elemento.id,
                descricao: elemento.descricao,
                presente: presente,
                obrigatorio: elemento.obrigatorio,
                status: presente ? 'OK' : (elemento.obrigatorio ? 'ERRO' : 'AVISO')
            });
            
            if (!presente && elemento.obrigatorio) {
                this.resultados.problemas.push({
                    tipo: 'elemento',
                    id: elemento.id,
                    mensagem: `Elemento DOM obrigatório não encontrado: ${elemento.id} (${elemento.descricao})`,
                    gravidade: 'média'
                });
            }
        });
    },

    /**
     * Verifica se os dados essenciais para cada funcionalidade estão carregados
     */
    verificarDados: function() {
        console.log('Verificando dados das funcionalidades...');
        
        this.verificacoesDados.forEach(verificacao => {
            let dadosCarregados = false;
            try {
                dadosCarregados = verificacao.verificar();
            } catch (e) {
                console.error(`Erro ao verificar dados para ${verificacao.id}:`, e);
                dadosCarregados = false;
            }
            
            this.resultados.dados.push({
                id: verificacao.id,
                descricao: verificacao.descricao,
                carregados: dadosCarregados,
                status: dadosCarregados ? 'OK' : 'ERRO'
            });
            
            if (!dadosCarregados) {
                this.resultados.problemas.push({
                    tipo: 'dados',
                    id: verificacao.id,
                    mensagem: `Dados essenciais não carregados para: ${verificacao.descricao}`,
                    gravidade: 'alta'
                });
            }
        });
    },
    
    /**
     * Verifica erros no console
     */
    verificarErrosConsole: function() {
        console.log('Verificando erros no console...');
        
        // Não é possível acessar diretamente o histórico do console,
        // mas podemos sobrescrever console.error para capturar futuros erros
        // e também verificar se há erros na página atual
        
        // Verificar se há erros na página atual (através de elementos de erro)
        const errosExibidos = document.querySelectorAll('.erro, .error, [data-erro]');
        if (errosExibidos.length > 0) {
            errosExibidos.forEach(erro => {
                this.resultados.errosConsole.push({
                    mensagem: erro.textContent || 'Erro não especificado',
                    origem: 'DOM',
                    timestamp: new Date().toISOString()
                });
                
                this.resultados.problemas.push({
                    tipo: 'erro',
                    id: 'erro_dom',
                    mensagem: `Erro exibido na página: ${erro.textContent || 'Erro não especificado'}`,
                    gravidade: 'média'
                });
            });
        }
        
        // Sobrescrever console.error para capturar futuros erros
        const diagnosticoRef = this;
        const originalConsoleError = console.error;
        console.error = function() {
            const args = Array.from(arguments);
            const mensagem = args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
            ).join(' ');
            
            diagnosticoRef.resultados.errosConsole.push({
                mensagem: mensagem,
                origem: 'console',
                timestamp: new Date().toISOString()
            });
            
            diagnosticoRef.resultados.problemas.push({
                tipo: 'erro',
                id: 'erro_console',
                mensagem: `Erro no console: ${mensagem}`,
                gravidade: 'média'
            });
            
            // Chamar a função original
            return originalConsoleError.apply(console, arguments);
        };
    },
    
    /**
     * Verifica o desempenho do site
     */
    verificarDesempenho: function() {
        console.log('Verificando desempenho...');
        
        // Usar a API Performance se disponível
        if (window.performance) {
            const timing = window.performance.timing;
            
            if (timing) {
                const loadTime = timing.loadEventEnd - timing.navigationStart;
                const dnsTime = timing.domainLookupEnd - timing.domainLookupStart;
                const connectTime = timing.connectEnd - timing.connectStart;
                const requestTime = timing.responseEnd - timing.requestStart;
                const renderTime = timing.domComplete - timing.domLoading;
                
                this.resultados.desempenho = {
                    loadTime: loadTime,
                    dnsTime: dnsTime,
                    connectTime: connectTime,
                    requestTime: requestTime,
                    renderTime: renderTime
                };
                
                // Verificar se há problemas de desempenho
                if (loadTime > 3000) {
                    this.resultados.problemas.push({
                        tipo: 'desempenho',
                        id: 'load_time',
                        mensagem: `Tempo de carregamento lento: ${loadTime}ms`,
                        gravidade: 'baixa'
                    });
                }
                
                if (renderTime > 1000) {
                    this.resultados.problemas.push({
                        tipo: 'desempenho',
                        id: 'render_time',
                        mensagem: `Tempo de renderização lento: ${renderTime}ms`,
                        gravidade: 'baixa'
                    });
                }
            }
        }
    },
    
    /**
     * Analisa os problemas encontrados e determina a gravidade geral
     */
    analisarProblemas: function() {
        console.log('Analisando problemas...');
        
        // Contar problemas por gravidade
        const problemasPorGravidade = {
            alta: 0,
            média: 0,
            baixa: 0
        };
        
        this.resultados.problemas.forEach(problema => {
            problemasPorGravidade[problema.gravidade]++;
        });
        
        // Determinar status geral
        let statusGeral = 'OK';
        if (problemasPorGravidade.alta > 0) {
            statusGeral = 'Problemas Críticos';
        } else if (problemasPorGravidade.média > 0) {
            statusGeral = 'Problemas Detectados';
        } else if (problemasPorGravidade.baixa > 0) {
            statusGeral = 'Avisos';
        }
        
        this.resultados.statusGeral = statusGeral;
    },
    
    /**
     * Gera sugestões para resolver os problemas encontrados
     */
    gerarSugestoes: function() {
        console.log('Gerando sugestões...');
        
        // Gerar sugestões com base nos problemas encontrados
        this.resultados.problemas.forEach(problema => {
            let sugestao = '';
            
            switch (problema.tipo) {
                case 'componente':
                    sugestao = `Verifique se o arquivo ${problema.id} está incluído corretamente no HTML e se o caminho está correto.`;
                    break;
                case 'funcao':
                    sugestao = `Verifique se a função ${problema.id} está definida e exportada corretamente no componente correspondente.`;
                    break;
                case 'elemento':
                    sugestao = `Verifique se o elemento com ID "${problema.id}" está presente no HTML e se o ID está correto.`;
                    break;
                case 'dados':
                    sugestao = `Verifique se os dados para ${problema.id} estão sendo carregados corretamente e se a estrutura dos dados está conforme esperado.`;
                    break;
                case 'erro':
                    sugestao = `Corrija o erro: ${problema.mensagem}`;
                    break;
                case 'desempenho':
                    sugestao = `Otimize o desempenho relacionado a ${problema.id}.`;
                    break;
                default:
                    sugestao = `Investigue o problema: ${problema.mensagem}`;
            }
            
            this.resultados.sugestoes.push({
                problema: problema.mensagem,
                sugestao: sugestao,
                gravidade: problema.gravidade
            });
        });
    },
    
    /**
     * Renderiza o relatório de diagnóstico na página
     */
    renderizarRelatorio: function(resultados) {
        console.log('Renderizando relatório...');
        
        const containerDiagnostico = document.getElementById('diagnostico-resultado');
        if (!containerDiagnostico) {
            console.error('Container de diagnóstico não encontrado');
            return;
        }
        
        // Formatar data
        const dataFormatada = new Date(this.dataExecucao).toLocaleString();
        
        // Determinar classe de status
        let statusClass = 'status-ok';
        if (resultados.statusGeral === 'Problemas Críticos') {
            statusClass = 'status-error';
        } else if (resultados.statusGeral === 'Problemas Detectados') {
            statusClass = 'status-warning';
        }
        
        // Contar resultados
        const componentesOK = resultados.componentes.filter(c => c.status === 'OK').length;
        const componentesTotal = resultados.componentes.length;
        
        const funcoesOK = resultados.funcoes.filter(f => f.status === 'OK').length;
        const funcoesTotal = resultados.funcoes.length;
        
        const elementosOK = resultados.elementos.filter(e => e.status === 'OK').length;
        const elementosTotal = resultados.elementos.length;
        
        const dadosOK = resultados.dados.filter(d => d.status === 'OK').length;
        const dadosTotal = resultados.dados.length;
        
        // Construir HTML do relatório
        let html = `
            <div class="diagnostico-report">
                <h3>Relatório de Diagnóstico do Sistema</h3>
                <div class="data-verificacao">Data da verificação: ${dataFormatada}</div>
                
                <div class="status-geral ${statusClass}">
                    Status Geral: ${resultados.statusGeral}
                </div>
                
                <div class="resumo-verificacao">
                    <div class="resumo-item ${componentesOK === componentesTotal ? 'status-ok' : 'status-error'}">
                        Componentes: ${componentesOK} / ${componentesTotal}
                    </div>
                    <div class="resumo-item ${funcoesOK === funcoesTotal ? 'status-ok' : 'status-error'}">
                        Funções: ${funcoesOK} / ${funcoesTotal}
                    </div>
                    <div class="resumo-item ${elementosOK === elementosTotal ? 'status-ok' : 'status-error'}">
                        Elementos: ${elementosOK} / ${elementosTotal}
                    </div>
                    <div class="resumo-item ${dadosOK === dadosTotal ? 'status-ok' : 'status-error'}">
                        Dados: ${dadosOK} / ${dadosTotal}
                    </div>
                </div>
        `;
        
        // Adicionar problemas encontrados
        if (resultados.problemas.length > 0) {
            html += `
                <h4>Problemas Detectados (${resultados.problemas.length})</h4>
                <ul class="problemas-list">
            `;
            
            resultados.problemas.forEach(problema => {
                let gravityClass = '';
                if (problema.gravidade === 'alta') gravityClass = 'status-error';
                else if (problema.gravidade === 'média') gravityClass = 'status-warning';
                else gravityClass = 'status-ok';
                
                html += `
                    <li class="${gravityClass}">
                        ${problema.mensagem}
                    </li>
                `;
            });
            
            html += `</ul>`;
        }
        
        // Adicionar sugestões
        if (resultados.sugestoes.length > 0) {
            html += `
                <h4>Sugestões de Correção</h4>
                <ul class="sugestoes-list">
            `;
            
            resultados.sugestoes.forEach(sugestao => {
                html += `
                    <li>
                        <strong>Problema:</strong> ${sugestao.problema}<br>
                        <strong>Sugestão:</strong> ${sugestao.sugestao}
                    </li>
                `;
            });
            
            html += `</ul>`;
        }
        
        // Adicionar informações de desempenho
        if (resultados.desempenho && Object.keys(resultados.desempenho).length > 0) {
            html += `
                <h4>Desempenho</h4>
                <ul class="desempenho-list">
                    <li>Tempo de carregamento total: ${resultados.desempenho.loadTime}ms</li>
                    <li>Tempo de renderização: ${resultados.desempenho.renderTime}ms</li>
                    <li>Tempo de requisição: ${resultados.desempenho.requestTime}ms</li>
                </ul>
            `;
        }
        
        html += `</div>`;
        
        // Inserir HTML no container
        containerDiagnostico.innerHTML = html;
    },
    
    /**
     * Copia o relatório para a área de transferência
     */
    copiarRelatorio: function() {
        console.log('Copiando relatório para área de transferência...');
        
        const containerDiagnostico = document.getElementById('diagnostico-resultado');
        if (!containerDiagnostico) {
            console.error('Container de diagnóstico não encontrado');
            return;
        }
        
        // Criar texto do relatório
        let texto = `RELATÓRIO DE DIAGNÓSTICO DO COPOM DASHBOARD\n`;
        texto += `Data: ${new Date(this.dataExecucao).toLocaleString()}\n`;
        texto += `Status Geral: ${this.resultados.statusGeral}\n\n`;
        
        // Adicionar resumo
        const componentesOK = this.resultados.componentes.filter(c => c.status === 'OK').length;
        const componentesTotal = this.resultados.componentes.length;
        
        const funcoesOK = this.resultados.funcoes.filter(f => f.status === 'OK').length;
        const funcoesTotal = this.resultados.funcoes.length;
        
        const elementosOK = this.resultados.elementos.filter(e => e.status === 'OK').length;
        const elementosTotal = this.resultados.elementos.length;
        
        const dadosOK = this.resultados.dados.filter(d => d.status === 'OK').length;
        const dadosTotal = this.resultados.dados.length;
        
        texto += `RESUMO:\n`;
        texto += `- Componentes: ${componentesOK}/${componentesTotal}\n`;
        texto += `- Funções: ${funcoesOK}/${funcoesTotal}\n`;
        texto += `- Elementos: ${elementosOK}/${elementosTotal}\n`;
        texto += `- Dados: ${dadosOK}/${dadosTotal}\n\n`;
        
        // Adicionar problemas
        if (this.resultados.problemas.length > 0) {
            texto += `PROBLEMAS DETECTADOS (${this.resultados.problemas.length}):\n`;
            
            this.resultados.problemas.forEach((problema, index) => {
                texto += `${index + 1}. [${problema.gravidade.toUpperCase()}] ${problema.mensagem}\n`;
            });
            
            texto += `\n`;
        }
        
        // Adicionar sugestões
        if (this.resultados.sugestoes.length > 0) {
            texto += `SUGESTÕES DE CORREÇÃO:\n`;
            
            this.resultados.sugestoes.forEach((sugestao, index) => {
                texto += `${index + 1}. Problema: ${sugestao.problema}\n`;
                texto += `   Sugestão: ${sugestao.sugestao}\n`;
            });
            
            texto += `\n`;
        }
        
        // Adicionar desempenho
        if (this.resultados.desempenho && Object.keys(this.resultados.desempenho).length > 0) {
            texto += `DESEMPENHO:\n`;
            texto += `- Tempo de carregamento total: ${this.resultados.desempenho.loadTime}ms\n`;
            texto += `- Tempo de renderização: ${this.resultados.desempenho.renderTime}ms\n`;
            texto += `- Tempo de requisição: ${this.resultados.desempenho.requestTime}ms\n\n`;
        }
        
        // Adicionar informações do sistema
        texto += `INFORMAÇÕES DO SISTEMA:\n`;
        texto += `- Navegador: ${navigator.userAgent}\n`;
        texto += `- Resolução: ${window.innerWidth}x${window.innerHeight}\n`;
        texto += `- Versão do diagnóstico: ${this.versao}\n`;
        
        // Copiar para a área de transferência
        navigator.clipboard.writeText(texto)
            .then(() => {
                alert('Relatório copiado para a área de transferência!');
            })
            .catch(err => {
                console.error('Erro ao copiar relatório:', err);
                alert('Erro ao copiar relatório. Por favor, tente novamente.');
            });
    }
};

// Inicializar UI quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos na aba de diagnóstico
    if (window.location.hash === '#diagnostico') {
        DiagnosticoCompleto.inicializarUI();
    } else {
        // Adicionar listener para quando a aba de diagnóstico for aberta
        window.addEventListener('hashchange', function() {
            if (window.location.hash === '#diagnostico') {
                DiagnosticoCompleto.inicializarUI();
            }
        });
    }
});
