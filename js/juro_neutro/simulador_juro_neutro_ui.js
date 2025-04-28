/**
 * Interface para o simulador de juro real neutro
 * 
 * Este módulo implementa a interface de usuário para o simulador de juro real neutro,
 * permitindo ajustar variáveis e visualizar o impacto nas estimativas dos diferentes modelos.
 */

// Namespace para a interface do simulador de juro real neutro
const simuladorJuroNeutroUI = (function() {
    
    // Dependências
    if (typeof juroNeutro === 'undefined' || typeof simuladorJuroNeutro === 'undefined') {
        console.error("Erro: Módulos 'juroNeutro' ou 'simuladorJuroNeutro' não encontrados.");
        return {}; // Retorna objeto vazio para evitar mais erros
    }
    
    // Função para criar a interface do simulador
    function criarInterfaceSimulador(container) {
        console.log("Criando interface do simulador de juro real neutro...");
        
        // Criar o contêiner principal do simulador
        const simuladorContainer = document.createElement('div');
        simuladorContainer.className = 'simulador-juro-neutro-container';
        
        // Título e descrição
        const titulo = document.createElement('h3');
        titulo.textContent = 'Simulador de Juro Real Neutro';
        simuladorContainer.appendChild(titulo);
        
        const descricao = document.createElement('p');
        descricao.textContent = 'Ajuste as variáveis abaixo para simular o impacto nos diferentes modelos de juro real neutro.';
        simuladorContainer.appendChild(descricao);
        
        const dataAtualizacao = document.createElement('p');
        dataAtualizacao.className = 'data-atualizacao';
        dataAtualizacao.textContent = `Data de referência: ${new Date().toLocaleDateString('pt-BR')}`;
        simuladorContainer.appendChild(dataAtualizacao);
        
        // Criar a seção de controles
        const controlesContainer = document.createElement('div');
        controlesContainer.className = 'controles-container';
        
        // Obter as variáveis de entrada atuais
        const inputVars = simuladorJuroNeutro.getInputVars();
        
        // Definir os controles para cada variável
        const controles = [
            {
                id: 'expectativaInflacaoLP',
                label: 'Expectativa de Inflação LP (%)',
                min: 2.0,
                max: 8.0,
                step: 0.1,
                value: inputVars.expectativaInflacaoLP
            },
            {
                id: 'hiatoProduto',
                label: 'Hiato do Produto (% do PIB)',
                min: -5.0,
                max: 5.0,
                step: 0.1,
                value: inputVars.hiatoProduto
            },
            {
                id: 'riscoPaisEMBI',
                label: 'Risco-País EMBI (pontos-base)',
                min: 100,
                max: 500,
                step: 10,
                value: inputVars.riscoPaisEMBI
            },
            {
                id: 'riscoPaisCDS',
                label: 'Risco-País CDS (pontos-base)',
                min: 50,
                max: 400,
                step: 10,
                value: inputVars.riscoPaisCDS
            },
            {
                id: 'taxaJurosExternaUS',
                label: 'Taxa de Juros Real EUA (%)',
                min: 0.0,
                max: 5.0,
                step: 0.1,
                value: inputVars.taxaJurosExternaUS
            },
            {
                id: 'premioRiscoCambial',
                label: 'Prêmio de Risco Cambial (%)',
                min: 0.0,
                max: 5.0,
                step: 0.1,
                value: inputVars.premioRiscoCambial
            },
            {
                id: 'crescimentoPotencialPIB',
                label: 'Crescimento Potencial do PIB (%)',
                min: 0.0,
                max: 5.0,
                step: 0.1,
                value: inputVars.crescimentoPotencialPIB
            }
        ];
        
        // Criar os controles deslizantes
        controles.forEach(controle => {
            const controleItem = document.createElement('div');
            controleItem.className = 'controle-item';
            
            const controleLabel = document.createElement('label');
            controleLabel.htmlFor = controle.id;
            controleLabel.textContent = controle.label;
            controleItem.appendChild(controleLabel);
            
            const controleValor = document.createElement('span');
            controleValor.className = 'controle-valor';
            controleValor.textContent = controle.value;
            controleItem.appendChild(controleValor);
            
            const controleSlider = document.createElement('input');
            controleSlider.type = 'range';
            controleSlider.id = controle.id;
            controleSlider.min = controle.min;
            controleSlider.max = controle.max;
            controleSlider.step = controle.step;
            controleSlider.value = controle.value;
            
            controleSlider.addEventListener('input', function() {
                controleValor.textContent = this.value;
            });
            
            controleItem.appendChild(controleSlider);
            controlesContainer.appendChild(controleItem);
        });
        
        // Botão para executar a simulação
        const botaoSimular = document.createElement('button');
        botaoSimular.className = 'botao-simular';
        botaoSimular.textContent = 'Executar Simulação';
        botaoSimular.addEventListener('click', function() {
            // Coletar os valores atuais dos controles
            const novasVars = {};
            controles.forEach(controle => {
                const elemento = document.getElementById(controle.id);
                novasVars[controle.id] = parseFloat(elemento.value);
            });
            
            // Atualizar as variáveis de entrada e executar a simulação
            simuladorJuroNeutro.setInputVars(novasVars);
            const resultados = simuladorJuroNeutro.executarSimulacao();
            
            // Atualizar a visualização dos resultados
            atualizarResultadosSimulacao(resultados);
        });
        
        controlesContainer.appendChild(botaoSimular);
        simuladorContainer.appendChild(controlesContainer);
        
        // Criar a seção de cenários pré-definidos
        const cenariosContainer = document.createElement('div');
        cenariosContainer.className = 'cenarios-container';
        
        const cenariosTitulo = document.createElement('h4');
        cenariosTitulo.textContent = 'Cenários Pré-definidos';
        cenariosContainer.appendChild(cenariosTitulo);
        
        // Definir cenários pré-definidos
        const cenarios = [
            {
                nome: 'Base',
                descricao: 'Cenário atual',
                vars: {
                    expectativaInflacaoLP: 4.0,
                    hiatoProduto: 0.0,
                    riscoPaisEMBI: 200,
                    riscoPaisCDS: 150,
                    taxaJurosExternaUS: 2.5,
                    premioRiscoCambial: 1.5,
                    crescimentoPotencialPIB: 2.0
                }
            },
            {
                nome: 'Alta Inflação',
                descricao: 'Expectativas de inflação elevadas',
                vars: {
                    expectativaInflacaoLP: 6.0,
                    hiatoProduto: 1.0,
                    riscoPaisEMBI: 250,
                    riscoPaisCDS: 200,
                    taxaJurosExternaUS: 2.5,
                    premioRiscoCambial: 2.0,
                    crescimentoPotencialPIB: 1.5
                }
            },
            {
                nome: 'Baixa Inflação',
                descricao: 'Expectativas de inflação reduzidas',
                vars: {
                    expectativaInflacaoLP: 3.0,
                    hiatoProduto: -1.0,
                    riscoPaisEMBI: 180,
                    riscoPaisCDS: 130,
                    taxaJurosExternaUS: 2.5,
                    premioRiscoCambial: 1.2,
                    crescimentoPotencialPIB: 2.2
                }
            },
            {
                nome: 'Alto Risco',
                descricao: 'Aumento do risco-país',
                vars: {
                    expectativaInflacaoLP: 4.5,
                    hiatoProduto: 0.0,
                    riscoPaisEMBI: 350,
                    riscoPaisCDS: 300,
                    taxaJurosExternaUS: 2.5,
                    premioRiscoCambial: 2.5,
                    crescimentoPotencialPIB: 1.8
                }
            },
            {
                nome: 'Baixo Risco',
                descricao: 'Redução do risco-país',
                vars: {
                    expectativaInflacaoLP: 3.8,
                    hiatoProduto: 0.0,
                    riscoPaisEMBI: 150,
                    riscoPaisCDS: 100,
                    taxaJurosExternaUS: 2.5,
                    premioRiscoCambial: 1.0,
                    crescimentoPotencialPIB: 2.2
                }
            }
        ];
        
        // Criar botões para os cenários
        const cenariosGrid = document.createElement('div');
        cenariosGrid.className = 'cenarios-grid';
        
        cenarios.forEach(cenario => {
            const cenarioItem = document.createElement('div');
            cenarioItem.className = 'cenario-item';
            
            const cenarioNome = document.createElement('div');
            cenarioNome.className = 'cenario-nome';
            cenarioNome.textContent = cenario.nome;
            cenarioItem.appendChild(cenarioNome);
            
            const cenarioDescricao = document.createElement('div');
            cenarioDescricao.className = 'cenario-descricao';
            cenarioDescricao.textContent = cenario.descricao;
            cenarioItem.appendChild(cenarioDescricao);
            
            cenarioItem.addEventListener('click', function() {
                // Atualizar os controles com os valores do cenário
                controles.forEach(controle => {
                    const elemento = document.getElementById(controle.id);
                    if (elemento) {
                        elemento.value = cenario.vars[controle.id];
                        // Atualizar o texto do valor exibido
                        const valorElemento = elemento.parentNode.querySelector('.controle-valor');
                        if (valorElemento) {
                            valorElemento.textContent = cenario.vars[controle.id];
                        }
                    }
                });
                
                // Atualizar as variáveis de entrada e executar a simulação
                simuladorJuroNeutro.setInputVars(cenario.vars);
                const resultados = simuladorJuroNeutro.executarSimulacao();
                
                // Atualizar a visualização dos resultados
                atualizarResultadosSimulacao(resultados);
            });
            
            cenariosGrid.appendChild(cenarioItem);
        });
        
        cenariosContainer.appendChild(cenariosGrid);
        simuladorContainer.appendChild(cenariosContainer);
        
        // Criar a seção de resultados
        const resultadosContainer = document.createElement('div');
        resultadosContainer.className = 'resultados-container';
        resultadosContainer.id = 'resultados-simulacao';
        
        const resultadosTitulo = document.createElement('h4');
        resultadosTitulo.textContent = 'Resultados da Simulação';
        resultadosContainer.appendChild(resultadosTitulo);
        
        simuladorContainer.appendChild(resultadosContainer);
        
        // Adicionar o contêiner do simulador ao contêiner principal
        container.appendChild(simuladorContainer);
        
        // Executar a simulação inicial
        const resultadosIniciais = simuladorJuroNeutro.executarSimulacao();
        atualizarResultadosSimulacao(resultadosIniciais);
        
        console.log("Interface do simulador de juro real neutro criada com sucesso");
    }
    
    // Função para atualizar a visualização dos resultados da simulação
    function atualizarResultadosSimulacao(resultados) {
        console.log("Atualizando visualização dos resultados da simulação:", resultados);
        
        const container = document.getElementById('resultados-simulacao');
        if (!container) {
            console.error("Contêiner de resultados não encontrado");
            return;
        }
        
        // Limpar o contêiner, mantendo apenas o título
        const titulo = container.querySelector('h4');
        container.innerHTML = '';
        container.appendChild(titulo);
        
        // Criar o contêiner para a mediana geral
        const medianaContainer = document.createElement('div');
        medianaContainer.className = 'mediana-simulada-container';
        
        const medianaValor = document.createElement('div');
        medianaValor.className = 'mediana-simulada-valor';
        medianaValor.textContent = `${resultados.mediana.toFixed(2)}%`;
        medianaContainer.appendChild(medianaValor);
        
        const medianaLabel = document.createElement('div');
        medianaLabel.className = 'mediana-simulada-label';
        medianaLabel.textContent = 'Mediana Simulada';
        medianaContainer.appendChild(medianaLabel);
        
        container.appendChild(medianaContainer);
        
        // Criar a tabela de resultados por modelo
        const tabelaContainer = document.createElement('div');
        tabelaContainer.className = 'tabela-resultados-container';
        
        const tabela = document.createElement('table');
        tabela.className = 'tabela-resultados';
        
        // Cabeçalho da tabela
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const thModelo = document.createElement('th');
        thModelo.textContent = 'Modelo';
        headerRow.appendChild(thModelo);
        
        const thBase = document.createElement('th');
        thBase.textContent = 'Valor Base (%)';
        headerRow.appendChild(thBase);
        
        const thSimulado = document.createElement('th');
        thSimulado.textContent = 'Valor Simulado (%)';
        headerRow.appendChild(thSimulado);
        
        const thVariacao = document.createElement('th');
        thVariacao.textContent = 'Variação (p.p.)';
        headerRow.appendChild(thVariacao);
        
        thead.appendChild(headerRow);
        tabela.appendChild(thead);
        
        // Corpo da tabela
        const tbody = document.createElement('tbody');
        
        // Obter os dados base dos modelos
        const modelos = juroNeutro.getTodosModelos();
        
        // Mapear os IDs dos modelos para os nomes de exibição
        const modelosMap = {
            'focusExAnte': 'Focus Ex-Ante',
            'hiatoProduto': 'Hiato do Produto',
            'ntnbPremio': 'NTN-B Prêmio',
            'laubachWilliams': 'Laubach-Williams',
            'samba': 'SAMBA',
            'paridadeDescoberta': 'Paridade Descoberta',
            'modelosBC': 'Modelos BC',
            'qpc': 'QPC'
        };
        
        // Adicionar uma linha para cada modelo
        Object.entries(resultados.modelos).forEach(([modeloId, valorSimulado]) => {
            const row = document.createElement('tr');
            
            // Encontrar o modelo base correspondente
            const modeloBase = modelos.find(m => m.name === modelosMap[modeloId]);
            const valorBase = modeloBase ? modeloBase.currentEstimates.median : 0;
            
            const tdModelo = document.createElement('td');
            tdModelo.textContent = modelosMap[modeloId] || modeloId;
            row.appendChild(tdModelo);
            
            const tdBase = document.createElement('td');
            tdBase.textContent = valorBase.toFixed(2);
            row.appendChild(tdBase);
            
            const tdSimulado = document.createElement('td');
            tdSimulado.textContent = valorSimulado.toFixed(2);
            row.appendChild(tdSimulado);
            
            const tdVariacao = document.createElement('td');
            const variacao = valorSimulado - valorBase;
            tdVariacao.textContent = variacao.toFixed(2);
            tdVariacao.className = variacao > 0 ? 'variacao-positiva' : (variacao < 0 ? 'variacao-negativa' : '');
            row.appendChild(tdVariacao);
            
            tbody.appendChild(row);
        });
        
        tabela.appendChild(tbody);
        tabelaContainer.appendChild(tabela);
        container.appendChild(tabelaContainer);
        
        // Criar o contêiner para o gráfico de comparação
        const graficoContainer = document.createElement('div');
        graficoContainer.className = 'grafico-resultados-container';
        container.appendChild(graficoContainer);
        
        // Criar o gráfico de comparação
        criarGraficoComparacao(graficoContainer, resultados);
    }
    
    // Função para criar o gráfico de comparação entre valores base e simulados
    function criarGraficoComparacao(container, resultados) {
        // Obter os dados base dos modelos
        const modelos = juroNeutro.getTodosModelos();
        
        // Mapear os IDs dos modelos para os nomes de exibição
        const modelosMap = {
            'focusExAnte': 'Focus Ex-Ante',
            'hiatoProduto': 'Hiato do Produto',
            'ntnbPremio': 'NTN-B Prêmio',
            'laubachWilliams': 'Laubach-Williams',
            'samba': 'SAMBA',
            'paridadeDescoberta': 'Paridade Descoberta',
            'modelosBC': 'Modelos BC',
            'qpc': 'QPC'
        };
        
        // Preparar os dados para o gráfico
        const labels = [];
        const valoresBase = [];
        const valoresSimulados = [];
        
        Object.entries(resultados.modelos).forEach(([modeloId, valorSimulado]) => {
            labels.push(modelosMap[modeloId] || modeloId);
            
            // Encontrar o modelo base correspondente
            const modeloBase = modelos.find(m => m.name === modelosMap[modeloId]);
            const valorBase = modeloBase ? modeloBase.currentEstimates.median : 0;
            
            valoresBase.push(valorBase);
            valoresSimulados.push(valorSimulado);
        });
        
        // Configuração do gráfico
        const config = {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Valor Base',
                        data: valoresBase,
                        backgroundColor: 'rgba(54, 162, 235, 0.7)',
                        borderColor: 'rgb(54, 162, 235)',
                        borderWidth: 1
                    },
                    {
                        label: 'Valor Simulado',
                        data: valoresSimulados,
                        backgroundColor: 'rgba(255, 99, 132, 0.7)',
                        borderColor: 'rgb(255, 99, 132)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 3,
                        max: 6,
                        ticks: {
                            color: '#ccc'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#ccc',
                            maxRotation: 45,
                            minRotation: 45
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#ccc'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.raw.toFixed(2)}%`;
                            }
                        }
                    }
                }
            }
        };
        
        // Criar o canvas para o gráfico
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 400;
        container.appendChild(canvas);
        
        // Renderizar o gráfico
        new Chart(canvas, config);
    }
    
    // Função para renderizar o simulador de juro real neutro
    function renderizarSimuladorJuroNeutro() {
        console.log("Renderizando simulador de juro real neutro...");
        
        // Obter o contêiner da seção de juro neutro
        const container = document.getElementById('juro-neutro');
        if (!container) {
            console.error("Contêiner para juro neutro não encontrado");
            return;
        }
        
        // Verificar se a seção de simulador já existe
        let simuladorSection = container.querySelector('.simulador-section');
        if (!simuladorSection) {
            // Criar a seção de simulador
            simuladorSection = document.createElement('div');
            simuladorSection.className = 'simulador-section';
            
            const simuladorTitulo = document.createElement('h3');
            simuladorTitulo.textContent = 'Simulador de Cenários';
            simuladorSection.appendChild(simuladorTitulo);
            
            // Adicionar a seção ao contêiner principal
            container.appendChild(simuladorSection);
        } else {
            // Limpar a seção existente
            simuladorSection.innerHTML = '';
            
            const simuladorTitulo = document.createElement('h3');
            simuladorTitulo.textContent = 'Simulador de Cenários';
            simuladorSection.appendChild(simuladorTitulo);
        }
        
        // Criar a interface do simulador
        criarInterfaceSimulador(simuladorSection);
        
        console.log("Simulador de juro real neutro renderizado com sucesso");
    }
    
    // Retornar as funções públicas do módulo
    return {
        renderizarSimuladorJuroNeutro: renderizarSimuladorJuroNeutro
    };
    
})();
