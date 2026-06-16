# Changelog — NexStore

Todas as mudanças notáveis deste projeto são documentadas aqui.  
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/)  
e adota [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [Não lançado]

> Funcionalidades planejadas ou em desenvolvimento.

### Planejado
- Integração com gateway de pagamento (ex: Stripe, Mercado Pago)
- Recuperação de senha por e-mail
- Paginação no catálogo de produtos
- Sistema de cupons de desconto
- Exportação de relatórios em PDF para o admin

---

## [1.3.0] — 2025-06-15

### Adicionado
- **API REST completa** sob `/api/` com endpoints JSON para autenticação, produtos, carrinho, pedidos e perfil
- **6 novos routers de API:** `authApiRoutes.js`, `produtosApiRoutes.js`, `lojaApiRoutes.js`, `carrinhoApiRoutes.js`, `pedidosApiRoutes.js`, `usuariosApiRoutes.js`
- **Documentação da API REST** na seção 9 do README
- **Alpine.js** para microinteratividade reativa (contador de carrinho, toast de notificações)

### Corrigido
- Carrinho de visitantes agora faz merge corretamente ao fazer login
- Cookie do token JWT agora usa flag `secure` baseada em `NODE_ENV` (produção)
- Contas inativas agora são bloqueadas no login (EJS e API REST)
- Alpine.js fixado em versão específica (`@3.14.9`) para evitar quebras
- README atualizado com variável `DB_PASS` correta
- Removida dependência morta `express-session`

---

## [1.2.0] — 2025-06-02

### Adicionado
- **Testes automatizados** com Jest + Supertest (auth, produtos, carrinho, pedidos)
- **Dockerfile** multi-stage para ambiente de produção
- **docker-compose.yml** orquestrando app + PostgreSQL com healthcheck
- **GitHub Actions CI/CD** — pipeline que roda testes em todo push/PR e publica imagem Docker na branch main
- **Documentação de rotas** (`docs/api.html`) com todos os endpoints, parâmetros e respostas

### Alterado
- `package.json` — adicionado Jest e Supertest como devDependencies
- `package.json` — script `test` agora executa Jest com cobertura

---

## [1.1.0] — 2025-05-20

### Adicionado
- Painel administrativo com dashboard analítico (faturamento, alertas de estoque)
- Gestão de status de pedidos pelo admin
- Upload e processamento de imagens de produtos via Multer + Sharp
- Sistema de avaliações de produtos (nota 1–5 + comentário)
- Trigger PostgreSQL para devolução de estoque ao cancelar pedido

### Corrigido
- Carrinho não mantinha itens corretamente após merge no login
- Estoque negativo em situações de concorrência (resolvido via trigger atômico)

---

## [1.0.0] — 2025-05-01

### Adicionado
- Estrutura inicial do projeto com arquitetura **MVC + Repository Pattern**
- Autenticação completa: registro, login e logout com **JWT** em cookie HttpOnly
- Hash seguro de senhas com **Bcrypt**
- Catálogo de produtos com busca e filtro por categoria
- **Carrinho híbrido**: cookies para visitantes, banco de dados para usuários logados
- Checkout completo com seleção de endereço
- Histórico de pedidos e página de recibo por pedido
- Banco de dados **PostgreSQL** com triggers automáticos de estoque
- Frontend responsivo com **Bootstrap 5** e **EJS**
- `database.sql` com DDL, índices, triggers e dados de exemplo

---

## Como criar uma Release no GitHub

Após cada versão, siga estes passos para criar um Release oficial:

```bash
# 1. Certifique-se de estar na branch main e que os testes passam
git checkout main
npm test

# 2. Commit com as mudanças do CHANGELOG
git add CHANGELOG.md
git commit -m "chore: atualiza CHANGELOG para v1.2.0"

# 3. Crie e suba a tag de versão
git tag -a v1.2.0 -m "Release v1.2.0 — Testes, Docker e documentação"
git push origin main --tags
```

**No GitHub:**
1. Acesse a aba **Releases** do repositório
2. Clique em **"Draft a new release"**
3. Selecione a tag `v1.2.0`
4. Título: `v1.2.0 — Testes, Docker e Documentação`
5. Cole o conteúdo do bloco `[1.2.0]` deste CHANGELOG na descrição
6. Publique a release ✅

---

> Formato dos tipos de mudança:
> - **Adicionado** — novas funcionalidades
> - **Alterado** — mudanças em funcionalidades existentes
> - **Depreciado** — funcionalidades que serão removidas
> - **Removido** — funcionalidades removidas
> - **Corrigido** — correção de bugs
> - **Segurança** — correções de vulnerabilidades
