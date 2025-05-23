// analise_atas_ui.js

(function () {
    function renderizarAnaliseAtas(dados) {
        console.log("Renderizando análise de atas...");

        // Verifica se os dados e os resultados existem
        if (!dados || !dados.resultados) {
            console.warn("Nenhum dado de análise NLP encontrado. A aba será exibida vazia.");
            const container = document.getElementById("aba-analise-atas");
            if (container) {
                container.innerHTML = `
                    <div class="alert alert-warning mt-4" role="alert">
                        Dados de Análise de Atas (NLP) não encontrados. Atualize o sistema para visualizar as análises.
                    </div>
                `;
            }
            return;
        }

        const resultados = dados.resultados;

        const container = document.getElementById("aba-analise-atas");
        if (!container) {
            console.error("Elemento da aba 'Análise de Atas' não encontrado no DOM.");
            return;
        }

        // Montagem do conteúdo
        container.innerHTML = `
            <div class="container mt-4">
                <h2 class="text-center">Análise NLP das Atas do COPOM</h2>
                <p class="text-center">Dados atualizados em: ${dados.ultimaAtualizacao || "Data desconhecida"}</p>

                <div class="row mt-5">
                    <div class="col-md-4">
                        <h4>Análise de Sentimento</h4>
                        <ul class="list-group">
                            <li class="list-group-item">Hawkish: ${(resultados.sentimento?.hawkish * 100).toFixed(0) || 0}%</li>
                            <li class="list-group-item">Neutral: ${(resultados.sentimento?.neutral * 100).toFixed(0) || 0}%</li>
                            <li class="list-group-item">Dovish: ${(resultados.sentimento?.dovish * 100).toFixed(0) || 0}%</li>
                        </ul>
                    </div>

                    <div class="col-md-4">
                        <h4>Palavras-Chave</h4>
                        <ul class="list-group">
                            ${(resultados.palavrasChave || [])
                                .slice(0, 5)
                                .map(palavra => `<li class="list-group-item">${palavra.termo} (${palavra.sentimento})</li>`)
                                .join('')}
                        </ul>
                    </div>

                    <div class="col-md-4">
                        <h4>Tópicos Relevantes</h4>
                        <ul class="list-group">
                            ${(resultados.topicos || [])
                                .slice(0, 5)
                                .map(topico => `<li class="list-group-item">${topico.nome} - ${(topico.relevancia * 100).toFixed(0)}%</li>`)
                                .join('')}
                        </ul>
                    </div>
                </div>

                <div class="row mt-5">
                    <div class="col-md-12">
                        <h4>Forward Guidance</h4>
                        <ul class="list-group">
                            ${(resultados.forwardGuidance || [])
                                .map(item => `<li class="list-group-item"><strong>${item.data}:</strong> ${item.texto}</li>`)
                                .join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    // Deixa a função disponível globalmente
    window.renderizarAnaliseAtas = renderizarAnaliseAtas;
})();
