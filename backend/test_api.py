from fastapi.testclient import TestClient
from api import app

# Cria um cliente de teste que simula o navegador acessando a sua API
client = TestClient(app)

def test_api_online():
    # Tenta acessar a rota principal ("/")
    response = client.get("/")
    
    # Verifica se o servidor respondeu com sucesso (Código 200)
    assert response.status_code == 200
    # Verifica se a mensagem de retorno está correta
    assert response.json() == {"mensagem": "API do AeroMetrics está rodando com sucesso!"}  