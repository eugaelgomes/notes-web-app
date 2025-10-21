"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import { useNotes } from "../../contexts/NotesContext";
import { FileText, Tag, TrendingUp, Clock } from "lucide-react";

export default function HomePage() {
  const { authenticated, loading, user } = useAuth();
  const { getNotesStats, getRecentNotes } = useNotes();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!authenticated) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null;
  }

  const stats = getNotesStats();
  const recentNotes = getRecentNotes();
  const userName = String(user?.name || user?.username || "usuário");

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col ">
      <div className="flex-1 space-y-4 overflow-y-auto ">
        {/* Header */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
          <h3 className="text-neutral-100 text-lg font-semibold mb-1 tracking-tight">
            Olá, {userName}! 👋
          </h3>
          <p className="text-neutral-400 text-xs leading-relaxed">
            Aqui está um resumo das suas notas e atividades recentes.
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              icon: <FileText className="w-4 h-4 text-neutral-300" />,
              label: "Total de Notas",
              value: stats.totalNotes,
            },
            {
              icon: <Tag className="w-4 h-4 text-neutral-300" />,
              label: "Tags Únicas",
              value: stats.totalTags,
            },
            {
              icon: <TrendingUp className="w-4 h-4 text-neutral-300" />,
              label: "Status Completo",
              value: stats.statusDistribution?.completed || 0,
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 hover:bg-neutral-900/80 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-neutral-800 rounded-md">
                  {item.icon}
                </div>
                <h4 className="font-medium text-xs text-neutral-400">
                  {item.label}
                </h4>
              </div>
              <p className="text-2xl font-bold text-neutral-100 tracking-tight">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Tags mais usadas */}
        {stats.mostUsedTags.length > 0 && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
            <h3 className="text-neutral-100 text-base font-semibold mb-3">
              Tags Mais Usadas
            </h3>
            <div className="flex flex-wrap gap-2">
              {stats.mostUsedTags.map((tagInfo, index) => (
                <div
                  key={index}
                  className="bg-neutral-800 hover:bg-neutral-800/70 text-neutral-200 px-2.5 py-1.5 rounded-md flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer"
                >
                  <span>{tagInfo.tag}</span>
                  <span className="bg-neutral-700 text-neutral-400 text-[10px] px-1.5 py-0.5 rounded font-semibold">
                    {tagInfo.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notas Recentes */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
          <h3 className="text-neutral-100 text-base font-semibold mb-3">
            Notas Recentes
          </h3>

          {recentNotes.length === 0 ? (
            <div className="text-neutral-400 text-center py-8">
              <FileText className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
              <p className="text-base font-medium text-neutral-200 mb-1">
                Você ainda não tem notas
              </p>
              <p className="text-neutral-500 text-sm mb-4">
                Que tal criar sua primeira nota?
              </p>
              <Link
                href="/notes"
                className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-neutral-950 px-3 py-1.5 rounded-md font-medium text-sm transition-colors"
              >
                <FileText className="w-4 h-4" />
                Criar Primeira Nota
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentNotes.map((note) => (
                <Link
                  key={note.id}
                  href={`/app/notes/view/${note.id}`}
                  className="block bg-neutral-800 rounded-md p-3 hover:bg-neutral-800/70 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <h4 className="text-neutral-200 font-semibold text-sm truncate group-hover:text-neutral-100 transition-colors">
                      {note.title}
                    </h4>
                    <div className="flex items-center gap-1 text-neutral-500">
                      <Clock className="w-3 h-3" />
                      <span className="text-[10px]">
                        {new Date(note.lastModified).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>

                  {note.preview && (
                    <p className="text-neutral-400 text-xs mb-2 line-clamp-2 leading-snug">
                      {note.preview}
                    </p>
                  )}

                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {note.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="bg-neutral-700 text-neutral-300 text-[10px] px-2 py-0.5 rounded font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="text-neutral-500 text-[10px] px-1 py-0.5 font-medium">
                          +{note.tags.length - 3} mais
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
