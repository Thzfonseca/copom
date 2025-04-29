document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("rolagem-ipca");
    if (!container) return;

    container.innerHTML = `
        <div class="rolagem-container">
            <h2>Simulador de Rolagem IPCA+</h2>
            
            <div class="grid grid-2">
                <div>
                    <div class="box-opcao">
                        <h3>Opção Curta</h3>
                        <label>Indexador:
                            <select id="curta-indexador">
                                <option value="ipca">IPCA+</option>
                                <option value="pre">Pré</option>
                            </select>
                        </label>
                        <label>Taxa (% a.a.):
                            <input type="number" id="curta-taxa" value="6.00" step="0.01" />
                        </label>
                        <label>Prazo (anos):
                            <input type="number" id="curta-prazo" value="2.0" step="0.5" />
                        </label>
                    </div>

                    <div class="box-premissas">
                        <h3>Premissas - Curta</h3>
                        <label>CDI Médio (% a.a.):
                            <input type="number" id="curta-cdi" value="10.00" step="0.01" />
                        </label>
                        <label>IPCA Médio (% a.a.):
                            <input type="number" id="curta-ipca" value="4.00" step="0.01" />
                        </label>
                    </div>
                </div>

                <div>
                    <div class="box-opcao">
                        <h3>Opção Longa</h3>
                        <label>Indexador:
                            <select id="longa-indexador">
                                <option value="ipca">IPCA+</option>
                                <option value="pre">Pré</option>
                            </select>
                        </label>
                        <label>Taxa (% a.a.):
                            <input type="number" id="longa-taxa" value="6.50" step="0.01" />
                        </label>
                        <label>Prazo (anos):
                            <input type="number" id="longa-prazo" value="5.0" step="0.5" />
                        </label>
                    </div>

                    <div class="box-premissas">
                        <h3>Premissas - Longa</h3>
                        <label>CDI Médio (% a.a.):
                            <input type="number" id="longa-cdi" value="10.00" step="0.01" />
                        </label>
                        <label>IPCA Médio (% a.a.):
                            <input type="number" id="longa-ipca" value="4.00" step="0.01" />
                        </label>
                    </div>
                </div>
            </div>

            <div class="grid grid-2">
                <button class="button button-simular" id="btn-simular-rolagem">Simular Rolagem</button>
                <button class="button button-resetar" id="btn-resetar-rolagem">Resetar</button>
            </div>

            <div class="chart-container mt-5">
                <canvas id="grafico-rolagem-ipca" height="100"></canvas>
            </div>
        </div>
    `;

    document.getElementById("btn-simular-rolagem").addEventListener("click", simularRolagem);
    document.getElementById("btn-resetar-rolagem").addEventListener("click", () => location.reload());

    window.rolagemChart = null;
});

function simularRolagem() {
    const curta = getDados("curta");
    const longa = getDados("longa");

    const curvaCurta = calcularCurva(curta);
    const curvaLonga = calcularCurva(longa);

    desenharGrafico(curvaCurta, curvaLonga, curta.prazo, longa.prazo);
}

function getDados(prefixo) {
    return {
        indexador: document.getElementById(`${prefixo}-indexador`).value,
        taxa: parseFloat(document.getElementById(`${prefixo}-taxa`).value),
        prazo: parseFloat(document.getElementById(`${prefixo}-prazo`).value),
        cdi: parseFloat(document.getElementById(`${prefixo}-cdi`).value),
        ipca: parseFloat(document.getElementById(`${prefixo}-ipca`).value)
    };
}

function calcularCurva({ indexador, taxa, prazo, ipca }) {
    const pontos = [];
    let acumulado = 1;

    for (let t = 0.5; t <= prazo; t += 0.5) {
        let rentabilidade = indexador === "ipca"
            ? (1 + ipca / 100) * (1 + taxa / 100)
            : (1 + taxa / 100);
        acumulado *= Math.pow(rentabilidade, 0.5);
        pontos.push({ prazo: t.toFixed(1), retorno: ((acumulado - 1) * 100).toFixed(2) });
    }

    return pontos;
}

function desenharGrafico(curta, longa, prazoCurta, prazoLonga) {
    const ctx = document.getElementById("grafico-rolagem-ipca").getContext("2d");
    const labels = [];

    const maxPrazo = Math.max(prazoCurta, prazoLonga);
    for (let t = 0.5; t <= maxPrazo; t += 0.5) {
        labels.push(t.toFixed(1) + "a");
    }

    const dadosCurta = labels.map(l => {
        const p = curta.find(p => p.prazo + "a" === l);
        return p ? parseFloat(p.retorno) : null;
    });

    const dadosLonga = labels.map(l => {
        const p = longa.find(p => p.prazo + "a" === l);
        return p ? parseFloat(p.retorno) : null;
    });

    if (window.rolagemChart) {
        window.rolagemChart.destroy();
    }

    window.rolagemChart = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Opção Curta",
                    data: dadosCurta,
                    borderColor: "#63b3ed",
                    backgroundColor: "transparent",
                    borderWidth: 2
                },
                {
                    label: "Opção Longa",
                    data: dadosLonga,
                    borderColor: "#f6ad55",
                    backgroundColor: "transparent",
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    ticks: {
                        color: "#e2e8f0",
                        callback: (val) => `${val.toFixed(0)}%`
                    }
                },
                x: {
                    ticks: {
                        color: "#e2e8f0"
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: "#e2e8f0"
                    }
                }
            }
        }
    });
}