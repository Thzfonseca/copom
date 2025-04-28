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

// Mostrar o Spinner no carregamento inicial
document.addEventListener('DOMContentLoaded', function () {
    mostrarLoading();

    setTimeout(() => {
        esconderLoading();
    }, 1200);
});

// Sistema de Tabs do Dashboard
function showTab(tabId) {
    // Esconder todas as abas
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.style.display = 'none';
    });

    // Mostrar a aba selecionada
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.style.display = 'block';
    } else {
        console.error(`Aba ${tabId} não encontrada.`);
    }

    // Inicializar componentes da aba, se existir
    initializeTabComponents(tabId);
}

function initializeTabComponents(tabId) {
    try {
        switch (tabId) {
            case 'dashboard':
                if (typeof window.renderizarDashboard === 'function') {
                    window.renderizarDashboard();
                }
                break;
            case 'modelos-preditivos':
                if (typeof window.renderizarModelosPreditivos === 'function') {
                    window.renderizarModelosPreditivos(window.modelosPreditivos.getResultados());
                }
                break;
            case 'modelos-avancados':
                if (typeof window.renderizarModelosAvancados === 'function') {
                    window.renderizarModelosAvancados(window.modelosPreditivos.getResultados());
                }
                break;
            case 'simulador':
                if (typeof window.renderizarSimulador === 'function') {
                    const container = document.getElementById('simulador-content');
                    if (container) renderizarSimulador(container);
                }
                break;
            case 'analise-atas':
                if (typeof window.renderizarAnaliseAtas === 'function') {
                    renderizarAnaliseAtas(window.analisadorAtas.getResultados());
                }
                break;
            case 'juro-neutro':
                if (typeof window.renderizarJuroNeutro === 'function') {
                    window.renderizarJuroNeutro();
                }
                break;
            case 'agenda-copom':
                if (typeof window.renderizarAgendaCopom === 'function') {
                    window.renderizarAgendaCopom();
                }
                break;
            case 'focus':
                if (typeof window.renderizarFocusAnalytics === 'function') {
                    window.renderizarFocusAnalytics();
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
    const container = document.getElementById(`${tabId}-content`);
    if (container) {
        container.innerHTML = `<div class="alert alert-danger mt-4">${message}</div>`;
    }
}

// Monitorar a navegação pelas abas via hash da URL
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1);
    showTab(hash || 'dashboard');
});

// Inicializar na primeira carga
window.addEventListener('load', () => {
    const initialHash = window.location.hash.substring(1);
    showTab(initialHash || 'dashboard');
});
