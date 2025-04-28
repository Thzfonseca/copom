/**
 * Módulo para simulação do juro real neutro
 * 
 * Permite ao usuário alterar variáveis-chave e observar o impacto nas estimativas
 * dos diferentes modelos de juro real neutro.
 */

// Namespace para o simulador de juro real neutro
const simuladorJuroNeutro = (function() {
    
    // Dependência: Módulo juroNeutro com os dados base
    if (typeof juroNeutro === 'undefined' || typeof juroNeutro.getData !== 'function') {
        console.error("Erro: Módulo 'juroNeutro' não encontrado ou inválido.");
        return {}; // Retorna objeto vazio para evitar mais erros
    }
    
    const dadosBase = juroNeutro.getData();
    
    // Variáveis de entrada para simulação com valores padrão
    let inputVars = {
        expectativaInflacaoLP: 4.0, // Expectativa de inflação de longo prazo (%)
        hiatoProduto: 0.0,          // Hiato do produto (% do PIB)
        riscoPaisEMBI: 200,         // Risco-país (EMBI Global, pontos-base)
        riscoPaisCDS: 150,          // Risco-país (CDS 5 anos, pontos-base)
        taxaJurosExternaUS: 2.5,    // Taxa de juros real externa (EUA, %)
        premioRiscoCambial: 1.5,    // Prêmio de risco cambial (%)
        crescimentoPotencialPIB: 2.0 // Crescimento potencial do PIB (%)
    };
    
    // Função para atualizar as variáveis de entrada
    function setInputVars(newVars) {
        inputVars = { ...inputVars, ...newVars };
        console.log("Variáveis de simulação atualizadas:", inputVars);
    }
    
    // Função para obter as variáveis de entrada atuais
    function getInputVars() {
        return { ...inputVars };
    }
    
    // --- Lógica de Simulação para cada Modelo ---
    
    // Simulação simplificada (ajustes lineares ou baseados em sensibilidades implícitas)
    
    function simularFocusExAnte(baseData) {
        const baseMedian = baseData.currentEstimates.median;
        // Sensibilidade (hipotética) à expectativa de inflação
        const ajusteInflacao = (inputVars.expectativaInflacaoLP - 4.0) * 0.2;
        return baseMedian + ajusteInflacao;
    }
    
    function simularHiatoProduto(baseData) {
        const baseMedian = baseData.currentEstimates.median;
        // Sensibilidade (hipotética) ao hiato do produto
        const ajusteHiato = inputVars.hiatoProduto * 0.5;
        return baseMedian + ajusteHiato;
    }
    
    function simularNtnbPremio(baseData) {
        const baseMedian = baseData.currentEstimates.median;
        // Sensibilidade (hipotética) ao risco-país (média EMBI/CDS)
        const riscoMedio = (inputVars.riscoPaisEMBI / 100 + inputVars.riscoPaisCDS / 100) / 2;
        const baseRiscoMedio = (200 / 100 + 150 / 100) / 2; // Risco base implícito
        const ajusteRisco = (riscoMedio - baseRiscoMedio) * 0.3;
        return baseMedian + ajusteRisco;
    }
    
    function simularLaubachWilliams(baseData) {
        const baseMedian = baseData.currentEstimates.median;
        // Sensibilidade (hipotética) ao hiato e crescimento potencial
        const ajusteHiato = inputVars.hiatoProduto * 0.4;
        const ajusteCrescimento = (inputVars.crescimentoPotencialPIB - 2.0) * 0.6;
        return baseMedian + ajusteHiato + ajusteCrescimento;
    }
    
    function simularSamba(baseData) {
        const baseMedian = baseData.currentEstimates.median;
        // Sensibilidade (hipotética) a múltiplos fatores
        const ajusteHiato = inputVars.hiatoProduto * 0.3;
        const ajusteCrescimento = (inputVars.crescimentoPotencialPIB - 2.0) * 0.5;
        const ajusteRisco = ((inputVars.riscoPaisEMBI / 100) - 2.0) * 0.2;
        return baseMedian + ajusteHiato + ajusteCrescimento + ajusteRisco;
    }
    
    function simularParidadeDescoberta(baseData) {
        // Fórmula: r_neutro = r_externo + risco_pais + premio_cambial
        const r_externo = inputVars.taxaJurosExternaUS;
        // Usar média do EMBI e CDS como risco país
        const risco_pais = (inputVars.riscoPaisEMBI / 100 + inputVars.riscoPaisCDS / 100) / 2;
        const premio_cambial = inputVars.premioRiscoCambial;
        return r_externo + risco_pais + premio_cambial;
    }
    
    function simularModelosBC(baseData) {
        // Média ponderada simplificada do SAMBA e Agregado/Desagregado
        const sambaSimulado = simularSamba(dadosBase.samba);
        const agregadoSimulado = baseData.currentEstimates.agregado + (inputVars.hiatoProduto * 0.4);
        return (sambaSimulado * 0.5 + agregadoSimulado * 0.5);
    }
    
    function simularQPC(baseData) {
        const baseMedian = baseData.currentEstimates.median;
        // Sensibilidade (hipotética) à expectativa de inflação e risco
        const ajusteInflacao = (inputVars.expectativaInflacaoLP - 4.0) * 0.3;
        const ajusteRisco = ((inputVars.riscoPaisEMBI / 100) - 2.0) * 0.1;
        return baseMedian + ajusteInflacao + ajusteRisco;
    }
    
    // Função principal para executar a simulação
    function executarSimulacao() {
        console.log("Executando simulação com variáveis:", inputVars);
        
        const resultadosSimulados = {
            focusExAnte: simularFocusExAnte(dadosBase.focusExAnte),
            hiatoProduto: simularHiatoProduto(dadosBase.hiatoProduto),
            ntnbPremio: simularNtnbPremio(dadosBase.ntnbPremio),
            laubachWilliams: simularLaubachWilliams(dadosBase.laubachWilliams),
            samba: simularSamba(dadosBase.samba),
            paridadeDescoberta: simularParidadeDescoberta(dadosBase.paridadeDescoberta),
            modelosBC: simularModelosBC(dadosBase.modelosBC),
            qpc: simularQPC(dadosBase.qpc)
        };
        
        // Calcular a mediana dos resultados simulados
        const todasEstimativasSimuladas = Object.values(resultadosSimulados);
        todasEstimativasSimuladas.sort((a, b) => a - b);
        const meio = Math.floor(todasEstimativasSimuladas.length / 2);
        let medianaSimulada;
        if (todasEstimativasSimuladas.length % 2 === 0) {
            medianaSimulada = (todasEstimativasSimuladas[meio - 1] + todasEstimativasSimuladas[meio]) / 2;
        } else {
            medianaSimulada = todasEstimativasSimuladas[meio];
        }
        
        console.log("Resultados da simulação:", resultadosSimulados);
        console.log("Mediana simulada:", medianaSimulada);
        
        return {
            mediana: medianaSimulada,
            modelos: resultadosSimulados
        };
    }
    
    // Retornar as funções públicas do módulo
    return {
        setInputVars: setInputVars,
        getInputVars: getInputVars,
        executarSimulacao: executarSimulacao
    };
    
})();
