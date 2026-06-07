/**
 * Arquitetura MVC (Model-View-Controller)
 * Sistema AeroMetrics Web + API Python (FastAPI) + Chart.js + Exportação PDF.
 */

// ==========================================
// 1. MODEL - Dados e regras de negócio
// ==========================================
class AeroMetricsModel {
    constructor() {
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

    async fetchRelatorioGeral() {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/relatorios/geral');
            if (!response.ok) throw new Error("Erro ao conectar com a API Python. Verifique se o uvicorn está rodando.");
            const dados = await response.json();
            if (dados.erro) throw new Error("Erro retornado pelo banco de dados: " + dados.erro);
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
        
        // Elementos do Relatório
        this.scmTbody = document.getElementById('scm-tbody');
        this.platformTbody = document.getElementById('platform-tbody');
        this.platformTfoot = document.getElementById('platform-tfoot');
        this.loadingMsg = document.getElementById('loading-message');
        this.errorMsg = document.getElementById('error-message');
        
        // Elementos de Alternância e Exportação
        this.viewControls = document.getElementById('view-controls');
        this.reportTables = document.getElementById('report-content-tables');
        this.reportCharts = document.getElementById('report-content-charts');
        this.btnShowTables = document.getElementById('btn-show-tables');
        this.btnShowCharts = document.getElementById('btn-show-charts');
        this.btnExportPdf = document.getElementById('btn-export-pdf');
        this.pdfHeaderTitle = document.getElementById('pdf-header-title');

        // Instâncias dos gráficos
        this.chartScmInstance = null;
        this.chartPlatformInstance = null;

        this.bindViewToggles();
        this.bindPdfExport();
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
                <td style="padding: 12px; border-bottom: 1px solid #eee;"><strong>${op.id}</strong></td>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">${op.aeroporto}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">${op.status}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">${op.tempo}</td>
            `;
            this.operationsBody.appendChild(tr);
        });
    }

    mostrarCarregando() {
        this.loadingMsg.style.display = 'block';
        this.errorMsg.style.display = 'none';
        this.viewControls.style.display = 'none';
        this.reportTables.style.display = 'none';
        this.reportCharts.style.display = 'none';
    }

    mostrarErro(mensagem) {
        this.loadingMsg.style.display = 'none';
        this.errorMsg.style.display = 'block';
        this.errorMsg.textContent = mensagem;
    }

    bindViewToggles() {
        this.btnShowTables.addEventListener('click', () => {
            this.btnShowTables.classList.add('active');
            this.btnShowCharts.classList.remove('active');
            this.reportTables.style.display = 'block';
            this.reportCharts.style.display = 'none';
        });

        this.btnShowCharts.addEventListener('click', () => {
            this.btnShowCharts.classList.add('active');
            this.btnShowTables.classList.remove('active');
            this.reportTables.style.display = 'none';
            this.reportCharts.style.display = 'flex';
        });
    }

    bindPdfExport() {
        this.btnExportPdf.addEventListener('click', () => {
            // 1. Elemento alvo da captura
            const containerRelatorio = document.getElementById('pdf-report-container');

            // 2. Guarda o estado de visualização atual do usuário
            const estadoTabelasOriginal = this.reportTables.style.display;
            const estadoGraficosOriginal = this.reportCharts.style.display;

            // 3. Preparação Visual: Ativa a classe especial para PDF e força a exibição combinada
            containerRelatorio.classList.add('pdf-export-mode');
            this.viewControls.style.display = 'none';
            this.pdfHeaderTitle.style.display = 'block';
            this.reportTables.style.display = 'block';
            this.reportCharts.style.display = 'flex';

            // 4. Configuração fina do documento PDF (Ajustado para evitar cortes)
            const opcoesPdf = {
                margin:       [10, 10, 10, 10], // Margens [top, left, bottom, right]
                filename:     'Relatorio_Gerencial_AeroMetrics.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                // windowWidth: 1280 garante que os gráficos não se apertem num ecrã pequeno
                html2canvas:  { scale: 2, useCORS: true, logging: false, windowWidth: 1280 },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' },
                pagebreak:    { mode: ['css', 'legacy'] } // Lê o nosso CSS para quebrar a página antes dos gráficos
            };

            // 5. Executa a geração do PDF e baixa o arquivo
            html2pdf().set(opcoesPdf).from(containerRelatorio).save().then(() => {
                // 6. Restaura a interface original
                containerRelatorio.classList.remove('pdf-export-mode');
                this.viewControls.style.display = 'flex';
                this.pdfHeaderTitle.style.display = 'none';
                this.reportTables.style.display = estadoTabelasOriginal;
                this.reportCharts.style.display = estadoGraficosOriginal;
                console.log("✅ PDF gerado e baixado com sucesso!");
            }).catch(erro => {
                console.error("Erro na exportação do PDF:", erro);
                containerRelatorio.classList.remove('pdf-export-mode');
                this.viewControls.style.display = 'flex';
                this.pdfHeaderTitle.style.display = 'none';
            });
        });
    }

    renderRelatorios(dados) {
        this.loadingMsg.style.display = 'none';
        this.errorMsg.style.display = 'none';
        this.viewControls.style.display = 'flex';
        this.reportTables.style.display = 'block';

        // Preenche Tabela 1: SCM
        this.scmTbody.innerHTML = '';
        dados.aeroportos.forEach((aero, index) => {
            const bateuMeta = aero.scm_yesterday >= 85;
            const corFundoYesterday = bateuMeta ? '#e6f4ea' : '#fce8e6';
            const corTextoYesterday = bateuMeta ? '#137333' : '#c5221f';
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                ${index === 0 ? `<td rowspan="${dados.aeroportos.length}" style="text-align: center; border: 1px solid #ccc; background-color: #fff; font-size: 13px;"><strong>${aero.regiao}</strong></td>` : ''}
                ${index === 0 ? `<td rowspan="${dados.aeroportos.length}" style="text-align: center; border: 1px solid #ccc; background-color: #fff; font-size: 13px;"><strong>${aero.pais}</strong></td>` : ''}
                <td style="text-align: center; border: 1px solid #ccc; font-size: 13px;">${aero.sigla}</td>
                <td style="text-align: center; border: 1px solid #ccc; font-size: 13px;">${aero.scm_day_before.toFixed(1)}%</td>
                <td style="text-align: center; border: 1px solid #ccc; background-color: ${corFundoYesterday}; color: ${corTextoYesterday}; font-weight: bold; font-size: 13px;">
                    ${aero.scm_yesterday.toFixed(1)}%
                </td>
                <td style="text-align: center; border: 1px solid #ccc; font-size: 13px;">${aero.voos_diarios}</td>
                <td style="border: 1px solid #ccc; padding-left: 10px; font-size: 13px;">${aero.responsavel}</td>
            `;
            this.scmTbody.appendChild(tr);

            // Preenche Tabela 2: Plataformas
            const trPlat = document.createElement('tr');
            trPlat.innerHTML = `
                <td style="color: #666; font-weight: bold; border: 1px solid #eee; text-align: left; padding-left: 10px; font-size: 13px;">${aero.sigla}</td>
                <td style="text-align: center; border: 1px solid #eee; font-size: 13px;">${aero.fsc_desktop.toFixed(1)}%</td>
                <td style="text-align: center; border: 1px solid #eee; font-size: 13px;">${aero.fsc_mobile.toFixed(1)}%</td>
                <td style="text-align: center; border: 1px solid #eee; font-size: 13px;">${aero.voos_diarios}</td>
            `;
            this.platformTbody.appendChild(trPlat);
        });

        this.platformTfoot.innerHTML = `
            <tr>
                <td style="text-align: left; padding: 10px; border: 1px solid #ccc; color: #333; font-size: 13px;">&#9663; Total LATAM / BRAZIL</td>
                <td style="padding: 10px; border: 1px solid #ccc; font-size: 13px;">${dados.totais.desktop}%</td>
                <td style="padding: 10px; border: 1px solid #ccc; font-size: 13px;">${dados.totais.mobile}%</td>
                <td style="padding: 10px; border: 1px solid #ccc; font-size: 13px;">${dados.totais.voos}</td>
            </tr>
        `;

        this.renderizarGraficosBI(dados);
    }

    renderizarGraficosBI(dados) {
        const labelsAeroportos = dados.aeroportos.map(a => a.sigla);
        
        // Gráfico 1: SCM
        const ctxScm = document.getElementById('chart-scm').getContext('2d');
        const scmData = dados.aeroportos.map(a => a.scm_yesterday);
        const coresScm = scmData.map(valor => valor >= 85 ? 'rgba(40, 167, 69, 0.8)' : 'rgba(220, 53, 69, 0.8)');

        if (this.chartScmInstance) this.chartScmInstance.destroy();
        this.chartScmInstance = new Chart(ctxScm, {
            type: 'bar',
            data: {
                labels: labelsAeroportos,
                datasets: [{
                    label: '% SCM Registrado',
                    data: scmData,
                    backgroundColor: coresScm,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true, max: 100 } },
                animation: false // Desativar animação garante que o PDF capte a imagem pronta instantaneamente
            }
        });

        // Gráfico 2: Plataformas
        const ctxPlatform = document.getElementById('chart-platform').getContext('2d');
        const desktopData = dados.aeroportos.map(a => a.fsc_desktop);
        const mobileData = dados.aeroportos.map(a => a.fsc_mobile);

        if (this.chartPlatformInstance) this.chartPlatformInstance.destroy();
        this.chartPlatformInstance = new Chart(ctxPlatform, {
            type: 'bar',
            data: {
                labels: labelsAeroportos,
                datasets: [
                    { label: '% Uso Desktop', data: desktopData, backgroundColor: '#3c8dbc', borderRadius: 4 },
                    { label: '% Uso Mobile', data: mobileData, backgroundColor: '#f39c12', borderRadius: 4 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true, max: 100 } },
                animation: false
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

                if (targetId === 'bi-area' && !this.biCarregado) {
                    await this.carregarRelatorioGeral();
                }
            });
        });
    }

    async carregarRelatorioGeral() {
        this.view.mostrarCarregando();
        try {
            const dadosRelatorio = await this.model.fetchRelatorioGeral();
            this.view.renderRelatorios(dadosRelatorio); 
            this.biCarregado = true; 
        } catch (erro) {
            this.view.mostrarErro(erro.message);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new AeroMetricsController(new AeroMetricsModel(), new AeroMetricsView());
});