# 🏡 Rental Properties Manager

Sistema fullstack para **gestão de imóveis de temporada**, com backend em **Spring Boot** e frontend em **React + TypeScript**.  
Foi pensado para simular um cenário mais próximo da realidade, com imóveis, reservas, regras de negócio e uma interface em estilo painel.

> 💡 Projeto criado para servir como peça forte de portfólio para vagas júnior (backend / fullstack).

---

## 📌 Visão geral

O *Rental Properties Manager* permite:

- Cadastrar imóveis de temporada (título, localização, diária, capacidade, descrição, status).
- Listar imóveis em um painel com filtros por status.
- Cadastrar reservas vinculadas a um imóvel existente.
- Visualizar as reservas registradas via API.
- Consumir a API a partir de uma interface web com layout de dashboard.

A stack foi escolhida para mostrar domínio de:

- **Java + Spring Boot** no backend.
- **React + TypeScript** no frontend.
- Integração real entre as duas pontas.
- Organização de código, DTOs, validação, camadas e boas práticas básicas.

---

## 🧱 Arquitetura do projeto

Estrutura do repositório:

```text
rental-properties-manager/
├── rental-properties-api/   # Backend - Spring Boot (Java)
└── rental-properties-web/   # Frontend - React + TypeScript (Vite)
Backend (rental-properties-api)
Aplicação Spring Boot com:

Camada de domínio (domain) – entidades JPA (Property, Reservation) + enums de status.

Camada de infraestrutura (infra) – repositórios JPA.

Camada de aplicação (application) – controllers + DTOs de request/response.

Banco em memória com H2, para facilitar testes locais.

Validação com Jakarta Bean Validation (@NotBlank, @NotNull, etc).

Frontend (rental-properties-web)
Aplicação React criada com Vite.

TypeScript em todo o código.

Layout em formato de painel:

Sidebar fixa (logo, descrição).

Área principal com lista de imóveis + formulário de cadastro.

Consumo da API de propriedades via fetch.

🛠️ Tecnologias usadas
Backend
Java 17

Spring Boot 3

Spring Web

Spring Data JPA

H2 Database (em memória)

Jakarta Validation

Frontend
React

TypeScript

Vite

CSS puro (com foco em UI mais moderna/dark)

Ferramentas auxiliares
Postman (testes de API)

H2 Console (/h2-console) para inspecionar o banco em memória

▶️ Como rodar o projeto localmente
✅ Pré-requisitos
Java 17 instalado e configurado.

Node.js (recomendado 18+).

Git instalado.

Navegador moderno (Chrome, Edge, etc).

1️⃣ Clonar o repositório
bash
Copiar código
git clone https://github.com/thiagolemos23/rental-properties-manager.git
cd rental-properties-manager
2️⃣ Subir o backend (API – Spring Boot)
Dentro da pasta do backend:

bash
Copiar código
cd rental-properties-api
Windows
bash
Copiar código
.\mvnw spring-boot:run
Linux / MacOS
bash
Copiar código
./mvnw spring-boot:run
Se tudo der certo, a aplicação sobe em:

http://localhost:8080

🔍 H2 Console
Você pode acessar o banco em memória em:

URL: http://localhost:8080/h2-console

JDBC URL: jdbc:h2:mem:rentaldb

Usuário: sa

Senha: (vazia)

3️⃣ Subir o frontend (React + TS)
Em outro terminal, na raiz do projeto, vá para a pasta do front:

bash
Copiar código
cd rental-properties-web
npm install
npm run dev
O Vite vai subir algo como:

http://localhost:5173

⚠️ O frontend está configurado para consumir a API em
http://localhost:8080.
Certifique-se de que o backend esteja rodando antes de abrir o front.

📚 Modelo de dados (resumo)
Entidade Property (Imóvel)
Campos principais:

id – identificador

title – título do imóvel (ex.: “Casa Moana - Beira-mar”)

type – tipo (casa, flat, loft, campo, etc.)

location – localização (ex.: “Porto de Galinhas - PE”)

status – enum (AVAILABLE, BLOCKED, INACTIVE)

nightlyPrice – valor da diária

maxGuests – capacidade máxima de hóspedes

description – descrição do imóvel

createdAt / updatedAt – timestamps (quando definidos)

Entidade Reservation (Reserva)
Campos principais:

id – identificador

property – referência ao imóvel (Property)

guestName – nome do hóspede

guestEmail – e-mail do hóspede

checkIn – data de entrada

checkOut – data de saída

status – enum (BOOKED, CANCELLED, COMPLETED)

totalPrice – valor total da reserva
(calculado a partir dos dias × diária do imóvel)

createdAt – data de criação da reserva

🌐 Endpoints principais da API
🏠 Propriedades (/properties)
GET /properties
Lista todos os imóveis.

Resposta (exemplo):

json
Copiar código
[
  {
    "id": 1,
    "title": "Casa Moana - Beira-mar em Porto de Galinhas",
    "type": "Casa de praia",
    "location": "Porto de Galinhas - PE",
    "status": "AVAILABLE",
    "nightlyPrice": 1200.00,
    "maxGuests": 12,
    "description": "Casa pé na areia com deck, piscina e varanda gourmet."
  }
]
GET /properties?location=porto
Busca imóveis filtrando por parte da localização (case-insensitive).

GET /properties/{id}
Busca um imóvel específico pelo ID.
Retorna 404 se não existir.

POST /properties
Cria um novo imóvel.

Body (exemplo):

json
Copiar código
{
  "title": "Casa de Campo - Vista para as montanhas",
  "type": "Casa de campo",
  "location": "Gravatá - PE",
  "nightlyPrice": 850.0,
  "maxGuests": 10,
  "description": "Casa de campo com área verde e espaço para eventos intimistas."
}
Validações:

title, type, location → obrigatórios (@NotBlank)

nightlyPrice, maxGuests → obrigatórios (@NotNull)

PUT /properties/{id}
Atualiza um imóvel existente.

Body (estrutura igual ao POST)
Retorna 404 se o ID não existir.

DELETE /properties/{id}
Remove um imóvel.
Retorna:

204 No Content se deletou.

404 Not Found se o ID não existir.

📅 Reservas (/reservations)
GET /reservations
Lista todas as reservas cadastradas.

POST /reservations
Cria uma nova reserva associada a um imóvel.

Body (exemplo):

json
Copiar código
{
  "propertyId": 1,
  "guestName": "João Silva",
  "guestEmail": "joao@example.com",
  "checkIn": "2026-02-10",
  "checkOut": "2026-02-15"
}
Regras típicas implementadas:

checkOut deve ser depois de checkIn.

propertyId deve existir.

totalPrice é calculado com base na diária do imóvel × número de noites.

Status inicial geralmente começa como BOOKED.

💻 Frontend – visão geral
A tela principal inclui:

Sidebar (esquerda):

Logo “RENTAL PROPERTIES”

Subtítulo explicando a ideia do painel

Texto de contexto focado em imóveis de temporada

Main (direita):

Header com título + botão principal

Card com “filtros” (Todos, Disponíveis, Bloqueados)

Lista de imóveis carregada da API

Card com formulário para cadastrar um novo imóvel

Cada imóvel na lista exibe:

Título

Localização

Tipo

Status (badge colorida)

Capacidade

Diária formatada

Descrição

🚀 Próximos passos / ideias de evolução
Algumas melhorias que podem ser implementadas (e que ajudam a mostrar crescimento contínuo):

 Tela de reservas no frontend (listagem e criação por imóvel).

 Autenticação básica (login admin) para gerenciar imóveis e reservas.

 Persistência em banco real (PostgreSQL) via Docker.

 Deploy da API (Railway/Render) + deploy do frontend (Vercel/Netlify).

 Testes automatizados no backend (Spring Boot Test) e no frontend (Vitest/React Testing Library).

 Filtros avançados (por valor de diária, capacidade, cidade, status de reserva).

👨‍💻 Autor
Thiago Espinoza – Desenvolvedor full stack júnior

GitHub: @thiagolemos23

LinkedIn: (adicionar aqui quando quiser linkar)

Sinta-se à vontade para abrir issues, sugerir melhorias ou deixar feedback técnico. 🙂

perl
Copiar código

Se você quiser, no próximo passo eu posso:

- enxugar esse README em uma versão **“resumida para vaga”** (pra colar no texto do projeto no LinkedIn/GitHub), ou  
- montar um **segundo projeto section** pro seu LinkedIn usando exatamente esse texto, adaptado pra seção de “Projetos”.
::contentReference[oaicite:0]{index=0}