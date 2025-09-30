import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import RecuperarSenha from "../components/modals/recuperar-senha";
import ResetSenha from "../components/modals/redefinir-senha";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isResetModalVisible, setResetModalVisible] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { login, authenticated, loginWithGoogle } = useAuth();

  // Se já estiver autenticado, redireciona
  useEffect(() => {
    if (authenticated) {
      navigate("/home", { replace: true });
    }
  }, [authenticated, navigate]);

  // Captura token de redefinição na URL e verifica status de autenticação Google
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("reset_token");
    const authStatus = params.get("auth");
    const authError = params.get("error");

    if (token) {
      setResetToken(token);
      setResetModalVisible(true);
    }

    if (authStatus === "success") {
      setStatus("Login com Google realizado com sucesso!");
      // Limpar parâmetros da URL
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => {
        setStatus("");
        navigate("/home");
      }, 1500);
    }

    if (authError === "auth_failed") {
      setErro("Erro na autenticação com Google. Tente novamente.");
      // Limpar parâmetros da URL
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => setErro(""), 5000);
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");

    const u = username.trim();
    const p = password;

    if (!u || !p) {
      setErro("Usuário e senha são obrigatórios");
      return;
    }

    try {
      setSubmitting(true);
      const result = await login({ username: u, password: p });

      if (result?.success) {
        setStatus(result.message || "Login realizado com sucesso!");
        // pequeno delay só pra UX (mostra feedback rapidamente)
        setTimeout(() => {
          setStatus("");
          navigate("/home");
        }, 100);
      } else {
        setErro(result?.message || "Falha no login");
      }
    } catch (error) {
      console.error("Erro ao conectar com o backend:", error);
      setErro("Erro ao conectar com o servidor.");
    } finally {
      setSubmitting(false);
      setTimeout(() => setErro(""), 3000);
    }
  };

  const handleGoogleLogin = () => {
    loginWithGoogle();
  };

  return (
    <>
      <div className="flex items-center justify-center h-screen bg-slate-900 p-4">
        <div className="w-full max-w-md bg-white border rounded-md p-6">
          <div className="flex justify-center mb-6">
            <a href="/" className="text-yellow-500 font-bold text-2xl">
              CodaWeb Notes
            </a>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Usuário
              </label>
              <input
                type="text"
                placeholder="Digite seu nome de usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                className="w-full p-2 border rounded-md text-sm"
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full p-2 pr-10 border rounded-md text-sm"
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  tabIndex={-1}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={() => setModalVisible(true)}
                type="button"
                className="text-sm text-gray-600 hover:text-gray-800"
                disabled={submitting}
              >
                Esqueceu a senha?
              </button>
              <button
                type="submit"
                className="bg-yellow-500 text-white py-2 px-5 rounded-full text-sm font-bold hover:bg-yellow-600 disabled:opacity-60"
                disabled={submitting}
              >
                {submitting ? "Entrando..." : "Entrar"}
              </button>
            </div>

            <div className="flex items-center justify-center text-center text-sm text-gray-500 space-x-3">
              <p>Ainda não tem uma conta?</p>
              <a
                href="/sign-up"
                className="text-yellow-500 font-bold hover:text-yellow-600 transition-colors"
              >
                Criar aqui
              </a>
              {/*
              <p className="text-gray-400">ou</p>

              <button
                onClick={handleGoogleLogin}
                type="button"
                aria-label="Continuar com o Google"
                className="inline-flex items-center justify-center gap-3 px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-60"
                disabled={submitting}
              >
                <svg
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                <span>Continuar com o Google</span>
              </button>*/}
            </div>

            {erro && (
              <p className="bg-red-100 text-red-600 p-2 rounded text-center text-xs">
                {erro}
              </p>
            )}
            {status && (
              <p className="bg-green-100 text-green-600 p-2 rounded text-center text-xs">
                {status}
              </p>
            )}
          </form>
        </div>
      </div>

      {/* Modal de recuperação de senha */}
      <RecuperarSenha
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
      />

      {/* Modal de redefinição de senha com token */}
      <ResetSenha
        isVisible={isResetModalVisible}
        token={resetToken}
        onClose={() => {
          setResetModalVisible(false);
          navigate("/", { replace: true });
        }}
      />
    </>
  );
}
