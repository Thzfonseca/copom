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
              <input type="number" id="longa-prazo" value="6.0" step="0.5" />
            </label>
          </div>
        </div>
      </div>

      <div class="box-premissas mt-3">
        <h3>Premissas (Selic / IPCA via Brasil_Trimestral)</h3>
        <input type="file" id="input-excel-itau" accept=".xlsx,.xls" />
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
  document.getElementById("input-excel-itau").addEventListener("change", handleTrimestralUpload);
});
function handleTrimestralUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets["Brasil_Trimestral"];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Obter referência tipo "Jun-25" com base na data atual
    const hoje = new Date();
    const trimestreBase = new Date(hoje.getFullYear(), hoje.getMonth() + 2); // dois meses à frente
    const mesRef = trimestreBase.toLocaleString("en-US", { month: "short" }); // ex: "Jun"
    const anoRef = String(trimestreBase.getFullYear()).slice(-2);            // ex: "25"
    const busca = `${mesRef}-${anoRef}`;                                     // ex: "Jun-25"

    let startIndex = json.findIndex(row =>
      typeof row[0] === "string" && row[0].includes(busca)
    );

    if (startIndex === -1) {
      alert(`Início dos trimestres (${busca}) não encontrado. Verifique a aba Brasil_Trimestral.`);
      return;
    }

    const taxas = [];
    for (let i = startIndex; i + 1 < json.length; i += 2) {
      const selic1 = parseFloat(json[i]?.[11]);
      const selic2 = parseFloat(json[i + 1]?.[11]);
      const ipca1 = parseFloat(json[i]?.[17]);
      const ipca2 = parseFloat(json[i + 1]?.[17]);

      if (!isNaN(selic1) && !isNaN(selic2) && !isNaN(ipca1) && !isNaN(ipca2)) {
        const selicMed = (selic1 + selic2) / 2;
        const ipcaMed = (ipca1 + ipca2) / 2;

        const selicSem = (Math.pow(1 + selicMed, 0.5) - 1) * 100;
        const ipcaSem = (Math.pow(1 + ipcaMed, 0.5) - 1) * 100;

        taxas.push({ cdi: selicSem, ipca: ipcaSem });
      }
    }

    window.premissasFinalArray = {
      cdi: taxas.map(t => t.cdi),
      ipca: taxas.map(t => t.ipca)
    };
  };

  reader.readAsArrayBuffer(file);
}
function calcularCurva({ indexador, taxa, prazo }, premissas, prazoFinal) {
  const pontos = [];
  let acumulado = 1;

  for (let t = 0.5; t <= prazoFinal; t += 0.5) {
    const semestre = Math.floor(t * 2) - 1;
    const ipca = (premissas.ipca[semestre] || 4) / 100;
    const cdi = (premissas.cdi[semestre] || 10) / 100;

    let rentabilidade;
    if (t <= prazo) {
      rentabilidade = indexador === "ipca"
        ? (1 + ipca) * (1 + taxa / 100)
        : (1 + taxa / 100);
    } else {
      rentabilidade = 1 + cdi;
    }

    acumulado *= rentabilidade;
    pontos.push({ prazo: t.toFixed(1), retorno: ((acumulado - 1) * 100).toFixed(2) });
  }

  return pontos;
}

function desenharGrafico(curvaCurta, curvaLonga, prazoFinal) {
  const ctx = document.getElementById("grafico-rolagem-ipca").getContext("2d");
  const labels = curvaCurta.map(p => `${p.prazo}a`);
  const dadosCurta = curvaCurta.map(p => parseFloat(p.retorno));
  const dadosLonga = curvaLonga.map(p => parseFloat(p.retorno));

  if (window.rolagemChart) window.rolagemChart.destroy();

  window.rolagemChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Curta + CDI",
          data: dadosCurta,
          borderColor: "#3182ce",
          borderWidth: 2,
          fill: false
        },
        {
          label: "Longa",
          data: dadosLonga,
          borderColor: "#dd6b20",
          borderWidth: 2,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: "#2d3748" } }
      },
      scales: {
        y: {
          ticks: { color: "#2d3748", callback: val => `${val}%` }
        },
        x: {
          ticks: { color: "#2d3748" }
        }
      }
    }
  });
}

function desenharGraficoAnualizado(curta, longa) {
  const ctx = document.getElementById("grafico-anualizado-ipca").getContext("2d");

  const labels = curta.map(p => p.prazo + "a");
  const dadosCurta = curta.map(p => {
    const t = parseFloat(p.prazo);
    const r = parseFloat(p.retorno) / 100;
    return ((Math.pow(1 + r, 1 / t) - 1) * 100).toFixed(2);
  });

  const dadosLonga = longa.map(p => {
    const t = parseFloat(p.prazo);
    const r = parseFloat(p.retorno) / 100;
    return ((Math.pow(1 + r, 1 / t) - 1) * 100).toFixed(2);
  });

  if (window.anualizadoChart) window.anualizadoChart.destroy();

  window.anualizadoChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Curta + CDI (Anualizada)",
          data: dadosCurta,
          borderColor: "#4299e1",
          borderWidth: 2,
          fill: false
        },
        {
          label: "Longa (Anualizada)",
          data: dadosLonga,
          borderColor: "#f6ad55",
          borderWidth: 2,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          ticks: { callback: val => `${val.toFixed(1)}%`, color: "#2d3748" }
        },
        x: {
          ticks: { color: "#2d3748" }
        }
      },
      plugins: {
        legend: { labels: { color: "#2d3748" } }
      }
    }
  });
}
function simularRolagem() {
  const curta = getDados("curta");
  const longa = getDados("longa");
  const prazoFinal = Math.max(curta.prazo, longa.prazo);
  const premissas = window.premissasFinalArray;

  const curvaCurta = calcularCurva(curta, premissas, prazoFinal);
  const curvaLonga = calcularCurva(longa, premissas, prazoFinal);

  desenharGrafico(curvaCurta, curvaLonga, prazoFinal);
  desenharGraficoAnualizado(curvaCurta, curvaLonga);

  const retornoCurtaFinal = parseFloat(curvaCurta[curta.prazo * 2 - 1].retorno);
  const retornoLongaFinal = parseFloat(curvaLonga[longa.prazo * 2 - 1].retorno);

  const t1 = curta.prazo;
  const t2 = longa.prazo;
  const rAnualCurta = ((Math.pow(1 + retornoCurtaFinal / 100, 1 / t1) - 1) * 100).toFixed(2);
  const rAnualLonga = ((Math.pow(1 + retornoLongaFinal / 100, 1 / t2) - 1) * 100).toFixed(2);

  const cdiCurta = media(premissas.cdi.slice(0, t1 * 2));
  const cdiLonga = media(premissas.cdi.slice(0, t2 * 2));
  const cdiEntre = media(premissas.cdi.slice(t1 * 2, t2 * 2));

  const ipcaCurta = media(premissas.ipca.slice(0, t1 * 2));
  const ipcaLonga = media(premissas.ipca.slice(0, t2 * 2));
  const ipcaEntre = media(premissas.ipca.slice(t1 * 2, t2 * 2));

  resultadoFinalBox.innerHTML = `
    <div class="box-premissas mt-3">
      <h3>Resumo Comparativo - Retorno Médio ao Ano</h3>
      <table class="tabela-premissas">
        <thead>
          <tr>
            <th>Período</th>
            <th>Curta (IPCA+)</th>
            <th>Longa (IPCA+)</th>
            <th>CDI</th>
            <th>IPCA</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Até venc. Curta</td>
            <td>${rAnualCurta}%</td>
            <td>-</td>
            <td>${cdiCurta.toFixed(2)}%</td>
            <td>${ipcaCurta.toFixed(2)}%</td>
          </tr>
          <tr>
            <td>Até venc. Longa</td>
            <td>${rAnualCurta}%</td>
            <td>${rAnualLonga}%</td>
            <td>${cdiLonga.toFixed(2)}%</td>
            <td>${ipcaLonga.toFixed(2)}%</td>
          </tr>
          <tr>
            <td>Entre Curta e Longa</td>
            <td>-</td>
            <td>-</td>
            <td>${cdiEntre.toFixed(2)}%</td>
            <td>${ipcaEntre.toFixed(2)}%</td>
          </tr>
        </tbody>
      </table>
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

function media(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

