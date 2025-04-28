// js/modelos_preditivos.js

/**
 * Módulo de Modelos Preditivos para o COPOM Dashboard
 * Simula resultados de previsão da taxa Selic para o sistema funcionar corretamente.
 */

window.modelosPreditivos = {
    /**
     * Retorna os resultados base para o simulador e para a aba Modelos Preditivos
     */
    getResultados: function () {
        return {
            proximaReuniao: {
                data: "05/06/2025",
                reuniao: "253ª",
                previsaoConsolidada: "manutencao",
                probabilidades: {
                    reducao50: 0.05,
                    reducao25: 0.15,
                    manutencao: 0.7,
                    aumento25: 0.1,
                    aumento50: 0.0
                }
            },
            taxaPrevista: 10.50,
            modelos: {
                regressaoLinear: {
                    nome: "Regressão Linear",
                    descricao: "Modelo simples de regressão linear dos principais indicadores econômicos.",
                    dataReferencia: "19/03/2025",
                    previsao: "manutencao",
                    probabilidades: {
                        reducao50: 0.02,
                        reducao25: 0.18,
                        manutencao: 0.75,
                        aumento25: 0.05,
                        aumento50: 0.0
                    }
                },
                arvoreDecisao: {
                    nome: "Árvore de Decisão",
                    descricao: "Modelo baseado em árvore de decisão para previsão da decisão do COPOM.",
                    dataReferencia: "19/03/2025",
                    previsao: "manutencao",
                    probabilidades: {
                        reducao50: 0.1,
                        reducao25: 0.2,
                        manutencao: 0.6,
                        aumento25: 0.1,
                        aumento50: 0.0
                    }
                }
            },
            indicadores: {
                ipca: 4.25,
                ipcaE12m: 4.50,
                hiato: -0.8,
                cambio: 5.20,
                cambioDelta: 0.15,
                jurosEUA: 5.50,
                commodities: -2.5,
                confConsumidor: 92.3,
                vix: 18.5
            },
            historicoDecisoes: [
                { reuniao: "252ª", data: "19/03/2025", taxa: 10.50, decisao: "Manutenção" },
                { reuniao: "251ª", data: "31/01/2025", taxa: 10.50, decisao: "Manutenção" },
                { reuniao: "250ª", data: "13/12/2024", taxa: 10.75, decisao: "Redução 25pb" },
                { reuniao: "249ª", data: "30/10/2024", taxa: 11.00, decisao: "Redução 25pb" }
            ]
        };
    },

    /**
     * Atualiza os indicadores simulados e gera novo resultado (mockado ainda)
     * @param {Object} novoCenario 
     * @returns {Object} novos resultados
     */
    atualizarIndicadores: function (novoCenario) {
        console.log("[Modelos Preditivos] Atualizando indicadores com cenário:", novoCenario);

        // Retorna o mesmo resultado apenas para manter o sistema rodando
        const resultados = this.getResultados();

        // Pequena lógica para mudar previsão conforme IPCA
        if (novoCenario.ipca > 5.5) {
            resultados.proximaReuniao.previsaoConsolidada = "aumento25";
        } else if (novoCenario.ipca < 3.5) {
            resultados.proximaReuniao.previsaoConsolidada = "reducao25";
        } else {
            resultados.proximaReuniao.previsaoConsolidada = "manutencao";
        }

        resultados.taxaPrevista = 10.50; // Mantém para agora

        return resultados;
    }
};

console.log("[COPOM Dashboard] Modelos Preditivos inicializados.");
