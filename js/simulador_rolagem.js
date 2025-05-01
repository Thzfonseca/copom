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

document.addEventListener("DOMContentLoaded", () => {
  preencherTabelaPremissas();
  document.getElementById("btn-simular-rolagem").addEventListener("click", simularRolagem);
  document.getElementById("btn-resetar-rolagem").addEventListener("click", () => location.reload());
});

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

  desenharGrafico(curvaCurta, curvaLonga, curta.prazo, longa.prazo);
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

function desenharGrafico(curta, longa, prazoCurta, prazoLonga) {
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
        { label: "Opção Curta", data: dadosCurta, borderColor: "#0077b6", borderWidth: 3, pointRadius: 0, fill: false },
        { label: "Opção Longa", data: dadosLonga, borderColor: "#f77f00", borderWidth: 3, pointRadius: 0, fill: false }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: "#333" } } },
      scales: {
        y: { ticks: { callback: v => v + "%", color: "#444" }, grid: { color: "#eee" } },
        x: { ticks: { color: "#444" }, grid: { color: "#eee" } }
      }
    }
  });
}

function desenharTabelaResumo(curvaCurta, curvaLonga, prazoCurta, prazoLonga) {
  const div = document.getElementById("resultado-final");
  if (!div) return;

  const retornoCurta = (curvaCurta.find(p => p.t === prazoLonga)?.retorno || 0) / prazoLonga;
  const retornoLonga = (curvaLonga.find(p => p.t === prazoLonga)?.retorno || 0) / prazoLonga;
  const entre = prazoLonga - prazoCurta;
  const ganhoAnualizado = (Math.pow((1 + retornoLonga / 100) / (1 + retornoCurta / 100), 1 / entre) - 1) * 100;
  const cdiBreakEven = (Math.pow((curvaLonga.find(p => p.t === prazoLonga)?.retorno || 0) / (curvaCurta.find(p => p.t === prazoLonga)?.retorno || 1), 1 / entre) - 1);
  const cdiBreakEvenAA = (Math.pow(1 + cdiBreakEven, 2) - 1) * 100;

  const ipca = window.premissasFinalArray.ipca.slice(0, prazoLonga * 2);
  const cdi = window.premissasFinalArray.cdi.slice(0, prazoLonga * 2);
  const ipcaMedia = ipca.reduce((a, b) => a + b, 0) / ipca.length;
  const cdiMedia = cdi.reduce((a, b) => a + b, 0) / cdi.length;

  const narrativa = `Entre um papel que vence antes e outro que atravessa o tempo, a diferença está no que acontece depois.<br>
  Caso os juros permaneçam numa trajetória decrescente, com CDI médio abaixo de ${cdiBreakEvenAA.toFixed(2)}% ao ano no período de reinvestimento, o papel mais longo tende a entregar um retorno superior — com mais estabilidade e menor exposição à incerteza da curva.<br>
  Não se trata de prever o futuro, mas de entender o preço do tempo hoje.`;

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
      <div style="margin-top: 12px;">
        <strong>Narração Comercial:</strong>
        <p id="narrativa-texto">${narrativa}</p>
        <button class="button" onclick="copiarNarrativa()">Copiar Texto</button>
      </div>
    </div>
  `;
}

function copiarNarrativa() {
  const texto = document.getElementById("narrativa-texto").innerText;
  navigator.clipboard.writeText(texto).then(() => alert("Narrativa copiada!"));
}
