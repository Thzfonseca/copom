class ModelosPreditivos {
    constructor() {
        this.coeficientes = {
            intercepto: 3.0,
            ipca: 1.2,
            cambio: 0.5,
            hiato: -0.7
        };

        this.cenarioBase = {
            ipca: 4.25,
            cambio: 5.20,
            hiato: -0.8
        };

        this.historicoSelic = [
            { data: 'jan/2023', taxa: 13.75 },
            { data: 'mar/2023', taxa: 13.75 },
            { data: 'mai/2023', taxa: 13.75 },
            { data: 'jul/2023', taxa: 13.25 },
            { data: 'set/2023', taxa: 12.75 },
            { data: 'nov/2023', taxa: 12.25 },
            { data: 'jan/2024', taxa: 11.75 },
            { data: 'mar/2024', taxa: 11.50 },
            { data: 'mai/2024', taxa: 11.25 },
            { data: 'jul/2024', taxa: 11.00 },
            { data: 'set/2024', taxa: 10.75 },
            { data: 'nov/2024', taxa: 10.50 },
            { data: 'jan/2025', taxa: 10.25 },
            { data: 'mar/2025', taxa: 10.25 }
        ];

        this.resultadoAtual = this.preverSelic(this.cenarioBase);
    }

    preverSelic(cenario) {
        const { intercepto, ipca, cambio, hiato } = this.coeficientes;
        const selicPrevista = intercepto +
            (ipca * (cenario.ipca ?? 0)) +
            (cambio * (cenario.cambio ?? 0)) +
            (hiato * (cenario.hiato ?? 0));

        let decisao = 'manutencao';
        const ultimaTaxa = this.historicoSelic.at(-1).taxa;

        if (selicPrevista > ultimaTaxa + 0.25) {
            decisao = 'aumento25';
        } else if (selicPrevista < ultimaTaxa - 0.25) {
            decisao = 'reducao25';
        }

        return {
            taxaPrevista: selicPrevista,
            decisaoPrevista: decisao,
            dataReferencia: "19/03/2025",
            proximaReuniao: {
                previsaoConsolidada: decisao
            }
        };
    }

    getResultados() {
        return this.resultadoAtual;
    }

    atualizarCenario(novoCenario) {
        this.resultadoAtual = this.preverSelic(novoCenario);
        return this.resultadoAtual;
    }

    getHistoricoSelic() {
        return this.historicoSelic;
    }
}

window.modelosPreditivos = new ModelosPreditivos();
