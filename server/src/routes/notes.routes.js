const express = require("express");

const notesController = require("@/controllers/notes-controller");

const { verifyToken } = require("@/middlewares/auth/auth-middleware");

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(verifyToken);

// GET /api/notes - Buscar todas as notas do usuário
router.get("/", (req, res, next) => {
  notesController.getAllNotes(req, res, next);
});

// GET /api/notes/:id - Buscar uma nota específica por ID
router.get("/:id", (req, res, next) => {
  notesController.getNoteById(req, res, next);
});

// POST /api/notes - Criar uma nova nota
router.post("/", (req, res, next) => {
  notesController.createNote(req, res, next);
});

// POST /api/notes/complete - Criar uma nova nota completa (com bloco inicial)
router.post("/complete", (req, res, next) => {
  notesController.createCompleteNote(req, res, next);
});

// PUT /api/notes/:id - Atualizar uma nota existente
router.put("/:id", (req, res, next) => {
  notesController.updateNote(req, res, next);
});

// DELETE /api/notes/:id - Deletar uma nota
router.delete("/:id", (req, res, next) => {
  notesController.deleteNote(req, res, next);
});

// ========================================
// ROTAS PARA GERENCIAMENTO DE BLOCOS
// ========================================

// GET /api/notes/:noteId/blocks - Buscar todos os blocos de uma nota
router.get("/:noteId/blocks", (req, res, next) => {
  notesController.getBlocksByNote(req, res, next);
});

// POST /api/notes/:id/blocks - Criar um novo bloco na nota
router.post("/:id/blocks", (req, res, next) => {
  notesController.createBlock(req, res, next);
});

// PUT /api/notes/:noteId/blocks/:blockId - Atualizar um bloco específico
router.put("/:noteId/blocks/:blockId", (req, res, next) => {
  notesController.updateBlock(req, res, next);
});

// DELETE /api/notes/:noteId/blocks/:blockId - Deletar um bloco específico
router.delete("/:noteId/blocks/:blockId", (req, res, next) => {
  notesController.deleteBlock(req, res, next);
});

// PUT /api/notes/:noteId/blocks/reorder - Reordenar blocos da nota
router.put("/:noteId/blocks/reorder", (req, res, next) => {
  notesController.reorderBlocks(req, res, next);
});

module.exports = router;
