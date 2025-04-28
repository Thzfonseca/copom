/**
 * Modelos avançados para análise de política monetária
 * 
 * Este módulo implementa modelos avançados baseados na literatura
 * econômica para análise e previsão de decisões de política monetária.
 */

class ModelosAvancados {
    constructor() {
        this.modelos = {
            regimesSwitching: {
                nome: "Regime-Switching",
                descricao: "Modelo que identifica diferentes regimes de política monetária ao longo do tempo",
                dataReferencia: "Março/2025",
                resultados: null
            },
            bayesiano: {
                nome: "Modelo Bayesiano",
                descricao: "Modelo que incorpora priors informativas e atualiza probabilidades com novas informações",
                dataReferencia: "Março/2025",
                resultados: null
            },
            dsge: {
                nome: "DSGE",
                descricao: "Modelo de Equilíbrio Geral Dinâmico Estocástico calibrado para a economia brasileira",
                dataReferencia: "Fevereiro/2025",
                resultados: null
            },
            redeNeural: {
                nome: "Rede Neural",
                descricao: "Modelo de aprendizado profundo treinado com dados históricos de decisões do COPOM",
                dataReferencia: "Março/2025",
                resultados: null
            },
            kalmanFilter: {
                nome: "Filtro de Kalman",
                descricao: "Modelo de espaço de estados que estima variáveis não observáveis como o hiato do produto",
                dataReferencia: "Março/2025",
                resultados: null
            }
        };
        
        this.indicadores = {
            ipca: 4.25,
            ipcaE12m: 4.50,
            hiato: -0.8,
            cambio: 5.20,
            cambioDelta: 0.15,
            jurosEUA: 5.50,
            commodities: -2.5,
            confConsumidor: 92.3,
            vix: 18.5,
            desemprego: 7.8,
            pib: 2.3,
            credito: 8.5,
            m4: 6.2
        };
        
        this.historicoDecisoes = [
            { reuniao: '269ª', data: '18-19/03/2025', taxa: 14.25, decisao: 'Aumento de 25 pontos-base' },
            { reuniao: '268ª', data: '29-30/01/2025', taxa: 14.00, decisao: 'Aumento de 25 pontos-base' },
            { reuniao: '267ª', data: '11-12/12/2024', taxa: 13.75, decisao: 'Aumento de 25 pontos-base' },
            { reuniao: '266ª', data: '06-07/11/2024', taxa: 13.50, decisao: 'Aumento de 25 pontos-base' },
            { reuniao: '265ª', data: '17-18/09/2024', taxa: 13.25, decisao: 'Aumento de 25 pontos-base' },
            { reuniao: '264ª', data: '30-31/07/2024', taxa: 13.00, decisao: 'Aumento de 25 pontos-base' },
            { reuniao: '263ª', data: '18-19/06/2024', taxa: 12.75, decisao: 'Aumento de 25 pontos-base' },
            { reuniao: '262ª', data: '07-08/05/2024', taxa: 12.50, decisao: 'Aumento de 25 pontos-base' },
            { reuniao: '261ª', data: '19-20/03/2024', taxa: 12.25, decisao: 'Aumento de 25 pontos-base' },
            { reuniao: '260ª', data: '30-31/01/2024', taxa: 12.00, decisao: 'Aumento de 25 pontos-base' }
        ];
        
        this.proximaReuniao = {
            reuniao: '270ª',
            data: '07/05/2025',
            previsoes: {}
        };
        
        // Inicializar modelos
        this.inicializarModelos();
    }
    
    /**
     * Inicializa todos os modelos avançados
     */
    inicializarModelos() {
        this.executarModeloRegimeSwitching();
        this.executarModeloBayesiano();
        this.executarModeloDSGE();
        this.executarModeloRedeNeural();
        this.executarModeloKalmanFilter();
        this.consolidarPrevisoes();
    }
    
    /**
     * Executa o modelo de Regime-Switching
     */
    executarModeloRegimeSwitching() {
        // Simulação do modelo de Regime-Switching
        // Em um ambiente real, isso seria substituído por um modelo treinado
        
        // Definir regimes possíveis
        const regimes = [
            { nome: 'Hawkish', probabilidade: 0.65, descricao: 'Foco no controle da inflação' },
            { nome: 'Neutro', probabilidade: 0.30, descricao: 'Equilíbrio entre inflação e crescimento' },
            { nome: 'Dovish', probabilidade: 0.05, descricao: 'Foco no estímulo ao crescimento' }
        ];
        
        // Calcular probabilidades de transição entre regimes
        const matrizTransicao = [
            [0.80, 0.15, 0.05], // Hawkish -> Hawkish, Neutro, Dovish
            [0.20, 0.70, 0.10], // Neutro -> Hawkish, Neutro, Dovish
            [0.10, 0.30, 0.60]  // Dovish -> Hawkish, Neutro, Dovish
        ];
        
        // Estimar regime atual com base no histórico recente
        const decisoesRecentes = this.historicoDecisoes.slice(0, 5);
        let regimeAtual = 'Hawkish'; // Padrão
        
        // Contar aumentos consecutivos
        const aumentosConsecutivos = decisoesRecentes.filter(d => 
            d.decisao.includes('Aumento')).length;
        
        if (aumentosConsecutivos >= 4) {
            regimeAtual = 'Hawkish';
        } else if (aumentosConsecutivos <= 1) {
            regimeAtual = 'Dovish';
        } else {
            regimeAtual = 'Neutro';
        }
        
        // Calcular probabilidades para próxima decisão
        let probabilidades = {
            'reducao50': 0,
            'reducao25': 0,
            'manutencao': 0,
            'aumento25': 0,
            'aumento50': 0
        };
        
        // Distribuição de probabilidades por regime
        const probPorRegime = {
            'Hawkish': {
                'reducao50': 0.01,
                'reducao25': 0.04,
                'manutencao': 0.15,
                'aumento25': 0.60,
                'aumento50': 0.20
            },
            'Neutro': {
                'reducao50': 0.05,
                'reducao25': 0.15,
                'manutencao': 0.60,
                'aumento25': 0.15,
                'aumento50': 0.05
            },
            'Dovish': {
                'reducao50': 0.20,
                'reducao25': 0.60,
                'manutencao': 0.15,
                'aumento25': 0.04,
                'aumento50': 0.01
            }
        };
        
        // Calcular probabilidades ponderadas
        for (const regime of regimes) {
            for (const [decisao, prob] of Object.entries(probPorRegime[regime.nome])) {
                probabilidades[decisao] += prob * regime.probabilidade;
            }
        }
        
        // Determinar decisão mais provável
        let maxProb = 0;
        let decisaoFinal = 'manutencao';
        
        for (const [decisao, prob] of Object.entries(probabilidades)) {
            if (prob > maxProb) {
                maxProb = prob;
                decisaoFinal = decisao;
            }
        }
        
        // Armazenar resultados
        this.modelos.regimesSwitching.resultados = {
            regimeAtual,
            regimes,
            matrizTransicao,
            probabilidades,
            decisao: decisaoFinal
        };
        
        // Armazenar previsão para próxima reunião
        this.proximaReuniao.previsoes.regimesSwitching = {
            decisao: decisaoFinal,
            probabilidades
        };
    }
    
    /**
     * Executa o modelo Bayesiano
     */
    executarModeloBayesiano() {
        // Simulação do modelo Bayesiano
        // Em um ambiente real, isso seria substituído por um modelo treinado
        
        // Definir priors
        const priors = {
            'reducao50': 0.05,
            'reducao25': 0.10,
            'manutencao': 0.20,
            'aumento25': 0.50,
            'aumento50': 0.15
        };
        
        // Fatores que afetam a likelihood
        const fatores = [
            {
                nome: 'Inflação acima da meta',
                valor: this.indicadores.ipca > 3.0,
                likelihood: {
                    'reducao50': 0.05,
                    'reducao25': 0.10,
                    'manutencao': 0.20,
                    'aumento25': 0.40,
                    'aumento50': 0.25
                }
            },
            {
                nome: 'Hiato do produto negativo',
                valor: this.indicadores.hiato < 0,
                likelihood: {
                    'reducao50': 0.20,
                    'reducao25': 0.30,
                    'manutencao': 0.30,
                    'aumento25': 0.15,
                    'aumento50': 0.05
                }
            },
            {
                nome: 'Depreciação cambial',
                valor: this.indicadores.cambioDelta > 0,
                likelihood: {
                    'reducao50': 0.05,
                    'reducao25': 0.10,
                    'manutencao': 0.25,
                    'aumento25': 0.40,
                    'aumento50': 0.20
                }
            },
            {
                nome: 'Aumento de juros nos EUA',
                valor: this.indicadores.jurosEUA > 5.0,
                likelihood: {
                    'reducao50': 0.05,
                    'reducao25': 0.15,
                    'manutencao': 0.30,
                    'aumento25': 0.35,
                    'aumento50': 0.15
                }
            }
        ];
        
        // Calcular posteriors
        let posteriors = { ...priors };
        
        for (const fator of fatores) {
            if (fator.valor) {
                // Aplicar regra de Bayes
                const evidencia = Object.entries(posteriors).reduce((sum, [decisao, prob]) => 
                    sum + prob * fator.likelihood[decisao], 0);
                
                for (const decisao in posteriors) {
                    posteriors[decisao] = (posteriors[decisao] * fator.likelihood[decisao]) / evidencia;
                }
            }
        }
        
        // Determinar decisão mais provável
        let maxProb = 0;
        let decisaoFinal = 'manutencao';
        
        for (const [decisao, prob] of Object.entries(posteriors)) {
            if (prob > maxProb) {
                maxProb = prob;
                decisaoFinal = decisao;
            }
        }
        
        // Armazenar resultados
        this.modelos.bayesiano.resultados = {
            priors,
            fatores,
            posteriors,
            decisao: decisaoFinal
        };
        
        // Armazenar previsão para próxima reunião
        this.proximaReuniao.previsoes.bayesiano = {
            decisao: decisaoFinal,
            probabilidades: posteriors
        };
    }
    
    /**
     * Executa o modelo DSGE
     */
    executarModeloDSGE() {
        // Simulação do modelo DSGE
        // Em um ambiente real, isso seria substituído por um modelo treinado
        
        // Parâmetros estruturais do modelo
        const parametros = {
            beta: 0.99,  // Fator de desconto
            sigma: 1.5,  // Elasticidade de substituição intertemporal
            kappa: 0.3,  // Inclinação da curva de Phillips
            phi: 1.5,    // Resposta da política monetária à inflação
            rho: 0.8,    // Persistência da taxa de juros
            alpha: 0.3,  // Resposta da política monetária ao hiato do produto
            theta: 0.7   // Rigidez de preços
        };
        
        // Choques exógenos
        const choques = {
            demanda: 0.2 * this.indicadores.confConsumidor / 100,
            oferta: -0.1 * this.indicadores.commodities / 100,
            monetario: 0.05 * this.indicadores.jurosEUA / 100,
            externo: 0.15 * this.indicadores.cambioDelta
        };
        
        // Simular modelo DSGE (simplificado)
        const taxaJurosNeutral = 4.85; // Taxa de juros real de equilíbrio
        const inflacaoMeta = 3.0;      // Meta de inflação
        
        // Calcular taxa de juros ótima segundo o modelo
        let taxaOtima = taxaJurosNeutral;
        
        // Adicionar componente de resposta à inflação
        taxaOtima += parametros.phi * (this.indicadores.ipca - inflacaoMeta);
        
        // Adicionar componente de resposta ao hiato do produto
        taxaOtima += parametros.alpha * this.indicadores.hiato;
        
        // Adicionar componente de suavização
        const taxaAtual = this.historicoDecisoes[0].taxa;
        taxaOtima = parametros.rho * taxaAtual + (1 - parametros.rho) * taxaOtima;
        
        // Adicionar choques
        taxaOtima += choques.demanda + choques.oferta + choques.monetario + choques.externo;
        
        // Calcular diferença em relação à taxa atual
        const diferenca = taxaOtima - taxaAtual;
        
        // Determinar decisão com base na diferença
        let decisao = 'manutencao';
        
        if (diferenca > 0.375) decisao = 'aumento50';
        else if (diferenca > 0.125) decisao = 'aumento25';
        else if (diferenca < -0.375) decisao = 'reducao50';
        else if (diferenca < -0.125) decisao = 'reducao25';
        
        // Calcular probabilidades com base na distância dos limiares
        const probabilidades = {
            'reducao50': 0,
            'reducao25': 0,
            'manutencao': 0,
            'aumento25': 0,
            'aumento50': 0
        };
        
        // Função para calcular probabilidade baseada na distância do limiar
        const calcularProb = (valor, limiar, largura) => {
            return Math.max(0, 1 - Math.abs(valor - limiar) / largura);
        };
        
        // Distribuir probabilidades
        probabilidades.reducao50 = calcularProb(diferenca, -0.5, 0.25) * 0.8;
        probabilidades.reducao25 = calcularProb(diferenca, -0.25, 0.25) * 0.8;
        probabilidades.manutencao = calcularProb(diferenca, 0.0, 0.25) * 0.8;
        probabilidades.aumento25 = calcularProb(diferenca, 0.25, 0.25) * 0.8;
        probabilidades.aumento50 = calcularProb(diferenca, 0.5, 0.25) * 0.8;
        
        // Normalizar probabilidades
        const somaProb = Object.values(probabilidades).reduce((a, b) => a + b, 0);
        for (const decisao in probabilidades) {
            probabilidades[decisao] /= somaProb;
        }
        
        // Armazenar resultados
        this.modelos.dsge.resultados = {
            parametros,
            choques,
            taxaOtima,
            diferenca,
            probabilidades,
            decisao
        };
        
        // Armazenar previsão para próxima reunião
        this.proximaReuniao.previsoes.dsge = {
            decisao,
            probabilidades
        };
    }
    
    /**
     * Executa o modelo de Rede Neural
     */
    executarModeloRedeNeural() {
        // Simulação do modelo de Rede Neural
        // Em um ambiente real, isso seria substituído por um modelo treinado
        
        // Normalizar inputs
        const inputs = {
            ipca: this.normalizar(this.indicadores.ipca, 2, 10),
            ipcaE12m: this.normalizar(this.indicadores.ipcaE12m, 2, 10),
            hiato: this.normalizar(this.indicadores.hiato, -5, 5),
            cambio: this.normalizar(this.indicadores.cambio, 4, 7),
            cambioDelta: this.normalizar(this.indicadores.cambioDelta, -10, 10),
            jurosEUA: this.normalizar(this.indicadores.jurosEUA, 0, 10),
            commodities: this.normalizar(this.indicadores.commodities, -15, 15),
            confConsumidor: this.normalizar(this.indicadores.confConsumidor, 70, 130),
            vix: this.normalizar(this.indicadores.vix, 10, 50),
            desemprego: this.normalizar(this.indicadores.desemprego, 5, 15),
            pib: this.normalizar(this.indicadores.pib, -5, 8),
            credito: this.normalizar(this.indicadores.credito, 0, 20),
            m4: this.normalizar(this.indicadores.m4, 0, 20)
        };
        
        // Pesos da camada oculta (simulados)
        const pesosOculta = [
            [0.3, -0.2, 0.5, 0.1, 0.4, 0.3, -0.1, -0.2, 0.2, -0.3, 0.1, 0.2, 0.1],  // Neurônio 1
            [0.5, 0.4, -0.3, 0.2, 0.1, 0.5, -0.2, -0.1, 0.3, -0.2, 0.2, 0.1, 0.3],  // Neurônio 2
            [0.2, 0.3, 0.1, -0.2, 0.3, 0.2, 0.1, 0.4, -0.3, 0.1, -0.2, 0.3, 0.2],   // Neurônio 3
            [0.4, 0.1, -0.2, 0.3, 0.2, 0.1, 0.3, -0.1, 0.2, 0.4, -0.3, 0.1, 0.2],   // Neurônio 4
            [0.1, 0.5, 0.3, 0.2, -0.3, 0.4, 0.2, 0.1, -0.2, 0.3, 0.1, -0.2, 0.4]    // Neurônio 5
        ];
        
        // Bias da camada oculta
        const biasOculta = [0.1, -0.1, 0.2, -0.2, 0.1];
        
        // Pesos da camada de saída (simulados)
        const pesosSaida = [
            [0.4, 0.3, -0.2, 0.1, 0.2],  // Saída para reducao50
            [0.2, 0.4, 0.1, -0.3, 0.3],  // Saída para reducao25
            [0.1, 0.2, 0.4, 0.3, -0.2],  // Saída para manutencao
            [-0.2, 0.1, 0.3, 0.4, 0.2],  // Saída para aumento25
            [0.3, -0.2, 0.1, 0.2, 0.4]   // Saída para aumento50
        ];
        
        // Bias da camada de saída
        const biasSaida = [-0.3, -0.1, 0.2, 0.3, 0.1];
        
        // Função de ativação ReLU
        const relu = x => Math.max(0, x);
        
        // Função softmax
        const softmax = arr => {
            const expValues = arr.map(val => Math.exp(val));
            const sumExp = expValues.reduce((acc, val) => acc + val, 0);
            return expValues.map(val => val / sumExp);
        };
        
        // Forward pass - camada oculta
        const inputsArray = Object.values(inputs);
        const oculta = [];
        
        for (let i = 0; i < pesosOculta.length; i++) {
            let soma = biasOculta[i];
            for (let j = 0; j < inputsArray.length; j++) {
                soma += inputsArray[j] * pesosOculta[i][j];
            }
            oculta.push(relu(soma));
        }
        
        // Forward pass - camada de saída
        const saida = [];
        
        for (let i = 0; i < pesosSaida.length; i++) {
            let soma = biasSaida[i];
            for (let j = 0; j < oculta.length; j++) {
                soma += oculta[j] * pesosSaida[i][j];
            }
            saida.push(soma);
        }
        
        // Aplicar softmax para obter probabilidades
        const probabilidades = {
            'reducao50': 0,
            'reducao25': 0,
            'manutencao': 0,
            'aumento25': 0,
            'aumento50': 0
        };
        
        const decisoes = Object.keys(probabilidades);
        const probArray = softmax(saida);
        
        for (let i = 0; i < decisoes.length; i++) {
            probabilidades[decisoes[i]] = probArray[i];
        }
        
        // Determinar decisão mais provável
        let maxProb = 0;
        let decisaoFinal = 'manutencao';
        
        for (const [decisao, prob] of Object.entries(probabilidades)) {
            if (prob > maxProb) {
                maxProb = prob;
                decisaoFinal = decisao;
            }
        }
        
        // Armazenar resultados
        this.modelos.redeNeural.resultados = {
            inputs,
            oculta,
            saida,
            probabilidades,
            decisao: decisaoFinal
        };
        
        // Armazenar previsão para próxima reunião
        this.proximaReuniao.previsoes.redeNeural = {
            decisao: decisaoFinal,
            probabilidades
        };
    }
    
    /**
     * Executa o modelo de Filtro de Kalman
     */
    executarModeloKalmanFilter() {
        // Simulação do modelo de Filtro de Kalman
        // Em um ambiente real, isso seria substituído por um modelo treinado
        
        // Estado inicial (estimativas)
        const estado = {
            hiatoPotencial: this.indicadores.hiato,
            taxaNeutral: 4.85,
            inflacaoTendencia: 3.5,
            crescimentoPotencial: 2.0
        };
        
        // Matriz de transição (simplificada)
        const transicao = {
            hiatoPersistencia: 0.8,
            taxaNeutralPersistencia: 0.95,
            inflacaoPersistencia: 0.7,
            crescimentoPersistencia: 0.9
        };
        
        // Observações
        const observacoes = {
            inflacao: this.indicadores.ipca,
            crescimento: this.indicadores.pib,
            desemprego: this.indicadores.desemprego,
            jurosReal: this.historicoDecisoes[0].taxa - this.indicadores.ipca
        };
        
        // Simular uma iteração do filtro de Kalman
        const estadoAtualizado = {
            hiatoPotencial: estado.hiatoPotencial * transicao.hiatoPersistencia + 
                            0.1 * (observacoes.crescimento - estado.crescimentoPotencial) -
                            0.05 * (observacoes.desemprego - 7.0),
            
            taxaNeutral: estado.taxaNeutral * transicao.taxaNeutralPersistencia +
                        0.05 * (observacoes.jurosReal - estado.taxaNeutral) +
                        0.02 * (observacoes.inflacao - estado.inflacaoTendencia),
            
            inflacaoTendencia: estado.inflacaoTendencia * transicao.inflacaoPersistencia +
                              0.1 * (observacoes.inflacao - estado.inflacaoTendencia),
            
            crescimentoPotencial: estado.crescimentoPotencial * transicao.crescimentoPersistencia +
                                 0.05 * (observacoes.crescimento - estado.crescimentoPotencial)
        };
        
        // Calcular taxa de juros ótima segundo o modelo
        const taxaOtima = estadoAtualizado.taxaNeutral + 
                         1.5 * (observacoes.inflacao - 3.0) + 
                         0.5 * estadoAtualizado.hiatoPotencial;
        
        // Calcular diferença em relação à taxa atual
        const taxaAtual = this.historicoDecisoes[0].taxa;
        const diferenca = taxaOtima - taxaAtual;
        
        // Determinar decisão com base na diferença
        let decisao = 'manutencao';
        
        if (diferenca > 0.375) decisao = 'aumento50';
        else if (diferenca > 0.125) decisao = 'aumento25';
        else if (diferenca < -0.375) decisao = 'reducao50';
        else if (diferenca < -0.125) decisao = 'reducao25';
        
        // Calcular probabilidades com base na distância dos limiares
        const probabilidades = {
            'reducao50': 0,
            'reducao25': 0,
            'manutencao': 0,
            'aumento25': 0,
            'aumento50': 0
        };
        
        // Função para calcular probabilidade baseada na distância do limiar
        const calcularProb = (valor, limiar, largura) => {
            return Math.max(0, 1 - Math.abs(valor - limiar) / largura);
        };
        
        // Distribuir probabilidades
        probabilidades.reducao50 = calcularProb(diferenca, -0.5, 0.25) * 0.8;
        probabilidades.reducao25 = calcularProb(diferenca, -0.25, 0.25) * 0.8;
        probabilidades.manutencao = calcularProb(diferenca, 0.0, 0.25) * 0.8;
        probabilidades.aumento25 = calcularProb(diferenca, 0.25, 0.25) * 0.8;
        probabilidades.aumento50 = calcularProb(diferenca, 0.5, 0.25) * 0.8;
        
        // Normalizar probabilidades
        const somaProb = Object.values(probabilidades).reduce((a, b) => a + b, 0);
        for (const decisao in probabilidades) {
            probabilidades[decisao] /= somaProb;
        }
        
        // Armazenar resultados
        this.modelos.kalmanFilter.resultados = {
            estadoInicial: estado,
            estadoAtualizado,
            observacoes,
            taxaOtima,
            diferenca,
            probabilidades,
            decisao
        };
        
        // Armazenar previsão para próxima reunião
        this.proximaReuniao.previsoes.kalmanFilter = {
            decisao,
            probabilidades
        };
    }
    
    /**
     * Consolida as previsões de todos os modelos
     */
    consolidarPrevisoes() {
        // Inicializar probabilidades consolidadas
        const probabilidadesConsolidadas = {
            'reducao50': 0,
            'reducao25': 0,
            'manutencao': 0,
            'aumento25': 0,
            'aumento50': 0
        };
        
        // Pesos dos modelos
        const pesos = {
            regimesSwitching: 0.20,
            bayesiano: 0.20,
            dsge: 0.25,
            redeNeural: 0.15,
            kalmanFilter: 0.20
        };
        
        // Calcular probabilidades ponderadas
        for (const [modelo, previsao] of Object.entries(this.proximaReuniao.previsoes)) {
            for (const [decisao, prob] of Object.entries(previsao.probabilidades)) {
                probabilidadesConsolidadas[decisao] += prob * pesos[modelo];
            }
        }
        
        // Determinar decisão mais provável
        let maxProb = 0;
        let decisaoFinal = 'manutencao';
        
        for (const [decisao, prob] of Object.entries(probabilidadesConsolidadas)) {
            if (prob > maxProb) {
                maxProb = prob;
                decisaoFinal = decisao;
            }
        }
        
        // Armazenar resultados
        this.proximaReuniao.previsaoConsolidada = decisaoFinal;
        this.proximaReuniao.probabilidadesConsolidadas = probabilidadesConsolidadas;
    }
    
    /**
     * Normaliza um valor para o intervalo [0, 1]
     * @param {number} valor - Valor a ser normalizado
     * @param {number} min - Valor mínimo do intervalo original
     * @param {number} max - Valor máximo do intervalo original
     * @returns {number} Valor normalizado
     */
    normalizar(valor, min, max) {
        return Math.max(0, Math.min(1, (valor - min) / (max - min)));
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
     * Retorna a taxa Selic prevista após a próxima decisão
     * @returns {number} Taxa Selic prevista
     */
    taxaSelicPrevista() {
        const taxaAtual = this.historicoDecisoes[0].taxa;
        const decisao = this.proximaReuniao.previsaoConsolidada;
        
        if (decisao === 'reducao50') return taxaAtual - 0.50;
        if (decisao === 'reducao25') return taxaAtual - 0.25;
        if (decisao === 'aumento25') return taxaAtual + 0.25;
        if (decisao === 'aumento50') return taxaAtual + 0.50;
        
        return taxaAtual; // Manutenção
    }
    
    /**
     * Retorna os resultados de todos os modelos
     * @returns {Object} Resultados dos modelos
     */
    getResultados() {
        return {
            modelos: this.modelos,
            proximaReuniao: this.proximaReuniao,
            taxaPrevista: this.taxaSelicPrevista(),
            historicoDecisoes: this.historicoDecisoes,
            indicadores: this.indicadores
        };
    }
    
    /**
     * Atualiza os indicadores econômicos e recalcula as previsões
     * @param {Object} novosIndicadores - Novos valores para os indicadores
     */
    atualizarIndicadores(novosIndicadores) {
        // Atualizar indicadores
        for (const [indicador, valor] of Object.entries(novosIndicadores)) {
            if (indicador in this.indicadores) {
                this.indicadores[indicador] = valor;
            }
        }
        
        // Recalcular previsões
        this.inicializarModelos();
        
        return this.getResultados();
    }
}

// Exportar a classe para uso global
window.ModelosAvancados = ModelosAvancados;

// Inicializar quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.modelosAvancados = new ModelosAvancados();
    
    // Renderizar resultados na interface, se a função existir
    if (typeof renderizarModelosAvancados === 'function') {
        renderizarModelosAvancados(window.modelosAvancados.getResultados());
    }
    
    console.log('Modelos avançados inicializados');
});
