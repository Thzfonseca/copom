// js/simulador_rolagem.js

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
  navigator.clipboard.writeText(texto).then(() => alert("Relatório copiado."));
}

function preencherTabelaPremissas() {
  const anos = [2025, 2026, 2027, 2028];
  const ipca = [3.7, 3.6, 3.5, 3.4];
  const cdi = [10.25, 9.5, 9.0, 8.75];
  const tbody = document.getElementById("tabela-premissas-body");
  tbody.innerHTML = "";
  anos.forEach((ano, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${ano}</td>
      <td><input type="number" class="ipca-input" value="${ipca[i]}" step="0.01"></td>
      <td><input type="number" class="cdi-input" value="${cdi[i]}" step="0.01"></td>
    `;
    tbody.appendChild(row);
  });
}

function preencherTabelaCopom() {
  const tabela = document.getElementById("tabela-copom");
  if (!tabela) return;
  const hoje = new Date();
  const datas = [];
  let data = new Date(hoje);
  while (datas.length < 6) {
    if (data.getDay() === 3) datas.push(new Date(data));
    data.setDate(data.getDate() + 14);
  }
  tabela.innerHTML = `
    <h3>Cenário de Política Monetária (Selic após cada reunião)</h3>
    <table class="tabela-copom">
      <thead><tr><th>Data</th><th>Selic esperada (%)</th></tr></thead>
      <tbody>
        ${datas.map((d, i) => `
          <tr>
            <td>${d.toLocaleDateString('pt-BR')}</td>
            <td><input type="number" class="copom-selic" data-indice="${i}" value="${10.5 - i * 0.25}" step="0.25"></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <button class="button" onclick="usarCurvaCopom()">Usar curva projetada</button>
  `;
}

function usarCurvaCopom() {
  const inputs = Array.from(document.querySelectorAll('.copom-selic'));
  const selics = inputs.map(input => parseFloat(input.value));
  const datas = inputs.map((_, i) => new Date(Date.now() + i * 30 * 24 * 3600 * 1000));
  const cdiMensal = [];
  for (let i = 0; i < datas.length - 1; i++) {
    const media = (selics[i] + selics[i + 1]) / 2;
    for (let m = 0; m < 2; m++) cdiMensal.push(media); // bimestral
  }
  const cdiAnual = [];
  for (let i = 0; i < cdiMensal.length; i += 2) {
    const ano = cdiMensal.slice(i, i + 2);
    const mediaAno = ano.reduce((a, b) => a + b, 0) / ano.length;
    cdiAnual.push(+mediaAno.toFixed(2));
  }
  document.querySelectorAll(".cdi-input").forEach((el, i) => {
    el.value = cdiAnual[i] ?? cdiAnual[cdiAnual.length - 1];
  });
}

function getDados(prefixo) {
  return {
    indexador: document.getElementById(`${prefixo}-indexador`).value,
    taxa: parseFloat(document.getElementById(`${prefixo}-taxa`).value),
    prazo: parseFloat(document.getElementById(`${prefixo}-prazo`).value)
  };
}

function lerPremissasDigitadas() {
  const ipca = Array.from(document.querySelectorAll(".ipca-input")).map(i => parseFloat(i.value));
  const cdi = Array.from(document.querySelectorAll(".cdi-input")).map(i => parseFloat(i.value));
  return { ipca, cdi };
}

function simularRolagem() {
  const { ipca, cdi } = lerPremissasDigitadas();
  window.premissasFinalArray = { ipca, cdi };
  const curta = getDados("curta");
  const longa = getDados("longa");
  const curvaCurta = calcularCurva(curta, "curta", longa.prazo);
  const curvaLonga = calcularCurva(longa, "longa", longa.prazo);
  desenharGrafico(curvaCurta, curvaLonga, longa.prazo);
  desenharTabelaResumo(curvaCurta, curvaLonga, curta.prazo, longa.prazo);
}

function calcularCurva({ indexador, taxa, prazo }, tipo, prazoFinal) {
  const { ipca, cdi } = window.premissasFinalArray;
  const pontos = [];
  let acumulado = 1;
  const n = Math.round(prazoFinal * 2);
  for (let i = 0; i < n; i++) {
    const ipcaAno = ipca[i] ?? ipca[ipca.length - 1];
    const cdiAno = cdi[i] ?? cdi[cdi.length - 1];
    let rent = tipo === "curta" && i >= prazo * 2
      ? 1 + cdiAno / 100
      : indexador === "ipca"
      ? (1 + ipcaAno / 100) * (1 + taxa / 100)
      : 1 + taxa / 100;
    acumulado *= Math.pow(rent, 0.5);
    pontos.push({ t: (i + 1) * 0.5, retorno: (acumulado - 1) * 100 });
  }
  return pontos;
}

function desenharGrafico(curvaCurta, curvaLonga, prazoMax) {
  const ctx = document.getElementById("grafico-rolagem-ipca").getContext("2d");
  const labels = [];
  for (let t = 0.5; t <= prazoMax; t += 0.5) labels.push(`${t.toFixed(1)}a`);
  const dadosCurta = labels.map(l => curvaCurta.find(p => `${p.t.toFixed(1)}a` === l)?.retorno.toFixed(2) || null);
  const dadosLonga = labels.map(l => curvaLonga.find(p => `${p.t.toFixed(1)}a` === l)?.retorno.toFixed(2) || null);
  if (window.rolagemChart) window.rolagemChart.destroy();
  window.rolagemChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Opção Curta",
          data: dadosCurta,
          borderColor: "#0077b6",
          backgroundColor: "rgba(0, 119, 182, 0.1)",
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.3,
          fill: true,
          borderWidth: 2
        },
        {
          label: "Opção Longa",
          data: dadosLonga,
          borderColor: "#f77f00",
          backgroundColor: "rgba(247, 127, 0, 0.1)",
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.3,
          fill: true,
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: "#333", font: { size: 14, family: 'Arial' } }
        },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.dataset.label}: ${ctx.raw}% acumulado`
          }
        }
      },
      scales: {
        y: {
          ticks: { callback: v => v + "%", color: "#444" },
          title: { display: true, text: "% Acumulado", color: "#666", font: { size: 13 } }
        },
        x: {
          ticks: { color: "#444" },
          title: { display: true, text: "Prazo", color: "#666", font: { size: 13 } }
        }
      }
    }
  });
}

function desenharTabelaResumo(curta, longa, prazoCurta, prazoLonga) {
  const div = document.getElementById("resultado-final");
  if (!div) return;
  const retornoCurta = (curta.find(p => p.t === prazoLonga)?.retorno || 0) / prazoLonga;
  const retornoLonga = (longa.find(p => p.t === prazoLonga)?.retorno || 0) / prazoLonga;
  const entre = prazoLonga - prazoCurta;
  const ganhoTotal = (longa.find(p => p.t === prazoLonga)?.retorno || 0) / 100 / (curta.find(p => p.t === prazoLonga)?.retorno || 1) * 100;
  const ganhoAnualizado = (Math.pow((1 + ganhoTotal / 100), 1 / entre) - 1) * 100;
  const cdiBreakEven = (Math.pow((longa.find(p => p.t === prazoLonga)?.retorno || 0) / (curta.find(p => p.t === prazoLonga)?.retorno || 1), 1 / entre) - 1);
  const cdiBreakEvenAA = (Math.pow(1 + cdiBreakEven, 2) - 1) * 100;
  const ipca = window.premissasFinalArray.ipca.slice(0, prazoLonga * 2);
  const cdi = window.premissasFinalArray.cdi.slice(0, prazoLonga * 2);
  const ipcaMedia = ipca.reduce((a, b) => a + b, 0) / ipca.length;
  const cdiMedia = cdi.reduce((a, b) => a + b, 0) / cdi.length;
  div.innerHTML = `
    <div class="box-premissas">
      <h3>Resumo da Simulação (% ao ano)</h3>
      <table class="tabela-premissas">
        <tr><th></th><th>Curta</th><th>Longa</th><th>Entre</th></tr>
        <tr><td>Papel</td><td>${retornoCurta.toFixed(2)}%</td><td>${retornoLonga.toFixed(2)}%</td><td>${ganhoAnualizado.toFixed(2)}%</td></tr>
        <tr><td>CDI</td><td colspan="3">${cdiMedia.toFixed(2)}%</td></tr>
        <tr><td>IPCA</td><td colspan="3">${ipcaMedia.toFixed(2)}%</td></tr>
        <tr><td>CDI Break-even</td><td colspan="3">${cdiBreakEvenAA.toFixed(2)}%</td></tr>
      </table>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  preencherTabelaPremissas();
  preencherTabelaCopom();
  document.getElementById("btn-simular-rolagem").addEventListener("click", simularRolagem);
  document.getElementById("btn-resetar-rolagem").addEventListener("click", () => location.reload());
});
