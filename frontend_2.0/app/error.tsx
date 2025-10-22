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
    <div className="flex h-full min-h-[60vh] items-center justify-center rounded-lg bg-gradient-to-br from-red-50 to-pink-50 px-4">
      <div className="w-full max-w-md text-center">
        {/* Ícone de Erro */}
        <div className="mb-8">
          <div className="mb-4 text-6xl text-red-500">
            <FaExclamationTriangle className="mx-auto" />
          </div>
          <div className="text-2xl font-bold text-red-600">Ops!</div>
        </div>

        {/* Título e Descrição */}
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">Algo deu errado</h1>
          <p className="mb-2 text-gray-600">
            Ocorreu um erro inesperado. Nossa equipe foi notificada e estamos trabalhando para
            resolver.
          </p>
          <p className="text-sm text-gray-500">Tente recarregar a página ou voltar ao início.</p>
        </div>

        {/* Detalhes do Erro (apenas em desenvolvimento) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mb-6 rounded-lg bg-gray-100 p-4 text-left">
            <p className="mb-2 text-xs text-gray-600">
              Detalhes do erro (apenas em desenvolvimento):
            </p>
            <code className="text-xs break-all text-red-600">{error.message}</code>
            {error.digest && <p className="mt-2 text-xs text-gray-500">ID: {error.digest}</p>}
          </div>
        )}

        {/* Botões de Ação */}
        <div className="space-y-4">
          {/* Botão Tentar Novamente */}
          <button
            onClick={reset}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 px-6 py-3 text-white transition-colors duration-200 hover:bg-red-600 focus:ring-2 focus:ring-red-300 focus:outline-none"
          >
            <FaRedo className="h-4 w-4" />
            Tentar Novamente
          </button>

          {/* Botão Ir para o Início */}
          <Link
            href="/"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-500 px-6 py-3 text-white transition-colors duration-200 hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-300 focus:outline-none"
          >
            <FaHome className="h-4 w-4" />
            Ir para o Início
          </Link>
        </div>

        {/* Links Úteis */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <p className="mb-3 text-sm text-gray-500">Precisa de ajuda?</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/home" className="text-red-600 transition-colors hover:text-red-700">
              Início
            </Link>
            <Link href="/notes" className="text-red-600 transition-colors hover:text-red-700">
              Minhas Notas
            </Link>
            <Link href="/settings" className="text-red-600 transition-colors hover:text-red-700">
              Configurações
            </Link>
          </div>
        </div>

        {/* Marca */}
        <div className="mt-8">
          <div className="inline-block rounded-md bg-yellow-500 px-4 py-2 text-lg font-bold text-white">
            CodaWeb Notes
          </div>
        </div>
      </div>
    </div>
  );
}
