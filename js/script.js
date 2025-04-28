// script.js

// Controle do Spinner de Carregamento
function mostrarLoading() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.style.display = 'flex';
    }
}

function esconderLoading() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.style.display = 'none';
    }
}

// Sistema de Tabs do Dashboard
function showTab(tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.style.display = 'none';
    });

    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.style.display = 'block';
    } else {
        console.error(`Aba ${tabId} não encontrada.`);
    }

    initializeTabComponents(tabId);
}

function initializeTabComponents(tabId) {
    try {
        switch (tabId) {
            case 'dashboard':
                console.log('Dashboard selecionado.');
                break;
            case 'modelos-preditivos':
                if (typeof window.ModelosPreditivos === 'function') {
                    if (!window.modelosPreditivos) {
                        window.modelosPreditivos = new ModelosPreditivos();
                    }
                    const resultados = {
                        modelos: window.modelosPreditivos.getModelosData(),
                        proximaReuniao: window.modelosPreditivos.getProximaReuniaoData(),
                        indicadores: window.modelosPreditivos.getIndicadoresData(),
                        historicoDecisoes: window.modelosPreditivos.historicoDecisoes,
                        taxaPrevista: window.modelosPreditivos.getProximaReuniaoData().previsaoConsolidada.includes('Aumento')
                            ? window.modelosPreditivos.historicoDecisoes[0].taxa + 0.25
                            : window.modelosPreditivos.historicoDecisoes[0].taxa
                    };
                    window.renderizarModelosPreditivos(resultados);
                }
                break;
            case 'analise-atas':
                if (typeof window.AnalisadorAtasCopom === 'function') {
                    if (!window.analisadorAtas) {
                        window.analisadorAtas = new AnalisadorAtasCopom();
                    }
                    const dados = window.analisadorAtas.getResultados();
                    window.renderizarAnaliseAtas(dados);
                }
                break;
            case 'simulador':
                if (typeof window.renderizarSimulador === 'function') {
                    const container = document.getElementById('simulador');
                    if (container) {
                        window.renderizarSimulador(container);
                    }
                }
                break;
            case 'modelos-avancados':
                if (typeof window.renderizarModelosAvancados === 'function') {
                    if (window.modelosPreditivos) {
                        const resultados = {
                            modelos: window.modelosPreditivos.getModelosData(),
                            proximaReuniao: window.modelosPreditivos.getProximaReuniaoData(),
                            taxaPrevista: window.modelosPreditivos.getProximaReuniaoData().previsaoConsolidada.includes('Aumento')
                                ? window.modelosPreditivos.historicoDecisoes[0].taxa + 0.25
                                : window.modelosPreditivos.historicoDecisoes[0].taxa
                        };
                        window.renderizarModelosAvancados(resultados);
                    }
                }
                break;
            case 'juro-neutro':
                if (typeof window.renderizarJuroNeutro === 'function') {
                    window.renderizarJuroNeutro();
                }
                break;
            case 'focus':
                if (typeof window.renderizarFocusAnalytics === 'function') {
                    window.renderizarFocusAnalytics();
                }
                break;
            case 'agenda-copom':
                if (typeof window.renderizarAgendaCopom === 'function') {
                    window.renderizarAgendaCopom();
                }
                break;
            default:
                console.warn(`Nenhuma função específica para a aba ${tabId}.`);
        }
    } catch (error) {
        console.error(`Erro ao inicializar componentes da aba ${tabId}:`, error);
        displayTabError(tabId, "Erro ao carregar esta seção. Tente novamente mais tarde.");
    }
}

function displayTabError(tabId, message) {
    const container = document.getElementById(tabId);
    if (container) {
        container.innerHTML = `<div class="alert alert-danger mt-4">${message}</div>`;
    }
}

// Inicializar tab ao mudar hash
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1);
    showTab(hash || 'dashboard');
});

// Inicializar tudo ao carregar
window.addEventListener('load', () => {
    mostrarLoading();
    const initialHash = window.location.hash.substring(1);
    showTab(initialHash || 'dashboard');
    setTimeout(() => {
        esconderLoading();
    }, 1000);
});
