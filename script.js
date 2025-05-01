document.getElementById('simular').addEventListener('click', simular);

function simular() {
  try {
    const taxaCurta = parseFloat(document.getElementById('taxaCurto').value);
    const prazoCurta = parseFloat(document.getElementById('prazoCurto').value);
    const taxaLonga = parseFloat(document.getElementById('taxaLongo').value);
    const prazoLonga = parseFloat(document.getElementById('prazoLongo').value);
    const premissas = getPremissas();

    const anos = [];
    const rentabilidadeCurta = [];
    const rentabilidadeLonga = [];
    const intervalos = Math.ceil(prazoLonga * 2);

    let acumCurtoAteVencimento = 1;
    let acumCurtoFinal = 1;
    let acumLongo = 1;

    for (let i = 0; i <= intervalos; i++) {
      const t = i * 0.5;
      const ano = 2025 + Math.floor(t);
      anos.push(t.toFixed(1));

      const ipca = premissas[ano]?.ipca ?? premissas[2028].ipca;
      const cdi = premissas[ano]?.cdi ?? premissas[2028].cdi;

      const taxaRealCurta = taxaCurta + (document.getElementById('indexadorCurto').value === 'ipca' ? ipca : 0);
      const taxaRealLonga = taxaLonga + (document.getElementById('indexadorLongo').value === 'ipca' ? ipca : 0);

      if (t <= prazoCurta) {
        acumCurtoAteVencimento *= 1 + taxaRealCurta / 100 / 2;
        acumCurtoFinal *= 1 + taxaRealCurta / 100 / 2;
      } else {
        acumCurtoFinal *= 1 + cdi / 100 / 2;
      }

      acumLongo *= 1 + taxaRealLonga / 100 / 2;

      rentabilidadeCurta.push((acumCurtoFinal - 1) * 100);
      rentabilidadeLonga.push((acumLongo - 1) * 100);
    }

    const acumLongoFinal = acumLongo;

    plotarGrafico(anos, rentabilidadeCurta, rentabilidadeLonga);
    mostrarResumo(acumCurtoAteVencimento, acumCurtoFinal, acumLongoFinal, prazoCurto, prazoLonga);
  } catch (e) {
    registrarErro(e.message);
  }
}

function getPremissas() {
  const linhas = document.querySelectorAll('#premissas tbody tr');
  const premissas = {};
  linhas.forEach(linha => {
    const ano = parseInt(linha.children[0].innerText);
    const ipca = parseFloat(linha.children[1].children[0].value);
    const cdi = parseFloat(linha.children[2].children[0].value);
    premissas[ano] = { ipca, cdi };
  });
  return premissas;
}

function plotarGrafico(labels, serie1, serie2) {
  if (window.graficoRentab) window.graficoRentab.destroy();
  const ctx = document.getElementById('grafico').getContext('2d');
  window.graficoRentab = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Opção Curta', data: serie1, fill: false, borderWidth: 2 },
        { label: 'Opção Longa', data: serie2, fill: false, borderWidth: 2 }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Rentabilidade Acumulada (%)' }
      }
    }
  });
}

function mostrarResumo(acumCurtoAteVencimento, acumCurtoFinal, acumLongoFinal, prazoCurto, prazoLongo) {
  let retornoAnualCurto = NaN;
  let retornoAnualLongo = NaN;

  try {
    retornoAnualCurto = Math.pow(acumCurtoAteVencimento, 1 / prazoCurto) - 1;
    retornoAnualLongo = Math.pow(acumLongoFinal, 1 / prazoLongo) - 1;
  } catch (e) {
    registrarErro("Erro ao calcular retornos anualizados: " + e.message);
  }

  let cdiBreakEven = '-';
  const tempoRestante = prazoLongo - prazoCurto;
  const n = tempoRestante * 2;

  if (n > 0 && acumCurtoAteVencimento > 0 && acumLongoFinal > 0) {
    try {
      const fator = acumLongoFinal / acumCurtoAteVencimento;
      const taxaSemestral = Math.pow(fator, 1 / n) - 1;
      const taxaAnual = Math.pow(1 + taxaSemestral, 2) - 1;
      cdiBreakEven = (taxaAnual * 100).toFixed(2) + '%';
    } catch (e) {
      registrarErro("Erro ao calcular CDI break-even: " + e.message);
    }
  }

  const resumo = `
    <p><strong>Retorno Anualizado Curto:</strong> ${isNaN(retornoAnualCurto) ? 'NaN%' : (retornoAnualCurto * 100).toFixed(2) + '%'}</p>
    <p><strong>Retorno Anualizado Longo:</strong> ${isNaN(retornoAnualLongo) ? 'NaN%' : (retornoAnualLongo * 100).toFixed(2) + '%'}</p>
    <p><strong>CDI Break-even:</strong> ${cdiBreakEven}</p>
  `;
  document.getElementById('resumo').innerHTML = resumo;
}

function registrarErro(msg) {
  console.error("[SIMULADOR-ERRO]", msg);
  window.__errosDebug = window.__errosDebug || [];
  window.__errosDebug.push(msg);
  const div = document.getElementById("relatorio-erros");
  if (div) {
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

function usarCurvaProjetada() {
  const linhas = document.querySelectorAll('#tabelaSelic tbody tr');
  const dados = [];

  linhas.forEach(linha => {
    const dataStr = linha.children[0].children[0].value;
    const selic = parseFloat(linha.children[1].children[0].value);
    const match = dataStr.match(/([A-Za-z]{3})\/(\\d{2})/);
    if (match) {
      const ano = parseInt("20" + match[2]);
      dados.push({ ano, selic });
    }
  });

  const porAno = {};
  dados.forEach(({ ano, selic }) => {
    porAno[ano] = porAno[ano] || [];
    porAno[ano].push(selic);
  });

  const tabelaPremissas = document.querySelectorAll('#premissas tbody tr');
  tabelaPremissas.forEach(linha => {
    const ano = parseInt(linha.children[0].innerText);
    if (porAno[ano]) {
      const mediaSelic = porAno[ano].reduce((a, b) => a + b, 0) / porAno[ano].length;
      const estimativaCDI = mediaSelic - 0.10;
      linha.children[2].children[0].value = estimativaCDI.toFixed(2);
    }
  });

  alert("Curva projetada aplicada com sucesso.");
}
