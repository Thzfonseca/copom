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
  navigator.clipboard.writeText(texto).then(() => {
    alert("Relatório copiado para a área de transferência.");
  });
}

const datasCopomOficiais = [
  new Date("2025-05-07"),
  new Date("2025-06-18"),
  new Date("2025-07-30"),
  new Date("2025-09-17"),
  new Date("2025-11-05"),
  new Date("2025-12-10")
];

function obterProximasReunioesCopom(hoje = new Date()) {
  const futuras = datasCopomOficiais.filter(d => d > hoje);
  while (futuras.length < 3) {
    const ultima = futuras[futuras.length - 1] || datasCopomOficiais[datasCopomOficiais.length - 1];
    const proxima = new Date(ultima);
    proxima.setDate(proxima.getDate() + 45);
    futuras.push(proxima);
  }
  return futuras.slice(0, 3);
}

document.addEventListener("DOMContentLoaded", () => {
  preencherTabelaPremissas();
  document.getElementById("btn-simular-rolagem").addEventListener("click", simularRolagem);
  document.getElementById("btn-resetar-rolagem").addEventListener("click", () => location.reload());
  exibirProximasReunioesCopom();
});

function exibirProximasReunioesCopom() {
  const container = document.getElementById("proximas-reunioes-copom");
  if (!container) return;
  const proximas = obterProximasReunioesCopom();
  container.innerHTML = `<h4>Próximas Reuniões do Copom</h4><ul>` +
    proximas.map(d => `<li>${d.toLocaleDateString('pt-BR')}</li>`).join('') +
    `</ul>`;
}

function preencherTabelaPremissas() {
  const anos = [2025, 2026, 2027, 2028];
  const ipcaFocus = [3.7, 3.6, 3.5, 3.5];
  const cdiFocus = [10.25, 9.5, 9.0, 8.75];
  const tbody = document.getElementById("tabela-premissas-body");
  anos.forEach((ano, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${ano}</td>
      <td><input type="number" class="ipca-input" data-ano="${ano}" value="${ipcaFocus[i]}" step="0.01"></td>
      <td><input type="number" class="cdi-input" data-ano="${ano}" value="${cdiFocus[i]}" step="0.01"></td>
    `;
    tbody.appendChild(row);
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
  const ipcaInputs = Array.from(document.querySelectorAll(".ipca-input"));
  const cdiInputs = Array.from(document.querySelectorAll(".cdi-input"));
  const ipca = ipcaInputs.map(input => parseFloat(input.value));
  const cdi = cdiInputs.map(input => parseFloat(input.value));
  return { ipca, cdi };
}

function simularRolagem() {
  const { ipca, cdi } = lerPremissasDigitadas();
  if (!ipca.length || !cdi.length) return registrarErro("Premissas não preenchidas.");
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
  const duracaoTotal = Math.round(prazoFinal * 2);

  for (let i = 0; i < duracaoTotal; i++) {
    const ipcaAno = ipca[i] ?? ipca[ipca.length - 1];
    const cdiAno = cdi[i] ?? cdi[cdi.length - 1];
    let rent;

    if (tipo === "curta" && i >= prazo * 2) {
      rent = 1 + cdiAno / 100;
    } else {
      rent = indexador === "ipca"
        ? (1 + ipcaAno / 100) * (1 + taxa / 100)
        : 1 + taxa / 100;
    }

    acumulado *= Math.pow(rent, 0.5);
    pontos.push({ t: (i + 1) * 0.5, retorno: ((acumulado - 1) * 100) });
  }

  return pontos;
}

function desenharGrafico(curta, longa, prazoLonga) {
  const ctx = document.getElementById("grafico-rolagem-ipca").getContext("2d");
  const labels = [];
  for (let t = 0.5; t <= prazoLonga; t += 0.5) labels.push(t.toFixed(1) + "a");

  const dadosCurta = labels.map(l => curta.find(p => p.t.toFixed(1) + "a" === l)?.retorno?.toFixed(2) ?? null);
  const dadosLonga = labels.map(l => longa.find(p => p.t.toFixed(1) + "a" === l)?.retorno?.toFixed(2) ?? null);

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
      plugins: { legend: { labels: { color: "#333" } } },
      scales: {
        y: { ticks: { callback: v => v + "%", color: "#444" } },
        x: { ticks: { color: "#444" } }
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
      <p><strong>Narração:</strong></p>
      <p>A troca do papel IPCA de ${prazoCurta} anos a ${(getDados("curta").taxa).toFixed(2)}% para um IPCA de ${prazoLonga} anos a ${(getDados("longa").taxa).toFixed(2)}% pode render um ganho anualizado de ${ganhoAnualizado.toFixed(2)} p.p., segundo as premissas atuais. <br>Para que o trade se justifique, o CDI médio no reinvestimento deve ficar abaixo de ${cdiBreakEvenAA.toFixed(2)}% a.a.</p>
      <button onclick="copiarResumo()">Copiar Texto</button>
    </div>
  `;
}

function copiarResumo() {
  const texto = document.querySelector("#resultado-final p:nth-of-type(2)").innerText;
  navigator.clipboard.writeText(texto).then(() => alert("Narrativa copiada."));
}
