"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { FaHome, FaRedo, FaExclamationTriangle } from "react-icons/fa";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log do erro para monitoramento (opcional)
    console.error("Erro capturado pela página de erro:", error);
  }, [error]);

  return (
    <div className="h-full min-h-[60vh] bg-gradient-to-br from-red-50 to-pink-50 rounded-lg flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Ícone de Erro */}
        <div className="mb-8">
          <div className="text-6xl text-red-500 mb-4">
            <FaExclamationTriangle className="mx-auto" />
          </div>
          <div className="text-2xl font-bold text-red-600">Ops!</div>
        </div>

        {/* Título e Descrição */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Algo deu errado
          </h1>
          <p className="text-gray-600 mb-2">
            Ocorreu um erro inesperado. Nossa equipe foi notificada e estamos trabalhando para resolver.
          </p>
          <p className="text-sm text-gray-500">
            Tente recarregar a página ou voltar ao início.
          </p>
        </div>

        {/* Detalhes do Erro (apenas em desenvolvimento) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left">
            <p className="text-xs text-gray-600 mb-2">Detalhes do erro (apenas em desenvolvimento):</p>
            <code className="text-xs text-red-600 break-all">
              {error.message}
            </code>
            {error.digest && (
              <p className="text-xs text-gray-500 mt-2">
                ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Botões de Ação */}
        <div className="space-y-4">
          {/* Botão Tentar Novamente */}
          <button
            onClick={reset}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-300"
          >
            <FaRedo className="w-4 h-4" />
            Tentar Novamente
          </button>

          {/* Botão Ir para o Início */}
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-300"
          >
            <FaHome className="w-4 h-4" />
            Ir para o Início
          </Link>
        </div>

        {/* Links Úteis */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3">Precisa de ajuda?</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link
              href="/home"
              className="text-red-600 hover:text-red-700 transition-colors"
            >
              Início
            </Link>
            <Link
              href="/notes"
              className="text-red-600 hover:text-red-700 transition-colors"
            >
              Minhas Notas
            </Link>
            <Link
              href="/settings"
              className="text-red-600 hover:text-red-700 transition-colors"
            >
              Configurações
            </Link>
          </div>
        </div>

        {/* Marca */}
        <div className="mt-8">
          <div className="inline-block bg-yellow-500 text-white px-4 py-2 rounded-md font-bold text-lg">
            CodaWeb Notes
          </div>
        </div>
      </div>
    </div>
  );
}