/**
 * API REST — Inteligência Artificial
 * Endpoints para geração de descrições, chatbot e status do provedor.
 *
 * Provedores suportados: OpenAI, Google Gemini, OpenRouter
 * Selecionado pela variável de ambiente AI_PROVIDER.
 */
const express = require('express');
const router = express.Router();
const { gerarDescricaoProduto, responderChat, getStatusIA } = require('../../services/aiService');
const { verificarLogadoOpcional } = require('../../middlewares/authMiddleware');

// ── Status do provedor ──────────────────────

// GET /api/ia/status — Retorna qual provedor está configurado e se está pronto
router.get('/status', (req, res) => {
    try {
        const status = getStatusIA();
        res.json({ sucesso: true, ...status });
    } catch (erro) {
        res.status(500).json({ sucesso: false, mensagem: erro.mensagem || 'Erro ao obter status.' });
    }
});

// ── Feature 1: Gerar Descrição de Produto ──────

// POST /api/ia/descricao — Gera descrição de produto com IA
router.post('/descricao', async (req, res) => {
    try {
        const { nome, categoria, preco } = req.body;

        if (!nome || !categoria) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Nome e categoria do produto são obrigatórios.',
            });
        }

        const descricao = await gerarDescricaoProduto({ nome, categoria, preco });

        res.json({ sucesso: true, descricao });
    } catch (erro) {
        console.error('=== API ERRO AO GERAR DESCRIÇÃO ===', erro);

        if (erro.tipo === 'API_KEY_AUSENTE' || erro.tipo === 'PROVEDOR_INVALIDO') {
            return res.status(503).json({ sucesso: false, mensagem: erro.mensagem });
        }

        if (erro.status) {
            const msg = erro.error?.message || 'Serviço de IA temporariamente indisponível.';
            return res.status(502).json({ sucesso: false, mensagem: msg });
        }

        res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao gerar descrição.' });
    }
});

// ── Feature 2: Chatbot de Suporte ──────────────

// POST /api/ia/chat — Envia mensagem e recebe resposta do chatbot
router.post('/chat', verificarLogadoOpcional, async (req, res) => {
    try {
        const { mensagem, historico } = req.body;

        if (!mensagem || typeof mensagem !== 'string' || mensagem.trim().length === 0) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'A mensagem não pode estar vazia.',
            });
        }

        const usuarioId = req.usuarioLogado?.id || null;

        let historicoFormatado = [];
        if (Array.isArray(historico) && historico.length > 0) {
            historicoFormatado = historico.slice(-10).map(msg => ({
                role: msg.role === 'assistant' ? 'assistant' : 'user',
                content: String(msg.content || '').slice(0, 500),
            }));
        }

        const resposta = await responderChat(
            mensagem.trim(),
            historicoFormatado,
            usuarioId
        );

        res.json({ sucesso: true, resposta });
    } catch (erro) {
        console.error('=== API ERRO NO CHATBOT ===', erro);

        if (erro.tipo === 'API_KEY_AUSENTE' || erro.tipo === 'PROVEDOR_INVALIDO') {
            return res.status(503).json({ sucesso: false, mensagem: erro.mensagem });
        }

        if (erro.status) {
            const msg = erro.error?.message || 'Serviço de IA temporariamente indisponível.';
            return res.status(502).json({ sucesso: false, mensagem: msg });
        }

        res.status(500).json({
            sucesso: false,
            mensagem: 'Desculpe, tive um problema técnico. Tente novamente em instantes.',
        });
    }
});

module.exports = router;
