document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM completamente carregado e parseado.');

    const simularBotao = document.getElementById('simular');
    if (simularBotao) {
        simularBotao.addEventListener('click', simular);
    } else {
        registrarErro("Erro: Botão 'simular' não encontrado no DOM.");
    }

    const anosPremissas = [2025, 2026, 2027, 2028];
    const defaultPremissas = {
        2025: { ipca: 5.00, cdi: 15.00 },
        2026: { ipca: 4.50, cdi: 12.00 },
        2027: { ipca: 4.00, cdi: 10.00 },
        2028: { ipca: 4.00, cdi: 9.00 },
    };

    const premissasGrid = document.querySelector('.premissas-grid');
    if (premissasGrid) {
        anosPremissas.forEach(ano => {
            const bloco = document.createElement('div');
            bloco.className = 'premissa-ano';
            bloco.innerHTML = `
                <h3>${ano}</h3>
                <div class="premissa-item">
                    <label for="ipca-${ano}">IPCA:</label>
                    <span id="ipca-val-${ano}">${defaultPremissas[ano].ipca.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</span>
                    <input type="range" min="0" max="20" step="0.1" value="${defaultPremissas[ano].ipca}" id="ipca-${ano}" />
                </div>
                <div class="premissa-item">
                    <label for="cdi-${ano}">CDI:</label>
                    <span id="cdi-val-${ano}">${defaultPremissas[ano].cdi.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</span>
                    <input type="range" min="0" max="20" step="0.1" value="${defaultPremissas[ano].cdi}" id="cdi-${ano}" />
                </div>
            `;
            premissasGrid.appendChild(bloco);

            document.getElementById(`ipca-${ano}`).addEventListener('input', (e) => {
                document.getElementById(`ipca-val-${ano}`).innerText = parseFloat(e.target.value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
            });
            document.getElementById(`cdi-${ano}`).addEventListener('input', (e) => {
                document.getElementById(`cdi-val-${ano}`).innerText = parseFloat(e.target.value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
            });
        });
    } else {
        registrarErro("Erro: Container de premissas (grid) não encontrado.");
    }

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
            const taxaCurtaElement = document.getElementById('taxaCurto');
            const prazoCurtaElement = document.getElementById('prazoCurta');
            const taxaLongoElement = document.getElementById('taxaLongo');
            const prazoLongoElement = document.getElementById('prazoLongo');

            if (!taxaCurtaElement || !prazoCurtaElement || !taxaLongoElement || !prazoLongoElement) {
                registrarErro("Erro: Um ou mais campos de entrada não foram encontrados.");
                return;
            }

            const taxaCurta = parseFloat(taxaCurtaElement.value.replace(',', '.'));
            const prazoCurta = parseFloat(prazoCurtaElement.value.replace(',', '.'));
            const taxaLongo = parseFloat(taxaLongoElement.value.replace(',', '.'));
            const prazoLongo = parseFloat(prazoLongoElement.value.replace(',', '.'));

            console.log('Valores lidos:', { taxaCurta, prazoCurta, taxaLongo, prazoLongo });

            if (
                isNaN(taxaCurta) || isNaN(prazoCurta) ||
                isNaN(taxaLongo) || isNaN(prazoLongo) ||
                taxaCurta <= 0 || prazoCurta <= 0 ||
                taxaLongo <= 0 || prazoLongo <= 0
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
                const taxaRealLonga = taxaLongo + ipca;

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
            mostrarResumo(acumCurtoFinal, acumLongo, acumCurtoAteVencimento, prazoCurta, prazoLongo, taxaCurta, taxaLongo);
        } catch (e) {
            registrarErro(e.message);
        }
    }

    function plotarGrafico(labels, serie1, serie2) {
        console.log('plotarGrafico chamado');
        if (window.graficoRentab) {
            window.graficoRentab.destroy();
            window.graficoRentab = null;
        }
        const graficoCanvas = document.getElementById('grafico');
        if (graficoCanvas) {
            graficoCanvas.width = graficoCanvas.offsetWidth;
            graficoCanvas.height = 150;
            const ctx = graficoCanvas.getContext('2d');
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
                    responsive: false,
                    maintainAspectRatio: false,
                    animation: false
                }
            });
            window.graficoRentab.resize();
        } else {
            registrarErro("Erro: Elemento canvas 'grafico' não encontrado.");
        }
    }

    function mostrarResumo(acumCurtoFinal, acumLongoFinal, acumCurtoAteVencimento, prazoCurta, prazoLongo, taxaCurta, taxaLongo) {
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

        const resumoDiv = document.getElementById('resumo');
        if (resumoDiv) {
            resumoDiv.innerHTML = `
                <div class="card"><h3>Retorno Anualizado Curto</h3><p>${(retornoAnualCurto * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</p></div>
                <div class="card"><h3>Retorno Anualizado Longo</h3><p>${(retornoAnualLongo * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</p></div>
                <div class="card"><h3>CDI Break-even</h3><p>${cdiBreakEven}</p></div>
            `;
        } else {
            registrarErro("Erro: Elemento 'resumo' não encontrado.");
        }

        const narrativaDiv = document.getElementById('narrativa');
        if (narrativaDiv) {
            narrativaDiv.innerHTML = `
                <p>Prezado cliente, esta simulação ilustra duas estratégias de investimento indexadas à inflação (IPCA+), considerando suas expectativas de mercado para os próximos anos.</p>

                <p><strong>Estratégia de Curto Prazo (Opção Azul):</strong> Inicialmente, alocamos em um título IPCA+ com uma taxa de retorno de <strong>${taxaCurta}% ao ano</strong> e prazo de <strong>${prazoCurta} anos</strong>. Ao vencimento, simulamos uma realocação para um investimento atrelado à taxa CDI.</p>

                <p><strong>Estratégia de Longo Prazo (Opção Rosa):</strong> Mantemos a alocação em um título IPCA+ com uma taxa de retorno de <strong>${taxaLongo}% ao ano</strong> durante todo o horizonte de <strong>${prazoLongo} anos</strong>.</p>

                <p><strong>Análise da Simulação:</strong></p>

                <ul>
                    <li><strong>Retorno Anualizado (Opção Curta):</strong> Visualizamos um retorno médio anual de <strong>${(retornoAnualCurto * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</strong> ao longo do período simulado. Este resultado incorpora a rentabilidade do IPCA+ inicial e a performance estimada do CDI na fase de reinvestimento.</li>
                    <li><strong>Retorno Anualizado (Opção Longa):</strong> A estratégia de longo prazo projeta um retorno médio anual de <strong>${(retornoAnualLongo * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</strong>, refletindo a taxa fixa de IPCA+ durante todo o período.</li>
                    <li><strong>Ponto de Equilíbrio do CDI:</strong> Para que a estratégia de curto prazo iguale o retorno da opção de longo prazo, o CDI médio no período de reinvestimento precisaria ser de aproximadamente <strong>${cdiBreakEven}</strong>. Este é um indicador importante para avaliar a atratividade relativa das duas abordagens.</li>
                </ul>

                <p><strong>Considerações Estratégicas:</strong> A escolha entre estas estratégias dependerá da sua visão sobre a trajetória futura das taxas de juros (CDI) após o período inicial do investimento de curto prazo. A opção de longo prazo oferece uma previsibilidade maior, enquanto a de curto prazo pode se beneficiar de um cenário de taxas de juros crescentes após o vencimento inicial.</p>
            `;
        } else {
            registrarErro("Erro: Elemento 'narrativa' não encontrado.");
        }
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
});