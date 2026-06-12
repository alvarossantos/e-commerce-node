const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { verificarAdmin } = require('../middlewares/authMiddleware');

// Rotas de Usuário (somente admin)
router.post('/', verificarAdmin, usuarioController.criar);
router.get('/', verificarAdmin, usuarioController.listar);
router.get('/:id', verificarAdmin, usuarioController.buscar);
router.patch('/:id/inativar', verificarAdmin, usuarioController.inativarConta);

// Rotas de atualizar/modificar dados do Usuário (somente admin)
router.put('/:id', verificarAdmin, usuarioController.atualizarUsuario);
router.put('/:id/foto', verificarAdmin, usuarioController.atualizarFoto);

module.exports = router;