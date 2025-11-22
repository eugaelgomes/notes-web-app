const express = require("express");

// Sub-rotas
const authRoutes = require("@/routes/auth.routes");
const userRoutes = require("@/routes/users.routes");
const passwordRoutes = require("@/routes/password.routes");
const notesRoutes = require("@/routes/notes.routes");
const backupRoutes = require("@/routes/backup.routes");

const router = express.Router();

// Endpoints das subrotas
const routeMap = [
  { path: "/auth", handler: authRoutes },
  { path: "/users", handler: userRoutes },
  { path: "/password", handler: passwordRoutes },
  { path: "/notes", handler: notesRoutes },
  { path: "/backup", handler: backupRoutes },
];

// Router mapping
routeMap.forEach(({ path, handler }) => router.use(path, handler));

module.exports = router;
