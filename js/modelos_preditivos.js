// js/modelos_preditivos.js

class ModelosPreditivos {
    constructor() {
        this.modelos = {};
        this.indicadores = {};
        this.historicoDecisoes = [];
        this.proximaReuniao = {};

        // Inicializa com dados simulados (exemplo)
        this.inicializarDados();
    }

    inicializarDados() {
        // Modelos simulados
        this.modelos = {
            regressaoLinear: {
                nome: "Regressão Linear",
                descricao: "Modelo de regressão linear para prever a taxa Selic.",
                previsao: "manutencao",
                probabilidades: {
                    reducao50: 0.05,
                    reducao25: 0.10,
                    manutencao: 0.65,
                    aumento25: 0.15,
                    aumento50: 0.05
                },
                dataReferencia: "Abril/2025"
            },
            randomForest: {
                nome: "Random Forest",
                descricao: "Modelo de Random Forest para classificação de decisões.",
                previsao: "aumento25",
                probabilidades: {
                    reducao50: 0.02,
                    reducao25: 0.08,
                    manutencao: 0.30,
                    aumento25: 0.50,
                    aumento50: 0.10
                },
                dataReferencia: "Abril/2025"
            },
            regraTaylor: {
                nome: "Regra de Taylor",
                descricao: "Aplicando a fórmula clássica da Regra de Taylor.",
                previsao: "manutencao",
                probabilidades: {
                    reducao50: 0.00,
                    reducao25: 0.05,
                    manutencao: 0.80,
                    aumento25: 0.10,
                    aumento50: 0.05
                },
                dataReferencia: "Abril/2025"
            },
            modeloNLP: {
                nome: "Análise de Comunicação (NLP)",
                descricao: "Modelo baseado na análise textual das atas do COPOM.",
                previsao: "aumento25",
                probabilidades: {
                    reducao50: 0.01,
                    reducao25: 0.05,
                    manutencao: 0.25,
                    aumento25: 0.60,
                    aumento50: 0.09
                },
                dataReferencia: "Abril/2025"
            }
        };

        // Indicadores simulados
        this.indicadores = {
            ipca: 4.25,
            ipcaE12m: 4.50,
            hiato: -0.8,
            cambio: 5.20,
            cambioDelta: 0.15,
            jurosEUA: 5.50,
            commodities: -2.5,
            confConsumidor: 92.3,
            vix: 18.5
        };

        // Histórico de decisões simuladas
        this.historicoDecisoes = [
            { reuniao: '269ª', data: '18-19/03/2025', taxa: 14.25, decisao: 'Aumento de 25 pontos-base' },
            { reuniao: '268ª', data: '29-30/01/2025', taxa: 14.00, decisao: 'Aumento de 25 pontos-base' },
            { reuniao: '267ª', data: '11-12/12/2024', taxa: 13.75, decisao: 'Aumento de 25 pontos-base' }
        ];

        // Proxima reuniao
        this.proximaReuniao = {
            reuniao: '270ª',
            data: '07/05/2025',
            previsaoConsolidada: 'manutencao',
            probabilidades: {
                reducao50: 0.02,
                reducao25: 0.08,
                manutencao: 0.65,
                aumento25: 0.20,
                aumento50: 0.05
            },
            taxaSelicPrevista: 14.25
        };
    }

    // Métodos de acesso
    getModelosData() {
        return this.modelos;
    }

    getProximaReuniaoData() {
        return this.proximaReuniao;
    }

    getIndicadoresData() {
        return this.indicadores;
    }

    // Função FINAL que junta tudo para o frontend
    getResultados() {
        return {
            modelos: this.getModelosData(),
            proximaReuniao: this.getProximaReuniaoData(),
            indicadores: this.getIndicadoresData(),
            historicoDecisoes: this.historicoDecisoes,
            taxaPrevista: this.getProximaReuniaoData()?.taxaSelicPrevista || 13.75
        };
    }
}

// Deixar disponível globalmente
window.ModelosPreditivos = ModelosPreditivos;

// Quando o documento estiver pronto, criar a instância
window.addEventListener('DOMContentLoaded', () => {
    window.modelosPreditivos = new ModelosPreditivos();
    console.log('Modelos Preditivos inicializados');
});
