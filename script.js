document.getElementById('simular').addEventListener('click', simular);

const anosPremissas = [2025, 2026, 2027, 2028];
const defaultPremissas = {
    2025: { ipca: 5.00, cdi: 15.00 },
    2026: { ipca: 4.50, cdi: 12.00 },
    2027: { ipca: 4.00, cdi: 10.00 },
    2028: { ipca: 4.00, cdi: 9.00 },
};

window.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('sliders-premissas');
    anosPremissas.forEach(ano => {
        const bloco = document.createElement('div');
        bloco.className = 'slider-bloco';
        bloco.innerHTML = `
            <div class="slider-ano"><strong>${ano}</strong></div>
            <label for="ipca-${ano}">IPCA: <span id="ipca-val-${ano}">${defaultPremissas[ano].ipca.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</span>
                <input type="range" min="0" max="20" step="0.1" value="${defaultPremissas[ano].ipca}" id="ipca-${ano}" />
            </label>
            <label for="cdi-${ano}">CDI: <span id="cdi-val-${ano}">${defaultPremissas[ano].cdi.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</span>
                <input type="range" min="0" max="20" step="0.1" value="${defaultPremissas[ano].cdi}" id="cdi-${ano}" />
            </label>
        `;
        container.appendChild(bloco);

        document.getElementById(`ipca-${ano}`).addEventListener('input', (e) => {
            document.getElementById(`ipca-val-${ano}`).innerText = parseFloat(e.target.value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
        });
        document.getElementById(`cdi-${ano}`).addEventListener('input', (e) => {
            document.getElementById(`cdi-val-${ano}`).innerText = parseFloat(e.target.value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
        });
    });
});

function getPremissas() {
    const premissas = {};
    anosPremissas.forEach(ano => {
        const ipca = parseFloat(document.getElementById(`ipca-${ano}`).value);
        const cdi = parseFloat(document.getElementById(`cdi-${ano}`).value);
        premissas[ano] = { ipca, cdi };
    });
    return premissas;
}

function simular() {
    try {
        const taxaCurta = parseFloat(document.getElementById('taxaCurto').value.replace(',', '.'));
        const prazoCurta = parseFloat(document.getElementById('prazoCurto').value.replace(',', '.'));
        const taxaLonga = parseFloat(document.getElementById('taxaLongo').value.replace(',', '.'));
        const prazoLongo = parseFloat(document.getElementById('prazoLongo').value.replace(',', '.'));

        if (
            isNaN(taxaCurta) || isNaN(prazoCurta) ||
            isNaN(taxaLonga) || isNaN(prazoLongo) ||
            taxaCurta <= 0 || prazoCurta <= 0 ||
            taxaLonga <= 0 || prazoLongo <= 0
        ) {
            registrarErro("Preencha corretamente todas as taxas e prazos com valores positivos.");
            return;
        }

        const premissas = getPremissas();

        const anosGrafico = [];
        const rentabilidadeCurta = [];
        const rentabilidadeLonga = [];
        const intervalos = Math.ceil(prazoLongo * 2);

        let acumCurtoFinal = 1;
        let acumCurtoAteVencimento = 1;
        let acumLongo = 1;

        for (let i = 0; i <= intervalos; i++) {
            const t = i * 0.5;
            const ano = 2025 + Math.floor(t);
            anosGrafico.push(t.toFixed(1));

            const ipca = premissas[ano]?.ipca ?? premissas[anosPremissas[anosPremissas.length - 1]].ipca;
            const cdi = premissas[ano]?.cdi ?? premissas[anosPremissas[anosPremissas.length - 1]].cdi;

            const taxaRealCurta = taxaCurta + ipca;
            const taxaRealLonga = taxaLonga + ipca;

            if (t < prazoCurta) {
                acumCurtoAteVencimento *= 1 + taxaRealCurta / 100 / 2;
                acumCurtoFinal *= 1 + taxaRealCurta / 100 / 2;
            } else {
                acumCurtoFinal *= 1 + cdi / 100 / 2;
            }

            acumLongo *= 1 + taxaRealLonga / 100 / 2;

            rentabilidadeCurta.push((acumCurtoFinal - 1) * 100);
            rentabilidadeLonga.push((acumLongo - 1) * 100);
        }

        plotarGrafico(anosGrafico, rentabilidadeCurta, rentabilidadeLonga);
        mostrarResumo(acumCurtoFinal, acumLongo, acumCurtoAteVencimento, prazoCurta, prazoLongo);
    } catch (e) {
        registrarErro(e.message);
    }
}

function plotarGrafico(labels, serie1, serie2) {
    if (window.graficoRentab) window.graficoRentab.destroy();
    const ctx = document.getElementById('grafico').getContext('2d');
    window.graficoRentab = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Opção Curta',
                    data: serie1,
                    fill: true,
                    backgroundColor: 'rgba(33, 150, 243, 0.08)',
                    borderColor: '#2196f3',
                    tension: 0.3,
                    borderWidth: 2
                },
                {
                    label: 'Opção Longa',
                    data: serie2,
                    fill: true,
                    backgroundColor: 'rgba(233, 30, 99, 0.08)',
                    borderColor: '#e91e63',
                    tension: 0.3,
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { color: '#333', font: { size: 14 } }
                },
                tooltip: {
                    backgroundColor: '#ffffff',
                    titleColor: '#111',
                    bodyColor: '#333',
                    borderColor: '#ccc',
                    borderWidth: 1,
                    padding: 10,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
                            }
                            return label;
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Rentabilidade Acumulada (%)',
                    font: { size: 16 },
                    color: '#0a2540'
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                x: {
                    ticks: {
                        color: '#555'
                    }
                }
            }
        }
    });
}

function mostrarResumo(acumCurtoFinal, acumLongoFinal, acumCurtoAteVencimento, prazoCurta, prazoLongo) {
    let retornoAnualCurto = Math.pow(acumCurtoFinal, 1 / prazoLongo) - 1;
    let retornoAnualLongo = Math.pow(acumLongoFinal, 1 / prazoLongo) - 1;
    let cdiBreakEven = '-';

    const tempoRestante = prazoLongo - prazoCurta;
    const n = tempoRestante * 2;

    if (n > 0 && acumCurtoAteVencimento > 0 && acumLongoFinal > 0) {
        const fator = acumLongoFinal / acumCurtoAteVencimento;
        const taxaSemestral = Math.pow(fator, 1 / n) - 1;
        const taxaAnual = Math.pow(1 + taxaSemestral, 2) - 1;
        cdiBreakEven = (taxaAnual * 100).toFixed(2) + '%';
    }

    document.getElementById('resumo').innerHTML = `
        <div class="card"><h3>Retorno Anualizado Curto</h3><p>${(retornoAnualCurto * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</p></div>
        <div class="card"><h3>Retorno Anualizado Longo</h3><p>${(retornoAnualLongo * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</p></div>
        <div class="card"><h3>CDI Break-even</h3><p>${cdiBreakEven}</p></div>
    `;

    const narrativa = `
        <p><strong>Simulação:</strong> Esta comparação avalia dois caminhos de investimento indexado ao IPCA+: uma opção curta com vencimento em ${prazoCurta} anos e uma opção longa com vencimento em ${prazoLongo} anos.</p>
        <p>A Opção Curta oferece <strong>IPCA+${document.getElementById('taxaCurto').value}%</strong> e, ao final do prazo, assume reinvestimento em CDI. A Opção Longa entrega <strong>IPCA+${document.getElementById('taxaLongo').value}%</strong> por todo o período.</p>
        <p>Considerando suas premissas para inflação e juros, a rentabilidade anualizada até ${prazoLongo} anos foi de:</p>
        <ul>
            <li><strong>Opção Curta:</strong> ${(retornoAnualCurto * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}% ao ano</li>
            <li><strong>Opção Longa:</strong> ${(retornoAnualLongo * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}% ao ano</li>
            <li><strong>CDI Break-even:</strong> ${cdiBreakEven}</li>
        </ul>
    `;
    document.getElementById('narrativa').innerHTML = narrativa;
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