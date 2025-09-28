// context/AuthContext.js
import React, { createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthProvider } from "../services/auth-service/use-auth-provider";

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return context;
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const auth = useAuthProvider(navigate);

  return (
    <AuthContext.Provider value={auth}>
      {!auth.loading ? children : <div className="w-full h-screen bg-slate-950 text-gray-800">Carregando...</div>}
    </AuthContext.Provider>
  );
}
