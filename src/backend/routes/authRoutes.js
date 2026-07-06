const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const rateLimit = require('express-rate-limit');

// Rate-limit específico para login/cadastro: 10 tentativas a cada 15 minutos
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Muitas tentativas de autenticação. Aguarde 15 minutos.',
});

router.get('/login', authController.renderizarLogin);
router.get('/cadastro', authController.renderizarCadastro);

router.post('/login', authLimiter, authController.fazerLogin);
router.get('/logout', authController.fazerLogout);

router.post('/cadastro', authLimiter, authController.fazerCadastro);

module.exports = router;