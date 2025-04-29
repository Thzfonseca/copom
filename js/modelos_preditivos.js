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

        this.resultadoAtual = this.preverSelic(this.cenarioBase);
    }

    preverSelic(cenario) {
        const { intercepto, ipca, cambio, hiato } = this.coeficientes;
        const selicPrevista = intercepto +
            (ipca * (cenario.ipca ?? 0)) +
            (cambio * (cenario.cambio ?? 0)) +
            (hiato * (cenario.hiato ?? 0));

        let decisao = 'manutencao';
        const taxaAtual = 13.75;

        if (selicPrevista > taxaAtual + 0.25) decisao = 'aumento25';
        else if (selicPrevista < taxaAtual - 0.25) decisao = 'reducao25';

        return {
            taxaPrevista: selicPrevista,
            previsaoConsolidada: decisao
        };
    }

    getResultados() {
        return this.resultadoAtual;
    }
}

window.modelosPreditivos = new ModelosPreditivos();
