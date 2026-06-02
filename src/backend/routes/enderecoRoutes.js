const express = require('express');
const router = express.Router();
const enderecoController = require('../controllers/enderecoController');
const { verificarLogado } = require('../middlewares/authMiddleware');

router.use(verificarLogado);

router.post('/adicionar', verificarLogado, enderecoController.adicionar);

module.exports = router;