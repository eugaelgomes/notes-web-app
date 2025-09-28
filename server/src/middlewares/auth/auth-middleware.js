const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.SECRET_KEY_VARIABLE;

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

// Descontinuado: middleware para verificar se o usuário é admin
//function isAdmin(req, res, next) {
//  const authHeader = req.headers.authorization;
//  console.log("Authorization Header received:", authHeader);
//
//  if (!authHeader) {
//    return res.status(401).json({ message: "Token not provided." });
//  }
//
//  const token = authHeader.split(" ")[1];
//  console.log("Token extracted:", token);
//
//  try {
//    const decoded = jwt.verify(token, SECRET_KEY, { algorithms: ["HS256"] });
//    console.log("Decoded Token:", decoded);
//
//    if (decoded.role !== "admin") {
//      return res.status(403).json({
//        message: "Access denied. Only administrators can access.",
//      });
//    }
//
//    req.user = decoded;
//    next();
//  } catch (error) {
//    console.error("Error verifying token:", error);
//    return res.status(401).json({ message: "Invalid or expired token." });
//  }
//}

module.exports = {
  verifyToken,
  //isAdmin,
};
