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

    let acumuladoCurto = 1;
    let acumuladoLongo = 1;

    for (let i = 0; i <= intervalos; i++) {
      const t = i * 0.5;
      const ano = 2025 + Math.floor(t);
      anos.push(t.toFixed(1));

      const ipca = premissas[ano]?.ipca ?? premissas[2028].ipca;
      const cdi = premissas[ano]?.cdi ?? premissas[2028].cdi;

      if (t <= prazoCurta) {
        acumuladoCurto *= 1 + (taxaCurta + (document.getElementById('indexadorCurto').value === 'ipca' ? ipca : 0)) / 100 / 2;
      } else {
        acumuladoCurto *= 1 + cdi / 100 / 2;
      }

      acumuladoLongo *= 1 + (taxaLonga + (document.getElementById('indexadorLongo').value === 'ipca' ? ipca : 0)) / 100 / 2;

      rentabilidadeCurta.push((acumuladoCurto - 1) * 100);
      rentabilidadeLonga.push((acumuladoLongo - 1) * 100);
    }

    plotarGrafico(anos, rentabilidadeCurta, rentabilidadeLonga);
    mostrarResumo(acumuladoCurto, acumuladoLongo, prazoLonga);
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
      plugins: { legend: { position: 'top' }, title: { display: true, text: 'Rentabilidade Acumulada (%)' } }
    }
  });
}

function mostrarResumo(acumCurta, acumLonga, prazo) {
  const retornoCurto = Math.pow(acumCurta, 1 / prazo) - 1;
  const retornoLongo = Math.pow(acumLonga, 1 / prazo) - 1;
  const breakeven = ((retornoLongo - retornoCurto) * 100).toFixed(2);
  const resumo = `
    <p><strong>Retorno Anualizado Curto:</strong> ${(retornoCurto * 100).toFixed(2)}%</p>
    <p><strong>Retorno Anualizado Longo:</strong> ${(retornoLongo * 100).toFixed(2)}%</p>
    <p><strong>CDI Break-even:</strong> ${breakeven}%</p>
  `;
  document.getElementById('resumo').innerHTML = resumo;
}

// Coletor de erros
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
