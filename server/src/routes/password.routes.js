const express = require("express");
const { body } = require("express-validator");
const PasswordController = require("@/controllers/password-controller");

const router = express.Router();

// Iniciar processo de recuperação de senha
router.post(
  "/forgot-password",
  [body("email").isEmail()],
  PasswordController.forgotPassword.bind(PasswordController)
);

// Resetar a senha usando o token enviado por email
router.post(
  "/reset-password",
  PasswordController.resetPassword.bind(PasswordController)
);

module.exports = router;
