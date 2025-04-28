// js/script.js

// Controle do Spinner de Carregamento
function mostrarLoading() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.style.display = 'flex';
}

function esconderLoading() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.style.display = 'none';
}

// Sistema de Tabs do Dashboard
function showTab(tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.style.display = 'none');

    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.style.display = 'block';
        initializeTabComponents(tabId);
    }
}

function initializeTabComponents(tabId) {
    if (tabId === 'simulador' && typeof window.renderizarSimulador === 'function') {
        window.renderizarSimulador();
    }
}

window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1);
    showTab(hash || 'dashboard');
});

window.addEventListener('load', () => {
    const initialHash = window.location.hash.substring(1);
    showTab(initialHash || 'dashboard');
    esconderLoading();
});

document.addEventListener('DOMContentLoaded', () => {
    mostrarLoading();
});
