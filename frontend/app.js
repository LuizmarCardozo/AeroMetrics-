// ==========================================
// 1. MODEL - Representa os dados e regras de negócio
// ==========================================
class AeroMetricsModel {
    constructor() {
        // Dados simulados iniciais para o Dashboard Principal
        this.operacoes = [
            { id: 'V-101', aeroporto: 'GRU', status: 'Concluída', tempo: '45 min' },
            { id: 'V-102', aeroporto: 'CGH', status: 'Em Andamento', tempo: '15 min' },
            { id: 'V-103', aeroporto: 'BSB', status: 'Atrasada', tempo: '65 min' }
        ];
        
        this.indicadores = {
            scmPercent: 92,
            activeFlights: 12,
            goalsMet: true
        };
    }

    getOperacoes() {
        return this.operacoes;
    }

    getIndicadores() {
        return this.indicadores;
    }

    // Método assíncrono para buscar os dados reais do Banco de Dados para o BI
    async fetchDadosBI() {
        try {
            console.log("Iniciando conexão com Aerometrics.db...");

            // 1. Inicializa o sql.js
            // Obs: Requer a tag <script> do sql-wasm.js no index.html
            const SQL = await initSqlJs({
                locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
            });

            // 2. Busca o arquivo .db (Atenção: o caminho relativo '../data/Aerometrics.db' deve estar correto)
            // Lembre-se: Isso só funciona se você estiver usando um servidor local (ex: Live Server)
            const response = await fetch('../data/Aerometrics.db'); 
            
            if (!response.ok) {
                throw new Error("Não foi possível carregar o arquivo .db. Verifique o caminho e o servidor local.");
            }

            const buffer = await response.arrayBuffer();
            
            // 3. Cria a instância do banco em memória
            const db = new SQL.Database(new Uint8Array(buffer));
            
            // 4. Executa a query de BI (Ajuste "operacoes" e "status" para os nomes reais de suas tabelas/colunas)
            // Aqui estamos simulando uma contagem de registros por status
            const query = "SELECT status, COUNT(*) as quantidade FROM operacoes GROUP BY status";
            const result = db.exec(query);

            if (result.length > 0) {
                return result[0]; // Retorna um objeto com { columns: [...], values: [...] }
            }
            
            return null; // Retorna nulo se a tabela estiver vazia
            
        } catch (erro) {
            console.error("Erro no Model (BI):", erro);
            throw erro; // Repassa o erro para o Controller lidar
        }
    }
}

// ==========================================
// 2. VIEW - Responsável pela interface do sistema
// ==========================================
class AeroMetricsView {
    constructor() {
        // Elementos do Dashboard
        this.scmValue = document.getElementById('scm-value');
        this.activeFlights = document.getElementById('active-flights');
        this.goalsStatus = document.getElementById('goals-status');
        this.operationsBody = document.getElementById('operations-body');

        // Elementos de Navegação
        this.menuButtons = document.querySelectorAll('.menu-btn');
        this.sections = document.querySelectorAll('.content-section');
        
        // Elemento do BI
        this.biAreaFrame = document.querySelector('.blank-bi-frame');
    }

    renderIndicators(data) {
        this.scmValue.textContent = `${data.scmPercent}%`;
        this.activeFlights.textContent = data.activeFlights;
        this.goalsStatus.textContent = data.goalsMet ? 'Atingida' : 'Pendente';
        this.goalsStatus.style.color = data.goalsMet ? '#28a745' : '#dc3545';
    }

    renderOperationsTable(operacoes) {
        this.operationsBody.innerHTML = '';
        operacoes.forEach(op => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${op.id}</strong></td>
                <td>${op.aeroporto}</td>
                <td>${op.status}</td>
                <td>${op.tempo}</td>
            `;
            this.operationsBody.appendChild(tr);
        });
    }

    // --- Métodos específicos do BI ---
    
    renderCarregandoBI() {
        this.biAreaFrame.innerHTML = `<div style="color: #666; font-style: italic;">Conectando ao banco de dados e processando indicadores...</div>`;
    }

    renderErroBI(mensagem) {
        this.biAreaFrame.innerHTML = `<div style="color: #dc3545; font-weight: bold;">Erro ao processar BI: <br><span style="font-weight: normal">${mensagem}</span><br><br>Dica: O projeto está rodando via Live Server? A tabela 'operacoes' existe?</div>`;
    }

    renderTabelaBI(dados) {
        if (!dados) {
            this.biAreaFrame.innerHTML = `<div style="color: #666;">O banco de dados foi lido, mas não há dados para exibir.</div>`;
            return;
        }

        // Constrói uma tabela HTML simples para exibir os dados do SQLite
        let html = `
            <div style="width: 100%; padding: 20px; text-align: left;">
                <h3 style="margin-bottom: 15px; color: #444;">Resultados da Consulta SQL</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background-color: #f0f0f0;">
                            ${dados.columns.map(coluna => `<th style="padding: 10px; border: 1px solid #ddd;">${coluna}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${dados.values.map(linha => `
                            <tr>
                                ${linha.map(valor => `<td style="padding: 10px; border: 1px solid #ddd;">${valor}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        this.biAreaFrame.innerHTML = html;
        this.biAreaFrame.style.display = 'block'; // Remove estilo de placeholder flex centralizado, se necessário
    }
}

// ==========================================
// 3. CONTROLLER - Recebe requisições e processa o fluxo
// ==========================================
class AeroMetricsController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.biCarregado = false; // Flag para não recarregar o banco toda vez que clicar na aba

        this.init();
    }

    init() {
        // Renderiza os dados iniciais do Dashboard principal
        this.view.renderIndicators(this.model.getIndicadores());
        this.view.renderOperationsTable(this.model.getOperacoes());

        // Configura a navegação e escuta os cliques
        this.bindMenuNavigation();
    }

    bindMenuNavigation() {
        this.view.menuButtons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                // Lógica visual: troca abas
                this.view.menuButtons.forEach(b => b.classList.remove('active'));
                this.view.sections.forEach(s => {
                    s.classList.remove('active');
                    s.classList.add('hidden');
                });

                const targetId = e.target.getAttribute('data-target');
                e.target.classList.add('active');
                
                const targetSection = document.getElementById(targetId);
                targetSection.classList.remove('hidden');
                targetSection.classList.add('active');

                // Lógica de Negócio: Se clicou na aba de BI, dispara a conexão com o banco
                if (targetId === 'bi-area' && !this.biCarregado) {
                    await this.carregarBI();
                }
            });
        });
    }

    async carregarBI() {
        this.view.renderCarregandoBI();
        
        try {
            // Solicita os dados ao Model
            const dadosBI = await this.model.fetchDadosBI();
            
            // Pede para a View mostrar os dados
            this.view.renderTabelaBI(dadosBI);
            
            // Marca como carregado para não fazer a requisição de novo na mesma sessão
            this.biCarregado = true; 
            
        } catch (erro) {
            this.view.renderErroBI(erro.message);
        }
    }
}

// ==========================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Instancia os componentes conectando-os
    const app = new AeroMetricsController(new AeroMetricsModel(), new AeroMetricsView());
});