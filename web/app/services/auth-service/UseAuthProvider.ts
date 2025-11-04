// services/auth-service/UseAuthProvider.ts
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createUserService,
  login as loginService,
  logout as logoutService,
  getUserData as getUserDataService,
  refreshToken as refreshTokenService,
  updateUserData,
  requestPasswordRecovery,
  resetPassword,
  updatePassword,
  initiateGoogleLogin,
  deleteUser,
  type User,
  type LoginCredentials,
  type CreateUserData,
} from "./AuthService";

export interface AuthState {
  authenticated: boolean;
  loading: boolean;
  user: User | null;
  users: User[];
}

export interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<{ success: boolean; message?: string }>;
  createUser: (userData: CreateUserData) => Promise<{ success: boolean; message?: string }>;
  updateUser: (userData: Partial<User>) => Promise<{ success: boolean; message?: string }>;
  updateUserPassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<{ success: boolean; message?: string }>;
  recoverPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
  resetSenha: (token: string, password: string) => Promise<{ success: boolean; message?: string }>;
  refreshAuthToken: () => Promise<{ success: boolean; user?: User; message?: string }>;
  getUserData: () => Promise<{ success: boolean; data?: User; message?: string }>;
  loginWithGoogle: () => void;
  deleteUserPermanently: () => Promise<{ success: boolean; message?: string }>;
}

export function useAuthProvider(): AuthState & AuthActions {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();

  // Função para debug de cookies
  function debugCookies() {
    if (typeof window !== "undefined") {
      console.log("🍪 Cookies disponíveis:", document.cookie);
      console.log(
        "🔍 Cookies do navegador:",
        document.cookie.split(";").map((c) => c.trim())
      );
    }
  }

  // --- Checa autenticação inicial ---
  useEffect(() => {
    async function fetchUser() {
      try {
        // Verificar se voltou do Google OAuth com sucesso
        if (typeof window !== "undefined") {
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get("auth") === "success") {
            // Limpar parâmetros da URL
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }

        const data = await getUserDataService(); // token enviado via HttpOnly cookie
        if (data) {
          setUser(data);
          setAuthenticated(true);
          console.log("✅ Usuário autenticado com sucesso:", data.username || data.email);
        } else {
          throw new Error("Dados do usuário não encontrados");
        }

        // Se for admin, carregar lista de usuários
        // if (data.role_name === "admin") {
        //   try {
        //     const usersData = await getUsersService();
        //     setUsers(usersData);
        //   } catch (err) {
        //     console.warn("Falha ao carregar usuários:", err);
        //   }
        // }
      } catch (error) {
        console.warn(
          "⚠️ Falha ao verificar autenticação:",
          error instanceof Error ? error.message : "Unknown error"
        );
        setUser(null);
        setAuthenticated(false);

        // Verificar se houve erro no Google OAuth
        if (typeof window !== "undefined") {
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get("error") === "auth_failed") {
            // Limpar parâmetros da URL
            window.history.replaceState({}, document.title, window.location.pathname);
            console.error("❌ Falha na autenticação OAuth");
            // Aqui você pode mostrar uma mensagem de erro se quiser
          }
        }
      } finally {
        setLoading(false);
      }
    }

    console.log("🔍 Verificando autenticação inicial...");
    fetchUser();
  }, []);

  // --- Autenticação ---
  async function login(credentials: LoginCredentials) {
    try {
      console.log("🔐 Tentando fazer login...");
      debugCookies();

      const response = await loginService(credentials);

      // Debug após login
      setTimeout(() => {
        debugCookies();
      }, 100);

      if (response && response.user) {
        // token já enviado como HttpOnly cookie pelo backend
        setUser(response.user);
        setAuthenticated(true);
        console.log(
          "✅ Login realizado com sucesso:",
          response.user.username || response.user.email
        );

        // Se for admin, carregar lista de usuários
        // if (response.user.role_name === "admin") {
        //   try {
        //     const usersData = await getUsersService();
        //     setUsers(usersData);
        //   } catch (err) {
        //     console.warn("Falha ao carregar usuários:", err);
        //   }
        // }

        return { success: true };
      } else {
        throw new Error("Resposta de login inválida");
      }
    } catch (error) {
      console.error("❌ Erro no login:", error);
      return { success: false, message: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  async function logout() {
    try {
      await logoutService(); // Chama API de logout
      setUser(null);
      setAuthenticated(false);
      setUsers([]);
      router.push("/auth/signin");
      return { success: true };
    } catch (error) {
      console.error("Erro no logout:", error);
      // Mesmo com erro na API, limpa estado local
      setUser(null);
      setAuthenticated(false);
      setUsers([]);
      router.push("/auth/signin");
      return { success: false, message: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  async function getCurrentUser() {
    try {
      const data = await getUserDataService();
      return { success: true, data };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  async function updateUser(userData: Partial<User>) {
    try {
      const updatedData = await updateUserData(userData);
      setUser((prev) => ({ ...prev, ...updatedData }));
      return { success: true };
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      return { success: false, message: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  async function updateUserPassword(currentPassword: string, newPassword: string) {
    try {
      await updatePassword(currentPassword, newPassword);
      return { success: true };
    } catch (error) {
      console.error("Erro ao atualizar senha:", error);
      return { success: false, message: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  async function recoverPassword(email: string) {
    try {
      const data = await requestPasswordRecovery(email);
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  async function resetSenha(token: string, password: string) {
    try {
      const data = await resetPassword(token, password);
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  async function createUser(userData: CreateUserData) {
    try {
      const { message } = await createUserService(userData);
      return { success: true, message };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  async function deleteUserPermanently() {
    try {
      await deleteUser();
      return { success: true };
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      return { success: false, message: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  async function refreshAuthToken() {
    try {
      const response = await refreshTokenService();
      setUser(response.user);
      return { success: true, user: response.user };
    } catch (error) {
      console.error("Erro ao renovar token:", error);
      // Se falhar ao renovar, fazer logout
      setUser(null);
      setAuthenticated(false);
      setUsers([]);
      return { success: false, message: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  function loginWithGoogle() {
    initiateGoogleLogin();
  }

  return {
    authenticated,
    loading,
    user,
    users,
    login,
    logout,
    createUser,
    updateUser,
    updateUserPassword,
    recoverPassword,
    resetSenha,
    refreshAuthToken,
    getUserData: getCurrentUser,
    loginWithGoogle,
    deleteUserPermanently,
  };
}
