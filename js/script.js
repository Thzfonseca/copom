// js/script.js

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

document.addEventListener('DOMContentLoaded', function () {
    mostrarLoading();
    setTimeout(() => {
        esconderLoading();
    }, 1200);
});

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
                if (typeof window.renderizarDashboard === 'function') window.renderizarDashboard();
                break;
            case 'modelos-avancados':
                if (typeof window.renderizarModelosAvancados === 'function') window.renderizarModelosAvancados();
                break;
            case 'modelos-preditivos':
                if (typeof window.renderizarModelosPreditivos === 'function') window.renderizarModelosPreditivos();
                break;
            case 'simulador':
                if (typeof window.renderizarSimulador === 'function') window.renderizarSimulador();
                break;
            case 'analise-atas':
                if (typeof window.renderizarAnaliseAtas === 'function') window.renderizarAnaliseAtas(window.dadosAnaliseAtas || null);
                break;
            case 'focus':
                if (typeof window.renderizarFocusAnalytics === 'function') window.renderizarFocusAnalytics(window.dadosFocus || null);
                break;
            case 'agenda-copom':
                if (typeof window.renderizarAgendaCopom === 'function') window.renderizarAgendaCopom();
                break;
            case 'taylor-dinamico':
                // Painel de Taylor é carregado automático via script próprio
                break;
            default:
                console.warn(`Nenhuma função específica para inicializar a aba ${tabId}.`);
        }
    } catch (error) {
        console.error(`Erro ao inicializar componentes da aba ${tabId}:`, error);
    }
}

window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1);
    showTab(hash || 'dashboard');
});

window.addEventListener('load', () => {
    const initialHash = window.location.hash.substring(1);
    showTab(initialHash || 'dashboard');
});
