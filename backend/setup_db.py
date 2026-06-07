import sqlite3
import os

diretorio_atual = os.path.dirname(os.path.abspath(__file__))
pasta_data = os.path.join(diretorio_atual, "..", "data")
caminho_banco = os.path.join(pasta_data, "Aerometrics.db")
os.makedirs(pasta_data, exist_ok=True)

conn = sqlite3.connect(caminho_banco)
cursor = conn.cursor()

script_sql = """
DROP TABLE IF EXISTS relatorio_operacional;
DROP TABLE IF EXISTS aeroporto;

-- Tabela de Aeroportos e Responsáveis
CREATE TABLE aeroporto (
    sigla CHAR(3) PRIMARY KEY,
    regiao VARCHAR(50),
    pais VARCHAR(50),
    responsavel VARCHAR(100)
);

-- Tabela do 2º Passo (Dados capturados do App/Desktop)
CREATE TABLE relatorio_operacional (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aeroporto_sigla CHAR(3) REFERENCES aeroporto(sigla),
    data_registro DATE,
    voos_diarios INTEGER,
    scm_day_before DECIMAL(5,2),
    scm_yesterday DECIMAL(5,2),
    fsc_desktop DECIMAL(5,2),
    fsc_mobile DECIMAL(5,2)
);

-- Inserindo a base de Aeroportos (Igual à imagem)
INSERT INTO aeroporto (sigla, regiao, pais, responsavel) VALUES 
('BSB', 'LATAM', 'BRAZIL', 'Ricardo Manoel'),
('CGH', 'LATAM', 'BRAZIL', 'Lucas Delfino'),
('GIG', 'LATAM', 'BRAZIL', 'Lasaro Correia'),
('GRU', 'LATAM', 'BRAZIL', 'Karina Freire'),
('SDU', 'LATAM', 'BRAZIL', 'Victor Nunes'),
('SSA', 'LATAM', 'BRAZIL', 'Claudio Pereira'),
('VIX', 'LATAM', 'BRAZIL', 'Nayara Vetorin');

-- Inserindo os dados capturados simulando o fechamento do dia
INSERT INTO relatorio_operacional (aeroporto_sigla, data_registro, voos_diarios, scm_day_before, scm_yesterday, fsc_desktop, fsc_mobile) VALUES 
('BSB', '2026-03-05', 250, 90.2, 89.6, 33.0, 87.3),
('CGH', '2026-03-05', 348, 92.1, 93.9, 16.2, 92.6),
('GIG', '2026-03-05', 213, 90.1, 98.0, 13.6, 91.4),
('GRU', '2026-03-05', 68,  97.0, 88.2, 11.0, 89.0),
('SDU', '2026-03-05', 143, 99.4, 98.7, 24.9, 97.7),
('SSA', '2026-03-05', 41,  100.0, 100.0, 5.7, 99.2),
('VIX', '2026-03-05', 51,  93.9, 97.2, 11.1, 88.9);
"""

cursor.executescript(script_sql)
conn.commit()
conn.close()

print("✅ Banco atualizado com os dados do Relatório de SCM!")