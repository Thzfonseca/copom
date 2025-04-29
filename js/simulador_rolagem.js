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
        </div>
      </div>

      <div class="box-premissas mt-3" id="premissas-dinamicas">
        <h3>Premissas por Ano (até prazo da opção longa)</h3>
        <div id="anos-premissas" class="grid grid-2"></div>
      </div>

      <div class="botoes-container">
        <button class="button button-simular" id="btn-simular-rolagem">Simular Rolagem</button>
        <button class="button button-resetar" id="btn-resetar-rolagem">Resetar</button>
      </div>

      <div class="chart-container mt-5">
        <canvas id="grafico-rolagem-ipca" height="100"></canvas>
      </div>

      <div class="chart-container mt-5">
        <canvas id="grafico-anualizado-ipca" height="100"></canvas>
      </div>

      <div id="resultado-final"></div>
    </div>
  `;

  resultadoFinalBox = document.getElementById("resultado-final");

  document.getElementById("btn-simular-rolagem").addEventListener("click", simularRolagem);
  document.getElementById("btn-resetar-rolagem").addEventListener("click", () => location.reload());

  window.rolagemChart = null;
  window.anualizadoChart = null;
});

function simularRolagem() {
  const curta = getDados("curta");
  const longa = getDados("longa");
  const prazoFinal = Math.max(curta.prazo, longa.prazo);

  gerarPremissasPorAno(prazoFinal);
  const premissas = getPremissasPorAno(prazoFinal);

  const curvaCurta = calcularCurva(curta, premissas, prazoFinal);
  const curvaLonga = calcularCurva(longa, premissas, prazoFinal);

  desenharGrafico(curvaCurta, curvaLonga, prazoFinal);
  desenharGraficoAnualizado(curvaCurta, curvaLonga);

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
    prazo: parseFloat(document.getElementById(`${prefixo}-prazo`).value)
  };
}

function gerarPremissasPorAno(prazoFinal) {
  const container = document.getElementById("anos-premissas");
  container.innerHTML = "";

  for (let ano = 1; ano <= prazoFinal; ano++) {
    const box = document.createElement("div");
    box.classList.add("box-opcao");
    box.innerHTML = `
      <strong>Ano ${ano}</strong>
      <label>CDI (% a.a.):
        <input type="number" id="cdi-ano-${ano}" value="10.00" step="0.01" />
      </label>
      <label>IPCA (% a.a.):
        <input type="number" id="ipca-ano-${ano}" value="4.00" step="0.01" />
      </label>
    `;
    container.appendChild(box);
  }
}

function getPremissasPorAno(prazoFinal) {
  const cdi = [], ipca = [];
  for (let ano = 1; ano <= prazoFinal; ano++) {
    cdi.push(parseFloat(document.getElementById(`cdi-ano-${ano}`).value));
    ipca.push(parseFloat(document.getElementById(`ipca-ano-${ano}`).value));
  }
  return { cdi, ipca };
}

function calcularCurva({ indexador, taxa, prazo }, premissas, prazoFinal) {
  const pontos = [];
  let acumulado = 1;

  for (let ano = 1; ano <= prazoFinal; ano++) {
    const ipca = premissas.ipca[ano - 1] / 100;
    const cdi = premissas.cdi[ano - 1] / 100;

    let rendimentoAnual;

    if (ano <= prazo) {
      rendimentoAnual =
        indexador === "ipca"
          ? (1 + ipca) * (1 + taxa / 100)
          : (1 + taxa / 100);
    } else {
      rendimentoAnual = 1 + cdi;
    }

    acumulado *= rendimentoAnual;
    pontos.push({
      prazo: ano.toFixed(1),
      retorno: ((acumulado - 1) * 100).toFixed(2)
    });
  }

  return pontos;
}

function desenharGrafico(curvaCurta, curvaLonga, prazoFinal) {
  const ctx = document.getElementById("grafico-rolagem-ipca").getContext("2d");
  const labels = curvaCurta.map(p => p.prazo + "a");

  const dadosCurta = curvaCurta.map(p => parseFloat(p.retorno));
  const dadosLonga = curvaLonga.map(p => parseFloat(p.retorno));

  if (window.rolagemChart) window.rolagemChart.destroy();

  window.rolagemChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Opção Curta + CDI (Acumulado)",
          data: dadosCurta,
          borderColor: "#63b3ed",
          borderWidth: 2,
          fill: false
        },
        {
          label: "Opção Longa (Acumulado)",
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
        legend: { labels: { color: "#333" } }
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

function desenharGraficoAnualizado(curvaCurta, curvaLonga) {
  const ctx = document.getElementById("grafico-anualizado-ipca").getContext("2d");

  const labels = curvaCurta.map(p => p.prazo + "a");

  const dadosCurta = curvaCurta.map((p, i) => {
    const t = parseFloat(p.prazo);
    const r = parseFloat(p.retorno) / 100;
    return t > 0 ? (Math.pow(1 + r, 1 / t) - 1) * 100 : null;
  });

  const dadosLonga = curvaLonga.map((p, i) => {
    const t = parseFloat(p.prazo);
    const r = parseFloat(p.retorno) / 100;
    return t > 0 ? (Math.pow(1 + r, 1 / t) - 1) * 100 : null;
  });

  if (window.anualizadoChart) window.anualizadoChart.destroy();

  window.anualizadoChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Curta + CDI (Anualizado)",
          data: dadosCurta,
          borderColor: "#3a86ff",
          borderWidth: 2,
          fill: false
        },
        {
          label: "Longa (Anualizado)",
          data: dadosLonga,
          borderColor: "#ff006e",
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
        }
      },
      scales: {
        y: {
          ticks: {
            color: "#333",
            callback: val => `${val.toFixed(2)}%`
          },
          title: {
            display: true,
            text: "Rentabilidade Anualizada (%)"
          }
        },
        x: {
          ticks: { color: "#333" }
        }
      }
    }
  });
}
