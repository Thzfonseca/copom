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

      <div class="botoes-container">
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

  const prazoFinal = Math.max(curta.prazo, longa.prazo);

  const curvaCurta = calcularCurva(curta, prazoFinal);
  const curvaLonga = calcularCurva(longa, prazoFinal);

  desenharGrafico(curvaCurta, curvaLonga, curta.prazo, longa.prazo);
}

function getDados(prefixo) {
  return {
    indexador: document.getElementById(`${prefixo}-indexador`).value,
    taxa: parseFloat(document.getElementById(`${prefixo}-taxa`).value),
    prazo: parseFloat(document.getElementById(`${prefixo}-prazo`).value),
    cdiMedio: parseFloat(document.getElementById(`${prefixo}-cdi`).value),
    ipcaMedio: parseFloat(document.getElementById(`${prefixo}-ipca`).value)
  };
}

function calcularCurva({ indexador, taxa, prazo, ipcaMedio, cdiMedio }, prazoFinal) {
  const pontos = [];
  let acumulado = 1;

  for (let t = 0.5; t <= prazoFinal; t += 0.5) {
    let rentabilidade;

    if (t <= prazo) {
      rentabilidade = indexador === "ipca"
        ? (1 + ipcaMedio / 100) * (1 + taxa / 100)
        : (1 + taxa / 100);
    } else {
      // Reinvestimento em CDI
      rentabilidade = 1 + cdiMedio / 100;
    }

    acumulado *= Math.pow(rentabilidade, 0.5);
    pontos.push({ prazo: t.toFixed(1), retorno: ((acumulado - 1) * 100).toFixed(2) });
  }

  return pontos;
}

function desenharGrafico(curvaCurta, curvaLonga, prazoCurta, prazoLonga) {
  const ctx = document.getElementById("grafico-rolagem-ipca").getContext("2d");
  const labels = [];

  const prazoFinal = Math.max(prazoCurta, prazoLonga);

  for (let t = 0.5; t <= prazoFinal; t += 0.5) {
    labels.push(t.toFixed(1) + "a");
  }

  const dadosCurta = labels.map(l => {
    const p = curvaCurta.find(p => p.prazo + "a" === l);
    return p ? parseFloat(p.retorno) : null;
  });

  const dadosLonga = labels.map(l => {
    const p = curvaLonga.find(p => p.prazo + "a" === l);
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
          label: "Opção Curta + Reinvestimento em CDI",
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
      plugins: {
        legend: {
          labels: {
            color: "#333"
          }
        },
        annotation: {
          annotations: prazoCurta < prazoLonga ? {
            reinvestimento: {
              type: 'box',
              xMin: prazoCurta + "a",
              xMax: prazoLonga + "a",
              backgroundColor: 'rgba(0, 119, 182, 0.1)',
              borderWidth: 0,
              label: {
                enabled: true,
                content: 'Reinvestimento em CDI',
                color: '#0077b6',
                position: 'start',
                font: {
                  style: 'italic',
                  weight: 'bold'
                }
              }
            }
          } : {}
        }
      },
      scales: {
        y: {
          ticks: {
            color: "#333",
            callback: (val) => `${val.toFixed(0)}%`
          }
        },
        x: {
          ticks: {
            color: "#333"
          }
        }
      }
    }
  });
}
