/**
 * Módulo de Modelos Preditivos para a Taxa Selic
 * 
 * Este módulo gerencia a lógica para simular previsões da Taxa Selic
 * com base em modelos estatísticos treinados.
 */

(function () {
    class ModelosPreditivos {
        constructor() {
            this.resultados = null;
        }

        /**
         * Inicializa o módulo carregando os dados de previsão
         */
        inicializar() {
            console.log('Modelos Preditivos inicializados');

            // Dados mockados para teste — Substituir futuramente por dados reais se necessário
            this.resultados = {
                modelos: {
                    regressaoLinear: {
                        nome: "Regressão Linear",
                        descricao: "Modelo de regressão linear simples baseado nos principais indicadores econômicos.",
                        previsao: "manutencao",
                        dataReferencia: "19/03/2025",
                        probabilidades: {
                            reducao50: 0.05,
                            reducao25: 0.10,
                            manutencao: 0.75,
                            aumento25: 0.08,
                            aumento50: 0.02
                        }
                    },
                    modeloVAR: {
                        nome: "Modelo VAR",
                        descricao: "Modelo Vetorial Autorregressivo com variáveis econômicas brasileiras e externas.",
                        previsao: "reducao25",
                        dataReferencia: "19/03/2025",
                        probabilidades: {
                            reducao50: 0.10,
                            reducao25: 0.60,
                            manutencao: 0.25,
                            aumento25: 0.04,
                            aumento50: 0.01
                        }
                    }
                },
                proximaReuniao: {
                    data: "07/05/2025",
                    reuniao: "250ª",
                    previsaoConsolidada: "manutencao",
                    probabilidades: {
                        reducao50: 0.08,
                        reducao25: 0.20,
                        manutencao: 0.65,
                        aumento25: 0.06,
                        aumento50: 0.01
                    }
                },
                taxaPrevista: 10.50,
                indicadores: {
                    ipca: 3.95,
                    ipcaE12m: 4.10,
                    hiato: -0.7,
                    cambio: 5.15,
                    cambioDelta: 0.25,
                    jurosEUA: 5.25,
                    commodities: -1.5,
                    confConsumidor: 94.2,
                    vix: 17.8
                },
                historicoDecisoes: [
                    { reuniao: "249ª", data: "19/03/2025", taxa: 10.75, decisao: "Redução de 25pb" },
                    { reuniao: "248ª", data: "31/01/2025", taxa: 11.00, decisao: "Redução de 50pb" },
                    { reuniao: "247ª", data: "13/12/2024", taxa: 11.50, decisao: "Redução de 50pb" }
                ]
            };
        }

        /**
         * Retorna os resultados atuais dos modelos
         * @returns {Object} Resultados
         */
        getResultados() {
            return this.resultados;
        }

        /**
         * Atualiza os resultados simulando alterações nos indicadores
         * @param {Object} novosIndicadores - Novos valores de indicadores
         * @returns {Object} Novos resultados simulados
         */
        atualizarIndicadores(novosIndicadores) {
            console.log('Atualizando indicadores para simulação:', novosIndicadores);

            // Cria uma cópia dos resultados para simulação
            const resultadosSimulados = JSON.parse(JSON.stringify(this.resultados));

            // Lógica simplificada de simulação
            const deltaInflacao = (novosIndicadores.ipca + novosIndicadores.ipcaE12m) / 2 - 4.0;
            const deltaHiato = novosIndicadores.hiato - (-1.0);
            const deltaJurosEUA = novosIndicadores.jurosEUA - 5.0;

            let ajuste = deltaInflacao * 0.4 + deltaHiato * 0.3 + deltaJurosEUA * 0.3;

            // Atualizar previsão consolidada com base no ajuste
            if (ajuste > 1) {
                resultadosSimulados.proximaReuniao.previsaoConsolidada = "aumento25";
                resultadosSimulados.taxaPrevista += 0.25;
            } else if (ajuste < -1) {
                resultadosSimulados.proximaReuniao.previsaoConsolidada = "reducao25";
                resultadosSimulados.taxaPrevista -= 0.25;
            } else {
                resultadosSimulados.proximaReuniao.previsaoConsolidada = "manutencao";
            }

            // Atualizar probabilidades
            resultadosSimulados.proximaReuniao.probabilidades = {
                reducao50: ajuste < -2 ? 0.2 : 0.05,
                reducao25: ajuste < -1 ? 0.5 : 0.1,
                manutencao: Math.max(0.5 - Math.abs(ajuste) * 0.1, 0.2),
                aumento25: ajuste > 1 ? 0.4 : 0.1,
                aumento50: ajuste > 2 ? 0.2 : 0.05
            };

            // Atualizar previsões dos modelos individuais
            Object.keys(resultadosSimulados.modelos).forEach(modeloId => {
                if (ajuste > 1) {
                    resultadosSimulados.modelos[modeloId].previsao = "aumento25";
                } else if (ajuste < -1) {
                    resultadosSimulados.modelos[modeloId].previsao = "reducao25";
                } else {
                    resultadosSimulados.modelos[modeloId].previsao = "manutencao";
                }
            });

            return resultadosSimulados;
        }
    }

    // Tornar disponível globalmente
    window.modelosPreditivos = new ModelosPreditivos();
})();
