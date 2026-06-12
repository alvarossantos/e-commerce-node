const express = require("express");
const router = express.Router();
const lojaController = require("../controllers/lojaController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/", lojaController.renderizarHome);
router.get("/produtos/:id", lojaController.renderizarDetalheProduto);
router.post(
  "/produtos/:id/avaliar",
  authMiddleware.verificarLogado,
  lojaController.adicionarAvaliacao,
);

module.exports = router;
