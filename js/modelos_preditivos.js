// js/modelos_preditivos.js

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

        this.historicoDecisoes = [
            { reuniao: '269ª', data: '18-19/03/2025', taxa: 14.25, decisao: 'Aumento de 25 pontos-base' },
            { reuniao: '268ª', data: '29-30/01/2025', taxa: 14.00, decisao: 'Aumento de 25 pontos-base' },
            { reuniao: '267ª', data: '11-12/12/2024', taxa: 13.75, decisao: 'Aumento de 25 pontos-base' }
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
        const ultimaTaxa = this.historicoDecisoes[0].taxa;

        if (selicPrevista > ultimaTaxa + 0.25) {
            decisao = 'aumento25';
        } else if (selicPrevista < ultimaTaxa - 0.25) {
            decisao = 'reducao25';
        }

        return {
            taxaPrevista: selicPrevista,
            decisaoPrevista: decisao,
            dataReferencia: "19/03/2025"
        };
    }

    getResultados() {
        return this.resultadoAtual;
    }

    atualizarCenario(novoCenario) {
        this.resultadoAtual = this.preverSelic(novoCenario);
    }
}

// Disponibilizar para a janela global
window.modelosPreditivos = new ModelosPreditivos();
