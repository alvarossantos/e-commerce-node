const express = require('express');
const router = express.Router();
const carrinhoController = require('../controllers/carrinhoController');
const { verificarLogadoOpcional } = require('../middlewares/authMiddleware');

router.use(verificarLogadoOpcional);

router.get('/', carrinhoController.renderizarCarrinho);
router.post('/adicionar', carrinhoController.adicionarItem);
router.post('/remover/:produtoId', carrinhoController.removerItem);
router.post('/limpar', carrinhoController.limparCarrinho);


module.exports = router;