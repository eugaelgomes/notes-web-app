const express = require("express");

const backupController = require("@/controllers/backup/backup-controller");

const { verifyToken } = require("@/middlewares/auth/auth-middleware");

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(verifyToken);

// GET /api/backup/export - Exportar todos os dados do usuário
router.get("/export", (req, res, next) => {
  backupController.exportUserData(req, res, next);
});

// GET /api/backup/summary - Resumo dos dados para backup
router.get("/summary", (req, res, next) => {
  backupController.getBackupSummary(req, res, next);
});

module.exports = router;