// ✅ Simulador de Rolagem IPCA+ com reinvestimento em CDI e marcador visual + box de comparativo

let resultadoFinalBox;

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

      <div id="resultado-final"></div>
    </div>
  `;

  resultadoFinalBox = document.getElementById("resultado-final");

  document.getElementById("btn-simular-rolagem").addEventListener("click", simularRolagem);
  document.getElementById("btn-resetar-rolagem").addEventListener("click", () => location.reload());
});

function simularRolagem() {
  const curta = getDados("curta");
  const longa = getDados("longa");
  const prazoFinal = Math.max(curta.prazo, longa.prazo);

  const curvaCurta = calcularCurva(curta, prazoFinal);
  const curvaLonga = calcularCurva(longa, prazoFinal);

  desenharGrafico(curvaCurta, curvaLonga, curta.prazo, prazoFinal);

  const retornoCurtaFinal = curvaCurta[curvaCurta.length - 1].retorno;
  const retornoLongaFinal = curvaLonga[curvaLonga.length - 1].retorno;

  resultadoFinalBox.innerHTML = `
    <div class="box-premissas mt-3">
      <h3>Comparativo Final</h3>
      <p><strong>Opção Curta + CDI:</strong> ${retornoCurtaFinal}%</p>
      <p><strong>Opção Longa:</strong> ${retornoLongaFinal}%</p>
    </div>
  `;
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
    let rentabilidade = t <= prazo
      ? (indexador === "ipca"
          ? (1 + ipcaMedio / 100) * (1 + taxa / 100)
          : (1 + taxa / 100))
      : (1 + cdiMedio / 100);

    acumulado *= Math.pow(rentabilidade, 0.5);
    pontos.push({ prazo: t.toFixed(1), retorno: ((acumulado - 1) * 100).toFixed(2) });
  }

  return pontos;
}

function desenharGrafico(curvaCurta, curvaLonga, prazoCurta, prazoFinal) {
  const ctx = document.getElementById("grafico-rolagem-ipca").getContext("2d");
  const labels = [];

  for (let t = 0.5; t <= prazoFinal; t += 0.5) {
    labels.push(t.toFixed(1) + "a");
  }

  const dadosCurta = labels.map(l => curvaCurta.find(p => p.prazo + "a" === l)?.retorno || null);
  const dadosLonga = labels.map(l => curvaLonga.find(p => p.prazo + "a" === l)?.retorno || null);

  if (window.rolagemChart) window.rolagemChart.destroy();

  window.rolagemChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Opção Curta + Reinvestimento em CDI",
          data: dadosCurta,
          borderColor: "#63b3ed",
          borderWidth: 2,
          fill: false
        },
        {
          label: "Opção Longa",
          data: dadosLonga,
          borderColor: "#f6ad55",
          borderWidth: 2,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: "#333" }
        },
        annotation: {
          annotations: {
            linhaReinvestimento: {
              type: 'line',
              xMin: prazoCurta + "a",
              xMax: prazoCurta + "a",
              borderColor: '#0077b6',
              borderWidth: 2,
              borderDash: [6, 6],
              label: {
                content: 'Início reinvestimento CDI',
                enabled: true,
                position: 'top',
                backgroundColor: '#0077b6',
                color: 'white',
                font: {
                  style: 'italic', weight: 'bold', size: 11
                }
              }
            }
          }
        }
      },
      scales: {
        y: {
          ticks: {
            color: "#333",
            callback: val => `${val.toFixed(0)}%`
          }
        },
        x: {
          ticks: { color: "#333" }
        }
      }
    }
  });
}
