"use client";

import React from "react";
import Link from "next/link";
import { FaHome, FaSearch, FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex h-full min-h-[60vh] items-center justify-center rounded-lg bg-gradient-to-br from-neutral-50 to-neutral-100 px-4">
      <div className="w-full max-w-md text-center">
        {/* Ilustração/Número 404 */}
        <div className="mb-8">
          <div className="mb-4 text-8xl font-bold text-yellow-500">404</div>
          <div className="mb-4 text-6xl">🔍</div>
        </div>

        {/* Título e Descrição */}
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold text-neutral-950">Página não encontrada</h1>
          <p className="mb-2 text-neutral-800">
            Ops! A página que você está procurando não existe ou foi movida.
          </p>
          <p className="text-sm text-neutral-800">
            Verifique o URL ou use os links abaixo para navegar.
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="space-y-4">
          {/* Botão Voltar */}
          <button
            onClick={() => router.back()}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-800 px-6 py-3 text-white transition-colors duration-200 hover:bg-neutral-950 focus:ring-2 focus:ring-neutral-300 focus:outline-none"
          >
            <FaArrowLeft className="h-4 w-4" />
            Voltar
          </button>

          {/* Botão Início */}
          <Link
            href="/"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-500 px-6 py-3 text-white transition-colors duration-200 hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-300 focus:outline-none"
          >
            <FaHome className="h-4 w-4" />
            Ir para o Início
          </Link>

          {/* Botão Minhas Notas */}
          <Link
            href="/notes"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-500 px-6 py-3 text-white transition-colors duration-200 hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-300 focus:outline-none"
          >
            <FaSearch className="h-4 w-4" />
            Minhas Notas
          </Link>
        </div>

        {/* Links Úteis */}
        <div className="mt-8 border-t border-neutral-200 pt-6">
          <p className="mb-3 text-sm text-neutral-800">Links úteis:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/home" className="text-yellow-500 transition-colors hover:text-yellow-600">
              Início
            </Link>
            <Link href="/notes" className="text-yellow-500 transition-colors hover:text-yellow-600">
              Notas
            </Link>
            <Link
              href="/settings"
              className="text-yellow-500 transition-colors hover:text-yellow-600"
            >
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
