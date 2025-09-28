import React from "react";

// Not found routes
export default function NotFoundRoute() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-white px-4">
      <h1 className="text-4xl text-yellow-500 font-bold mb-4">404 - Página Não Encontrada</h1>
      <p className="text-lg mb-8">
        Desculpe, a rota que você tentou acessar não existe.
      </p>
      <a
        href="/home"
        className="bg-yellow-500 text-white font-bold py-2 px-6 rounded-md shadow-md hover:bg-gray-200"
      >
        Voltar para a Página Inicial
      </a>
    </div>
  );
}
