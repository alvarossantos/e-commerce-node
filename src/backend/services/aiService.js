/**
 * AIService — Integração multi-provedor para IA generativa.
 * Suporta: OpenAI, Google Gemini, OpenRouter (modelos free).
 *
 * Todos usam o SDK da OpenAI como cliente, pois os três provedores
 * são compatíveis com o formato de API da OpenAI.
 *
 * Variáveis de ambiente relevantes:
 *   AI_PROVIDER        — "openai" | "gemini" | "openrouter" (padrão: openai)
 *   OPENAI_API_KEY     — Chave da API da OpenAI
 *   GEMINI_API_KEY     — Chave da API do Google AI Studio
 *   OPENROUTER_API_KEY — Chave da API do OpenRouter
 *   AI_MODEL           — Override manual do modelo (opcional)
 */
const OpenAI = require('openai');
const pool = require('../config/database');

// ──────────────────────────────────────────────
//  Configuração Multi-Provedor
// ──────────────────────────────────────────────

/**
 * Mapeamento de provedores: { baseURL, envKey, defaultModel }
 */
const PROVIDERS = {
    openai: {
        baseURL: 'https://api.openai.com/v1',
        envKey: 'OPENAI_API_KEY',
        defaultModel: 'gpt-4o-mini',
        label: 'OpenAI',
    },
    gemini: {
        // Google expõe um endpoint compatível com OpenAI
        baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
        envKey: 'GEMINI_API_KEY',
        defaultModel: 'gemini-2.0-flash',
        label: 'Google Gemini',
    },
    openrouter: {
        baseURL: 'https://openrouter.ai/api/v1',
        envKey: 'OPENROUTER_API_KEY',
        defaultModel: 'inclusionai/ling-3.0-flash:free',
        label: 'OpenRouter',
    },
};

/**
 * Retorna o provedor ativo com base na variável AI_PROVIDER.
 */
function getProviderName() {
    return (process.env.AI_PROVIDER || 'openai').toLowerCase();
}

/**
 * Retorna a config do provedor ativo.
 */
function getActiveProvider() {
    const name = getProviderName();
    const provider = PROVIDERS[name];
    if (!provider) {
        throw {
            tipo: 'PROVEDOR_INVALIDO',
            mensagem: `Provedor "${name}" não é válido. Opções: openai, gemini, openrouter`,
        };
    }
    return { name, ...provider };
}

/**
 * Retorna o modelo ativo (AI_MODEL override > default do provedor).
 */
function getActiveModel() {
    const provider = getActiveProvider();
    return process.env.AI_MODEL || provider.defaultModel;
}

/**
 * Obtém a chave da API do provedor ativo.
 */
function getApiKey() {
    const provider = getActiveProvider();
    const key = process.env[provider.envKey];
    if (!key) {
        throw {
            tipo: 'API_KEY_AUSENTE',
            mensagem: `Chave do provedor "${provider.label}" não configurada. Defina ${provider.envKey} no .env`,
        };
    }
    return key;
}

function getApiKeySilent() {
    const provider = getActiveProvider();
    return process.env[provider.envKey] || null;
}

/**
 * Cria e retorna um cliente OpenAI apontando para o provedor ativo.
 */
function getClient() {
    const provider = getActiveProvider();
    const apiKey = getApiKey();

    return new OpenAI({
        baseURL: provider.baseURL,
        apiKey,
    });
}

// ──────────────────────────────────────────────
//  Feature 1: Gerador de Descrição de Produto
// ──────────────────────────────────────────────

/**
 * Gera uma descrição persuasiva para um produto.
 *
 * @param {object} produto — { nome, categoria, preco }
 * @returns {Promise<string>} descrição gerada pela IA
 */
async function gerarDescricaoProduto({ nome, categoria, preco }) {
    const client = getClient();
    const model = getActiveModel();

    const messages = [
        {
            role: 'system',
            content: `Você é um copywriter especializado em e-commerce de tecnologia.
Escreva descrições de produtos persuasivas, informativas e otimizadas para SEO.
Regras:
- Escreva em português brasileiro
- Use tom profissional mas acessível
- Inclua benefícios do produto para o cliente
- Mencione features técnicas relevantes quando fizer sentido
- Não invente especificações que não foram fornecidas
- Máximo de 3 parágrafos curtos
- Não use títulos ou markdown, apenas texto corrido`
        },
        {
            role: 'user',
            content: `Gere uma descrição para o seguinte produto:
- Nome: ${nome}
- Categoria: ${categoria}
- Preço: R$ ${parseFloat(preco).toFixed(2)}`
        }
    ];

    const response = await client.chat.completions.create({
        model,
        messages,
        max_tokens: 400,
        temperature: 0.7,
    });

    return response.choices[0].message.content.trim();
}

// ──────────────────────────────────────────────
//  Feature 2: Chatbot de Suporte
// ──────────────────────────────────────────────

/**
 * Monta o contexto do chatbot: produtos, pedidos do usuário, FAQs.
 */
async function montarContextoChatbot(usuarioId) {
    const partes = [];

    const { rows: produtos } = await pool.query(`
        SELECT p.nome, p.preco, p.categoria,
               COALESCE(e.quantidade, 0) AS estoque
        FROM produtos p
        LEFT JOIN estoque e ON p.id = e.produto_id
        ORDER BY p.id DESC
        LIMIT 20
    `);

    if (produtos.length > 0) {
        const catalogo = produtos.map(p =>
            `- ${p.nome} (R$ ${parseFloat(p.preco).toFixed(2)}) | Estoque: ${p.estoque} | Cat: ${p.categoria}`
        ).join('\n');
        partes.push(`CATÁLOGO DE PRODUTOS ATUAIS:\n${catalogo}`);
    }

    if (usuarioId) {
        const { rows: pedidos } = await pool.query(`
            SELECT p.id, p.status, p.valor_total, p.data_criacao::date as data
            FROM pedidos p
            WHERE p.usuario_id = $1
            ORDER BY p.data_criacao DESC
            LIMIT 5
        `, [usuarioId]);

        if (pedidos.length > 0) {
            const historico = pedidos.map(p =>
                `  Pedido #${p.id} — R$ ${parseFloat(p.valor_total).toFixed(2)} — Status: ${p.status} — Data: ${p.data}`
            ).join('\n');
            partes.push(`ÚLTIMOS PEDIDOS DO CLIENTE:\n${historico}`);
        }
    }

    return partes.join('\n\n');
}

/**
 * Processa uma mensagem do chatbot e retorna a resposta da IA.
 */
async function responderChat(mensagem, historico = [], usuarioId = null) {
    const client = getClient();
    const model = getActiveModel();
    const contexto = await montarContextoChatbot(usuarioId);

    const systemPrompt = `Você é o assistente virtual da NexStore, uma loja online de tecnologia, hardware e periféricos.

SOBRE A LOJA:
- Nome: NexStore
- Categorias: Hardware, Periféricos, Portáteis, Gamer, Monitores
- Políticas: Entrega em até 7 dias úteis, troca em 30 dias com nota fiscal
- Contato: contato@nexstore.com.br | (31) 99999-0000

SUAS FUNCIONALIDADES:
- Informar sobre produtos (nome, preço, disponibilidade)
- Acompanhar status de pedidos do cliente logado
- Responder dúvidas sobre a loja, entregas, trocas e devoluções
- Ajudar a encontrar o produto ideal

REGRAS:
- Responda sempre em português brasileiro
- Seja simpático, prestativo e objetivo
- Se não souber a resposta, diga que o cliente pode entrar em contato com o suporte humano
- Não invente informações sobre preços ou disponibilidade — use apenas os dados do contexto
- Para assuntos muito específicos ou reclamações, redirecione para contato@nexstore.com.br
- Maximo de 3 frases por resposta
- NÃO use markdown, apenas texto simples`;

    const messages = [
        { role: 'system', content: systemPrompt },
        ...(contexto ? [{ role: 'system', content: contexto }] : []),
        ...historico,
        { role: 'user', content: mensagem },
    ];

    const response = await client.chat.completions.create({
        model,
        messages,
        max_tokens: 300,
        temperature: 0.7,
    });

    return response.choices[0].message.content.trim();
}

// ──────────────────────────────────────────────
//  Utilitário: Status da configuração
// ──────────────────────────────────────────────

/**
 * Retorna um resumo da configuração atual de IA (para debug/admin).
 * NÃO expõe chaves de API.
 */
function getStatusIA() {
    const providerName = getProviderName();
    const provider = PROVIDERS[providerName];
    const model = getActiveModel();
    const hasKey = !!getApiKeySilent();

    return {
        provedor: provider.label,
        provedorId: providerName,
        modelo: model,
        chaveConfigurada: hasKey,
        baseURL: provider.baseURL,
        pronto: hasKey,
    };
}

module.exports = {
    gerarDescricaoProduto,
    responderChat,
    getStatusIA,
    getProviderName,
    getActiveModel,
};
