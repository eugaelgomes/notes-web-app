const express = require("express");
const authRoutes = require("@/routes/auth.routes");
const userRoutes = require("@/routes/users.routes");
const passwordRoutes = require("@/routes/password.routes");
const notesRoutes = require("@/routes/notes.routes");

const router = express.Router();

// Rotas de autenticação
router.use("/auth", authRoutes);

// Rotas de usuário
router.use("/users", userRoutes);

// Rotas de gerenciamento de senha/recuperação de acessos
router.use("/password", passwordRoutes);

// Rotas de notas
router.use("/notes", notesRoutes);

module.exports = router;
