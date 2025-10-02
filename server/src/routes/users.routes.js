const express = require("express");
const UserController = require("@/controllers/user/user-controller");
const NotesController = require("@/controllers/notes/notes-controller");

const dataValidator = require("@/middlewares/data/data-validator");
const upload = require("@/middlewares/data/profile-img");
const validateCompressedImageSize = require("@/middlewares/data/image-validator");
const { verifyToken } = require("@/middlewares/auth/auth-middleware");

const router = express.Router();

router.post(
  "/create-account",
  upload.single("profileImage"),
  validateCompressedImageSize,
  dataValidator(),
  UserController.createUser.bind(UserController)
);

// GET /api/users/search - Buscar usuários para colaboração
router.get(
  "/search",
  verifyToken,
  (req, res, next) => {
    NotesController.searchUsers(req, res, next);
  }
);

// Rotas que usam apenas o token do usuário logado (sem parâmetro userId)
router.get(
  "/my-profile-image",
  verifyToken,
  UserController.getProfileImage.bind(UserController)
);
router.get(
  "/my-profile-image-info",
  verifyToken,
  UserController.getProfileImageInfo.bind(UserController)
);
router.delete(
  "/delete-my-account",
  verifyToken,
  UserController.deleteUser.bind(UserController)
);

module.exports = router;
