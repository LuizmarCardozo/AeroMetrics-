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
    diretorio_atual = os.path.dirname(os.path.abspath(__file__))
    caminho_banco = os.path.join(diretorio_atual, "..", "data", "Aerometrics.db")
    conn = sqlite3.connect(caminho_banco)
    conn.row_factory = sqlite3.Row 
    return conn

@app.get("/api/relatorios/geral")
def obter_relatorio_geral():
    try:
        conn = conectar_banco()
        cursor = conn.cursor()

        # Traz os dados unindo aeroporto e os registros
        query = """
            SELECT 
                a.regiao, a.pais, a.sigla, a.responsavel,
                r.scm_day_before, r.scm_yesterday, r.voos_diarios,
                r.fsc_desktop, r.fsc_mobile
            FROM aeroporto a
            JOIN relatorio_operacional r ON a.sigla = r.aeroporto_sigla
            ORDER BY a.sigla
        """
        cursor.execute(query)
        dados = [dict(row) for row in cursor.fetchall()]
        conn.close()

        # Calcula os totais do LATAM/BRAZIL para o rodapé
        total_voos = sum(d['voos_diarios'] for d in dados)
        media_desktop = sum(d['fsc_desktop'] for d in dados) / len(dados) if dados else 0
        media_mobile = sum(d['fsc_mobile'] for d in dados) / len(dados) if dados else 0

        return {
            "aeroportos": dados,
            "totais": {
                "voos": total_voos,
                "desktop": round(media_desktop, 1),
                "mobile": round(media_mobile, 1)
            }
        }
    except Exception as e:
        return {"erro": str(e)}