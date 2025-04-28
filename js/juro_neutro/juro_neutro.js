/**
 * Módulo para visualização e interação com modelos de estimação do juro real neutro
 * 
 * Este módulo implementa a interface para visualização dos resultados dos diferentes
 * modelos de estimação do juro real neutro para o Brasil, incluindo:
 * - Modelo Focus Ex-Ante
 * - Modelo Hiato do Produto
 * - Modelo NTN-B com Prêmio a Termo
 * - Modelo Laubach-Williams
 * - Modelo SAMBA
 * - Modelo Paridade Descoberta de Juros
 * - Modelos Específicos do Banco Central
 * - Modelo QPC (Questionário de Percepções de Conjuntura)
 * 
 * Última atualização: Junho/2024
 */

// Namespace para o módulo de juro real neutro
const juroNeutro = (function() {
    
    // Dados dos modelos de juro real neutro (valores atuais e séries históricas)
    const juroNeutroData = {
        // Informações gerais
        metaData: {
            lastUpdate: "Junho/2024",
            dataSource: "Banco Central do Brasil - Relatório de Inflação",
            referenceDate: "30/06/2024"
        },
        
        // Modelo Focus Ex-Ante
        focusExAnte: {
            name: "Modelo Focus Ex-Ante",
            description: "Baseado nas expectativas da pesquisa Focus do Banco Central",
            lastUpdate: "Junho/2024",
            currentEstimates: {
                "4y": 5.0,
                "1y_hp": 5.7,
                "median": 5.35
            },
            historicalData: {
                dates: [
                    "2000-01-01", "2003-01-01", "2006-01-01", "2009-01-01", 
                    "2012-01-01", "2015-01-01", "2018-01-01", "2021-01-01", 
                    "2023-01-01", "2024-06-01"
                ],
                "4y": [
                    9.5, 8.2, 7.8, 6.5, 5.0, 5.8, 4.2, 3.0, 4.7, 5.0
                ],
                "1y_hp": [
                    11.5, 9.0, 8.5, 7.0, 4.5, 6.0, 3.8, 2.5, 5.2, 5.7
                ]
            },
            methodologies: [
                {
                    name: "Taxa de juros reais ex-ante de 4 anos da pesquisa Focus",
                    description: "Utiliza a mediana da distribuição das taxas de juros nominais previstas pelos entrevistados para o horizonte de quatro anos, deflacionadas pelas expectativas medianas de inflação para o mesmo horizonte."
                },
                {
                    name: "Taxa de juros reais ex-ante de 1 ano da pesquisa Focus com filtro HP",
                    description: "Utiliza a mediana da distribuição das taxas de juros nominais previstas para o horizonte de um ano, aplicando um filtro Hodrick-Prescott para expurgar movimentos mais cíclicos da taxa esperada."
                }
            ]
        },
        
        // Modelo Hiato do Produto
        hiatoProduto: {
            name: "Modelo Hiato do Produto",
            description: "Baseado em filtros estatísticos aplicados ao hiato do produto",
            lastUpdate: "Maio/2024",
            currentEstimates: {
                "bp_af": 5.0,
                "bn_af": 5.0,
                "bp_bf": 4.8,
                "bn_bf": 4.8,
                "median": 4.9
            },
            historicalData: {
                dates: [
                    "2000-01-01", "2003-01-01", "2006-01-01", "2009-01-01", 
                    "2012-01-01", "2015-01-01", "2018-01-01", "2021-01-01", 
                    "2023-01-01", "2024-05-01"
                ],
                "bp_af": [
                    8.5, 7.8, 6.5, 5.8, 4.5, 5.0, 4.2, 4.0, 4.8, 5.0
                ],
                "bn_af": [
                    8.3, 7.5, 6.3, 5.5, 4.3, 4.8, 4.0, 3.8, 4.8, 5.0
                ],
                "bp_bf": [
                    8.0, 7.2, 6.0, 5.2, 4.0, 4.5, 3.8, 3.5, 4.3, 4.8
                ],
                "bn_bf": [
                    7.8, 7.0, 5.8, 5.0, 3.8, 4.3, 3.6, 3.3, 4.4, 4.8
                ]
            },
            methodologies: [
                {
                    name: "Hiato Band-Pass (Alta Frequência)",
                    description: "Utiliza o filtro Band-Pass para extrair componentes cíclicos do produto, focando em ciclos de alta frequência (curto prazo)."
                },
                {
                    name: "Hiato Beveridge-Nelson (Alta Frequência)",
                    description: "Utiliza a decomposição de Beveridge-Nelson para separar tendência e ciclo, focando em ciclos de alta frequência."
                },
                {
                    name: "Hiato Band-Pass (Baixa Frequência)",
                    description: "Similar ao primeiro método, mas foca em ciclos de baixa frequência (longo prazo), buscando capturar movimentos estruturais da economia."
                },
                {
                    name: "Hiato Beveridge-Nelson (Baixa Frequência)",
                    description: "Similar ao segundo método, mas foca em ciclos de baixa frequência, buscando capturar mudanças estruturais de longo prazo."
                }
            ]
        },
        
        // Modelo NTN-B com Prêmio a Termo
        ntnbPremio: {
            name: "Modelo NTN-B com Prêmio a Termo",
            description: "Baseado nas taxas reais de mercado das NTN-Bs descontando o prêmio a termo",
            lastUpdate: "Junho/2024",
            currentEstimates: {
                "5y": 5.4,
                "10y": 5.5,
                "20y": 5.6,
                "5_10y": 5.6,
                "5_20y": 5.7,
                "10_20y": 5.7,
                "median": 5.6
            },
            historicalData: {
                dates: [
                    "2006-01-01", "2008-01-01", "2010-01-01", "2012-01-01", 
                    "2014-01-01", "2016-01-01", "2018-01-01", "2020-01-01", 
                    "2022-01-01", "2023-01-01", "2024-06-01"
                ],
                "5y": [
                    6.8, 6.5, 6.0, 5.2, 5.8, 6.2, 5.0, 4.2, 5.0, 5.5, 5.4
                ],
                "10y": [
                    6.9, 6.6, 6.1, 5.3, 5.9, 6.3, 5.1, 4.3, 5.1, 5.6, 5.5
                ],
                "20y": [
                    7.0, 6.7, 6.2, 5.4, 6.0, 6.4, 5.2, 4.4, 5.2, 5.6, 5.6
                ],
                "5_10y": [
                    7.1, 6.8, 6.3, 5.5, 6.1, 6.5, 5.3, 4.5, 5.3, 5.7, 5.6
                ],
                "5_20y": [
                    7.2, 6.9, 6.4, 5.6, 6.2, 6.6, 5.4, 4.6, 5.4, 5.7, 5.7
                ],
                "10_20y": [
                    7.2, 6.9, 6.4, 5.6, 6.2, 6.6, 5.4, 4.6, 5.4, 5.7, 5.7
                ]
            },
            methodologies: [
                {
                    name: "Taxa de 5 anos",
                    description: "Utiliza a taxa da NTN-B com vencimento em 5 anos, descontando o prêmio a termo estimado pelo modelo ACM."
                },
                {
                    name: "Taxa de 10 anos",
                    description: "Utiliza a taxa da NTN-B com vencimento em 10 anos, descontando o prêmio a termo estimado pelo modelo ACM."
                },
                {
                    name: "Taxa de 20 anos",
                    description: "Utiliza a taxa da NTN-B com vencimento em 20 anos, descontando o prêmio a termo estimado pelo modelo ACM."
                },
                {
                    name: "Taxas para diferentes horizontes",
                    description: "Utiliza a média das taxas para os respectivos horizontes (5-10, 5-20, 10-20 anos), descontando o prêmio a termo estimado pelo modelo ACM."
                }
            ]
        },
        
        // Modelo Laubach-Williams
        laubachWilliams: {
            name: "Modelo Laubach-Williams",
            description: "Baseado no modelo de Laubach e Williams (2003) com filtro de Kalman",
            lastUpdate: "Abril/2024",
            currentEstimates: {
                "lw_embi": 5.1,
                "lw_cds": 4.5,
                "median": 4.8
            },
            historicalData: {
                dates: [
                    "2000-01-01", "2003-01-01", "2006-01-01", "2009-01-01", 
                    "2012-01-01", "2015-01-01", "2018-01-01", "2021-01-01", 
                    "2023-01-01", "2024-04-01"
                ],
                "lw_embi": [
                    7.5, 7.0, 6.5, 5.8, 5.0, 5.5, 4.8, 4.0, 5.3, 5.1
                ],
                "lw_cds": [
                    7.0, 6.5, 6.0, 5.3, 4.5, 5.0, 4.3, 3.5, 4.6, 4.5
                ]
            },
            methodologies: [
                {
                    name: "LW + EMBI + Prêmio Risco Cambial",
                    description: "Utiliza o modelo Laubach-Williams com o EMBI (Emerging Markets Bond Index) como medida de risco-país, adicionando um prêmio de risco cambial à estimativa."
                },
                {
                    name: "LW + CDS + Prêmio Risco Cambial",
                    description: "Utiliza o modelo Laubach-Williams com o CDS (Credit Default Swap) como medida de risco-país, adicionando um prêmio de risco cambial à estimativa."
                }
            ]
        },
        
        // Modelo SAMBA
        samba: {
            name: "Modelo SAMBA",
            description: "Baseado no modelo DSGE do Banco Central do Brasil",
            lastUpdate: "Junho/2024",
            currentEstimates: {
                "samba_original": 4.5,
                "samba_estendido": 4.7,
                "median": 4.6
            },
            historicalData: {
                dates: [
                    "2000-01-01", "2003-01-01", "2006-01-01", "2009-01-01", 
                    "2012-01-01", "2015-01-01", "2018-01-01", "2021-01-01", 
                    "2023-01-01", "2024-06-01"
                ],
                "samba_original": [
                    7.0, 6.5, 6.0, 5.5, 4.8, 5.2, 4.0, 3.5, 4.3, 4.5
                ],
                "samba_estendido": [
                    7.2, 6.7, 6.2, 5.7, 5.0, 5.4, 4.2, 3.7, 4.5, 4.7
                ]
            },
            methodologies: [
                {
                    name: "SAMBA Original",
                    description: "Versão básica do modelo SAMBA, focando nos determinantes domésticos da taxa neutra."
                },
                {
                    name: "SAMBA Estendido",
                    description: "Versão ampliada do modelo SAMBA, incorporando fatores adicionais como crescimento da produtividade, prêmio de risco de longo prazo e fatores demográficos."
                }
            ]
        },
        
        // Modelo Paridade Descoberta de Juros (NOVO)
        paridadeDescoberta: {
            name: "Modelo Paridade Descoberta de Juros",
            description: "Baseado na relação entre taxas domésticas e externas em uma economia aberta",
            lastUpdate: "Junho/2024",
            currentEstimates: {
                "treasury_embi": 4.3,
                "tips_embi": 4.1,
                "treasury_cds": 3.5,
                "tips_cds": 3.5,
                "lw_embi": 5.1,
                "lw_cds": 4.5,
                "median": 4.3
            },
            historicalData: {
                dates: [
                    "2000-01-01", "2003-01-01", "2006-01-01", "2009-01-01", 
                    "2012-01-01", "2015-01-01", "2018-01-01", "2021-01-01", 
                    "2023-01-01", "2024-06-01"
                ],
                "treasury_embi": [
                    8.0, 7.5, 6.5, 5.5, 4.5, 5.0, 4.0, 3.5, 4.0, 4.3
                ],
                "tips_embi": [
                    7.8, 7.3, 6.3, 5.3, 4.3, 4.8, 3.8, 3.3, 4.1, 4.1
                ],
                "treasury_cds": [
                    7.5, 7.0, 6.0, 5.0, 4.0, 4.5, 3.5, 3.0, 3.5, 3.5
                ],
                "tips_cds": [
                    7.3, 6.8, 5.8, 4.8, 3.8, 4.3, 3.3, 2.8, 3.5, 3.5
                ],
                "lw_embi": [
                    8.5, 8.0, 7.0, 6.0, 5.0, 5.5, 4.5, 4.0, 5.3, 5.1
                ],
                "lw_cds": [
                    8.0, 7.5, 6.5, 5.5, 4.5, 5.0, 4.0, 3.5, 4.6, 4.5
                ]
            },
            methodologies: [
                {
                    name: "Treasury 1 ano + EMBI + Prêmio Risco Cambial",
                    description: "Utiliza a taxa do Treasury americano de 1 ano como taxa externa, o EMBI como medida de risco-país, e adiciona um prêmio de risco cambial estimado."
                },
                {
                    name: "TIPS 5 anos + EMBI + Prêmio Risco Cambial",
                    description: "Utiliza a taxa do TIPS (Treasury Inflation-Protected Securities) de 5 anos como taxa externa, o EMBI como medida de risco-país, e adiciona um prêmio de risco cambial estimado."
                },
                {
                    name: "Treasury 1 ano + CDS + Prêmio Risco Cambial",
                    description: "Utiliza a taxa do Treasury americano de 1 ano como taxa externa, o CDS como medida de risco-país, e adiciona um prêmio de risco cambial estimado."
                },
                {
                    name: "TIPS 5 anos + CDS + Prêmio Risco Cambial",
                    description: "Utiliza a taxa do TIPS de 5 anos como taxa externa, o CDS como medida de risco-país, e adiciona um prêmio de risco cambial estimado."
                },
                {
                    name: "Laubach-Williams + EMBI + Prêmio Risco Cambial",
                    description: "Utiliza a taxa neutra americana estimada pelo modelo Laubach-Williams como taxa externa, o EMBI como medida de risco-país, e adiciona um prêmio de risco cambial estimado."
                },
                {
                    name: "Laubach-Williams + CDS + Prêmio Risco Cambial",
                    description: "Utiliza a taxa neutra americana estimada pelo modelo Laubach-Williams como taxa externa, o CDS como medida de risco-país, e adiciona um prêmio de risco cambial estimado."
                }
            ]
        },
        
        // Modelos Específicos do Banco Central (NOVO)
        modelosBC: {
            name: "Modelos Específicos do Banco Central",
            description: "Baseado nas abordagens específicas do Banco Central do Brasil",
            lastUpdate: "Junho/2024",
            currentEstimates: {
                "samba_2a": 3.6,
                "samba_5a": 3.5,
                "agregado": 5.5,
                "desagregado": 5.2,
                "median": 4.4
            },
            historicalData: {
                dates: [
                    "2000-01-01", "2003-01-01", "2006-01-01", "2009-01-01", 
                    "2012-01-01", "2015-01-01", "2018-01-01", "2021-01-01", 
                    "2023-01-01", "2024-06-01"
                ],
                "samba_2a": [
                    7.0, 6.5, 5.5, 5.0, 4.5, 4.8, 3.8, 3.5, 3.8, 3.6
                ],
                "samba_5a": [
                    6.8, 6.3, 5.3, 4.8, 4.3, 4.6, 3.6, 3.3, 3.7, 3.5
                ],
                "agregado": [
                    8.5, 8.0, 7.0, 6.5, 5.5, 6.0, 5.0, 4.5, 5.5, 5.5
                ],
                "desagregado": [
                    8.0, 7.5, 6.5, 6.0, 5.0, 5.5, 4.5, 4.0, 5.1, 5.2
                ]
            },
            methodologies: [
                {
                    name: "Taxa futura de dois anos do modelo Samba",
                    description: "Utiliza o modelo SAMBA para extrair a taxa de juros real implícita para o horizonte de dois anos, considerando que no médio prazo a taxa de juros converge para seu valor neutro."
                },
                {
                    name: "Taxa futura de cinco anos do modelo Samba",
                    description: "Similar à abordagem anterior, mas para o horizonte de cinco anos. Horizonte mais longo tende a capturar melhor o valor de equilíbrio de longo prazo."
                },
                {
                    name: "Modelo agregado",
                    description: "Modelo semi-estrutural desenvolvido pelo Banco Central que estima conjuntamente o produto potencial e a taxa neutra, incorporando relações macroeconômicas fundamentais da economia brasileira."
                },
                {
                    name: "Modelo desagregado",
                    description: "Versão mais detalhada do modelo semi-estrutural que desagrega componentes da demanda e da oferta, permitindo capturar dinâmicas setoriais específicas."
                }
            ]
        },
        
        // Modelo QPC (NOVO)
        qpc: {
            name: "Modelo QPC",
            description: "Baseado no Questionário de Percepções de Conjuntura do Banco Central",
            lastUpdate: "Junho/2024",
            currentEstimates: {
                "curto_prazo": 5.2,
                "dois_anos": 5.0,
                "cinco_anos": 5.0,
                "median": 5.0
            },
            historicalData: {
                dates: [
                    "2015-01-01", "2016-01-01", "2017-01-01", "2018-01-01", 
                    "2019-01-01", "2020-01-01", "2021-01-01", "2022-01-01", 
                    "2023-01-01", "2024-06-01"
                ],
                "curto_prazo": [
                    6.0, 5.8, 5.5, 5.0, 4.8, 4.5, 4.2, 4.5, 4.8, 5.2
                ],
                "dois_anos": [
                    5.8, 5.6, 5.3, 4.8, 4.6, 4.3, 4.0, 4.3, 4.8, 5.0
                ],
                "cinco_anos": [
                    5.8, 5.6, 5.3, 4.8, 4.6, 4.3, 4.0, 4.3, 4.5, 5.0
                ]
            },
            methodologies: [
                {
                    name: "Mediana de curto prazo",
                    description: "Utiliza a mediana das respostas sobre a taxa de juros real neutra de curto prazo no Questionário de Percepções de Conjuntura (QPC) do Banco Central."
                },
                {
                    name: "Mediana de 2 anos",
                    description: "Utiliza a mediana das respostas sobre a taxa de juros real neutra para o horizonte de 2 anos no QPC."
                },
                {
                    name: "Mediana de 5 anos",
                    description: "Utiliza a mediana das respostas sobre a taxa de juros real neutra para o horizonte de 5 anos no QPC."
                }
            ]
        }
    };
    
    // Função para calcular a mediana geral de todos os modelos
    function calcularMedianaGeral() {
        const todasEstimativas = [];
        
        // Coletar todas as estimativas medianas de cada modelo
        todasEstimativas.push(juroNeutroData.focusExAnte.currentEstimates.median);
        todasEstimativas.push(juroNeutroData.hiatoProduto.currentEstimates.median);
        todasEstimativas.push(juroNeutroData.ntnbPremio.currentEstimates.median);
        todasEstimativas.push(juroNeutroData.laubachWilliams.currentEstimates.median);
        todasEstimativas.push(juroNeutroData.samba.currentEstimates.median);
        todasEstimativas.push(juroNeutroData.paridadeDescoberta.currentEstimates.median);
        todasEstimativas.push(juroNeutroData.modelosBC.currentEstimates.median);
        todasEstimativas.push(juroNeutroData.qpc.currentEstimates.median);
        
        // Ordenar as estimativas
        todasEstimativas.sort((a, b) => a - b);
        
        // Calcular a mediana
        const meio = Math.floor(todasEstimativas.length / 2);
        if (todasEstimativas.length % 2 === 0) {
            return (todasEstimativas[meio - 1] + todasEstimativas[meio]) / 2;
        } else {
            return todasEstimativas[meio];
        }
    }
    
    // Função para obter todos os modelos
    function getTodosModelos() {
        return [
            juroNeutroData.focusExAnte,
            juroNeutroData.hiatoProduto,
            juroNeutroData.ntnbPremio,
            juroNeutroData.laubachWilliams,
            juroNeutroData.samba,
            juroNeutroData.paridadeDescoberta,
            juroNeutroData.modelosBC,
            juroNeutroData.qpc
        ];
    }
    
    // Função para obter os dados de um modelo específico
    function getModeloEspecifico(nomeModelo) {
        switch (nomeModelo) {
            case 'focusExAnte':
                return juroNeutroData.focusExAnte;
            case 'hiatoProduto':
                return juroNeutroData.hiatoProduto;
            case 'ntnbPremio':
                return juroNeutroData.ntnbPremio;
            case 'laubachWilliams':
                return juroNeutroData.laubachWilliams;
            case 'samba':
                return juroNeutroData.samba;
            case 'paridadeDescoberta':
                return juroNeutroData.paridadeDescoberta;
            case 'modelosBC':
                return juroNeutroData.modelosBC;
            case 'qpc':
                return juroNeutroData.qpc;
            default:
                return null;
        }
    }
    
    // Função para criar o gráfico de comparação entre modelos
    function criarGraficoComparacao(container) {
        const modelos = getTodosModelos();
        const medianas = modelos.map(modelo => modelo.currentEstimates.median);
        const nomes = modelos.map(modelo => modelo.name);
        
        // Configuração do gráfico
        const config = {
            type: 'bar',
            data: {
                labels: nomes,
                datasets: [{
                    label: 'Taxa de Juro Real Neutro (%)',
                    data: medianas,
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
                        'rgba(255, 159, 64, 0.7)',
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(255, 205, 86, 0.7)',
                        'rgba(201, 203, 207, 0.7)',
                        'rgba(54, 162, 235, 0.7)'
                    ],
                    borderColor: [
                        'rgb(54, 162, 235)',
                        'rgb(75, 192, 192)',
                        'rgb(153, 102, 255)',
                        'rgb(255, 159, 64)',
                        'rgb(255, 99, 132)',
                        'rgb(255, 205, 86)',
                        'rgb(201, 203, 207)',
                        'rgb(54, 162, 235)'
                    ],
                    borderWidth: 1
                }]
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
                                return `${context.dataset.label}: ${context.raw}%`;
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
    
    // Função para criar o gráfico de evolução histórica
    function criarGraficoEvolucao(container, modelo) {
        const dadosModelo = getModeloEspecifico(modelo);
        if (!dadosModelo || !dadosModelo.historicalData) return;
        
        const datasets = [];
        const metodologias = Object.keys(dadosModelo.historicalData).filter(key => key !== 'dates');
        
        // Cores para as diferentes metodologias
        const cores = [
            { bg: 'rgba(54, 162, 235, 0.2)', border: 'rgb(54, 162, 235)' },
            { bg: 'rgba(75, 192, 192, 0.2)', border: 'rgb(75, 192, 192)' },
            { bg: 'rgba(153, 102, 255, 0.2)', border: 'rgb(153, 102, 255)' },
            { bg: 'rgba(255, 159, 64, 0.2)', border: 'rgb(255, 159, 64)' },
            { bg: 'rgba(255, 99, 132, 0.2)', border: 'rgb(255, 99, 132)' },
            { bg: 'rgba(255, 205, 86, 0.2)', border: 'rgb(255, 205, 86)' }
        ];
        
        // Criar datasets para cada metodologia
        metodologias.forEach((metodologia, index) => {
            datasets.push({
                label: metodologia,
                data: dadosModelo.historicalData[metodologia],
                backgroundColor: cores[index % cores.length].bg,
                borderColor: cores[index % cores.length].border,
                borderWidth: 2,
                tension: 0.4,
                fill: false
            });
        });
        
        // Configuração do gráfico
        const config = {
            type: 'line',
            data: {
                labels: dadosModelo.historicalData.dates,
                datasets: datasets
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
                            color: '#ccc'
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
                                return `${context.dataset.label}: ${context.raw}%`;
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
    
    // Função para criar a tabela de comparação entre modelos
    function criarTabelaComparacao(container) {
        const modelos = getTodosModelos();
        const medianaGeral = calcularMedianaGeral();
        
        // Criar a tabela
        const tabela = document.createElement('table');
        tabela.className = 'tabela-comparacao';
        
        // Cabeçalho da tabela
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        ['Modelo', 'Descrição', 'Estimativa Atual', 'Data de Referência'].forEach(texto => {
            const th = document.createElement('th');
            th.textContent = texto;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        tabela.appendChild(thead);
        
        // Corpo da tabela
        const tbody = document.createElement('tbody');
        
        // Linha para a mediana geral
        const medianaRow = document.createElement('tr');
        medianaRow.className = 'mediana-geral';
        
        const medianaModeloCell = document.createElement('td');
        medianaModeloCell.textContent = 'Mediana Geral';
        medianaRow.appendChild(medianaModeloCell);
        
        const medianaDescricaoCell = document.createElement('td');
        medianaDescricaoCell.textContent = 'Mediana de todos os modelos';
        medianaRow.appendChild(medianaDescricaoCell);
        
        const medianaEstimativaCell = document.createElement('td');
        medianaEstimativaCell.textContent = `${medianaGeral.toFixed(2)}%`;
        medianaEstimativaCell.className = 'valor-destaque';
        medianaRow.appendChild(medianaEstimativaCell);
        
        const medianaDataCell = document.createElement('td');
        medianaDataCell.textContent = juroNeutroData.metaData.referenceDate;
        medianaRow.appendChild(medianaDataCell);
        
        tbody.appendChild(medianaRow);
        
        // Linhas para cada modelo
        modelos.forEach(modelo => {
            const row = document.createElement('tr');
            
            const modeloCell = document.createElement('td');
            modeloCell.textContent = modelo.name;
            row.appendChild(modeloCell);
            
            const descricaoCell = document.createElement('td');
            descricaoCell.textContent = modelo.description;
            row.appendChild(descricaoCell);
            
            const estimativaCell = document.createElement('td');
            estimativaCell.textContent = `${modelo.currentEstimates.median.toFixed(2)}%`;
            row.appendChild(estimativaCell);
            
            const dataCell = document.createElement('td');
            dataCell.textContent = modelo.lastUpdate;
            row.appendChild(dataCell);
            
            tbody.appendChild(row);
        });
        
        tabela.appendChild(tbody);
        container.appendChild(tabela);
    }
    
    // Função para criar a seção de detalhes de um modelo específico
    function criarSecaoDetalhesModelo(container, nomeModelo) {
        const modelo = getModeloEspecifico(nomeModelo);
        if (!modelo) return;
        
        // Criar o contêiner para os detalhes do modelo
        const detalhesContainer = document.createElement('div');
        detalhesContainer.className = 'detalhes-modelo';
        
        // Título e descrição
        const titulo = document.createElement('h3');
        titulo.textContent = modelo.name;
        detalhesContainer.appendChild(titulo);
        
        const descricao = document.createElement('p');
        descricao.textContent = modelo.description;
        detalhesContainer.appendChild(descricao);
        
        const dataAtualizacao = document.createElement('p');
        dataAtualizacao.className = 'data-atualizacao';
        dataAtualizacao.textContent = `Última atualização: ${modelo.lastUpdate}`;
        detalhesContainer.appendChild(dataAtualizacao);
        
        // Estimativas atuais
        const estimativasContainer = document.createElement('div');
        estimativasContainer.className = 'estimativas-container';
        
        const estimativasTitulo = document.createElement('h4');
        estimativasTitulo.textContent = 'Estimativas Atuais';
        estimativasContainer.appendChild(estimativasTitulo);
        
        const estimativasGrid = document.createElement('div');
        estimativasGrid.className = 'estimativas-grid';
        
        // Adicionar cada estimativa
        Object.entries(modelo.currentEstimates).forEach(([chave, valor]) => {
            const estimativaItem = document.createElement('div');
            estimativaItem.className = 'estimativa-item';
            
            const estimativaNome = document.createElement('div');
            estimativaNome.className = 'estimativa-nome';
            estimativaNome.textContent = chave === 'median' ? 'Mediana' : chave;
            estimativaItem.appendChild(estimativaNome);
            
            const estimativaValor = document.createElement('div');
            estimativaValor.className = 'estimativa-valor';
            estimativaValor.textContent = `${valor.toFixed(2)}%`;
            if (chave === 'median') estimativaValor.classList.add('valor-destaque');
            estimativaItem.appendChild(estimativaValor);
            
            estimativasGrid.appendChild(estimativaItem);
        });
        
        estimativasContainer.appendChild(estimativasGrid);
        detalhesContainer.appendChild(estimativasContainer);
        
        // Metodologias
        const metodologiasContainer = document.createElement('div');
        metodologiasContainer.className = 'metodologias-container';
        
        const metodologiasTitulo = document.createElement('h4');
        metodologiasTitulo.textContent = 'Metodologias';
        metodologiasContainer.appendChild(metodologiasTitulo);
        
        // Adicionar cada metodologia
        modelo.methodologies.forEach(metodologia => {
            const metodologiaItem = document.createElement('div');
            metodologiaItem.className = 'metodologia-item';
            
            const metodologiaNome = document.createElement('h5');
            metodologiaNome.textContent = metodologia.name;
            metodologiaItem.appendChild(metodologiaNome);
            
            const metodologiaDescricao = document.createElement('p');
            metodologiaDescricao.textContent = metodologia.description;
            metodologiaItem.appendChild(metodologiaDescricao);
            
            metodologiasContainer.appendChild(metodologiaItem);
        });
        
        detalhesContainer.appendChild(metodologiasContainer);
        
        // Contêiner para o gráfico de evolução histórica
        const graficoContainer = document.createElement('div');
        graficoContainer.className = 'grafico-container';
        
        const graficoTitulo = document.createElement('h4');
        graficoTitulo.textContent = 'Evolução Histórica';
        graficoContainer.appendChild(graficoTitulo);
        
        detalhesContainer.appendChild(graficoContainer);
        
        // Adicionar ao contêiner principal
        container.appendChild(detalhesContainer);
        
        // Criar o gráfico de evolução histórica
        criarGraficoEvolucao(graficoContainer, nomeModelo);
    }
    
    // Função principal para renderizar a seção de juro real neutro
    function renderizarJuroNeutro() {
        console.log('Renderizando seção de juro real neutro...');
        
        // Obter o contêiner da seção
        const container = document.getElementById('juro-neutro');
        if (!container) {
            console.error('Contêiner para juro real neutro não encontrado');
            return;
        }
        
        // Limpar o contêiner
        container.innerHTML = '';
        
        // Criar o cabeçalho da seção
        const header = document.createElement('div');
        header.className = 'section-header';
        
        const titulo = document.createElement('h2');
        titulo.textContent = 'Juro Real Neutro';
        header.appendChild(titulo);
        
        const dataAtualizacao = document.createElement('p');
        dataAtualizacao.className = 'data-atualizacao';
        dataAtualizacao.textContent = `Dados atualizados em: ${juroNeutroData.metaData.referenceDate}`;
        header.appendChild(dataAtualizacao);
        
        container.appendChild(header);
        
        // Criar a seção de visão geral
        const visaoGeralSection = document.createElement('div');
        visaoGeralSection.className = 'visao-geral-section';
        
        const visaoGeralTitulo = document.createElement('h3');
        visaoGeralTitulo.textContent = 'Visão Geral';
        visaoGeralSection.appendChild(visaoGeralTitulo);
        
        const medianaGeral = calcularMedianaGeral();
        
        const medianaContainer = document.createElement('div');
        medianaContainer.className = 'mediana-container';
        
        const medianaValor = document.createElement('div');
        medianaValor.className = 'mediana-valor';
        medianaValor.textContent = `${medianaGeral.toFixed(2)}%`;
        medianaContainer.appendChild(medianaValor);
        
        const medianaLabel = document.createElement('div');
        medianaLabel.className = 'mediana-label';
        medianaLabel.textContent = 'Mediana de todos os modelos';
        medianaContainer.appendChild(medianaLabel);
        
        visaoGeralSection.appendChild(medianaContainer);
        
        // Contêiner para o gráfico de comparação
        const graficoComparacaoContainer = document.createElement('div');
        graficoComparacaoContainer.className = 'grafico-comparacao-container';
        visaoGeralSection.appendChild(graficoComparacaoContainer);
        
        container.appendChild(visaoGeralSection);
        
        // Criar a seção de tabela de comparação
        const tabelaSection = document.createElement('div');
        tabelaSection.className = 'tabela-section';
        
        const tabelaTitulo = document.createElement('h3');
        tabelaTitulo.textContent = 'Comparação entre Modelos';
        tabelaSection.appendChild(tabelaTitulo);
        
        container.appendChild(tabelaSection);
        
        // Criar a seção de detalhes dos modelos
        const detalhesSection = document.createElement('div');
        detalhesSection.className = 'detalhes-section';
        
        const detalhesTitulo = document.createElement('h3');
        detalhesTitulo.textContent = 'Detalhes dos Modelos';
        detalhesSection.appendChild(detalhesTitulo);
        
        // Criar abas para os diferentes modelos
        const abas = document.createElement('div');
        abas.className = 'abas-container';
        
        const modelos = [
            { id: 'focusExAnte', nome: 'Focus Ex-Ante' },
            { id: 'hiatoProduto', nome: 'Hiato do Produto' },
            { id: 'ntnbPremio', nome: 'NTN-B Prêmio' },
            { id: 'laubachWilliams', nome: 'Laubach-Williams' },
            { id: 'samba', nome: 'SAMBA' },
            { id: 'paridadeDescoberta', nome: 'Paridade Descoberta' },
            { id: 'modelosBC', nome: 'Modelos BC' },
            { id: 'qpc', nome: 'QPC' }
        ];
        
        modelos.forEach((modelo, index) => {
            const aba = document.createElement('button');
            aba.className = 'aba-button';
            aba.textContent = modelo.nome;
            aba.dataset.modelo = modelo.id;
            if (index === 0) aba.classList.add('active');
            
            aba.addEventListener('click', function() {
                // Remover classe active de todas as abas
                document.querySelectorAll('.aba-button').forEach(btn => btn.classList.remove('active'));
                // Adicionar classe active à aba clicada
                this.classList.add('active');
                
                // Limpar e renderizar o conteúdo da aba selecionada
                const conteudoAbas = document.querySelector('.conteudo-abas');
                conteudoAbas.innerHTML = '';
                criarSecaoDetalhesModelo(conteudoAbas, this.dataset.modelo);
            });
            
            abas.appendChild(aba);
        });
        
        detalhesSection.appendChild(abas);
        
        // Contêiner para o conteúdo das abas
        const conteudoAbas = document.createElement('div');
        conteudoAbas.className = 'conteudo-abas';
        detalhesSection.appendChild(conteudoAbas);
        
        container.appendChild(detalhesSection);
        
        // Renderizar os componentes iniciais
        criarGraficoComparacao(graficoComparacaoContainer);
        criarTabelaComparacao(tabelaSection);
        criarSecaoDetalhesModelo(conteudoAbas, 'focusExAnte'); // Modelo inicial
        
        console.log('Seção de juro real neutro renderizada com sucesso');
    }
    
    // Retornar as funções públicas do módulo
    return {
        renderizarJuroNeutro: renderizarJuroNeutro,
        getMedianaGeral: calcularMedianaGeral,
        getTodosModelos: getTodosModelos,
        getModeloEspecifico: getModeloEspecifico,
        getData: function() { return juroNeutroData; }
    };
})();
