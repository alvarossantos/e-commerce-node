const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');
const { verificarLogado } = require('../middlewares/authMiddleware');

const verificarAdmin = (req, res, next) => {
    const usuario = res.locals.usuarioLogado || req.usuarioLogado;
    if (usuario && usuario.is_admin) {
        return next();
    }
    res.redirect('/erro=Acesso Negado! Área restrita a administradores da loja.');
}

router.use(verificarLogado);

// Meus Pedidos
router.get('/meus-pedidos', pedidoController.meusPedidos);
router.post('/processar', pedidoController.processarPagamento);
router.get('/sucesso/:id', pedidoController.renderizarRecibo);

// VISÃO DE ADMIN
// Listar todos os pedidos do sistema
router.get('/', verificarAdmin, pedidoController.listarTodos);
// Atualizar Status do Pagamento
router.patch('/:id/status', verificarAdmin, pedidoController.atualizarStatusPagamento);

module.exports = router;