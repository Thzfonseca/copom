/**
 * Módulo para exibir a agenda de reuniões do COPOM.
 */

class AgendaCopom {
    constructor() {
        this.reunioes2025 = [
            { data: "28 e 29 de Janeiro", status: "Realizada", decisao: "Aumento de 25 pontos-base (14.00%)" },
            { data: "18 e 19 de Março", status: "Realizada", decisao: "Aumento de 25 pontos-base (14.25%)" },
            { data: "06 e 07 de Maio", status: "Próxima" },
            { data: "17 e 18 de Junho", status: "Agendada" },
            { data: "29 e 30 de Julho", status: "Agendada" },
            { data: "16 e 17 de Setembro", status: "Agendada" },
            { data: "28 e 29 de Outubro", status: "Agendada" },
            { data: "09 e 10 de Dezembro", status: "Agendada" }
        ];
    }

    /**
     * Retorna a lista de reuniões de 2025.
     */
    getAgenda() {
        return this.reunioes2025;
    }

    /**
     * Renderiza a agenda na página.
     * @param {string} containerId - ID do elemento container onde a agenda será renderizada.
     */
    renderAgenda(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container com ID '${containerId}' não encontrado para renderizar a agenda.`);
            return;
        }

        let html = 
        `<div class="card bg-dark text-light mb-4">
            <div class="card-header"><h3>Agenda COPOM 2025</h3></div>
            <div class="card-body">
                <table class="table table-dark table-striped table-hover">
                    <thead>
                        <tr>
                            <th scope="col">Data</th>
                            <th scope="col">Status</th>
                            <th scope="col">Decisão / Observação</th>
                        </tr>
                    </thead>
                    <tbody>`;

        this.reunioes2025.forEach(reuniao => {
            let statusClass = '';
            switch (reuniao.status) {
                case 'Realizada': statusClass = 'text-secondary'; break;
                case 'Próxima': statusClass = 'text-warning fw-bold'; break;
                case 'Agendada': statusClass = 'text-info'; break;
            }
            html += 
            `<tr>
                <td>${reuniao.data}</td>
                <td class="${statusClass}">${reuniao.status}</td>
                <td>${reuniao.decisao || '-'}</td>
            </tr>`;
        });

        html += 
                    `</tbody>
                </table>
                <p class="card-text"><small class="text-muted">Fonte: Banco Central do Brasil (Calendário oficial de 2025)</small></p>
            </div>
        </div>`;

        container.innerHTML = html;
    }
}

// Exportar a classe para ser usada em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgendaCopom;
} else {
    window.AgendaCopom = AgendaCopom;
}

