# 🛒 NexStore | E-commerce em Node.js

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white)

Um sistema completo de comércio eletrônico (E-commerce) desenvolvido do zero utilizando **Node.js** e **PostgreSQL**. Focado em performance, segurança e numa arquitetura de software limpa, o projeto atende tanto ao fluxo de compras do cliente quanto à gestão administrativa do negócio.

---

## 📖 1. O que é o projeto?

A **Nex****Store** é uma plataforma de vendas online *Full-Stack*. O seu grande diferencial é a aplicação da arquitetura **MVC (Model-View-Controller)** com o padrão de **Repositories**, garantindo um código altamente modular e fácil de manter.

O sistema possui duas frentes principais:

* **Visão do Cliente (Loja):** Navegação de catálogo, sistema de busca, carrinho de compras híbrido (funciona via *Cookies* para visitantes e via *Banco de Dados* para utilizadores logados), checkout completo, emissão de recibos e histórico de pedidos.
* **Visão do Administrador (Painel):** Dashboard analítico (cálculo de faturamento, total de vendas e alertas de estoque baixo), gestão de produtos e controle do status de entrega dos pedidos.

---

## 🚀 2. Tecnologias Usadas

O projeto foi construído utilizando as seguintes ferramentas:

**Back-end:**

* **Node.js & Express.js:** Motor principal da aplicação e rotas.
* **PostgreSQL (`pg`):** Banco de dados relacional robusto para garantir a integridade das transações financeiras e controle de estoque.
* **JWT (JSON Web Tokens) & Cookies:** Para autenticação segura e manutenção de sessão.
* **Bcrypt:** Para criptografia de senhas no banco de dados.

**Front-end:**

* **EJS (Embedded JavaScript):** Motor de templates dinâmicos integrado nativamente com o back-end.
* **Bootstrap 5:** Framework CSS para um design responsivo (*Mobile-First*), moderno e limpo.
* **FontAwesome:** Biblioteca de ícones.

---

## 🏗️ 3. Estrutura do Projeto

O código está rigorosamente organizado para separar a interface visual das lógicas de negócio e banco de dados:

```text
📦 e-commerce-node
 ┣ 📂 src
 ┃ ┣ 📂 backend
 ┃ ┃ ┣ 📂 config           # Conexão com o banco de dados (pool PostgreSQL)
 ┃ ┃ ┣ 📂 controllers      # Lógica de negócio (Carrinho, Pedidos, Admin, etc.)
 ┃ ┃ ┣ 📂 middlewares      # Segurança (Autenticação, Verificação de Admin, Detetive de Carrinho)
 ┃ ┃ ┣ 📂 repositories     # Comunicação direta com o banco de dados (SQL queries)
 ┃ ┃ ┗ 📂 routes           # Definição dos endpoints (URLs) do sistema
 ┃ ┗ 📂 frontend
 ┃   ┣ 📂 static           # Arquivos estáticos (CSS, Imagens dos produtos)
 ┃   ┗ 📂 views
 ┃     ┗ 📂 templates      # Telas dinâmicas em HTML/EJS (Layouts, Dashboard, Checkout)
 ┣ 📜 server.js            # Ponto de entrada da aplicação
 ┣ 📜 package.json         # Dependências do projeto
 ┗ 📜 .env                 # Variáveis de ambiente (não versionado)

```

---

## ⚙️ 4. Como Usar (Rodando Localmente)

Siga os passos abaixo para testar a aplicação na sua máquina:

### Pré-requisitos

* Ter o **Node.js** instalado (versão 18+ recomendada).
* Ter o **PostgreSQL** instalado e a rodar.

### Passo a Passo

**1. Clone este repositório:**

```bash
git clone [https://github.com/alvarossantos/e-commerce-node.git](https://github.com/alvarossantos/e-commerce-node.git)
cd e-commerce-node

```

**2. Instale as dependências:**

```bash
npm install

```

**3. Configure o Banco de Dados:**

* Crie um banco de dados no seu PostgreSQL (ex: `ecommerce_db`).
* Rode os scripts SQL fornecidos no projeto para criar as tabelas (`usuarios`, `produtos`, `carrinhos`, `pedidos`, etc.).

**4. Configure as Variáveis de Ambiente:**
Crie um arquivo chamado `.env` na raiz do projeto e preencha com as suas credenciais:

```env
PORT=3000
DB_HOST=localhost
DB_USER=seu_usuario_postgres
DB_PASS=sua_senha_postgres
DB_NAME=ecommerce_db
DB_PORT=5432
JWT_SECRET=sua_chave_secreta_super_segura

```

**5. Inicie o servidor:**

```bash
# Para desenvolvimento (reinicia automaticamente)
npm run dev

# Para produção
npm start

```

**6. Acesse no navegador:**
Abra `http://localhost:3000` e aproveite o sistema!

---

*Desenvolvido com dedicação por Álvaro Santos.*
