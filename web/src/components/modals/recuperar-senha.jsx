import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

function RecuperarSenha({ isVisible, onClose }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [status, setStatus] = useState("");

  // Usa a função do contexto
  const { recoveryPassword } = useAuth();

  if (!isVisible) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErro("");
    setStatus("");

    // Chama a função do contexto
    const result = await recoveryPassword(email);

    if (!result.success) {
      // Define a mensagem de erro
      setErro(result.message);
      // Configura o timer para limpar a mensagem após 5 segundos
      setTimeout(() => setErro(""), 5000);
    } else {
      // Define a mensagem de sucesso
      setStatus(result.message);
      // Limpa o campo de email após sucesso
      setEmail("");
      // Fecha o modal automaticamente após 3 segundos
      setTimeout(() => {
        onClose();
        setStatus("");
      }, 3000);
    }

    setIsLoading(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex justify-center items-center"
      onClick={onClose}
    >
      <div
        className="bg-white p-4 rounded-md shadow-lg w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4">Recuperar minha conta</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1" htmlFor="email">
              Email:
            </label>
            <input
              type="email"
              id="email"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-950"
              required
            />
          </div>
          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-800 py-2 px-4 rounded"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-yellow-500 text-white py-2 px-4 rounded"
              disabled={isLoading}
            >
              {isLoading ? "Enviando..." : "Enviar"}
            </button>
          </div>

          {erro && <p className="bg-red-600 text-white py-1 rounded-md text-center text-sm">{erro}</p>}
          {status && <p className="bg-green-600 text-white py-1 rounded-md text-center text-sm">{status}</p>}
        </form>
      </div>
    </div>
  );
}

export default RecuperarSenha;
