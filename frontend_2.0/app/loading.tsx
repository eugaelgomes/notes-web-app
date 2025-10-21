"use client";

import React from "react";

export default function Loading() {
  return (
    <div className="h-full min-h-[60vh] bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg flex items-center justify-center">
      <div className="text-center">
        {/* Spinner principal */}
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto">
            <div className="w-full h-full border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin"></div>
          </div>
        </div>

        {/* Logo */}
        <div className="mb-4">
          <div className="inline-block bg-yellow-500 text-white px-4 py-2 rounded-md font-bold text-lg">
            CodaWeb Notes
          </div>
        </div>

        {/* Texto de carregamento */}
        <div className="space-y-2">
          <p className="text-gray-700 font-medium">Carregando...</p>
          <p className="text-sm text-gray-500">Preparando tudo para você</p>
        </div>

        {/* Indicador de pontos animados */}
        <div className="mt-4 flex justify-center space-x-1">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce [animation-delay:0.1s]"></div>
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
        </div>
      </div>
    </div>
  );
}