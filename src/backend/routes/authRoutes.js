const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/login', authController.renderizarLogin);
router.get('/cadastro', authController.renderizarCadastro);

router.post('/login', authController.fazerLogin);
router.get('/logout', authController.fazerLogout);

router.post('/cadastro', authController.fazerCadastro);

module.exports = router;