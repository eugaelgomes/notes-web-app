"use client";

import React from "react";
import { useAuth } from "../contexts/AuthContext";

export default function SecurePage() {
  const { user, loading } = useAuth();

  if (loading) return <div>Carregando...</div>;
  
  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/auth/signin";
    }
    return null;
  }

  return (
    <div className="secure">
      <h2>Área Protegida</h2>
      <p>Olá, {user.username || "usuário"} — você está autenticado.</p>
    </div>
  );
}
