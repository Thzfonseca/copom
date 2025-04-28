// script.js atualizado

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

// Mostra o Spinner no carregamento inicial
document.addEventListener('DOMContentLoaded', function () {
    mostrarLoading();

    setTimeout(() => {
        esconderLoading();
    }, 1000);
});

// Sistema de Tabs do Dashboard
function showTab(tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.style.display = 'none');

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
                // Nada por enquanto
                break;
            case 'analise-atas':
                if (window.analisadorAtas && typeof window.renderizarAnaliseAtas === 'function') {
                    window.renderizarAnaliseAtas(window.analisadorAtas.getResultados());
                }
                break;
            case 'modelos-avancados':
                if (window.modelosPreditivos && typeof window.renderizarModelosAvancados === 'function') {
                    window.renderizarModelosAvancados({
                        modelos: window.modelosPreditivos.getModelosData(),
                        proximaReuniao: window.modelosPreditivos.getProximaReuniaoData(),
                        taxaPrevista: window.modelosPreditivos.getProximaReuniaoData()?.taxaSelicPrevista || 0
                    });
                }
                break;
            case 'modelos-preditivos':
                if (window.modelosPreditivos && typeof window.renderizarModelosPreditivos === 'function') {
                    window.renderizarModelosPreditivos({
                        modelos: window.modelosPreditivos.getModelosData(),
                        proximaReuniao: window.modelosPreditivos.getProximaReuniaoData(),
                        indicadores: window.modelosPreditivos.getIndicadoresData(),
                        historicoDecisoes: window.modelosPreditivos.historicoDecisoes,
                        taxaPrevista: window.modelosPreditivos.getProximaReuniaoData()?.taxaSelicPrevista || 0
                    });
                }
                break;
            case 'simulador':
                if (typeof window.renderizarSimulador === 'function') {
                    window.renderizarSimulador();
                }
                break;
            case 'juro-neutro':
                if (typeof window.renderizarJuroNeutro === 'function') {
                    window.renderizarJuroNeutro();
                }
                break;
            default:
                console.warn(`Nenhuma função específica para inicializar a aba ${tabId}.`);
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

// Monitorar navegação pela URL
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1);
    showTab(hash || 'dashboard');
});

window.addEventListener('load', () => {
    const initialHash = window.location.hash.substring(1);
    showTab(initialHash || 'dashboard');

    // Inicializar objetos principais
    if (typeof window.AnalisadorAtasCopom === 'function') {
        window.analisadorAtas = new window.AnalisadorAtasCopom();
    }
    if (typeof window.ModelosPreditivos === 'function') {
        window.modelosPreditivos = new window.ModelosPreditivos();
    }
});
