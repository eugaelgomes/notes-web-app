const multer = require("multer");

// Armazena em memória para salvar no banco (BYTEA)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB (permitir maior para compressão posterior)
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Only PNG, JPEG, JPG, and WEBP formats are allowed!"),
        false
      );
    }
    cb(null, true);
  },
});

module.exports = upload;
