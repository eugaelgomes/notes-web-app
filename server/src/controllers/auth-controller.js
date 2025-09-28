const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const axios = require("axios");
const AuthRepository = require("@/repositories/auth-repo");

const SECRET_KEY = process.env.SECRET_KEY_VARIABLE;

class AuthController {
  async login(req, res) {
    const { username, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await AuthRepository.findUserByUsername(username);

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Usuário ou senha inválidos" });
      }

      const payload = {
        userId: user.user_id,
        username: user.username,
        email: user.email,
        name: user.name,
        //role_name: user.role_name, // Adicionar role para controle de acesso
      };

      const token = jwt.sign(payload, SECRET_KEY, {
        algorithm: "HS256",
        expiresIn: "12h", // Aumentar duração do token
      });

      // Envia token como HttpOnly cookie
      res.cookie("token", token, {
        httpOnly: true, // não acessível via JS
        secure: process.env.NODE_ENV === "production", // somente HTTPS em produção
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Permite cross-origin em produção
        maxAge: 24 * 60 * 60 * 1000, // 24 horas em millisegundos
        path: "/", // Cookie disponível em todas as rotas
        // Não defina domain explicitamente para deixar o navegador aplicar o host atual
      });

      return res.status(200).json({
        success: true,
        message: "Login realizado com sucesso",
        data: {
          user: {
            id: user.user_id,
            username: user.username,
            email: user.email,
            name: user.name,
            avatar_url: user.avatar_url,
            //role_name: user.role_name,
          },
          token: token
          //refreshToken: refreshToken,
        }
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async googleAuth(req, res) {
    // Redireciona para o endpoint do Google OAuth2
    const googleOAuthURL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.GOOGLE_REDIRECT_URI)}&response_type=code&scope=openid%20email%20profile&access_type=offline&prompt=consent`;
    res.redirect(googleOAuthURL);
  }

  async googleCallback(req, res) {
    try {
      const { code, error } = req.query;
      
      // Verificar se houve erro na autorização
      if (error) {
        console.error("Erro na autorização Google:", error);
        const frontendURL = process.env.FRONTEND_URL || "http://localhost:80";
        return res.redirect(`${frontendURL}/?error=authorization_denied`);
      }
      
      if (!code) {
        console.error("Código de autorização não encontrado");
        const frontendURL = process.env.FRONTEND_URL || "http://localhost:80";
        return res.redirect(`${frontendURL}/?error=missing_auth_code`);
      }

      // Trocar o código por tokens de acesso
      const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      });

      const { access_token } = tokenResponse.data;

      if (!access_token) {
        throw new Error("Token de acesso não recebido do Google");
      }

      // Obter informações do usuário do Google
      const userResponse = await axios.get(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${access_token}`);
      const googleUser = userResponse.data;

      if (!googleUser.id || !googleUser.email) {
        throw new Error("Dados incompletos do usuário Google");
      }

      let user = null;

      // Primeiro, tentar encontrar por Google ID
      user = await AuthRepository.findUserByGoogleId(googleUser.id);

      if (!user) {
        // Se não encontrou por Google ID, tentar por email
        user = await AuthRepository.findUserByEmail(googleUser.email);
        
        if (user) {
          // Usuário existe mas ainda não tem Google ID associado
          user = await AuthRepository.updateUserWithGoogle(
            user.user_id, 
            googleUser.id, 
            googleUser.picture
          );
        } else {
          // Usuário não existe, criar novo
          user = await AuthRepository.createUserWithGoogle(
            googleUser.id,
            googleUser.name,
            googleUser.email,
            googleUser.picture
          );
          console.log("Usuário criado:", user);
        }
      }

      if (!user) {
        throw new Error("Falha ao criar/encontrar usuário");
      }

      // Gerar JWT token
      const payload = {
        userId: user.user_id,
        username: user.username,
        email: user.email,
        name: user.name,
      };

      const token = jwt.sign(payload, SECRET_KEY, {
        algorithm: "HS256",
        expiresIn: "24h",
      });

      // Definir cookie com token
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 24 * 60 * 60 * 1000,
        path: "/",
      });

      // Redirecionar para o frontend
      const frontendURL = process.env.FRONTEND_URL || "http://localhost:80";
      res.redirect(`${frontendURL}/home?auth=success`);

    } catch (error) {
      console.error("Erro detalhado no callback Google:", error.message);
      const frontendURL = process.env.FRONTEND_URL || "http://localhost:80";
      res.redirect(`${frontendURL}/?error=auth_failed`);
    }
  }

  async logout(req, res) {
    try {
      // Remove cookie do token
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
        // Sem domain explícito para limpar no host atual
      });

      // Se houver sessão, destruir também
      if (req.session) {
        req.session.destroy((err) => {
          if (err) {
            console.error("Erro ao destruir sessão:", err);
          }
        });
      }

      return res.status(200).json({ message: "Logout realizado com sucesso" });
    } catch (error) {
      console.error("Erro no logout:", error);
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  async getProfile(req, res) {
    try {
      // O token já foi validado pelo middleware, usar dados do req.user
      const user = await AuthRepository.findUserByUsername(req.user.username);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      return res.json({
        id: user.user_id,
        name: user.name,
        email: user.email,
        username: user.username,
        avatar_url: user.avatar_url || null,
        //role_name: user.role_name,
        createdAt: user.created_at,
      });
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  async updateProfile(req, res) {
    const { name, username, email } = req.body;
    try {
      const updatedUser = await AuthRepository.updateUserProfile(
        req.user.userId,
        name,
        email,
        username
      );
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.json({
        id: updatedUser.user_id,
        name: updatedUser.name,
        email: updatedUser.email,
        username: updatedUser.username,
        createdAt: updatedUser.created_at,
        message: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async updatePassword(req, res) {
    const { currentPassword, newPassword } = req.body;
    try {
      const updateUserPassword = await AuthRepository.updateUserPassword(
        req.user.userId,
        newPassword,
        currentPassword
      );
      if (!updateUserPassword) {
        return res.status(404).json({ message: "User not found" });
      }

      const match = await bcrypt.compare(
        currentPassword,
        updateUserPassword.password
      );
      if (!match) {
        return res
          .status(401)
          .json({ message: "Current password is incorrect" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await AuthRepository.updateUserPassword(req.user.userId, hashedPassword);

      return res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error updating password:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async refreshToken(req, res) {
    try {
      const currentToken = req.cookies?.token;
      if (!currentToken) {
        return res.status(401).json({ message: "Token não encontrado" });
      }

      // Verifica se o token atual ainda é válido
      const decoded = jwt.verify(currentToken, SECRET_KEY);

      // Busca dados atualizados do usuário
      const user = await AuthRepository.findUserByUsername(decoded.username);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      // Gera novo token com dados atualizados
      const payload = {
        userId: user.user_id,
        username: user.username,
        email: user.email,
        name: user.name,
        //role_name: user.role_name,
      };

      const newToken = jwt.sign(payload, SECRET_KEY, {
        algorithm: "HS256",
        expiresIn: "24h",
      });

      // Define novo cookie
      res.cookie("token", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 24 * 60 * 60 * 1000,
        path: "/",
        // Sem domain explícito para compatibilidade com múltiplos hosts
      });

      return res.status(200).json({
        user: {
          id: user.user_id,
          username: user.username,
          email: user.email,
          name: user.name,
          avatar_url: user.avatar_url,
          //role_name: user.role_name,
        },
      });
    } catch (error) {
      console.error("Erro ao renovar token:", error);
      return res.status(401).json({ message: "Token inválido ou expirado" });
    }
  }

  //async getGeolocation(ip) {
  //  try {
  //    if (!ip || ip === "127.0.0.1" || ip === "::1") {
  //      return {
  //        ip: ip || "127.0.0.1",
  //        city: "Local",
  //        region: "Local",
  //        country: "Local",
  //        loc: "0,0",
  //        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  //      };
  //    }
  //    const response = await axios.get(
  //      `https://ipinfo.io/${ip}?token=${CLIENT_IP}`
  //    );
  //    return response.data;
  //  } catch (error) {
  //    return null;
  //  }
  //}
}

module.exports = new AuthController();
