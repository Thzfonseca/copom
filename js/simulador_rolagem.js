
function registrarErro(msg) {
  console.error("[COPOM-DEBUG]", msg);
  window.__errosDebug = window.__errosDebug || [];
  window.__errosDebug.push(msg);
  const div = document.getElementById("relatorio-erros");
  if (div) {
    div.style.display = "block";
    div.innerHTML += `<div>[!] ${msg}</div>`;
    div.scrollTop = div.scrollHeight;
  }
}

function copiarRelatorioErros() {
  const erros = window.__errosDebug || [];
  const texto = erros.length ? erros.map(e => `[!] ${e}`).join('\n') : 'Nenhum erro registrado.';
  navigator.clipboard.writeText(texto).then(() => {
    alert("Relatório copiado para a área de transferência.");
  });
}

function normalizarReferenciaTrimestre(valor) {
  if (!valor || typeof valor !== 'string') return null;
  const mapPT = { 'mar': 'Mar', 'jun': 'Jun', 'set': 'Sep', 'dez': 'Dec' };
  const meses = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let ref = valor.toString().trim();
  if (/\d{2}\/\d{4}/.test(ref)) {
    const [mes, ano] = ref.split('/');
    const idx = parseInt(mes, 10) - 1;
    return meses[idx] + '-' + ano.slice(2);
  }
  for (let [pt, en] of Object.entries(mapPT)) {
    ref = ref.replace(new RegExp(pt, 'i'), en);
  }
  const regex = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[- ]?(\d{2,4})/i;
  const match = ref.match(regex);
  if (!match) return null;
  const mes = match[1].charAt(0).toUpperCase() + match[1].slice(1,3).toLowerCase();
  let ano = match[2];
  if (ano.length === 4) ano = ano.slice(2);
  return `${mes}-${ano}`;
}



function registrarErro(msg) {
  console.error("[COPOM-DEBUG]", msg);
  window.__errosDebug = window.__errosDebug || [];
  window.__errosDebug.push(msg);

  const div = document.getElementById("relatorio-erros");
  if (div) {
    div.style.display = "block";
    div.innerHTML += `<div>[!] ${msg}</div>`;
    div.scrollTop = div.scrollHeight;
  }
}


function normalizarReferenciaTrimestre(valor) {
  if (!valor || typeof valor !== 'string') return null;

  const mapPT = { 'mar': 'Mar', 'jun': 'Jun', 'set': 'Sep', 'dez': 'Dec' };
  const meses = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  let ref = valor.toString().trim();

  // Tenta converter datas Excel para texto "Jun-25"
  if (/\d{2}\/\d{4}/.test(ref)) {
    const [mes, ano] = ref.split('/');
    const idx = parseInt(mes, 10) - 1;
    return meses[idx] + '-' + ano.slice(2);
  }

  // Normaliza português para inglês
  for (let [pt, en] of Object.entries(mapPT)) {
    ref = ref.replace(new RegExp(pt, 'i'), en);
  }

  // Extrai mês e ano
  const regex = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[- ]?(\d{2,4})/i;
  const match = ref.match(regex);
  if (!match) return null;

  const mes = match[1].charAt(0).toUpperCase() + match[1].slice(1,3).toLowerCase();
  let ano = match[2];
  if (ano.length === 4) ano = ano.slice(2);
  return `${mes}-${ano}`;
}



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

      <div class="box-premissas mt-3">
        <h3>Premissas por Ano (a partir de 2025)</h3>
        <input type="file" id="input-arquivo" accept=".xlsx" />
      </div>

      <div class="botoes-container">
        <button class="button button-simular" id="btn-simular-rolagem">Simular Rolagem</button>
        <button class="button button-resetar" id="btn-resetar-rolagem">Resetar</button>
      </div>

      <div class="chart-container">
        <canvas id="grafico-rolagem-ipca" height="100"></canvas>
      </div>
    </div>
  `;

  document.getElementById("btn-simular-rolagem").addEventListener("click", () => {
    registrarErro("Função de simulação será acoplada aqui com base nas premissas.");
  });

  document.getElementById("btn-resetar-rolagem").addEventListener("click", () => location.reload());

  document.getElementById("input-arquivo").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets["Brasil_Trimestral"];
    if (!sheet) return registrarErro("Aba 'Brasil_Trimestral' não encontrada.");

    const linhas = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const hoje = new Date();
    const mesAtual = hoje.getMonth(); // 0 a 11
    const anoAtual = hoje.getFullYear();
    const trimestres = ["Mar", "Jun", "Sep", "Dec"];
let mesAtual = hoje.getMonth(); // 0-11
const anoAtual = hoje.getFullYear();

const trimestreIndex = Math.floor((mesAtual + 3) / 3) % 4;
const anoRef = (trimestreIndex === 0 && mesAtual >= 9) ? anoAtual + 1 : anoAtual;
const refInicial = `${trimestres[trimestreIndex]}-${anoRef.toString().slice(2)}`;

    const idxInicio = linhas.findIndex(l => normalizarReferenciaTrimestre(l[0]) === refInicial);
    if (idxInicio === -1) return registrarErro(`Início dos trimestres (${refInicial}) não encontrado. Verifique a aba Brasil_Trimestral.`);

    const ipca = [], cdi = [];
    for (let i = idxInicio; i < linhas.length; i++) {
      const row = linhas[i];
      const ipcaAnual = parseFloat(row[17]);
      const selicAnual = parseFloat(row[11]);
      if (isNaN(ipcaAnual) || isNaN(selicAnual)) break;

      ipca.push(Math.pow(1 + ipcaAnual, 0.5) - 1);
      cdi.push(Math.pow(1 + selicAnual, 0.5) - 1);
    }

    window.premissasFinalArray = {
      ipca: ipca.map(x => +(x * 100).toFixed(2)),
      cdi: cdi.map(x => +(x * 100).toFixed(2))
    };

    console.log("Premissas carregadas:", window.premissasFinalArray);
  });
});

function copiarRelatorioErros() {
  const erros = window.__errosDebug || [];
  const texto = erros.length ? erros.map(e => `[!] ${e}`).join('\n') : 'Nenhum erro registrado.';
  navigator.clipboard.writeText(texto).then(() => {
    alert("Relatório copiado para a área de transferência.");
  });
}



function getDados(prefixo) {
  return {
    indexador: document.getElementById(`${prefixo}-indexador`).value,
    taxa: parseFloat(document.getElementById(`${prefixo}-taxa`).value),
    prazo: parseFloat(document.getElementById(`${prefixo}-prazo`).value)
  };
}

function simularRolagem() {
  if (!window.premissasFinalArray || !window.premissasFinalArray.ipca) {
    registrarErro("Premissas não carregadas. Importe o Excel antes de simular.");
    return;
  }

  const curta = getDados("curta");
  const longa = getDados("longa");

  const curvaCurta = calcularCurva(curta, "curta");
  const curvaLonga = calcularCurva(longa, "longa");

  desenharGrafico(curvaCurta, curvaLonga, curta.prazo, longa.prazo);
  desenharGraficoAnualizado(curvaCurta, curvaLonga);
  desenharTabelaResumo(curvaCurta, curvaLonga, curta.prazo, longa.prazo);
}

function calcularCurva({ indexador, taxa, prazo }, tipo) {
  const ipca = window.premissasFinalArray.ipca;
  const cdi = window.premissasFinalArray.cdi;

  const pontos = [];
  let acumulado = 1;

  for (let i = 0; i < prazo * 2; i++) {
    let rent;
    if (indexador === "ipca") {
      rent = (1 + (ipca[i] || ipca[ipca.length - 1]) / 100) * (1 + taxa / 100);
    } else {
      rent = 1 + taxa / 100;
    }

    if (tipo === "curta" && i >= prazo * 2) {
      rent = 1 + (cdi[i] || cdi[cdi.length - 1]) / 100;
    }

    acumulado *= Math.pow(rent, 0.5);
    pontos.push({ t: (i + 1) * 0.5, retorno: ((acumulado - 1) * 100) });
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
    const p = curta.find(p => p.t.toFixed(1) + "a" === l);
    return p ? p.retorno.toFixed(2) : null;
  });

  const dadosLonga = labels.map(l => {
    const p = longa.find(p => p.t.toFixed(1) + "a" === l);
    return p ? p.retorno.toFixed(2) : null;
  });

  if (window.rolagemChart) window.rolagemChart.destroy();

  window.rolagemChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "Opção Curta", data: dadosCurta, borderColor: "#0077b6", borderWidth: 2 },
        { label: "Opção Longa", data: dadosLonga, borderColor: "#f77f00", borderWidth: 2 }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: "#333" } }
      },
      scales: {
        y: { ticks: { callback: v => v + "%", color: "#444" } },
        x: { ticks: { color: "#444" } }
      }
    }
  });
}

function desenharGraficoAnualizado(curta, longa) {
  // Implementação opcional posterior: gráfico de retorno médio ao ano por período
}

function desenharTabelaResumo(curta, longa, prazoCurta, prazoLonga) {
  const div = document.getElementById("resultado-final");
  if (!div) return;

  const retornoCurta = (curta.find(p => p.t === prazoCurta)?.retorno || 0) / prazoCurta;
  const retornoLonga = (longa.find(p => p.t === prazoLonga)?.retorno || 0) / prazoLonga;

  const entre = prazoLonga - prazoCurta;
  const diff = ((longa.find(p => p.t === prazoLonga)?.retorno || 0) - (curta.find(p => p.t === prazoCurta)?.retorno || 0)) / entre;

  const ipca = window.premissasFinalArray.ipca.slice(0, prazoLonga * 2);
  const cdi = window.premissasFinalArray.cdi.slice(0, prazoLonga * 2);
  const ipcaMedia = ipca.reduce((a,b)=>a+b,0)/ipca.length;
  const cdiMedia = cdi.reduce((a,b)=>a+b,0)/cdi.length;

  div.innerHTML = `
    <div class="box-premissas">
      <h3>Resumo da Simulação (% ao ano)</h3>
      <table class="tabela-premissas">
        <tr><th></th><th>Curta</th><th>Longa</th><th>Entre</th></tr>
        <tr><td>Papel</td><td>${retornoCurta.toFixed(2)}%</td><td>${retornoLonga.toFixed(2)}%</td><td>${diff.toFixed(2)}%</td></tr>
        <tr><td>CDI</td><td colspan="3">${cdiMedia.toFixed(2)}%</td></tr>
        <tr><td>IPCA</td><td colspan="3">${ipcaMedia.toFixed(2)}%</td></tr>
      </table>
    </div>
  `;
}