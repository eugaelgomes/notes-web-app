const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.SECRET_KEY;

function verifyToken(req, res, next) {
  // Debug logs para produção

  // Primeiro, tenta obter token do cookie (preferência para HttpOnly)
  let token = req.cookies?.token;

  // Se não encontrar no cookie, verifica Authorization header (compatibilidade)
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "Acesso negado. Token não fornecido." });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY, { algorithms: ["HS256"] });
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido ou expirado." });
  }
}

module.exports = {
  verifyToken,
};
