import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export function ChangePasswordSection() {
  const { updateUserPassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isChanging, setIsChanging] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChangePassword = async () => {
    try {
      setError("");
      setSuccessMessage("");
      
      // Validações
      if (!currentPassword || !newPassword || !confirmPassword) {
        setError("Todos os campos são obrigatórios.");
        return;
      }

      if (newPassword !== confirmPassword) {
        setError("As senhas não coincidem.");
        return;
      }

      if (newPassword.length < 6) {
        setError("A nova senha deve ter pelo menos 6 caracteres.");
        return;
      }

      setIsChanging(true);
      const result = await updateUserPassword(currentPassword, newPassword);

      if (result.success) {
        setSuccessMessage(result.message);
        // Limpa os campos
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Erro ao alterar a senha. Tente novamente.");
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="bg-slate-700/50 rounded-md p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Alterar Senha</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">
            Senha Atual
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full bg-slate-600 text-white px-3 py-2 rounded border border-slate-500 focus:border-blue-500 focus:outline-none"
            placeholder="Digite sua senha atual"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">
            Nova Senha
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-slate-600 text-white px-3 py-2 rounded border border-slate-500 focus:border-blue-500 focus:outline-none"
            placeholder="Digite a nova senha"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">
            Confirme a Nova Senha
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-slate-600 text-white px-3 py-2 rounded border border-slate-500 focus:border-blue-500 focus:outline-none"
            placeholder="Digite a nova senha novamente"
          />
        </div>
        
        {error && (
          <div className="bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-400">{error}</p>
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-900/20 border-l-4 border-green-500 p-4 rounded">
            <p className="text-green-400">{successMessage}</p>
          </div>
        )}

        <button
          onClick={handleChangePassword}
          disabled={!currentPassword || !newPassword || !confirmPassword || isChanging}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded transition-colors duration-200"
        >
          {isChanging ? "Alterando..." : "Alterar Senha"}
        </button>
      </div>
    </div>
  );
}
