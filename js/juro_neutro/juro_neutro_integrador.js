/**
 * Função integradora para o módulo de juro real neutro
 * 
 * Esta função é responsável por inicializar e integrar todos os componentes
 * relacionados ao juro real neutro, incluindo a visualização dos modelos
 * e o simulador.
 */

// Namespace global para a função integradora
window.atualizarJuroNeutro = function() {
    console.log("Inicializando módulo integrado de juro real neutro...");
    
    // Verificar se os componentes necessários estão disponíveis
    if (typeof window.juroNeutro === "undefined") {
        console.error("Componente juroNeutro não encontrado");
        return;
    }
    
    // Renderizar a visualização dos modelos de juro neutro
    if (typeof window.juroNeutro.renderizarJuroNeutro === "function") {
        console.log("Renderizando visualização de juro neutro");
        window.juroNeutro.renderizarJuroNeutro();
    } else {
        console.error("Função renderizarJuroNeutro não encontrada");
    }
    
    // Inicializar o simulador de juro neutro
    if (typeof window.simuladorJuroNeutro !== "undefined" && 
        typeof window.simuladorJuroNeutro.inicializar === "function") {
        console.log("Inicializando simulador de juro neutro");
        window.simuladorJuroNeutro.inicializar();
        
        // Configurar os controles do simulador
        configurarControlesSimulador();
    } else {
        console.error("Componente simuladorJuroNeutro não encontrado");
    }
    
    console.log("Módulo integrado de juro real neutro inicializado com sucesso");
};

// Função para configurar os controles do simulador
function configurarControlesSimulador() {
    console.log("Configurando controles do simulador de juro neutro");
    
    // Configurar os sliders e seus eventos
    const sliders = [
        { id: "inflacao-esperada", valorId: "inflacao-esperada-valor", sufixo: "%" },
        { id: "hiato-produto", valorId: "hiato-produto-valor", sufixo: "%" },
        { id: "crescimento-pib", valorId: "crescimento-pib-valor", sufixo: "%" },
        { id: "risco-pais", valorId: "risco-pais-valor", sufixo: "" },
        { id: "taxa-juros-eua", valorId: "taxa-juros-eua-valor", sufixo: "%" }
    ];
    
    sliders.forEach(slider => {
        const sliderElement = document.getElementById(slider.id);
        const valorElement = document.getElementById(slider.valorId);
        
        if (sliderElement && valorElement) {
            // Atualizar o valor exibido quando o slider muda
            sliderElement.addEventListener("input", function() {
                const valor = parseFloat(this.value).toFixed(2);
                valorElement.textContent = valor + slider.sufixo;
                
                // Atualizar a simulação quando os parâmetros mudam
                if (typeof window.simuladorJuroNeutro !== "undefined" && 
                    typeof window.simuladorJuroNeutro.atualizarSimulacao === "function") {
                    window.simuladorJuroNeutro.atualizarSimulacao(obterParametrosSimulacao());
                }
            });
        } else {
            console.error(`Elemento não encontrado: ${slider.id} ou ${slider.valorId}`);
        }
    });
    
    // Inicializar a simulação com os valores padrão
    if (typeof window.simuladorJuroNeutro !== "undefined" && 
        typeof window.simuladorJuroNeutro.atualizarSimulacao === "function") {
        window.simuladorJuroNeutro.atualizarSimulacao(obterParametrosSimulacao());
    }
}

// Função para obter os parâmetros atuais da simulação
function obterParametrosSimulacao() {
    return {
        inflacaoEsperada: parseFloat(document.getElementById("inflacao-esperada").value),
        hiatoProduto: parseFloat(document.getElementById("hiato-produto").value),
        crescimentoPib: parseFloat(document.getElementById("crescimento-pib").value),
        riscoPais: parseFloat(document.getElementById("risco-pais").value),
        taxaJurosEua: parseFloat(document.getElementById("taxa-juros-eua").value)
    };
}
