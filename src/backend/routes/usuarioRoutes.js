const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// Rotas de Usuário
router.post('/', usuarioController.criar);
router.get('/', usuarioController.listar);
router.get('/:id', usuarioController.buscar);
router.patch('/:id/inativar', usuarioController.inativarConta);

// Rotas de atualizar/modificar dados do Usuário
router.put('/:id', usuarioController.atualizarUsuario);
router.put('/:id/foto', usuarioController.atualizarFoto);

module.exports = router;