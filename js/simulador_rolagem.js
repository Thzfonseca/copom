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

document.addEventListener("DOMContentLoaded", () => {
  preencherTabelaPremissas();
  document.getElementById("btn-simular-rolagem").addEventListener("click", simularRolagem);
  document.getElementById("btn-resetar-rolagem").addEventListener("click", () => location.reload());
  exibirTabelaCopom();
});
function preencherTabelaPremissas() {
  const anos = [2025, 2026, 2027, 2028];
  const ipcaFocus = [3.7, 3.6, 3.5, 3.5];
  const cdiFocus = [10.25, 9.5, 9.0, 8.75];

  const tbody = document.getElementById("tabela-premissas-body");
  if (!tbody) {
    registrarErro("Elemento 'tabela-premissas-body' não encontrado.");
    return;
  }

  tbody.innerHTML = ""; // limpa antes de preencher
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

