
# 🛒 NexStore | E-commerce em Node.js

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/github%20actions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white)

Um sistema completo de comércio eletrônico (E-commerce) desenvolvido do zero utilizando **Node.js** e **PostgreSQL**. Focado em performance, segurança e numa arquitetura de software limpa, o projeto atende tanto ao fluxo de compras do cliente quanto à gestão administrativa do negócio, contando com infraestrutura profissional de **DevOps** e **QA**.

---

## 📖 1. O que é o projeto?

A **NexStore** é uma plataforma de vendas online *Full-Stack*. O seu grande diferencial é a aplicação da arquitetura **MVC (Model-View-Controller)** com o padrão de **Repositories**, garantindo um código altamente modular e fácil de manter.

O sistema possui duas frentes principais:

* **Visão do Cliente (Loja):** Navegação de catálogo com busca e filtros por categoria, sistema de avaliações com estrelas, carrinho de compras híbrido (funciona via *Cookies* para visitantes e via *Banco de Dados* para utilizadores logados), checkout completo com seleção de endereço e pagamento, emissão de recibos e histórico de pedidos.
* **Visão do Administrador (Painel):** Dashboard analítico com KPIs (faturamento, total de vendas, usuários registrados e alertas de estoque baixo), gestão completa de produtos (CRUD com upload de imagens via Sharp) e controle do status de entrega dos pedidos.

Além disso, o projeto adota práticas avançadas de engenharia de software, incluindo **containerização (Docker)**, **pipeline de CI/CD (GitHub Actions)**, **cobertura de testes automatizados**, **proteção CSRF**, **acessibilidade (a11y)** e **SEO otimizado**.

---

## 🚀 2. Tecnologias Usadas

**Back-end:**
* **Node.js & Express.js 5:** Motor principal da aplicação e rotas.
* **PostgreSQL (`pg`):** Banco de dados relacional com pool de conexões.
* **JWT & Cookies:** Autenticação segura via token (httpOnly, 24h expiração).
* **Bcrypt:** Criptografia de senhas com salt.
* **Sharp:** Processamento e conversão de imagens para WebP.
* **Multer:** Upload de arquivos em memória.
* **Method Override:** Suporte a PUT/DELETE via formulários HTML.

**Front-end:**
* **EJS:** Motor de templates dinâmicos com layouts separados (admin/cliente).
* **Alpine.js:** Microinteratividade reativa (contador de carrinho, favoritos, quantity selector).
* **Bootstrap 5.3:** Interface responsiva (Mobile-First) e moderna.
* **Font Awesome 6:** Ícones vetoriais.
* **CSS Customizado:** Arquivo externo `main.css` com design system consistente.

**API REST:**
* **Endpoints JSON:** API completa sob `/api/` para integrações futuras (mobile, SPA).
* **Rotas públicas:** Catálogo, detalhe de produtos, vitrine.
* **Rotas autenticadas:** Carrinho, pedidos, perfil, endereços.

**Segurança:**
* **CSRF Protection:** Middleware HMAC-SHA256 com tokens por sessão.
* ** Helmet-ready:** Headers de segurança configuráveis.

**DevOps & Qualidade (QA):**
* **Docker & Docker Compose:** Containerização multi-stage com Alpine.
* **Jest & Supertest:** 34 testes automatizados (integração + unitários).
* **GitHub Actions:** CI/CD com testes automáticos e build Docker.

---

## 🏗️ 3. Estrutura do Projeto

```text
📦 e-commerce-node
 ┣ 📂 .github/workflows     # Pipeline de CI/CD (GitHub Actions)
 ┣ 📂 docs                  # Documentação visual da API (api.html)
 ┣ 📂 src
 ┃ ┣ 📂 backend
 ┃ ┃ ┣ 📂 config            # Conexão com o banco (database.js)
 ┃ ┃ ┣ 📂 controllers       # Lógica de negócio (11 controllers)
 ┃ ┃ ┣ 📂 middlewares        # Auth (JWT), CSRF, Upload (Multer), Carrinho
 ┃ ┃ ┣ 📂 models            # Modelo de dados (Produto, Usuario)
 ┃ ┃ ┣ 📂 repositories      # Queries SQL parametrizadas (7 repositories)
 ┃ ┃ ┗ 📂 routes            # Definição de rotas EJS (11 arquivos)
 ┃ ┃   ┗ 📂 api             # API REST — rotas JSON (6 arquivos)
 ┃ ┗ 📂 frontend
 ┃ ┃ ┣ 📂 static
 ┃ ┃ ┃ ┣ 📂 css/            # CSS externo consolidado (main.css)
 ┃ ┃ ┃ ┗ 📂 img/            # Imagens de produtos e usuários
 ┃ ┃ ┗ 📂 views/templates   # 17 templates EJS com layouts
 ┣ 📂 tests                 # 34 testes automatizados (Jest + Supertest)
 ┃ ┃ ┗ 📂 mocks             # Mock do pool PostgreSQL
 ┣ 📜 Dockerfile            # Build multi-stage (Node 20 Alpine)
 ┣ 📜 docker-compose.yml    # Orquestração App + PostgreSQL
 ┣ 📜 CHANGELOG.md          # Histórico de versões
 ┣ 📜 jest.config.js        # Configuração do Jest
 ┣ 📜 server.js             # Ponto de entrada da aplicação
 ┣ 📜 nodemon.json          # Configuração do Nodemon (dev)
 ┣ 📜 database.sql          # Script SQL (DDL + triggers + seed)
 ┗ 📜 package.json / .env   # Dependências e variáveis de ambiente
```

---

## ⚙️ 4. Como Usar

### Opção A: Rodando via Docker (Recomendado)

**1.** Clone o repositório e entre na pasta:

```bash
git clone https://github.com/alvarossantos/e-commerce-node.git
cd e-commerce-node
```

**2.** Suba os containers:

```bash
docker compose up -d
```

**3.** Acesse no navegador:

Abra `http://localhost:3000`. O banco de dados será inicializado automaticamente na primeira execução.

---

### Opção B: Rodando Manualmente (Local)

**Pré-requisitos:** Node.js (v18+) e PostgreSQL instalados.

**1.** Clone e instale dependências:

```bash
git clone https://github.com/alvarossantos/e-commerce-node.git
cd e-commerce-node
npm install
```

**2.** Crie o banco de dados no PostgreSQL e rode o script `database.sql`:

```bash
psql -U postgres -c "CREATE DATABASE \"e-commerce\";"
psql -U postgres -d "e-commerce" -f database.sql
```

**3.** Crie o arquivo `.env` na raiz:

```env
PORT=4000
DB_USER=postgres
DB_PASSWORD=sua_senha_postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=e-commerce
JWT_SECRET=sua_chave_secreta_super_segura
```

**4.** Inicie o servidor:

```bash
npm run dev     # Desenvolvimento (com Nodemon)
npm start       # Produção
```

---

## 🧪 5. Testes Automatizados

A NexStore possui **34 testes** organizados em 4 suítes:

| Suíte | Cobertura |
|-------|-----------|
| `auth.test.js` | Cadastro (válido, duplicado, incompleto), Login (válido, senha incorreta), Logout |
| `produtos.test.js` | Catálogo (200, vazio), Detalhe (existente, 404, estoque baixo), Admin (redirect sem auth) |
| `carrinho.test.js` | Carrinho vazio, Adicionar item (válido, sem estoque, qtd zero, produto inexistente), Remover, Checkout, Merge híbrido |
| `pedidos.test.js` | Histórico (redirect sem auth), Detalhe, Status válidos, Cálculo de totais, Admin status |

O banco de dados é *mockado* para que os testes rodem rápido sem alterar dados reais.

```bash
npm test                  # Executa todos os testes
npm run test:watch        # Modo watch (re-executa ao salvar)
npm run test:coverage     # Relatório de cobertura
```

---

## 🔒 6. Segurança

| Recurso | Implementação |
|---------|---------------|
| **Autenticação** | JWT via cookie httpOnly (24h expiração) |
| **Senhas** | Bcrypt com salt rounds = 10 |
| **CSRF** | Token HMAC-SHA256 por sessão, validado em POST/PUT/PATCH/DELETE |
| **SQL Injection** | Queries parametrizadas ($1, $2, ...) em todos os repositories |
| **Upload** | Multer com limite de 20MB, aceita apenas imagens (jpeg/png/webp) |
| **RBAC** | Middleware `verificarAdmin` em rotas administrativas |
| **Controle de estoque** | Transações SQL com BEGIN/COMMIT/ROLLBACK no processamento de pedidos |

---

## ♿ 7. Acessibilidade & SEO

**Acessibilidade (a11y):**
* Tag `<main>` com `id` para skip links
* Skip link "Pular para o conteúdo principal"
* Labels associados a inputs (`for/id`)
* `aria-label`, `aria-hidden`, `role` em elementos interativos
* Hierarquia de headings correta (h1 → h2 → h3)
* `autocomplete` em formulários de login/cadastro
* Contraste de cores adequado

**SEO:**
* `<meta name="description">` em todas as páginas
* Open Graph tags (og:title, og:description, og:type)
* `<meta name="robots" content="noindex, nofollow">` no admin
* Favicon SVG por página (🎮 loja, 🛡️ admin)
* `lang="pt-BR"` padronizado

---

## 📚 8. Documentação da API

Toda a documentação dos *endpoints* HTML/EJS está detalhada visualmente em:

👉 `docs/api.html` — abra diretamente no navegador.

---

## 🔌 9. API REST (JSON)

A partir da versão 1.3.0, o NexStore disponibiliza uma API REST completa sob o prefixo `/api/`. Esta API pode ser consumida por clientes mobile, SPAs ou qualquer outro frontend.

### Autenticação

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| `POST` | `/api/auth/login` | Login (retorna JWT no cookie) | Não |
| `POST` | `/api/auth/cadastro` | Cadastro de novo usuário | Não |
| `POST` | `/api/auth/logout` | Logout (limpa cookie) | Não |
| `GET`  | `/api/auth/me` | Dados do usuário logado | Opcional |

### Produtos & Catálogo

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| `GET` | `/api/loja/vitrine` | Produtos da vitrine (busca + categoria) | Não |
| `GET` | `/api/loja/produtos/:id` | Detalhe completo do produto | Não |
| `GET` | `/api/produtos` | Listar todos os produtos | Não |
| `GET` | `/api/produtos/:id` | Buscar produto por ID | Não |
| `POST` | `/api/produtos` | Criar produto | Admin |
| `PUT` | `/api/produtos/:id` | Atualizar produto | Admin |
| `DELETE` | `/api/produtos/:id` | Deletar produto | Admin |

### Carrinho de Compras

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| `GET` | `/api/carrinho` | Listar itens do carrinho | Opcional |
| `POST` | `/api/carrinho/adicionar` | Adicionar item ao carrinho | Opcional |
| `POST` | `/api/carrinho/remover/:id` | Remover item do carrinho | Opcional |
| `POST` | `/api/carrinho/limpar` | Esvaziar carrinho | Opcional |

### Pedidos

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| `GET` | `/api/pedidos` | Listar pedidos do usuário | Sim |
| `GET` | `/api/pedidos/:id` | Detalhe de um pedido | Sim |

### Usuários & Perfil

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| `GET` | `/api/usuarios/me` | Dados completos do perfil | Sim |
| `GET` | `/api/usuarios/me/enderecos` | Endereços do usuário | Sim |

> **Formato de resposta:** Todas as rotas retornam JSON no padrão `{ sucesso: true/false, ... }`.

---

## 📊 10. Resumo Técnico

| Aspecto | Detalhe |
|---------|---------|
| **Nome** | NexStore |
| **Versão** | 1.3.0 |
| **Autor** | Álvaro Santos |
| **Arquitetura** | MVC + Repository Pattern + API REST |
| **Backend** | Express.js 5 + Node.js 20 |
| **Banco** | PostgreSQL 16 (pool de conexões) |
| **Template Engine** | EJS com layouts separados |
| **Frontend Interativo** | Alpine.js (microinteratividade reativa) |
| **API REST** | 6 routers JSON (`/api/*`) — 15+ endpoints |
| **Autenticação** | JWT (cookies httpOnly, 24h) |
| **Senhas** | Bcrypt (salt 10) |
| **Upload** | Multer (memory) + Sharp (WebP) |
| **Carrinho** | Híbrido: cookie (visitante) + banco (logado) |
| **CSRF** | HMAC-SHA256 com expiração de 1h |
| **Testes** | 34 testes (Jest + Supertest) |
| **CI/CD** | GitHub Actions (testes + Docker build) |
| **Containerização** | Docker multi-stage (Alpine) |
| **Frontend** | Bootstrap 5.3 + Alpine.js + CSS customizado |
| **Módulos** | CommonJS |

---

*Desenvolvido com dedicação por Álvaro Santos.*
