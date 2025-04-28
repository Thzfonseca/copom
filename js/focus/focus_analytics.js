/**
 * Módulo para análise dos relatórios Focus do Banco Central do Brasil
 * 
 * Este módulo implementa a visualização e análise da evolução das expectativas
 * dos últimos 10 relatórios Focus.
 */

// Namespace para o módulo de análise Focus
const focusAnalytics = (function() {
    
    // Dados de fallback para quando não for possível acessar a API
    let dadosFallback = null;
    
    // Variáveis de interesse para exibição
    const variaveisInteresse = [
        'IPCA',
        'IGP-M',
        'Taxa de câmbio',
        'Meta Taxa Selic',
        'PIB Total',
        'Produção industrial',
        'Conta corrente',
        'Investimento direto no país',
        'Dívida líquida do setor público',
        'Resultado primário'
    ];
    
    // Cores para os gráficos
    const cores = {
        atual: 'rgba(54, 162, 235, 0.7)',
        proximoAno: 'rgba(255, 99, 132, 0.7)',
        doisAnos: 'rgba(75, 192, 192, 0.7)',
        alta: 'rgba(75, 192, 75, 0.7)',
        baixa: 'rgba(255, 99, 132, 0.7)',
        estavel: 'rgba(255, 205, 86, 0.7)'
    };
    
    // Função para carregar os dados do arquivo de fallback
    async function carregarDados() {
        try {
            console.log("Carregando dados dos relatórios Focus...");
            
            // Tentar carregar os dados do arquivo de fallback
            const response = await fetch('/js/focus/focus_data_fallback.json');
            if (!response.ok) {
                throw new Error(`Erro ao carregar dados: ${response.status}`);
            }
            
            dadosFallback = await response.json();
            console.log("Dados dos relatórios Focus carregados com sucesso:", dadosFallback);
            
            return dadosFallback;
        } catch (error) {
            console.error("Erro ao carregar dados dos relatórios Focus:", error);
            
            // Se não conseguir carregar os dados, retornar um objeto vazio
            return {
                ultima_atualizacao: new Date().toLocaleDateString('pt-BR'),
                relatorios: [],
                evolucao: {}
            };
        }
    }
    
    // Função para criar o resumo das expectativas mais recentes
    function criarResumoExpectativas(container, dados) {
        console.log("Criando resumo das expectativas mais recentes...");
        
        const resumoContainer = document.createElement('div');
        resumoContainer.className = 'resumo-expectativas';
        
        // Título e data de atualização
        const titulo = document.createElement('h3');
        titulo.textContent = 'Resumo das Expectativas Atuais';
        resumoContainer.appendChild(titulo);
        
        const dataAtualizacao = document.createElement('p');
        dataAtualizacao.className = 'data-atualizacao';
        dataAtualizacao.textContent = `Data de referência: ${dados.ultima_atualizacao || new Date().toLocaleDateString('pt-BR')}`;
        resumoContainer.appendChild(dataAtualizacao);
        
        // Criar tabela de resumo
        const tabela = document.createElement('table');
        tabela.className = 'tabela-resumo';
        
        // Cabeçalho da tabela
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const thVariavel = document.createElement('th');
        thVariavel.textContent = 'Variável';
        headerRow.appendChild(thVariavel);
        
        const thAtual = document.createElement('th');
        thAtual.textContent = 'Atual';
        headerRow.appendChild(thAtual);
        
        const thProximo = document.createElement('th');
        thProximo.textContent = 'Próximo Ano';
        headerRow.appendChild(thProximo);
        
        const thTendencia = document.createElement('th');
        thTendencia.textContent = 'Tendência';
        headerRow.appendChild(thTendencia);
        
        thead.appendChild(headerRow);
        tabela.appendChild(thead);
        
        // Corpo da tabela
        const tbody = document.createElement('tbody');
        
        // Adicionar uma linha para cada variável de interesse
        variaveisInteresse.forEach(variavel => {
            if (dados.evolucao && dados.evolucao[variavel]) {
                const evolucao = dados.evolucao[variavel];
                
                const row = document.createElement('tr');
                
                const tdVariavel = document.createElement('td');
                tdVariavel.textContent = variavel;
                row.appendChild(tdVariavel);
                
                const tdAtual = document.createElement('td');
                const valorAtual = evolucao.valores_atual && evolucao.valores_atual.length > 0 ? 
                    evolucao.valores_atual[0] : '-';
                tdAtual.textContent = valorAtual !== null ? valorAtual : '-';
                row.appendChild(tdAtual);
                
                const tdProximo = document.createElement('td');
                const valorProximo = evolucao.valores_proximo_ano && evolucao.valores_proximo_ano.length > 0 ? 
                    evolucao.valores_proximo_ano[0] : '-';
                tdProximo.textContent = valorProximo !== null ? valorProximo : '-';
                row.appendChild(tdProximo);
                
                const tdTendencia = document.createElement('td');
                tdTendencia.textContent = evolucao.tendencia ? 
                    evolucao.tendencia.charAt(0).toUpperCase() + evolucao.tendencia.slice(1) : '-';
                tdTendencia.className = evolucao.tendencia ? `tendencia-${evolucao.tendencia}` : '';
                row.appendChild(tdTendencia);
                
                tbody.appendChild(row);
            }
        });
        
        tabela.appendChild(tbody);
        resumoContainer.appendChild(tabela);
        
        container.appendChild(resumoContainer);
    }
    
    // Função para criar o gráfico de evolução de uma variável
    function criarGraficoEvolucao(container, variavel, dados) {
        console.log(`Criando gráfico de evolução para ${variavel}...`);
        
        if (!dados.evolucao || !dados.evolucao[variavel]) {
            console.error(`Dados de evolução não encontrados para ${variavel}`);
            return;
        }
        
        const evolucao = dados.evolucao[variavel];
        
        // Criar o contêiner para o gráfico
        const graficoContainer = document.createElement('div');
        graficoContainer.className = 'grafico-evolucao-container';
        
        // Título do gráfico
        const titulo = document.createElement('h4');
        titulo.textContent = `Evolução das Expectativas: ${variavel}`;
        graficoContainer.appendChild(titulo);
        
        // Criar o canvas para o gráfico
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 400;
        graficoContainer.appendChild(canvas);
        
        // Adicionar o contêiner ao contêiner principal
        container.appendChild(graficoContainer);
        
        // Configuração do gráfico
        const config = {
            type: 'line',
            data: {
                labels: evolucao.datas || [],
                datasets: [
                    {
                        label: 'Atual',
                        data: evolucao.valores_atual || [],
                        backgroundColor: cores.atual,
                        borderColor: cores.atual.replace('0.7', '1'),
                        borderWidth: 2,
                        pointRadius: 4,
                        fill: false,
                        tension: 0.1
                    },
                    {
                        label: 'Próximo Ano',
                        data: evolucao.valores_proximo_ano || [],
                        backgroundColor: cores.proximoAno,
                        borderColor: cores.proximoAno.replace('0.7', '1'),
                        borderWidth: 2,
                        pointRadius: 4,
                        fill: false,
                        tension: 0.1
                    },
                    {
                        label: 'Dois Anos à Frente',
                        data: evolucao.valores_dois_anos || [],
                        backgroundColor: cores.doisAnos,
                        borderColor: cores.doisAnos.replace('0.7', '1'),
                        borderWidth: 2,
                        pointRadius: 4,
                        fill: false,
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
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
                                return `${context.dataset.label}: ${context.raw !== null ? context.raw : 'N/A'}`;
                            }
                        }
                    }
                }
            }
        };
        
        // Renderizar o gráfico
        new Chart(canvas, config);
    }
    
    // Função para criar o painel de análise comparativa
    function criarPainelAnaliseComparativa(container, dados) {
        console.log("Criando painel de análise comparativa...");
        
        const painelContainer = document.createElement('div');
        painelContainer.className = 'painel-analise-comparativa';
        
        // Título
        const titulo = document.createElement('h3');
        titulo.textContent = 'Análise Comparativa das Expectativas';
        painelContainer.appendChild(titulo);
        
        // Criar o canvas para o gráfico de barras
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 500;
        painelContainer.appendChild(canvas);
        
        // Adicionar o contêiner ao contêiner principal
        container.appendChild(painelContainer);
        
        // Preparar dados para o gráfico
        const labels = [];
        const valoresAtuais = [];
        const valoresProximoAno = [];
        const tendencias = [];
        
        variaveisInteresse.forEach(variavel => {
            if (dados.evolucao && dados.evolucao[variavel]) {
                const evolucao = dados.evolucao[variavel];
                
                labels.push(variavel);
                
                // Valores atuais
                const valorAtual = evolucao.valores_atual && evolucao.valores_atual.length > 0 ? 
                    evolucao.valores_atual[0] : null;
                valoresAtuais.push(valorAtual);
                
                // Valores para o próximo ano
                const valorProximo = evolucao.valores_proximo_ano && evolucao.valores_proximo_ano.length > 0 ? 
                    evolucao.valores_proximo_ano[0] : null;
                valoresProximoAno.push(valorProximo);
                
                // Tendências
                tendencias.push(evolucao.tendencia || 'estavel');
            }
        });
        
        // Configuração do gráfico
        const config = {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Atual',
                        data: valoresAtuais,
                        backgroundColor: valoresAtuais.map((_, i) => {
                            const tendencia = tendencias[i];
                            return cores[tendencia] || cores.estavel;
                        }),
                        borderColor: valoresAtuais.map((_, i) => {
                            const tendencia = tendencias[i];
                            return (cores[tendencia] || cores.estavel).replace('0.7', '1');
                        }),
                        borderWidth: 1
                    },
                    {
                        label: 'Próximo Ano',
                        data: valoresProximoAno,
                        backgroundColor: cores.proximoAno,
                        borderColor: cores.proximoAno.replace('0.7', '1'),
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
                                return `${context.dataset.label}: ${context.raw !== null ? context.raw : 'N/A'}`;
                            }
                        }
                    }
                }
            }
        };
        
        // Renderizar o gráfico
        new Chart(canvas, config);
    }
    
    // Função para criar a seção de detalhes por variável
    function criarSecaoDetalhesVariaveis(container, dados) {
        console.log("Criando seção de detalhes por variável...");
        
        const detalhesContainer = document.createElement('div');
        detalhesContainer.className = 'detalhes-variaveis-container';
        
        // Título
        const titulo = document.createElement('h3');
        titulo.textContent = 'Detalhes por Variável';
        detalhesContainer.appendChild(titulo);
        
        // Criar abas para cada variável
        const abas = document.createElement('div');
        abas.className = 'abas-variaveis';
        
        // Criar conteúdo das abas
        const conteudoAbas = document.createElement('div');
        conteudoAbas.className = 'conteudo-abas';
        
        // Adicionar uma aba para cada variável de interesse
        variaveisInteresse.forEach((variavel, index) => {
            // Criar botão da aba
            const botaoAba = document.createElement('button');
            botaoAba.className = 'botao-aba';
            botaoAba.textContent = variavel;
            botaoAba.dataset.variavel = variavel;
            
            // Tornar a primeira aba ativa por padrão
            if (index === 0) {
                botaoAba.classList.add('ativa');
            }
            
            botaoAba.addEventListener('click', function() {
                // Remover classe ativa de todas as abas
                document.querySelectorAll('.botao-aba').forEach(aba => {
                    aba.classList.remove('ativa');
                });
                
                // Adicionar classe ativa à aba clicada
                this.classList.add('ativa');
                
                // Esconder todos os conteúdos
                document.querySelectorAll('.conteudo-aba').forEach(conteudo => {
                    conteudo.style.display = 'none';
                });
                
                // Mostrar o conteúdo correspondente
                const conteudoAba = document.getElementById(`conteudo-${this.dataset.variavel.replace(/[^a-zA-Z0-9]/g, '-')}`);
                if (conteudoAba) {
                    conteudoAba.style.display = 'block';
                }
            });
            
            abas.appendChild(botaoAba);
            
            // Criar conteúdo da aba
            const conteudoAba = document.createElement('div');
            conteudoAba.className = 'conteudo-aba';
            conteudoAba.id = `conteudo-${variavel.replace(/[^a-zA-Z0-9]/g, '-')}`;
            conteudoAba.style.display = index === 0 ? 'block' : 'none';
            
            // Criar gráfico de evolução para a variável
            criarGraficoEvolucao(conteudoAba, variavel, dados);
            
            conteudoAbas.appendChild(conteudoAba);
        });
        
        detalhesContainer.appendChild(abas);
        detalhesContainer.appendChild(conteudoAbas);
        
        container.appendChild(detalhesContainer);
    }
    
    // Função principal para renderizar a análise dos relatórios Focus
    async function renderizarAnaliseFocus() {
        console.log("Renderizando análise dos relatórios Focus...");
        
        // Obter o contêiner da seção
        const container = document.getElementById('focus-analytics');
        if (!container) {
            console.error("Contêiner para análise Focus não encontrado");
            return;
        }
        
        // Limpar o contêiner
        container.innerHTML = '';
        
        // Adicionar título principal
        const tituloPrincipal = document.createElement('h2');
        tituloPrincipal.textContent = 'Análise dos Relatórios Focus';
        container.appendChild(tituloPrincipal);
        
        // Adicionar descrição
        const descricao = document.createElement('p');
        descricao.className = 'descricao-focus';
        descricao.textContent = 'Análise da evolução das expectativas de mercado com base nos últimos 10 relatórios Focus do Banco Central do Brasil.';
        container.appendChild(descricao);
        
        // Carregar os dados
        const dados = await carregarDados();
        
        // Verificar se os dados foram carregados com sucesso
        if (!dados || !dados.evolucao) {
            const erro = document.createElement('div');
            erro.className = 'erro-carregamento';
            erro.textContent = 'Erro ao carregar os dados dos relatórios Focus. Tente novamente mais tarde.';
            container.appendChild(erro);
            return;
        }
        
        // Criar as seções da análise
        criarResumoExpectativas(container, dados);
        criarPainelAnaliseComparativa(container, dados);
        criarSecaoDetalhesVariaveis(container, dados);
        
        console.log("Análise dos relatórios Focus renderizada com sucesso");
    }
    
    // Retornar as funções públicas do módulo
    return {
        renderizarAnaliseFocus: renderizarAnaliseFocus,
        carregarDados: carregarDados
    };
    
})();
