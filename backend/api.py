from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def conectar_banco():
    # Descobre a pasta atual onde está o api.py (pasta backend)
    diretorio_atual = os.path.dirname(os.path.abspath(__file__))
    # Volta uma pasta e entra na pasta data
    caminho_banco = os.path.join(diretorio_atual, "..", "data", "Aerometrics.db")
    
    # Conecta usando o caminho absoluto garantido
    conn = sqlite3.connect(caminho_banco)
    conn.row_factory = sqlite3.Row 
    return conn

@app.get("/")
def read_root():
    return {"mensagem": "API do AeroMetrics está rodando com sucesso!"}

@app.get("/api/bi/dados")
def obter_dados_bi():
    try:
        conn = conectar_banco()
        cursor = conn.cursor()

        # Análise 1: Status dos Voos
        cursor.execute("SELECT status, COUNT(id) as quantidade FROM voo GROUP BY status")
        voos = [dict(row) for row in cursor.fetchall()]

        # Análise 2: Tempo Gasto por Tipo de Serviço
        cursor.execute("""
            SELECT ts.nome as servico, SUM(l.duracao_min) as tempo_total
            FROM lancamento l
            JOIN tipo_servico ts ON l.tipo_servico_id = ts.id
            GROUP BY ts.nome
        """)
        servicos = [dict(row) for row in cursor.fetchall()]

        conn.close()

        return {
            "voos": voos,
            "servicos": servicos
        }
    except Exception as e:
        return {"erro": str(e)}