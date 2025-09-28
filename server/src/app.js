const express = require("express");
const {
  configureGlobalMiddlewares,
} = require("@/middlewares/global-middleware");
const { errorHandler } = require("@/middlewares/error-handler");
const routes = require("@/routes/index.routes");

const app = express();

// Middlewares globais
configureGlobalMiddlewares(app);

// Rota base para todas as rotas da API
app.use("/api", routes);

// Middleware para rotas não encontradas
app.use(errorHandler.notFoundHandler);

// Middleware de tratamento de erros global
app.use(errorHandler.globalErrorHandler);

module.exports = { app };
