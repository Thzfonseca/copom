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
  new Date("2025-06-19"),
  new Date("2025-07-31"),
  new Date("2025-09-17"),
  new Date("2025-11-05"),
  new Date("2025-12-17")
];

function gerarDatasCopomProximosSemestres() {
  const hoje = new Date();
  const resultado = datasCopomOficiais.filter(d => d >= hoje);
  while (resultado.length < 6) {
    const ultima = resultado[resultado.length - 1] || hoje;
    const proxima = new Date(ultima);
    proxima.setDate(proxima.getDate() + 45);
    resultado.push(proxima);
  }
  return resultado.slice(0, 6);
}

function exibirTabelaCopom() {
  const container = document.getElementById("tabela-copom");
  if (!container) return;
  const datas = gerarDatasCopomProximosSemestres();

  container.innerHTML = `
    <h3>Cenário de Política Monetária (Selic após cada reunião)</h3>
    <p style="font-size: 0.9rem; color: #555;">Preencha a expectativa de Selic após cada reunião do Copom. Vamos transformar essas trajetórias em uma curva de juros anualizada e aplicar ao seu cenário de rolagem.</p>
    <table class="tabela-copom">
      <thead><tr><th>Data</th><th>Selic esperada (%)</th></tr></thead>
      <tbody>
        ${datas.map((d, i) => `
          <tr>
            <td>${d.toLocaleDateString('pt-BR')}</td>
            <td><input type="number" class="copom-selic" data-indice="${i}" value="${(10.5 - i * 0.25).toFixed(2)}" step="0.25"></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div style="margin-top: 10px;">
      <button class="button" onclick="usarCurvaCopom()">Usar curva projetada</button>
      <button class="button" onclick="resetarCurvaCopom()">Voltar para preenchimento manual</button>
    </div>
  `;
}

function usarCurvaCopom() {
  const inputs = Array.from(document.querySelectorAll('.copom-selic'));
  const selics = inputs.map(input => parseFloat(input.value));
  const datas = gerarDatasCopomProximosSemestres();

  const hoje = new Date();
  const cdiMensal = [];
  for (let i = 0; i < datas.length - 1; i++) {
    const inicio = datas[i];
    const fim = datas[i + 1];
    const meses = Math.round((fim - inicio) / (30 * 24 * 3600 * 1000));
    const media = (selics[i] + selics[i + 1]) / 2;
    for (let m = 0; m < meses; m++) {
      cdiMensal.push(media);
    }
  }

  const cdiAnual = [];
  for (let i = 0; i < cdiMensal.length; i += 12) {
    const ano = cdiMensal.slice(i, i + 12);
    const mediaAno = ano.reduce((a, b) => a + b, 0) / ano.length;
    cdiAnual.push(+mediaAno.toFixed(2));
  }

  const inputsCDI = document.querySelectorAll('.cdi-input');
  inputsCDI.forEach((el, i) => {
    el.value = cdiAnual[i] ?? cdiAnual[cdiAnual.length - 1];
  });
}

function resetarCurvaCopom() {
  preencherTabelaPremissas();
}

function preencherTabelaPremissas() {
  const anos = [2025, 2026, 2027, 2028];
  const ipcaFocus = [3.7, 3.6, 3.5, 3.5];
  const cdiFocus = [10.25, 9.5, 9.0, 8.75];
  const tbody = document.getElementById("tabela-premissas-body");
  if (!tbody) return;
  tbody.innerHTML = "";
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
