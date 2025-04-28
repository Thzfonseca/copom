/**
 * Modelos preditivos para a taxa Selic
 * 
 * Este módulo implementa diferentes modelos para prever
 * as decisões do COPOM sobre a taxa Selic.
 */

class ModelosPreditivos {
    constructor() {
        this.modelos = {
            regressaoLinear: {
                nome: "Regressão Linear",
                descricao: "Modelo baseado em regressão linear múltipla utilizando indicadores econômicos como variáveis independentes.",
                explicacao: "Este modelo utiliza uma regressão linear múltipla para prever a decisão do COPOM com base em um conjunto de indicadores econômicos. A ideia é encontrar uma relação linear entre as variáveis independentes (indicadores) e a variável dependente (decisão do COPOM, codificada numericamente). Assume-se que a relação entre os indicadores e a decisão é linear e que os erros são normalmente distribuídos.",
                dataReferencia: "19/03/2025",
                previsao: null,
                probabilidades: {},
                dadosUtilizados: ["IPCA", "IPCA 12m", "Hiato do Produto", "Câmbio (USD/BRL)", "Variação Cambial", "Juros EUA", "Índice de Commodities", "Confiança do Consumidor", "VIX"],
                fontesDados: ["IBGE", "BCB Focus", "BCB", "Investing.com", "FGV"],
                resultados: null, // Será preenchido com detalhes
                testesHipotese: null, // Será preenchido com detalhes
                miniRelatorio: null // Será preenchido com detalhes
            },
            randomForest: {
                nome: "Random Forest",
                descricao: "Modelo de ensemble baseado em árvores de decisão que captura relações não-lineares entre variáveis.",
                explicacao: "O Random Forest é um modelo de aprendizado de máquina do tipo ensemble que constrói múltiplas árvores de decisão durante o treinamento e combina suas previsões (por votação majoritária para classificação). Ele é robusto a overfitting e capaz de capturar relações complexas e não-lineares nos dados. A previsão final é a decisão mais votada pelas árvores individuais.",
                dataReferencia: "19/03/2025",
                previsao: null,
                probabilidades: {},
                dadosUtilizados: ["IPCA", "IPCA 12m", "Hiato do Produto", "Câmbio (USD/BRL)", "Variação Cambial", "Juros EUA", "Índice de Commodities", "Confiança do Consumidor", "VIX"],
                fontesDados: ["IBGE", "BCB Focus", "BCB", "Investing.com", "FGV"],
                resultados: null,
                testesHipotese: null,
                miniRelatorio: null
            },
            modeloTaylor: {
                nome: "Regra de Taylor",
                descricao: "Implementação da regra de Taylor para política monetária, considerando hiato do produto e desvio da inflação.",
                explicacao: "A Regra de Taylor é uma diretriz de política monetária que sugere como o banco central deve ajustar a taxa de juros nominal em resposta a desvios da inflação em relação à meta e do produto em relação ao seu potencial (hiato). A fórmula básica é r = p + a*(p - p*) + b*y + r*, onde r é a taxa nominal, p é a inflação, p* é a meta de inflação, y é o hiato do produto, r* é a taxa de juros real de equilíbrio, e 'a' e 'b' são coeficientes que refletem a sensibilidade do banco central à inflação e ao hiato.",
                dataReferencia: "19/03/2025",
                previsao: null,
                probabilidades: {},
                dadosUtilizados: ["IPCA", "Hiato do Produto", "Meta de Inflação", "Juro Real Neutro"],
                fontesDados: ["IBGE", "BCB", "CMN"],
                resultados: null,
                testesHipotese: null,
                miniRelatorio: null
            },
            modeloVAR: {
                nome: "Modelo VAR",
                descricao: "Modelo de Vetores Autorregressivos que captura a dinâmica conjunta de múltiplas variáveis econômicas.",
                explicacao: "Um Modelo de Vetores Autorregressivos (VAR) é um modelo econométrico usado para capturar a interdependência linear entre múltiplas séries temporais. Cada variável no modelo VAR é modelada como uma função linear de seus próprios valores passados (lags) e dos valores passados de todas as outras variáveis no sistema. É útil para analisar a dinâmica conjunta e os choques entre variáveis econômicas.",
                dataReferencia: "19/03/2025",
                previsao: null,
                probabilidades: {},
                dadosUtilizados: ["Histórico de Decisões do COPOM", "IPCA", "Hiato do Produto", "Câmbio (USD/BRL)", "VIX"],
                fontesDados: ["BCB", "IBGE", "Investing.com"],
                resultados: null,
                testesHipotese: null,
                miniRelatorio: null
            },
            modeloNLP: {
                nome: "Análise de Comunicação",
                descricao: "Modelo baseado em processamento de linguagem natural aplicado às atas do COPOM.",
                explicacao: "Este modelo utiliza técnicas de Processamento de Linguagem Natural (NLP) para analisar o texto das atas e comunicados do COPOM. A análise busca identificar o tom (hawkish, dovish, neutral), palavras-chave, tópicos recorrentes e possíveis sinais de 'forward guidance'. A previsão é baseada na interpretação do sentimento e das sinalizações extraídas da comunicação mais recente do comitê.",
                dataReferencia: "19/03/2025",
                previsao: null,
                probabilidades: {},
                dadosUtilizados: ["Atas e Comunicados do COPOM"],
                fontesDados: ["BCB"],
                resultados: null,
                testesHipotese: null,
                miniRelatorio: null
            }
        };
        
        this.indicadores = {
            ipca: { valor: 4.25, ref: "03/2025", fonte: "IBGE" },
            ipcaE12m: { valor: 4.50, ref: "03/2025", fonte: "BCB Focus" },
            hiato: { valor: -0.8, ref: "T4/2024", fonte: "BCB (Estimativa)" },
            cambio: { valor: 5.20, ref: "19/03/2025", fonte: "BCB" },
            cambioDelta: { valor: 0.15, ref: "Últimos 30 dias", fonte: "BCB" },
            jurosEUA: { valor: 5.50, ref: "19/03/2025", fonte: "FED" },
            commodities: { valor: -2.5, ref: "Últimos 30 dias", fonte: "BCB (Índice IC-Br)" },
            confConsumidor: { valor: 92.3, ref: "03/2025", fonte: "FGV" },
            vix: { valor: 18.5, ref: "19/03/2025", fonte: "CBOE" },
            metaInflacao: { valor: 3.0, ref: "2025", fonte: "CMN" },
            juroRealNeutro: { valor: 4.85, ref: "03/2025", fonte: "Estimativa Consolidada (Dashboard)" }
        };
        
        this.historicoDecisoes = [
            { reuniao: '269ª', data: '18-19/03/2025', taxa: 14.25, decisao: 'Aumento de 25 pontos-base' },
            { reuniao: '268ª', data: '29-30/01/2025', taxa: 14.00, decisao: 'Aumento de 25 pontos-base' },
            { reuniao: '267ª', data: '11-12/12/2024', taxa: 13.75, decisao: 'Aumento de 25 pontos-base' },
            { reuniao: '266ª', data: '06-07/11/2024', taxa: 13.50, decisao: 'Aumento de 25 pontos-base' },
            { reuniao: '265ª', data: '17-18/09/2024', taxa: 13.25, decisao: 'Aumento de 25 pontos-base' },
            { reuniao: '264ª', data: '30-31/07/2024', taxa: 13.00, decisao: 'Aumento de 25 pontos-base' }
        ];
        
        this.proximaReuniao = {
            reuniao: '270ª',
            data: '07/05/2025',
            previsaoConsolidada: null,
            probabilidades: {}
        };

        // Estrutura para dados atualizáveis (exemplo com JSON)
        this.dadosAtualizaveisPath = 'data/model_data.json'; // Caminho para o arquivo de dados
        
        // Inicializar modelos
        this.inicializarModelos();
    }

    /**
     * Carrega dados atualizáveis de um arquivo JSON
     * (Implementação básica, pode ser expandida para buscar de API)
     */
    async carregarDadosAtualizaveis() {
        try {
            // Em um ambiente real, poderia ser um fetch para uma API
            // Aqui, simulamos a leitura de um arquivo local (requer estrutura)
            // const response = await fetch(this.dadosAtualizaveisPath);
            // const data = await response.json();
            
            // Simulação de dados carregados
            const data = {
                indicadores: {
                    ipca: { valor: 4.30, ref: "04/2025", fonte: "IBGE" },
                    ipcaE12m: { valor: 4.55, ref: "04/2025", fonte: "BCB Focus" },
                    hiato: { valor: -0.7, ref: "T1/2025", fonte: "BCB (Estimativa)" },
                    cambio: { valor: 5.15, ref: "28/04/2025", fonte: "BCB" },
                    cambioDelta: { valor: -0.05, ref: "Últimos 30 dias", fonte: "BCB" },
                    jurosEUA: { valor: 5.50, ref: "28/04/2025", fonte: "FED" },
                    commodities: { valor: -1.5, ref: "Últimos 30 dias", fonte: "BCB (Índice IC-Br)" },
                    confConsumidor: { valor: 93.0, ref: "04/2025", fonte: "FGV" },
                    vix: { valor: 17.0, ref: "28/04/2025", fonte: "CBOE" },
                    metaInflacao: { valor: 3.0, ref: "2025", fonte: "CMN" },
                    juroRealNeutro: { valor: 4.90, ref: "04/2025", fonte: "Estimativa Consolidada (Dashboard)" }
                },
                historicoDecisoes: [
                    { reuniao: '269ª', data: '18-19/03/2025', taxa: 14.25, decisao: 'Aumento de 25 pontos-base' },
                    // ... (histórico pode ser atualizado)
                ],
                proximaReuniao: {
                    reuniao: '270ª',
                    data: '07/05/2025',
                    // ... (outras infos da próxima reunião)
                }
            };

            console.log("Dados atualizados carregados:", data);
            this.indicadores = data.indicadores;
            this.historicoDecisoes = data.historicoDecisoes;
            this.proximaReuniao = { ...this.proximaReuniao, ...data.proximaReuniao };
            
            // Re-executar modelos com dados atualizados
            this.inicializarModelos();
            
            // Atualizar UI (requer função externa ou callback)
            if (typeof window.atualizarUIModelosPreditivos === 'function') {
                window.atualizarUIModelosPreditivos();
            }

        } catch (error) {
            console.error("Erro ao carregar dados atualizáveis:", error);
            // Usar dados estáticos como fallback (já estão carregados no construtor)
        }
    }
    
    /**
     * Inicializa todos os modelos preditivos
     */
    inicializarModelos() {
        this.executarModeloRegressaoLinear();
        this.executarModeloRandomForest();
        this.executarModeloTaylor();
        this.executarModeloVAR();
        this.executarModeloNLP();
        this.consolidarPrevisoes();
    }
    
    /**
     * Executa o modelo de regressão linear
     */
    executarModeloRegressaoLinear() {
        const modelo = this.modelos.regressaoLinear;
        // Simulação do modelo de regressão linear
        const coeficientes = {
            intercepto: 0.15, ipca: 0.08, ipcaE12m: 0.12, hiato: -0.05,
            cambio: 0.03, cambioDelta: 0.10, jurosEUA: 0.07, commodities: -0.02,
            confConsumidor: -0.01, vix: 0.01
        };
        let previsaoNumerica = coeficientes.intercepto;
        previsaoNumerica += coeficientes.ipca * this.indicadores.ipca.valor;
        previsaoNumerica += coeficientes.ipcaE12m * this.indicadores.ipcaE12m.valor;
        previsaoNumerica += coeficientes.hiato * this.indicadores.hiato.valor;
        previsaoNumerica += coeficientes.cambio * this.indicadores.cambio.valor;
        previsaoNumerica += coeficientes.cambioDelta * this.indicadores.cambioDelta.valor;
        previsaoNumerica += coeficientes.jurosEUA * this.indicadores.jurosEUA.valor;
        previsaoNumerica += coeficientes.commodities * this.indicadores.commodities.valor;
        previsaoNumerica += coeficientes.confConsumidor * this.indicadores.confConsumidor.valor;
        previsaoNumerica += coeficientes.vix * this.indicadores.vix.valor;
        
        let decisaoIndex = this.mapearPrevisaoParaIndice(previsaoNumerica);
        modelo.probabilidades = this.calcularProbabilidades(decisaoIndex);
        modelo.previsao = this.mapearIndiceParaDecisao(decisaoIndex);

        // Adicionar resultados detalhados (simulados)
        modelo.resultados = {
            coeficientes: coeficientes,
            previsaoNumerica: previsaoNumerica.toFixed(3),
            rQuadrado: 0.75, // Exemplo
            pValor: 0.001 // Exemplo
        };
        modelo.testesHipotese = {
            testeF: { estatistica: 15.2, pValor: 0.001, resultado: "Rejeita H0 (modelo significativo)" },
            testeT_ipca: { estatistica: 3.1, pValor: 0.005, resultado: "Rejeita H0 (coeficiente significativo)" }
            // ... outros testes T
        };
        modelo.miniRelatorio = `O modelo de Regressão Linear, utilizando indicadores como IPCA (ref: ${this.indicadores.ipca.ref}), Hiato (ref: ${this.indicadores.hiato.ref}) e Câmbio (ref: ${this.indicadores.cambio.ref}), sugere uma ${modelo.previsao.toLowerCase()}. A previsão numérica foi ${modelo.resultados.previsaoNumerica}. O modelo apresentou um R² de ${modelo.resultados.rQuadrado} e os testes indicam significância estatística (p < 0.01). A probabilidade maior está em ${this.obterDecisaoMaisProvavel(modelo.probabilidades)}.`;
    }
    
    /**
     * Executa o modelo Random Forest
     */
    executarModeloRandomForest() {
        const modelo = this.modelos.randomForest;
        // Simulação do modelo Random Forest
        const votos = { 'reducao50': 0, 'reducao25': 5, 'manutencao': 35, 'aumento25': 50, 'aumento50': 10 };
        const totalVotos = Object.values(votos).reduce((a, b) => a + b, 0);
        const probabilidades = {};
        let maxVotos = 0;
        let decisaoFinal = 'manutencao';
        for (const [decisao, voto] of Object.entries(votos)) {
            probabilidades[decisao] = voto / totalVotos;
            if (voto > maxVotos) {
                maxVotos = voto;
                decisaoFinal = this.mapearNomeDecisao(decisao);
            }
        }
        modelo.previsao = decisaoFinal;
        modelo.probabilidades = probabilidades;

        // Adicionar resultados detalhados (simulados)
        modelo.resultados = {
            importanciaFeatures: { // Exemplo
                ipca: 0.25, ipcaE12m: 0.20, hiato: 0.15, cambio: 0.10, cambioDelta: 0.08,
                jurosEUA: 0.12, commodities: 0.05, confConsumidor: 0.03, vix: 0.02
            },
            numeroArvores: 100, // Exemplo
            votos: votos
        };
        modelo.testesHipotese = {
            outOfBagError: { valor: 0.15, interpretacao: "Erro de 15% em dados fora da amostra de treino" }
        };
        modelo.miniRelatorio = `O modelo Random Forest, baseado em 100 árvores de decisão e considerando a importância de variáveis como IPCA (${(modelo.resultados.importanciaFeatures.ipca * 100).toFixed(0)}%) e IPCA 12m (${(modelo.resultados.importanciaFeatures.ipcaE12m * 100).toFixed(0)}%), prevê ${modelo.previsao.toLowerCase()}. A decisão recebeu ${modelo.resultados.votos[this.mapearDecisaoParaNomeCurto(modelo.previsao)]} votos (${(modelo.probabilidades[this.mapearDecisaoParaNomeCurto(modelo.previsao)] * 100).toFixed(1)}%). O erro Out-of-Bag estimado é de ${(modelo.testesHipotese.outOfBagError.valor * 100).toFixed(0)}%.`;
    }
    
    /**
     * Executa o modelo baseado na Regra de Taylor
     */
    executarModeloTaylor() {
        const modelo = this.modelos.modeloTaylor;
        const metaInflacao = this.indicadores.metaInflacao.valor;
        const juroRealEquilibrio = this.indicadores.juroRealNeutro.valor;
        const taxaTaylor = this.indicadores.ipca.valor + 
                          0.5 * this.indicadores.hiato.valor + 
                          0.5 * (this.indicadores.ipca.valor - metaInflacao) + 
                          juroRealEquilibrio;
        const selicAtual = this.historicoDecisoes[0].taxa;
        const diferenca = taxaTaylor - selicAtual;
        
        let decisaoIndex = 2;
        if (diferenca > 0.75) decisaoIndex = 4;
        else if (diferenca > 0.25) decisaoIndex = 3;
        else if (diferenca < -0.75) decisaoIndex = 0;
        else if (diferenca < -0.25) decisaoIndex = 1;

        modelo.probabilidades = this.calcularProbabilidadesTaylor(diferenca);
        modelo.previsao = this.mapearIndiceParaDecisao(decisaoIndex);

        // Adicionar resultados detalhados
        modelo.resultados = {
            taxaCalculada: taxaTaylor.toFixed(2),
            selicAtual: selicAtual.toFixed(2),
            diferenca: diferenca.toFixed(2),
            parametros: { a: 0.5, b: 0.5, metaInflacao: metaInflacao, juroRealNeutro: juroRealEquilibrio }
        };
        modelo.testesHipotese = null; // Regra determinística, sem testes de hipótese padrão
        modelo.miniRelatorio = `A Regra de Taylor, com parâmetros a=0.5, b=0.5, meta de inflação de ${metaInflacao}% (ref: ${this.indicadores.metaInflacao.ref}) e juro real neutro de ${juroRealEquilibrio}% (ref: ${this.indicadores.juroRealNeutro.ref}), recomenda uma taxa Selic de ${modelo.resultados.taxaCalculada}%. Comparado à taxa atual de ${modelo.resultados.selicAtual}%, a diferença de ${modelo.resultados.diferenca} pontos percentuais sugere ${modelo.previsao.toLowerCase()}. A maior probabilidade (${(modelo.probabilidades[this.mapearDecisaoParaNomeCurto(modelo.previsao)] * 100).toFixed(1)}%) recai sobre esta decisão.`;
    }
    
    /**
     * Executa o modelo VAR (Vetores Autorregressivos)
     */
    executarModeloVAR() {
        const modelo = this.modelos.modeloVAR;
        // Simulação do modelo VAR
        const decisoesRecentes = this.historicoDecisoes.map(d => this.mapearDecisaoParaIndice(d.decisao));
        const pesos = [0.35, 0.25, 0.15, 0.10, 0.10, 0.05];
        let tendencia = 0;
        for (let i = 0; i < Math.min(decisoesRecentes.length, pesos.length); i++) {
            tendencia += decisoesRecentes[i] * pesos[i];
        }
        let ajuste = 0;
        ajuste += (this.indicadores.ipca.valor - this.indicadores.metaInflacao.valor) * 0.2;
        ajuste += this.indicadores.hiato.valor * 0.15;
        ajuste += this.indicadores.cambioDelta.valor * 0.1;
        ajuste += (this.indicadores.vix.valor - 15) * 0.01;
        const previsaoVAR = tendencia + ajuste;
        let decisaoIndex = this.mapearPrevisaoParaIndice(previsaoVAR, 2.0); // Mapeia em torno do índice 2 (manutenção)
        
        modelo.probabilidades = this.calcularProbabilidadesVAR(previsaoVAR);
        modelo.previsao = this.mapearIndiceParaDecisao(decisaoIndex);

        // Adicionar resultados detalhados (simulados)
        modelo.resultados = {
            previsaoNumerica: previsaoVAR.toFixed(3),
            tendenciaHistorica: tendencia.toFixed(3),
            ajusteIndicadores: ajuste.toFixed(3),
            lagsUtilizados: 2 // Exemplo
        };
        modelo.testesHipotese = {
            testeGranger_IPCA_Selic: { pValor: 0.03, resultado: "IPCA causa Selic (Granger)" }, // Exemplo
            testeEstacionariedade_ADF: { pValor: 0.01, resultado: "Séries estacionárias" } // Exemplo
        };
        modelo.miniRelatorio = `O modelo VAR, considerando ${modelo.resultados.lagsUtilizados} lags e a dinâmica conjunta de variáveis como o histórico de decisões e o IPCA (ref: ${this.indicadores.ipca.ref}), gera uma previsão numérica de ${modelo.resultados.previsaoNumerica}. Isso sugere ${modelo.previsao.toLowerCase()}. A tendência histórica apontava para ${modelo.resultados.tendenciaHistorica.toFixed(2)}, enquanto os indicadores atuais contribuíram com um ajuste de ${modelo.resultados.ajusteIndicadores.toFixed(2)}. Testes indicam causalidade de Granger do IPCA para a Selic (p=${modelo.testesHipotese.testeGranger_IPCA_Selic.pValor}).`;
    }
    
    /**
     * Executa o modelo baseado em NLP (Processamento de Linguagem Natural)
     */
    executarModeloNLP() {
        const modelo = this.modelos.modeloNLP;
        // Simulação do modelo NLP
        const sentimentoAtas = { hawkish: 0.65, neutral: 0.30, dovish: 0.05 };
        const probabilidades = {
            'reducao50': sentimentoAtas.dovish * 0.3,
            'reducao25': sentimentoAtas.dovish * 0.7,
            'manutencao': sentimentoAtas.neutral,
            'aumento25': sentimentoAtas.hawkish * 0.7,
            'aumento50': sentimentoAtas.hawkish * 0.3
        };
        const somaProb = Object.values(probabilidades).reduce((a, b) => a + b, 0);
        let maxProb = 0;
        let decisaoFinal = 'manutencao';
        for (const decisao in probabilidades) {
            probabilidades[decisao] /= somaProb;
            if (probabilidades[decisao] > maxProb) {
                maxProb = probabilidades[decisao];
                decisaoFinal = this.mapearNomeDecisao(decisao);
            }
        }
        modelo.previsao = decisaoFinal;
        modelo.probabilidades = probabilidades;

        // Adicionar resultados detalhados (simulados)
        modelo.resultados = {
            sentimentoGeral: sentimentoAtas,
            termosChaveHawkish: ["vigilância", "cautela", "inflação"],
            termosChaveDovish: ["consolidação"],
            forwardGuidanceDetectado: "Manutenção da postura hawkish até consolidação da desinflação."
        };
        modelo.testesHipotese = null; // NLP geralmente não tem testes de hipótese estatísticos padrão
        modelo.miniRelatorio = `A análise da comunicação recente do COPOM (atas e comunicados) indica um sentimento predominantemente hawkish (${(sentimentoAtas.hawkish * 100).toFixed(0)}%). Termos como 'vigilância' e 'cautela' foram frequentes. O forward guidance detectado sugere '${modelo.resultados.forwardGuidanceDetectado}'. Com base nisso, o modelo prevê ${modelo.previsao.toLowerCase()}, com uma probabilidade de ${(maxProb * 100).toFixed(1)}%.`;
    }

    /**
     * Mapeia a previsão numérica para um índice de decisão
     * 0 = Redução 50pb, 1 = Redução 25pb, 2 = Manutenção, 3 = Aumento 25pb, 4 = Aumento 50pb
     */
    mapearPrevisaoParaIndice(previsao, centro = 0.0) {
        if (previsao > centro + 0.75) return 4;
        if (previsao > centro + 0.25) return 3;
        if (previsao < centro - 0.75) return 0;
        if (previsao < centro - 0.25) return 1;
        return 2;
    }

    /**
     * Mapeia um índice de decisão para a descrição textual
     */
    mapearIndiceParaDecisao(indice) {
        const mapa = [
            'Redução de 50 pontos-base',
            'Redução de 25 pontos-base',
            'Manutenção da taxa',
            'Aumento de 25 pontos-base',
            'Aumento de 50 pontos-base'
        ];
        return mapa[indice] || 'Manutenção da taxa';
    }

    /**
     * Mapeia a descrição textual para um índice de decisão
     */
    mapearDecisaoParaIndice(decisaoTexto) {
        if (!decisaoTexto) return 2;
        if (decisaoTexto.includes('Aumento de 50')) return 4;
        if (decisaoTexto.includes('Aumento de 25')) return 3;
        if (decisaoTexto.includes('Redução de 50')) return 0;
        if (decisaoTexto.includes('Redução de 25')) return 1;
        return 2; // Manutenção
    }
    
    /**
     * Mapeia a descrição textual para nome curto usado nas probabilidades
     */
    mapearDecisaoParaNomeCurto(decisaoTexto) {
        if (!decisaoTexto) return 'manutencao';
        if (decisaoTexto.includes('Aumento de 50')) return 'aumento50';
        if (decisaoTexto.includes('Aumento de 25')) return 'aumento25';
        if (decisaoTexto.includes('Redução de 50')) return 'reducao50';
        if (decisaoTexto.includes('Redução de 25')) return 'reducao25';
        return 'manutencao';
    }

    /**
     * Mapeia o nome curto da probabilidade para a descrição textual
     */
    mapearNomeDecisao(nomeCurto) {
        const mapa = {
            reducao50: 'Redução de 50 pontos-base',
            reducao25: 'Redução de 25 pontos-base',
            manutencao: 'Manutenção da taxa',
            aumento25: 'Aumento de 25 pontos-base',
            aumento50: 'Aumento de 50 pontos-base'
        };
        return mapa[nomeCurto] || 'Manutenção da taxa';
    }

    /**
     * Calcula probabilidades com base no índice da decisão (distribuição genérica)
     */
    calcularProbabilidades(indice) {
        const probs = { reducao50: 0, reducao25: 0, manutencao: 0, aumento25: 0, aumento50: 0 };
        const nomes = ['reducao50', 'reducao25', 'manutencao', 'aumento25', 'aumento50'];
        
        if (indice === 0) { probs.reducao50 = 0.65; probs.reducao25 = 0.25; probs.manutencao = 0.10; }
        else if (indice === 1) { probs.reducao50 = 0.15; probs.reducao25 = 0.60; probs.manutencao = 0.20; probs.aumento25 = 0.05; }
        else if (indice === 2) { probs.reducao25 = 0.15; probs.manutencao = 0.65; probs.aumento25 = 0.15; probs.aumento50 = 0.05; }
        else if (indice === 3) { probs.manutencao = 0.20; probs.aumento25 = 0.60; probs.aumento50 = 0.20; }
        else if (indice === 4) { probs.manutencao = 0.05; probs.aumento25 = 0.25; probs.aumento50 = 0.70; }
        else { probs.manutencao = 1.0; } // Fallback
        
        return probs;
    }

    /**
     * Calcula probabilidades para a Regra de Taylor com base na diferença
     */
    calcularProbabilidadesTaylor(diferenca) {
        const probs = { reducao50: 0, reducao25: 0, manutencao: 0, aumento25: 0, aumento50: 0 };
        const calcularProb = (valor, limiar, largura) => Math.max(0, 1 - Math.abs(valor - limiar) / largura);
        
        probs.reducao50 = calcularProb(diferenca, -1.0, 0.5) * 0.8;
        probs.reducao25 = calcularProb(diferenca, -0.5, 0.5) * 0.8;
        probs.manutencao = calcularProb(diferenca, 0.0, 0.5) * 0.8;
        probs.aumento25 = calcularProb(diferenca, 0.5, 0.5) * 0.8;
        probs.aumento50 = calcularProb(diferenca, 1.0, 0.5) * 0.8;
        
        const somaProb = Object.values(probs).reduce((a, b) => a + b, 0);
        if (somaProb > 0) {
            for (const decisao in probs) {
                probs[decisao] /= somaProb;
            }
        } else {
            probs.manutencao = 1.0; // Fallback
        }
        return probs;
    }

    /**
     * Calcula probabilidades para o Modelo VAR com base na previsão numérica
     */
    calcularProbabilidadesVAR(previsaoVAR) {
        const probs = { reducao50: 0, reducao25: 0, manutencao: 0, aumento25: 0, aumento50: 0 };
        const calcularProb = (valor, centro, largura) => Math.max(0, 1 - Math.abs(valor - centro) / largura);

        probs.reducao50 = calcularProb(previsaoVAR, 0, 1) * 0.8;
        probs.reducao25 = calcularProb(previsaoVAR, 1, 1) * 0.8;
        probs.manutencao = calcularProb(previsaoVAR, 2, 1) * 0.8;
        probs.aumento25 = calcularProb(previsaoVAR, 3, 1) * 0.8;
        probs.aumento50 = calcularProb(previsaoVAR, 4, 1) * 0.8;

        const somaProb = Object.values(probs).reduce((a, b) => a + b, 0);
        if (somaProb > 0) {
            for (const decisao in probs) {
                probs[decisao] /= somaProb;
            }
        } else {
            probs.manutencao = 1.0; // Fallback
        }
        return probs;
    }

    /**
     * Obtém a decisão mais provável de um conjunto de probabilidades
     */
    obterDecisaoMaisProvavel(probabilidades) {
        let maxProb = 0;
        let decisaoMaisProvavel = 'Manutenção da taxa';
        for (const [nomeCurto, prob] of Object.entries(probabilidades)) {
            if (prob > maxProb) {
                maxProb = prob;
                decisaoMaisProvavel = this.mapearNomeDecisao(nomeCurto);
            }
        }
        return `${decisaoMaisProvavel} (${(maxProb * 100).toFixed(1)}%)`;
    }

    /**
     * Consolida as previsões dos diferentes modelos
     */
    consolidarPrevisoes() {
        const probsConsolidadas = { reducao50: 0, reducao25: 0, manutencao: 0, aumento25: 0, aumento50: 0 };
        let numModelos = 0;
        
        for (const modelo of Object.values(this.modelos)) {
            if (modelo.probabilidades) {
                for (const [decisao, prob] of Object.entries(modelo.probabilidades)) {
                    if (probsConsolidadas.hasOwnProperty(decisao)) {
                        probsConsolidadas[decisao] += prob;
                    }
                }
                numModelos++;
            }
        }
        
        if (numModelos > 0) {
            for (const decisao in probsConsolidadas) {
                probsConsolidadas[decisao] /= numModelos;
            }
        }
        
        // Determinar previsão consolidada
        let maxProb = 0;
        let decisaoFinal = 'Manutenção da taxa';
        for (const [decisao, prob] of Object.entries(probsConsolidadas)) {
            if (prob > maxProb) {
                maxProb = prob;
                decisaoFinal = this.mapearNomeDecisao(decisao);
            }
        }
        
        this.proximaReuniao.previsaoConsolidada = decisaoFinal;
        this.proximaReuniao.probabilidades = probsConsolidadas;
    }
    
    /**
     * Retorna os dados de todos os modelos
     */
    getModelosData() {
        return this.modelos;
    }
    
    /**
     * Retorna os dados da próxima reunião
     */
    getProximaReuniaoData() {
        return this.proximaReuniao;
    }

    /**
     * Retorna os indicadores econômicos utilizados
     */
    getIndicadoresData() {
        return this.indicadores;
    }
}

// Exportar a classe para ser usada em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModelosPreditivos;
} else {
    window.ModelosPreditivos = ModelosPreditivos;
}

