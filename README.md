
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

* **Visão do Cliente (Loja):** Navegação de catálogo, sistema de busca, carrinho de compras híbrido (funciona via *Cookies* para visitantes e via *Banco de Dados* para utilizadores logados), checkout completo, emissão de recibos e histórico de pedidos.
* **Visão do Administrador (Painel):** Dashboard analítico (cálculo de faturamento, total de vendas e alertas de estoque baixo), gestão de produtos e controle do status de entrega dos pedidos.

Além disso, o projeto adota práticas avançadas de engenharia de software, incluindo **containerização (Docker)**, **pipeline de CI/CD (GitHub Actions)**, **cobertura de testes automatizados** e **documentação visual de API**.

---

## 🚀 2. Tecnologias Usadas

O projeto foi construído utilizando as seguintes ferramentas:

**Back-end:**
* **Node.js & Express.js:** Motor principal da aplicação e rotas.
* **PostgreSQL (`pg`):** Banco de dados relacional robusto.
* **JWT & Cookies:** Autenticação segura e manutenção de sessão.
* **Bcrypt:** Criptografia de senhas no banco de dados.

**Front-end:**
* **EJS:** Motor de templates dinâmicos integrado nativamente.
* **Bootstrap 5 & FontAwesome:** Interface responsiva (*Mobile-First*) e moderna.

**DevOps & Qualidade (QA):**
* **Docker & Docker Compose:** Containerização para padronização de ambientes.
* **Jest & Supertest:** Testes de integração e unitários automatizados.
* **GitHub Actions:** CI/CD para execução automática de testes a cada commit.

---

## 🏗️ 3. Estrutura do Projeto

O código está rigorosamente organizado para separar a interface visual das lógicas de negócio:

```text
📦 e-commerce-node
 ┣ 📂 .github/workflows    # Pipeline de CI/CD (GitHub Actions)
 ┣ 📂 docs                 # Documentação da API em HTML (api.html)
 ┣ 📂 src                  
 ┃ ┣ 📂 backend            # Configurações, Controllers, Middlewares, Repositories e Routes
 ┃ ┗ 📂 frontend           # Arquivos estáticos (CSS/Img) e Views (Templates EJS)
 ┣ 📂 tests                # Testes automatizados (Jest) e mocks do banco de dados
 ┣ 📜 Dockerfile           # Construção da imagem Docker (Multi-stage build)
 ┣ 📜 docker-compose.yml   # Orquestração rápida da aplicação + Banco PostgreSQL
 ┣ 📜 CHANGELOG.md         # Histórico de atualizações e versões do sistema
 ┣ 📜 jest.config.js       # Configurações do robô de testes
 ┣ 📜 server.js            # Ponto de entrada da aplicação
 ┗ 📜 package.json / .env  # Dependências e Variáveis de ambiente

```

---

## ⚙️ 4. Como Usar

Você pode rodar este projeto de forma automatizada (recomendado) ou configurando o ambiente manualmente.

### Opção A: Rodando via Docker (Recomendado)

A forma mais rápida de testar o projeto. O Docker irá subir a aplicação e o banco de dados já configurado simultaneamente.

**1.** Clone o repositório e entre na pasta:

```bash
git clone [https://github.com/alvarossantos/e-commerce-node.git](https://github.com/alvarossantos/e-commerce-node.git)
cd e-commerce-node

```

**2.** Suba os containers com o Docker Compose:

```bash
docker compose up -d

```

**3.** Acesse no navegador:
Abra `http://localhost:3000` e aproveite o sistema! *(O banco de dados será inicializado automaticamente na primeira execução).*

---

### Opção B: Rodando Manualmente (Local)

**Pré-requisitos:** Node.js (v18+) e PostgreSQL instalados.

1. Clone o repositório e instale as dependências:
```bash
npm install

```


2. Crie um banco de dados no PostgreSQL (ex: `ecommerce_db`) e rode os scripts `.sql` fornecidos.
3. Crie o arquivo `.env` na raiz baseado no `.env.example`:
```env
PORT=3000
DB_HOST=localhost
DB_USER=seu_usuario_postgres
DB_PASS=sua_senha_postgres
DB_NAME=ecommerce_db
DB_PORT=5432
JWT_SECRET=sua_chave_secreta_super_segura

```


4. Inicie o servidor:
```bash
npm run dev    # Para desenvolvimento
npm start      # Para produção

```



---

## 🧪 5. Testes Automatizados

A NexStore possui uma suíte de testes robusta (Jest + Supertest) para garantir o funcionamento das regras de negócio (Carrinho, Estoque, Pedidos e Autenticação). O banco de dados é *mockado* (simulado) para que os testes rodem de forma rápida e segura sem alterar dados reais.

Para rodar os testes na sua máquina:

```bash
# Instale as dependências (se ainda não o fez)
npm install

# Execute a suíte de testes
npm test

```

---

## 📚 6. Documentação da API

Toda a documentação dos *endpoints*, modelos de dados, rotas de administrador e fluxos de checkout está detalhada visualmente.

Para consultá-la, basta abrir o arquivo localizado em:
👉 `docs/api.html` diretamente no seu navegador.

---

*Desenvolvido com dedicação por Álvaro Santos.*

```

```