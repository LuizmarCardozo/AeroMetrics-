/**
 * Arquitetura MVC (Model-View-Controller)
 * Sistema AeroMetrics Web + API Python (FastAPI) + Chart.js.
 */

// ==========================================
// 1. MODEL - Dados e regras de negócio
// ==========================================
class AeroMetricsModel {
    constructor() {
        // Dados rápidos para o Dashboard Principal
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

    getOperacoes() { return this.operacoes; }
    getIndicadores() { return this.indicadores; }

    // Busca os dados diretamente da nova API Python
    async fetchDadosBI() {
        try {
            // Fazendo a requisição HTTP para a API FastAPI
            const response = await fetch('http://127.0.0.1:8000/api/bi/dados');
            
            if (!response.ok) {
                throw new Error("Erro ao conectar com a API Python. Verifique se o uvicorn está rodando no terminal.");
            }

            const dados = await response.json();
            
            if (dados.erro) {
                throw new Error("Erro retornado pelo banco de dados: " + dados.erro);
            }

            return dados;
            
        } catch (erro) {
            console.error("Erro no Model (BI):", erro);
            throw erro; 
        }
    }
}

// ==========================================
// 2. VIEW - Interface do sistema
// ==========================================
class AeroMetricsView {
    constructor() {
        this.scmValue = document.getElementById('scm-value');
        this.activeFlights = document.getElementById('active-flights');
        this.goalsStatus = document.getElementById('goals-status');
        this.operationsBody = document.getElementById('operations-body');

        this.menuButtons = document.querySelectorAll('.menu-btn');
        this.sections = document.querySelectorAll('.content-section');
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

    // --- Métodos do BI ---
    renderCarregandoBI() {
        this.biAreaFrame.innerHTML = `<div style="color: #666; font-style: italic; text-align: center; padding: 40px;">Conectando à API Python e gerando gráficos...</div>`;
    }

    renderErroBI(mensagem) {
        this.biAreaFrame.innerHTML = `
            <div style="color: #dc3545; background: #fff3f3; padding: 20px; border-radius: 8px; border-left: 4px solid #dc3545;">
                <strong>Erro ao processar BI:</strong><br><br>
                ${mensagem}
            </div>
        `;
    }

    renderTabelaBI(dados) {
        // Verifica se há dados retornados pela API
        if (!dados.voos || dados.voos.length === 0) {
            this.biAreaFrame.innerHTML = `<div style="padding: 20px; color: #666; text-align: center;">Conectado à API com sucesso, mas o banco de dados está vazio. Insira alguns voos e lançamentos para ver os gráficos.</div>`;
            return;
        }

        // Cria o HTML estruturando a área para receber os gráficos do Chart.js
        this.biAreaFrame.innerHTML = `
            <div style="display: flex; gap: 20px; flex-wrap: wrap; width: 100%;">
                
                <div style="flex: 1; min-width: 300px; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #eaeaea;">
                    <h3 style="text-align: center; margin-bottom: 20px; color: #444; font-size: 16px;">Status dos Voos</h3>
                    <div style="position: relative; height: 250px; width: 100%; display: flex; justify-content: center;">
                        <canvas id="chartVoos"></canvas>
                    </div>
                </div>

                <div style="flex: 1; min-width: 300px; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #eaeaea;">
                    <h3 style="text-align: center; margin-bottom: 20px; color: #444; font-size: 16px;">Tempo Gasto por Serviço (Min)</h3>
                    <div style="position: relative; height: 250px; width: 100%;">
                        <canvas id="chartServicos"></canvas>
                    </div>
                </div>

            </div>
        `;

        // ==========================================
        // DESENHANDO OS GRÁFICOS COM CHART.JS
        // ==========================================

        // 1. Gráfico de Voos (Rosca/Pizza)
        const ctxVoos = document.getElementById('chartVoos').getContext('2d');
        const labelsVoos = dados.voos.map(v => v.status.toUpperCase());
        const valuesVoos = dados.voos.map(v => v.quantidade);

        new Chart(ctxVoos, {
            type: 'doughnut',
            data: {
                labels: labelsVoos,
                datasets: [{
                    data: valuesVoos,
                    backgroundColor: ['#f39c12', '#00a65a', '#dd4b39', '#3c8dbc'],
                    borderWidth: 1
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });

        // 2. Gráfico de Serviços (Barras)
        const ctxServicos = document.getElementById('chartServicos').getContext('2d');
        const labelsServicos = dados.servicos.map(s => s.servico);
        const valuesServicos = dados.servicos.map(s => s.tempo_total);

        new Chart(ctxServicos, {
            type: 'bar',
            data: {
                labels: labelsServicos,
                datasets: [{
                    label: 'Minutos Totais',
                    data: valuesServicos,
                    backgroundColor: '#3c8dbc',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
}

// ==========================================
// 3. CONTROLLER - Orquestração
// ==========================================
class AeroMetricsController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.biCarregado = false; 

        this.init();
    }

    init() {
        this.view.renderIndicators(this.model.getIndicadores());
        this.view.renderOperationsTable(this.model.getOperacoes());
        this.bindMenuNavigation();
    }

    bindMenuNavigation() {
        this.view.menuButtons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
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

                // Carrega o BI apenas quando a aba é acessada e se ainda não foi carregado
                if (targetId === 'bi-area' && !this.biCarregado) {
                    await this.carregarBI();
                }
            });
        });
    }

    async carregarBI() {
        this.view.renderCarregandoBI();
        try {
            const dadosBI = await this.model.fetchDadosBI();
            this.view.renderTabelaBI(dadosBI); // Agora desenha gráficos reais!
            this.biCarregado = true; 
        } catch (erro) {
            this.view.renderErroBI(erro.message);
        }
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    const app = new AeroMetricsController(new AeroMetricsModel(), new AeroMetricsView());
});