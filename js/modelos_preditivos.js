// js/modelos_preditivos.js

(function () {
    const ModelosPreditivos = {
        modelos: {
            regressaoLinear: {
                nome: "Regressão Linear",
                descricao: "Modelo simples de regressão linear para previsão da taxa Selic.",
                dataReferencia: "19/03/2025",
                previsao: "manutencao",
                probabilidades: {
                    reducao50: 0.1,
                    reducao25: 0.2,
                    manutencao: 0.6,
                    aumento25: 0.1,
                    aumento50: 0.0
                }
            },
            arvoreDecisao: {
                nome: "Árvore de Decisão",
                descricao: "Modelo baseado em árvore de decisão para análise de cenários.",
                dataReferencia: "19/03/2025",
                previsao: "reducao25",
                probabilidades: {
                    reducao50: 0.05,
                    reducao25: 0.5,
                    manutencao: 0.4,
                    aumento25: 0.05,
                    aumento50: 0.0
                }
            },
            redeNeural: {
                nome: "Rede Neural",
                descricao: "Modelo de rede neural treinado com variáveis macroeconômicas.",
                dataReferencia: "19/03/2025",
                previsao: "manutencao",
                probabilidades: {
                    reducao50: 0.0,
                    reducao25: 0.3,
                    manutencao: 0.6,
                    aumento25: 0.1,
                    aumento50: 0.0
                }
            }
        },
        taxaPrevista: 10.75,
        proximaReuniao: {
            data: "30/07/2025",
            reuniao: "252ª",
            previsaoConsolidada: "manutencao",
            probabilidades: {
                reducao50: 0.05,
                reducao25: 0.25,
                manutencao: 0.6,
                aumento25: 0.1,
                aumento50: 0.0
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
            { reuniao: "251ª", data: "20/03/2025", taxa: 10.75, decisao: "Manutenção" },
            { reuniao: "250ª", data: "31/01/2025", taxa: 10.75, decisao: "Redução de 25pb" },
            { reuniao: "249ª", data: "13/12/2024", taxa: 11.00, decisao: "Redução de 50pb" },
            { reuniao: "248ª", data: "01/11/2024", taxa: 11.50, decisao: "Redução de 50pb" }
        ],
        getResultados: function () {
            return {
                modelos: this.modelos,
                taxaPrevista: this.taxaPrevista,
                proximaReuniao: this.proximaReuniao,
                indicadores: this.indicadores,
                historicoDecisoes: this.historicoDecisoes
            };
        },
        atualizarIndicadores: function (novosIndicadores) {
            // Simulação básica para atualizar resultados baseado nos novos indicadores
            console.log("[COPOM Dashboard] Atualizando indicadores para simulação...", novosIndicadores);

            const ajusteTaxa = (novosIndicadores.ipcaE12m - 4.5) * 0.5;
            const novaTaxa = Math.max(2.0, Math.min(20.0, this.taxaPrevista + ajusteTaxa));

            const novaPrevisao =
                ajusteTaxa > 0.5 ? "aumento25" :
                ajusteTaxa < -0.5 ? "reducao25" :
                "manutencao";

            return {
                modelos: this.modelos,
                taxaPrevista: novaTaxa,
                proximaReuniao: {
                    ...this.proximaReuniao,
                    previsaoConsolidada: novaPrevisao,
                    probabilidades: {
                        reducao50: 0.1,
                        reducao25: novaPrevisao === "reducao25" ? 0.6 : 0.1,
                        manutencao: novaPrevisao === "manutencao" ? 0.6 : 0.2,
                        aumento25: novaPrevisao === "aumento25" ? 0.6 : 0.1,
                        aumento50: 0.0
                    }
                },
                indicadores: novosIndicadores,
                historicoDecisoes: this.historicoDecisoes
            };
        }
    };

    console.log("[COPOM Dashboard] Modelos Preditivos inicializados.");
    window.ModelosPreditivos = ModelosPreditivos;
})();
