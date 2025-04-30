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
        <table class="tabela-premissas">
          <thead>
            <tr>
              <th>Ano</th>
              <th>CDI (% a.a.)</th>
              <th>IPCA (% a.a.)</th>
            </tr>
          </thead>
          <tbody id="tabela-premissas-body"></tbody>
        </table>

        <div class="mt-3">
          <label><strong>Importar projeções do Itaú (Excel):</strong></label><br/>
          <input type="file" id="input-excel-itau" accept=".xlsx,.xls" />
        </div>
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

  const prazoInicial = parseFloat(document.getElementById("longa-prazo").value);
  gerarTabelaPremissas(prazoInicial);

  document.getElementById("longa-prazo").addEventListener("change", () => {
    const prazo = parseFloat(document.getElementById("longa-prazo").value);
    gerarTabelaPremissas(prazo);
  });

  document.getElementById("input-excel-itau").addEventListener("change", handleExcelUpload);

  window.rolagemChart = null;
  window.anualizadoChart = null;
});

function simularRolagem() {
  const curta = getDados("curta");
  const longa = getDados("longa");
  const prazoFinal = Math.max(curta.prazo, longa.prazo);

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

function gerarTabelaPremissas(prazoFinal) {
  const tbody = document.getElementById("tabela-premissas-body");
  tbody.innerHTML = "";

  for (let ano = 1; ano <= prazoFinal; ano++) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${ano}</td>
      <td><input type="number" id="cdi-ano-${ano}" value="10.00" step="0.01" /></td>
      <td><input type="number" id="ipca-ano-${ano}" value="4.00" step="0.01" /></td>
    `;
    tbody.appendChild(row);
  }
}

function getPremissasPorAno(prazoFinal) {
  const cdi = [], ipca = [];
  for (let ano = 1; ano <= prazoFinal; ano++) {
    cdi.push(parseFloat(document.getElementById(`cdi-ano-${ano}`)?.value || "10"));
    ipca.push(parseFloat(document.getElementById(`ipca-ano-${ano}`)?.value || "4"));
  }
  return { cdi, ipca };
}

function handleExcelUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const linhaIpca = json.find(row => row[2] && row[2].toString().toUpperCase().includes("IPCA"));
    const linhaCdi  = json.find(row => row[2] && row[2].toString().toUpperCase().includes("CDI"));
    const anos = json[1]; // Cabeçalhos horizontais

    const premissas = {};
    for (let col = 3; col < anos.length; col++) {
      const ano = parseInt(anos[col]);
      if (ano && ano >= 2024) {
        const ipca = parseFloat(linhaIpca[col]) * 100;
        const cdi  = parseFloat(linhaCdi[col]) * 100;
        if (!isNaN(ipca) && !isNaN(cdi)) {
          premissas[ano] = { ipca, cdi };
        }
      }
    }

    const prazoLongo = parseFloat(document.getElementById("longa-prazo").value);
    const anoAtual = new Date().getFullYear();
    const ultimoAno = anoAtual + Math.ceil(prazoLongo);

    const fallback = premissas[2028];
    for (let ano = 2029; ano <= ultimoAno; ano++) {
      if (!premissas[ano]) {
        premissas[ano] = { ...fallback };
      }
    }

    preencherTabelaComPremissas(premissas);
  };

  reader.readAsArrayBuffer(file);
}

function preencherTabelaComPremissas(premissas) {
  const tbody = document.getElementById("tabela-premissas-body");
  tbody.innerHTML = "";

  const anos = Object.keys(premissas).map(a => parseInt(a)).sort((a, b) => a - b);
  anos.forEach(ano => {
    const { cdi, ipca } = premissas[ano];
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${ano}</td>
      <td><input type="number" id="cdi-ano-${ano}" value="${cdi.toFixed(2)}" step="0.01" /></td>
      <td><input type="number" id="ipca-ano-${ano}" value="${ipca.toFixed(2)}" step="0.01" /></td>
    `;
    tbody.appendChild(row);
  });
}

function calcularCurva({ indexador, taxa, prazo }, premissas, prazoFinal) {
  const pontos = [];
  let acumulado = 1;

  for (let t = 0.5; t <= prazoFinal; t += 0.5) {
    const ano = Math.ceil(t);
    const ipca = premissas.ipca[ano - 1] / 100 || 0.04;
    const cdi  = premissas.cdi[ano - 1] / 100 || 0.10;

    let rentabilidade;
    if (t <= prazo) {
      rentabilidade = indexador === "ipca" ? (1 + ipca) * (1 + taxa / 100) : (1 + taxa / 100);
    } else {
      rentabilidade = 1 + cdi;
    }

    acumulado *= Math.pow(rentabilidade, 0.5);
    pontos.push({ prazo: t.toFixed(1), retorno: ((acumulado - 1) * 100).toFixed(2) });
  }

  return pontos;
}
