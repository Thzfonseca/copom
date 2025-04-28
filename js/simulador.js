// js/simulador.js

function renderizarSimulador() {
    const container = document.getElementById('simulador');
    if (!container || !window.modelosPreditivos) {
        console.error('Container ou modelosPreditivos não encontrados.');
        return;
    }

    container.innerHTML = `
        <h2>Simulador COPOM</h2>
        <div>
            <label>IPCA (%): <input id="ipca" type="number" step="0.1" value="${window.modelosPreditivos.cenarioBase.ipca}"></label>
        </div>
        <div>
            <label>Câmbio (USD/BRL): <input id="cambio" type="number" step="0.01" value="${window.modelosPreditivos.cenarioBase.cambio}"></label>
        </div>
        <div>
            <label>Hiato (%): <input id="hiato" type="number" step="0.1" value="${window.modelosPreditivos.cenarioBase.hiato}"></label>
        </div>
        <button id="simular-btn">Simular</button>

        <div id="resultado-simulacao" style="margin-top:20px;"></div>
    `;

    document.getElementById('simular-btn').addEventListener('click', () => {
        const ipca = parseFloat(document.getElementById('ipca').value);
        const cambio = parseFloat(document.getElementById('cambio').value);
        const hiato = parseFloat(document.getElementById('hiato').value);

        window.modelosPreditivos.atualizarCenario({ ipca, cambio, hiato });

        const resultado = window.modelosPreditivos.getResultados();

        document.getElementById('resultado-simulacao').innerHTML = `
            <h4>Resultado da Simulação:</h4>
            <p>Taxa Selic Prevista: <strong>${resultado.taxaPrevista.toFixed(2)}%</strong></p>
            <p>Decisão Prevista: <strong>${interpretarDecisao(resultado.decisaoPrevista)}</strong></p>
        `;
    });
}

function interpretarDecisao(decisao) {
    const mapa = {
        'aumento25': 'Aumento de 25 pontos-base',
        'reducao25': 'Redução de 25 pontos-base',
        'manutencao': 'Manutenção da taxa'
    };
    return mapa[decisao] || 'Indefinido';
}

// Disponibilizar globalmente
window.renderizarSimulador = renderizarSimulador;
