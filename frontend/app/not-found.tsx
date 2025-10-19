"use client";

import React from "react";
import Link from "next/link";
import { FaHome, FaSearch, FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="h-full min-h-[60vh] bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Ilustração/Número 404 */}
        <div className="mb-8">
          <div className="text-8xl font-bold text-yellow-500 mb-4">404</div>
          <div className="text-6xl mb-4">🔍</div>
        </div>

        {/* Título e Descrição */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Página não encontrada
          </h1>
          <p className="text-gray-600 mb-2">
            Ops! A página que você está procurando não existe ou foi movida.
          </p>
          <p className="text-sm text-gray-500">
            Verifique o URL ou use os links abaixo para navegar.
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="space-y-4">
          {/* Botão Voltar */}
          <button
            onClick={() => router.back()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <FaArrowLeft className="w-4 h-4" />
            Voltar
          </button>

          {/* Botão Início */}
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-300"
          >
            <FaHome className="w-4 h-4" />
            Ir para o Início
          </Link>

          {/* Botão Minhas Notas */}
          <Link
            href="/notes"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <FaSearch className="w-4 h-4" />
            Minhas Notas
          </Link>
        </div>

        {/* Links Úteis */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3">Links úteis:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link
              href="/home"
              className="text-yellow-600 hover:text-yellow-700 transition-colors"
            >
              Início
            </Link>
            <Link
              href="/notes"
              className="text-yellow-600 hover:text-yellow-700 transition-colors"
            >
              Notas
            </Link>
            <Link
              href="/settings"
              className="text-yellow-600 hover:text-yellow-700 transition-colors"
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