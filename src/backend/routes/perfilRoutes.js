const express = require('express');
const router = express.Router();
const perfilController = require('../controllers/perfilController');
const { verificarLogado } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.use(verificarLogado);

router.get('/', perfilController.renderizarPerfil);
router.post('/dados', perfilController.atualizarDados);

// O 'foto_upload' é o nome do campo <input type='file' name="foto_upload"
router.post('/foto', upload.single('foto_upload'), perfilController.atualizarFoto);

router.get('/endereco/novo', perfilController.renderizarFormEndereco);
router.get('/endereco/:id/editar', perfilController.renderizarFormEndereco);
router.post('/endereco', perfilController.salvarEndereco);
router.put('/endereco/:id', perfilController.salvarEndereco);
router.delete('/endereco/:id', perfilController.excluirEndereco);

module.exports = router;