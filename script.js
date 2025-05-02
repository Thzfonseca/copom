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
    console.log('Simulando...');
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

        console.log('Dados do gráfico:', anosGrafico, rentabilidadeCurta, rentabilidadeLonga);
        plotarGrafico(anosGrafico, rentabilidadeCurta, rentabilidadeLonga);
        mostrarResumo(acumCurtoFinal, acumLongo, acumCurtoAteVencimento, prazoCurta, prazoLongo, taxaCurta, taxaLonga);
    } catch (e) {
        registrarErro(e.message);
    }
}

function plotarGrafico(labels, serie1, serie2) {
    console.log('plotarGrafico chamado');
    if (window.graficoRentab) {
        console.log('Gráfico existente, destruindo...');
        window.graficoRentab.destroy();
        window.graficoRentab = null; // Adicionando para garantir que a referência seja limpa
    }
    const ctx = document.getElementById('grafico').getContext('2d');
    console.log('Contexto do canvas:', ctx);
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
            maintainAspectRatio: false,
            // Removi todas as outras opções para teste
        }
    });
    console.log('Gráfico instanciado:', window.graficoRentab);
}

function mostrarResumo(acumCurtoFinal, acumLongoFinal, acumCurtoAteVencimento, prazoCurta, prazoLongo, taxaCurta, taxaLongo) {
    // ... (seu código da função mostrarResumo)
}

function registrarErro(msg) {
    // ... (seu código da função registrarErro)
}