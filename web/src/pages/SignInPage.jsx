import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import RecuperarSenha from "../components/modals/RescuePassword.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isRecuperarSenhaVisible, setIsRecuperarSenhaVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { login, authenticated, loginWithGoogle } = useAuth();

  // Se já estiver autenticado, redireciona
  useEffect(() => {
    if (authenticated) {
      navigate("/home", { replace: true });
    }
  }, [authenticated, navigate]);

  // Verifica status de autenticação Google
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const authStatus = params.get("auth");
    const authError = params.get("error");

    if (authStatus === "success") {
      setStatus("Autenticação realizada com sucesso! Redirecionando...");
      // Limpar parâmetros da URL
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => {
        setStatus("");
        navigate("/home");
      }, 1500);
    }

    if (authError === "auth_failed") {
      setErro("Não foi possível autenticar com o Google. Tente novamente ou use suas credenciais.");
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
      setErro("Por favor, preencha todos os campos para continuar.");
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
        // Mensagens mais amigáveis baseadas no erro do backend
        let errorMessage = result?.message || "Falha no login";
        
        if (errorMessage.includes("Usuário ou senha inválidos")) {
          errorMessage = "Usuário ou senha incorretos. Verifique seus dados e tente novamente.";
        } else if (errorMessage.includes("Internal Server Error")) {
          errorMessage = "Erro temporário no servidor. Tente novamente em alguns momentos.";
        }
        
        setErro(errorMessage);
      }
    } catch (error) {
      console.error("Erro ao conectar com o backend:", error);
      setErro("Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.");
    } finally {
      setSubmitting(false);
      setTimeout(() => setErro(""), 5000);
    }
  };

  const handleGoogleLogin = () => {
    loginWithGoogle();
  };

  return (
    <div className="h-screen flex relative">
      {/* Toast de Mensagens - Flutuante no topo */}
      {(erro || status) && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
          {erro && (
            <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg shadow-lg backdrop-blur-sm">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              <span className="flex-1">{erro}</span>
              <button 
                onClick={() => setErro("")}
                className="text-red-400 hover:text-red-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
          {status && (
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg shadow-lg backdrop-blur-sm">
              <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L7.53 10.25a.75.75 0 00-1.06 1.5l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
              <span className="flex-1">{status}</span>
              <button 
                onClick={() => setStatus("")}
                className="text-green-400 hover:text-green-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Coluna esquerda - formulário */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-4 bg-white">
        <div className="w-full max-w-sm space-y-4">
          {/* Logo */}
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-yellow-500 p-4 rounded-md text-white">CodaWeb Notes</h1>
          </div>

          {/* Título */}
          <div className="flex text-center justify-center">
            <p className="text-sm text-gray-600">Bem-vindos! Entre ou cadastre-se em nosso app.</p>
          </div>

          {/* Botão Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200"
            disabled={submitting}
          >
            <img
              src="https://www.svgrepo.com/show/355037/google.svg"
              alt="Google"
              className="w-4 h-4 mr-2"
            />
            Entrar com Google
          </button>

          {/* Separador */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">ou</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Usuário */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Usuário
              </label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Digite seu nome de usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={submitting}
                autoComplete="username"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors duration-200"
              />
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                  autoComplete="current-password"
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-4 w-4" />
                  ) : (
                    <FaEye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Ações */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-gray-900">
                  Lembrar por 30 dias
                </label>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setIsRecuperarSenhaVisible(true)}
                  className="font-medium text-yellow-600 hover:text-yellow-500 focus:outline-none focus:underline transition-colors duration-200"
                >
                  Esqueceu a senha?
                </button>
              </div>
            </div>

            {/* Botão entrar */}
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              disabled={submitting}
            >
              {submitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Entrando...
                </span>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          {/* Cadastro */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{" "}
              <a href="/sign-up" className="font-medium text-yellow-600 hover:text-yellow-500 transition-colors duration-200">
                Cadastre-se
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Coluna direita - imagem */}
      <div className="hidden lg:block relative flex-1">
        <img
          src="https://cwn.sfo3.cdn.digitaloceanspaces.com/medias/bg-studying_guy.webp"
          alt="Login visual"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-lg">
            <h3 className="text-xl font-bold text-white mb-2">
              Traga suas ideias à vida.
            </h3>
            <p className="text-sm text-white/90">
              Cadastre-se e aproveite as máximo a melhor experiência de organizar sua vida.
              Conte conosco!
            </p>
          </div>
        </div>
      </div>

      {/* Modal de Recuperar Senha */}
      <RecuperarSenha 
        isVisible={isRecuperarSenhaVisible} 
        onClose={() => setIsRecuperarSenhaVisible(false)} 
      />
    </div>
  );
}
