import sqlite3
import os

# 1. Define o caminho exato para a pasta 'data' (mesma lógica da sua API)
diretorio_atual = os.path.dirname(os.path.abspath(__file__))
pasta_data = os.path.join(diretorio_atual, "..", "data")
caminho_banco = os.path.join(pasta_data, "Aerometrics.db")

# Garante que a pasta 'data' existe
os.makedirs(pasta_data, exist_ok=True)

print(f"🛠️ Criando/Atualizando o banco de dados em: {caminho_banco}")

# 2. Conecta ao banco (isso já cria o arquivo .db fisicamente se ele não existir)
conn = sqlite3.connect(caminho_banco)
cursor = conn.cursor()

# 3. Executa o Script SQL completo (Criação de Tabelas + Inserção de Dados)
script_sql = """
-- ========================================================
-- LIMPEZA INICIAL: Remove as tabelas antigas se existirem
-- ========================================================
DROP TABLE IF EXISTS lancamento;
DROP TABLE IF EXISTS atendimento;
DROP TABLE IF EXISTS voo;
DROP TABLE IF EXISTS meta_operacional;
DROP TABLE IF EXISTS tipo_servico;
DROP TABLE IF EXISTS usuario;
DROP TABLE IF EXISTS aeroporto;
DROP TABLE IF EXISTS regiao;
DROP TABLE IF EXISTS pais;

-- ========================================================
-- CRIAÇÃO DAS TABELAS (Estrutura SQLite)
-- ========================================================
CREATE TABLE pais (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(100) NOT NULL,
    codigo_iso CHAR(2) UNIQUE NOT NULL
);

CREATE TABLE regiao (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pais_id INTEGER REFERENCES pais(id),
    nome VARCHAR(100) NOT NULL
);

CREATE TABLE aeroporto (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    regiao_id INTEGER REFERENCES regiao(id),
    nome VARCHAR(150) NOT NULL,
    codigo_iata CHAR(3) UNIQUE NOT NULL,
    cidade VARCHAR(100),
    ativo BOOLEAN DEFAULT TRUE
);

CREATE TABLE usuario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aeroporto_id INTEGER REFERENCES aeroporto(id),
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha_hash TEXT NOT NULL,
    perfil VARCHAR(20) CHECK (perfil IN ('colaborador', 'supervisor', 'gerente', 'admin')),
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tipo_servico (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE
);

CREATE TABLE meta_operacional (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aeroporto_id INTEGER REFERENCES aeroporto(id),
    percentual_meta DECIMAL(5,2) NOT NULL,
    vigencia_inicio DATE NOT NULL,
    vigencia_fim DATE NOT NULL
);

CREATE TABLE voo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aeroporto_id INTEGER REFERENCES aeroporto(id),
    numero_voo VARCHAR(20) NOT NULL,
    companhia VARCHAR(100),
    data_voo DATE NOT NULL,
    hora_prevista TIME,
    hora_real TIME,
    status VARCHAR(20) DEFAULT 'previsto',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE atendimento (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    voo_id INTEGER REFERENCES voo(id),
    usuario_id INTEGER REFERENCES usuario(id),
    inicio TIMESTAMP,
    fim TIMESTAMP,
    status VARCHAR(20),
    observacoes TEXT
);

CREATE TABLE lancamento (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    atendimento_id INTEGER REFERENCES atendimento(id),
    tipo_servico_id INTEGER REFERENCES tipo_servico(id),
    usuario_id INTEGER REFERENCES usuario(id),
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duracao_min INTEGER,
    maquinas_utilizadas TEXT,
    origem VARCHAR(20) DEFAULT 'app_mobile',
    observacoes TEXT
);

-- ========================================================
-- INSERÇÃO DE DADOS DE TESTE (Para o BI e Gráficos)
-- ========================================================
INSERT INTO tipo_servico (nome, descricao) VALUES ('Abastecimento', 'Abastecimento de combustível');
INSERT INTO tipo_servico (nome, descricao) VALUES ('Bagagem', 'Carga e descarga de malas');
INSERT INTO tipo_servico (nome, descricao) VALUES ('Limpeza', 'Limpeza interna da aeronave');

INSERT INTO aeroporto (nome, codigo_iata) VALUES ('Guarulhos', 'GRU');

-- Inserindo Voos com status variados para o gráfico de pizza
INSERT INTO voo (aeroporto_id, numero_voo, status, data_voo) VALUES (1, 'G3-1001', 'Atrasado', '2026-05-31');
INSERT INTO voo (aeroporto_id, numero_voo, status, data_voo) VALUES (1, 'G3-1002', 'Concluída', '2026-05-31');
INSERT INTO voo (aeroporto_id, numero_voo, status, data_voo) VALUES (1, 'G3-1003', 'Concluída', '2026-05-31');
INSERT INTO voo (aeroporto_id, numero_voo, status, data_voo) VALUES (1, 'G3-1004', 'Em Andamento', '2026-05-31');
INSERT INTO voo (aeroporto_id, numero_voo, status, data_voo) VALUES (1, 'G3-1005', 'Em Andamento', '2026-05-31');

-- Inserindo Atendimentos
INSERT INTO atendimento (voo_id, status) VALUES (2, 'finalizado');
INSERT INTO atendimento (voo_id, status) VALUES (3, 'finalizado');

-- Inserindo Lançamentos de tempo para o gráfico de barras
INSERT INTO lancamento (atendimento_id, tipo_servico_id, duracao_min) VALUES (1, 1, 45);
INSERT INTO lancamento (atendimento_id, tipo_servico_id, duracao_min) VALUES (1, 2, 30);
INSERT INTO lancamento (atendimento_id, tipo_servico_id, duracao_min) VALUES (2, 1, 50);
INSERT INTO lancamento (atendimento_id, tipo_servico_id, duracao_min) VALUES (2, 3, 25);
"""

# Executa todo o script acima
cursor.executescript(script_sql)

# Salva as alterações e fecha a conexão
conn.commit()
conn.close()

print("✅ Banco de dados criado e populado com sucesso!")