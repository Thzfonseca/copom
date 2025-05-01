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
  if (!tbody) return registrarErro("Elemento 'tabela-premissas-body' não encontrado.");

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

  const maxAno = Math.max(...ipcaInputs.map(i => +i.dataset.ano));
  const anos = ipcaInputs.map(i => +i.dataset.ano);

  return { ipca, cdi, maxAno, anos };
}

function simularRolagem() {
  const { ipca, cdi, maxAno, anos } = lerPremissasDigitadas();
  if (!ipca.length || !cdi.length) {
    registrarErro("Premissas não preenchidas.");
    return;
  }

  window.premissasFinalArray = { ipca, cdi, maxAno, anos };

  const curta = getDados("curta");
  const longa = getDados("longa");

  const curvaCurta = calcularCurva(curta, "curta");
  const curvaLonga = calcularCurva(longa, "longa");

  desenharGrafico(curvaCurta, curvaLonga, curta.prazo, longa.prazo);
  desenharTabelaResumo(curvaCurta, curvaLonga, curta.prazo, longa.prazo, curta, longa);
}

function calcularCurva({ indexador, taxa, prazo }, tipo) {
  const { ipca, cdi } = window.premissasFinalArray;
  const pontos = [];
  let acumulado = 1;

  for (let i = 0; i < prazo * 2; i++) {
    let rent;
    const ipcaAno = ipca[i] ?? ipca[ipca.length - 1];
    const cdiAno = cdi[i] ?? cdi[cdi.length - 1];

    if (indexador === "ipca") {
      rent = (1 + ipcaAno / 100) * (1 + taxa / 100);
    } else {
      rent = 1 + taxa / 100;
    }

    if (tipo === "curta" && i >= prazo * 2) {
      rent = 1 + cdiAno / 100;
    }

    acumulado *= Math.pow(rent, 0.5);
    pontos.push({ t: (i + 1) * 0.5, retorno: ((acumulado - 1) * 100) });
  }

  return pontos;
}

function calcularBreakEvenComposto(curta, longa, curvaCurta, curvaLonga) {
  const prazoCurta = curta.prazo;
  const prazoLonga = longa.prazo;

  const valorCurto = Math.pow(1 + curvaCurta.find(p => p.t === prazoCurta).retorno / 100, 1);
  const valorLongo = Math.pow(1 + curvaLonga.find(p => p.t === prazoLonga).retorno / 100, 1);

  let reinvestimentoCDI = 0;
  let erro = 1;
  const target = valorLongo / valorCurto;

  let min = 0.01, max = 0.3;
  while (erro > 0.00001) {
    reinvestimentoCDI = (min + max) / 2;
    const composto = Math.pow(1 + reinvestimentoCDI, prazoLonga - prazoCurta);
    erro = Math.abs(composto - target);
    if (composto > target) max = reinvestimentoCDI;
    else min = reinvestimentoCDI;
  }

  return reinvestimentoCDI * 100;
}

function gerarNarrativa(curta, longa, diff, breakEven) {
  return `A troca do papel ${curta.indexador.toUpperCase()} de ${curta.prazo} anos a ${curta.taxa.toFixed(2)}% para um ${longa.indexador.toUpperCase()} de ${longa.prazo} anos a ${longa.taxa.toFixed(2)}% pode render um ganho anualizado de ${diff.toFixed(2)} p.p., segundo as premissas atuais. Para que o trade se justifique, o CDI médio no reinvestimento deve ficar abaixo de ${breakEven.toFixed(2)}% a.a.`;
}

function desenharGrafico(curta, longa, prazoCurta, prazoLonga) {
  const ctx = document.getElementById("grafico-rolagem-ipca").getContext("2d");
  const labels = [];
  const maxPrazo = Math.max(prazoCurta, prazoLonga);
  for (let t = 0.5; t <= maxPrazo; t += 0.5) labels.push(t.toFixed(1) + "a");

  const dadosCurta = labels.map(l => curta.find(p => p.t.toFixed(1) + "a" === l)?.retorno.toFixed(2) || null);
  const dadosLonga = labels.map(l => longa.find(p => p.t.toFixed(1) + "a" === l)?.retorno.toFixed(2) || null);

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

function desenharTabelaResumo(curvaCurta, curvaLonga, prazoCurta, prazoLonga, curta, longa) {
  const div = document.getElementById("resultado-final");
  if (!div) return;

  const retornoCurta = (curvaCurta.find(p => p.t === prazoCurta)?.retorno || 0) / prazoCurta;
  const retornoLonga = (curvaLonga.find(p => p.t === prazoLonga)?.retorno || 0) / prazoLonga;
  const entre = prazoLonga - prazoCurta;
  const diff = ((curvaLonga.find(p => p.t === prazoLonga)?.retorno || 0) - (curvaCurta.find(p => p.t === prazoCurta)?.retorno || 0)) / entre;

  const breakEven = calcularBreakEvenComposto(curta, longa, curvaCurta, curvaLonga);

  const ipca = window.premissasFinalArray.ipca.slice(0, prazoLonga * 2);
  const cdi = window.premissasFinalArray.cdi.slice(0, prazoLonga * 2);
  const ipcaMedia = ipca.reduce((a, b) => a + b, 0) / ipca.length;
  const cdiMedia = cdi.reduce((a, b) => a + b, 0) / cdi.length;

  const texto = gerarNarrativa(curta, longa, diff, breakEven);

  div.innerHTML = `
    <div class="box-premissas">
      <h3>Resumo da Simulação (% ao ano)</h3>
      <table class="tabela-premissas">
        <tr><th></th><th>Curta</th><th>Longa</th><th>Entre</th></tr>
        <tr><td>Papel</td><td>${retornoCurta.toFixed(2)}%</td><td>${retornoLonga.toFixed(2)}%</td><td>${diff.toFixed(2)}%</td></tr>
        <tr><td>CDI</td><td colspan="3">${cdiMedia.toFixed(2)}%</td></tr>
        <tr><td>IPCA</td><td colspan="3">${ipcaMedia.toFixed(2)}%</td></tr>
        <tr><td>CDI Break-even</td><td colspan="3">${breakEven.toFixed(2)}%</td></tr>
      </table>
      <div style="margin-top: 12px;">
        <strong>Narração:</strong>
        <p id="narrativa-texto">${texto}</p>
        <button class="button" onclick="copiarNarrativa()">Copiar Texto</button>
      </div>
    </div>
  `;
}

function copiarNarrativa() {
  const texto = document.getElementById("narrativa-texto").innerText;
  navigator.clipboard.writeText(texto).then(() => alert("Narração copiada!"));
}
