const express = require("express");
const { body } = require("express-validator");
const { verifyToken } = require("@/middlewares/auth/auth-middleware");
const upload = require("@/middlewares/profile-img");
const validateImage = require("@/middlewares/image-validator");
const AuthController = require("@/controllers/auth-controller");
const { loginLimiter } = require("@/middlewares/limiters");
const toString = require("@/middlewares/stringfy");
const authController = require("@/controllers/auth-controller");

const router = express.Router();

router.post(
  "/signin",
  loginLimiter,
  [body("username").trim().escape(), body("password").trim()],
  toString,
  AuthController.login.bind(AuthController)
);

router.get(
  "/signin/sso/google",
  AuthController.googleAuth.bind(AuthController)
);

router.get(
  "/signin/sso/google/callback",
  AuthController.googleCallback.bind(AuthController)
);

router.get(
  "/me",
  verifyToken,
  AuthController.getProfile.bind(AuthController)
);

router.put(
  "/me/update-profile",
  verifyToken,
  upload.single("profilePicture"),
  validateImage,
  authController.updateProfile.bind(authController)
);

router.put(
  "/me/update-password",
  verifyToken,
  [
    body("currentPassword").trim(),
    body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters long"),
  ],
  toString,
  AuthController.updatePassword.bind(AuthController)
);

router.post("/logout", verifyToken, AuthController.logout.bind(AuthController));

router.post("/refresh", AuthController.refreshToken.bind(AuthController));

module.exports = router;
