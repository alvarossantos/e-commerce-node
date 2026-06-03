# ════════════════════════════════════════════════════════════
#  Dockerfile — NexStore (e-commerce-node)
#  Multi-stage build: reduz tamanho final da imagem
# ════════════════════════════════════════════════════════════

# ── Stage 1: instalar dependências ───────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copia apenas os arquivos de dependências primeiro (aproveita cache do Docker)
COPY package*.json ./

# Instala somente dependências de produção
RUN npm ci --omit=dev


# ── Stage 2: imagem final ─────────────────────────────────────
FROM node:20-alpine AS runner

# Boa prática: não rodar como root
RUN addgroup -S nexstore && adduser -S nexstore -G nexstore

WORKDIR /app

# Copia as dependências já instaladas do stage anterior
COPY --from=deps /app/node_modules ./node_modules

# Copia o código-fonte da aplicação
COPY . .

# Define que o usuário sem privilégios será o dono dos arquivos
RUN chown -R nexstore:nexstore /app

USER nexstore

# Porta que o Express escuta (deve bater com PORT no .env)
EXPOSE 3000

# Variáveis de ambiente com valores padrão (sobrescritas pelo docker-compose)
ENV NODE_ENV=production \
    PORT=3000

# Healthcheck: o Docker verifica se a app está respondendo
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1

# Comando de inicialização
CMD ["node", "server.js"]
