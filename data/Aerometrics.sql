-- Nível 1: Geografia
CREATE TABLE pais (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    codigo_iso CHAR(2) UNIQUE NOT NULL
);

CREATE TABLE regiao (
    id SERIAL PRIMARY KEY,
    pais_id INTEGER REFERENCES pais(id),
    nome VARCHAR(100) NOT NULL
);

-- Nível 2: Estrutura Base
CREATE TABLE aeroporto (
    id SERIAL PRIMARY KEY,
    regiao_id INTEGER REFERENCES regiao(id),
    nome VARCHAR(150) NOT NULL,
    codigo_iata CHAR(3) UNIQUE NOT NULL,
    cidade VARCHAR(100),
    ativo BOOLEAN DEFAULT TRUE
);

CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    aeroporto_id INTEGER REFERENCES aeroporto(id),
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha_hash TEXT NOT NULL,
    perfil VARCHAR(20) CHECK (perfil IN ('colaborador', 'supervisor', 'gerente', 'admin')),
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tipo_servico (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE
);

CREATE TABLE meta_operacional (
    id SERIAL PRIMARY KEY,
    aeroporto_id INTEGER REFERENCES aeroporto(id),
    percentual_meta DECIMAL(5,2) NOT NULL,
    vigencia_inicio DATE NOT NULL,
    vigencia_fim DATE NOT NULL
);

-- Nível 3 e 4: Operação e Lançamentos
CREATE TABLE voo (
    id SERIAL PRIMARY KEY,
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
    id SERIAL PRIMARY KEY,
    voo_id INTEGER REFERENCES voo(id),
    usuario_id INTEGER REFERENCES usuario(id),
    inicio TIMESTAMP,
    fim TIMESTAMP,
    status VARCHAR(20),
    observacoes TEXT
);

CREATE TABLE lancamento (
    id SERIAL PRIMARY KEY,
    atendimento_id INTEGER REFERENCES atendimento(id),
    tipo_servico_id INTEGER REFERENCES tipo_servico(id),
    usuario_id INTEGER REFERENCES usuario(id),
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duracao_min INTEGER,
    maquinas_utilizadas TEXT,
    origem VARCHAR(20) DEFAULT 'app_mobile',
    observacoes TEXT
);