
# ✈️ AeroManager: Sistema de Gestão de Operações  

O **AeroManager** é uma plataforma robusta projetada para otimizar o fluxo operacional em aeroportos, permitindo o acompanhamento em tempo real de voos, atendimentos em solo e métricas de desempenho. O sistema integra desde a infraestrutura geográfica até o controle detalhado de lançamentos de serviços por colaboradores.

## 🚀 Tecnologias Utilizadas

  * **Backend:** Java 17+ com Spring Boot.
  * **Frontend:** Java (Spring MVC/Thymeleaf ou JavaFX).
  * **Banco de Dados:** PostgreSQL (SQL ANSI).
  * **Segurança:** Spring Security com criptografia de senhas (BCrypt).

-----

## 📊 Arquitetura do Banco de Dados

O banco de dados foi projetado em camadas para garantir escalabilidade e integridade referencial:

1.  **Geografia:** Controle de Países e Regiões.
2.  **Estrutura:** Aeroportos, Usuários (RBAC) e Tipos de Serviço.
3.  **Planejamento:** Metas operacionais por aeroporto.
4.  **Operação:** Gestão de Voos, Atendimentos e Lançamentos de serviços em campo.

-----

## 🛠️ Estrutura das Tabelas (SQL)

O sistema utiliza as seguintes entidades principais:

  * `usuario`: Gerenciamento de acessos com perfis de *colaborador*, *supervisor*, *gerente* e *admin*.
  * `voo`: Registro de horários previstos vs. realizados e status.
  * `atendimento`: Controle de tempo (check-in/check-out) de equipes em cada aeronave.
  * `lancamento`: Registro detalhado de serviços prestados (ex: limpeza, abastecimento, catering) via app mobile.

-----

## ⚙️ Funcionalidades Principais

  * **Painel de Controle (Dashboard):** Visualização de metas operacionais e status de voos.
  * **Gestão de Atendimento:** Registro de início e fim de serviços para cálculo de eficiência.
  * **Logs de Serviço:** Histórico detalhado de máquinas utilizadas e duração das atividades.
  * **Hierarquia Geográfica:** Suporte a múltiplos aeroportos em diferentes regiões e países.

-----

## 🏁 Como Iniciar

### Pré-requisitos

  * Java JDK 17 ou superior.
  * PostgreSQL 14 ou superior.
  * Maven.

### Instalação

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/aero-manager.git
    ```
2.  **Configure o Banco de Dados:**
      * Crie um banco de dados chamado `aeromanager`.
      * Execute os scripts SQL localizados em `/src/main/resources/db/migration`.
3.  **Configure o `application.properties`:**
      * Ajuste as credenciais do seu PostgreSQL (`spring.datasource.username` e `password`).
4.  **Execute a aplicação:**
    ```bash
    mvn spring-boot:run
    ```

-----

## 👥 Contribuição

1.  Faça um **Fork** do projeto.
2.  Crie uma **Branch** para sua feature (`git checkout -b feature/NovaFeature`).
3.  De um **Commit** nas suas alterações (`git commit -m 'Adicionando nova funcionalidade'`).
4.  Dê um **Push** na Branch (`git push origin feature/NovaFeature`).
5.  Abra um **Pull Request**.

