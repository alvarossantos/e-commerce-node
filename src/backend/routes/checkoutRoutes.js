const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const { verificarLogado } = require('../middlewares/authMiddleware');

router.use(verificarLogado);

router.post('/', verificarLogado, checkoutController.iniciarCheckout);
router.get('/', verificarLogado, checkoutController.renderizarCheckout);

module.exports = router;