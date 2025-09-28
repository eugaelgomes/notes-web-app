import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function ResetSenha({ isVisible, onClose }) {
  const { resetSenha, login } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [status, setStatus] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("reset_token");
    const usernameFromUrl = params.get("username");

    if (tokenFromUrl) setToken(tokenFromUrl);
    if (usernameFromUrl) setUsername(usernameFromUrl);
  }, []);

  if (!isVisible) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setStatus("");

    if (password !== confirmPassword) {
      setErro("As senhas não coincidem");
      setTimeout(() => setErro(""), 5000);
      return;
    }

    if (password.length < 8) {
      setErro("A senha deve ter pelo menos 8 caracteres");
      setTimeout(() => setErro(""), 5000);
      return;
    }

    if (!token) {
      setErro("Token de redefinição não encontrado");
      setTimeout(() => setErro(""), 5000);
      return;
    }

    setIsLoading(true);
    const response = await resetSenha(token, password);
    
    if (response.success) {
      setStatus(response.message);
      // Limpa os campos de senha
      setPassword("");
      setConfirmPassword("");
      
      setTimeout(async () => {
        setStatus("");
        onClose(); // Fecha o modal
        
        // Se temos o username, tenta fazer login automaticamente
        if (username) {
          const loginResponse = await login({ username, password });
          if (loginResponse.success) {
            navigate("/");
          }
        } else {
          navigate("/sign-in");
        }
      }, 2000);
    } else {
      setErro(response.message);
      setTimeout(() => setErro(""), 5000);
    }

    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-white p-4 rounded-md shadow-lg w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-4">Redefinir Senha</h2>
        <p className="mb-4 text-sm text-gray-600">
          Digite sua nova senha abaixo. A senha deve ter pelo menos 8 caracteres.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label className="block mb-1" htmlFor="password">Nova Senha:</label>
            <div className="flex items-center relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Digite sua nova senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-950 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 flex items-center justify-center h-full"
              >
                {showPassword ? <FaEyeSlash className="text-gray-500" /> : <FaEye className="text-gray-500" />}
              </button>
            </div>
          </div>

          <div className="relative">
            <label className="block mb-1" htmlFor="confirmPassword">Confirmar Senha:</label>
            <div className="flex items-center relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                placeholder="Confirme sua nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-950 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 flex items-center justify-center h-full"
              >
                {showConfirmPassword ? <FaEyeSlash className="text-gray-500" /> : <FaEye className="text-gray-500" />}
              </button>
            </div>
          </div>

          <div className="flex justify-between mt-4">
            <button type="button" onClick={onClose} className="bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400 transition-colors">
              Cancelar
            </button>
            <button 
              type="submit" 
              className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 transition-colors disabled:opacity-50" 
              disabled={isLoading}
            >
              {isLoading ? "Processando..." : "Redefinir Senha"}
            </button>
          </div>

          {erro && <p className="bg-red-600 text-white py-1 rounded-md text-center text-sm">{erro}</p>}
          {status && <p className="bg-green-600 text-white py-1 rounded-md text-center text-sm">{status}</p>}
        </form>
      </div>
    </div>
  );
}

export default ResetSenha;
