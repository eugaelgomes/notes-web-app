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
      <div className="flex h-48 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-yellow-500"></div>
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
    <div className="flex min-h-screen flex-col bg-neutral-950">
      <div className="flex-1 space-y-4 overflow-y-auto">
        {/* Header */}
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
          <h3 className="mb-1 text-lg font-semibold tracking-tight text-neutral-100">
            Olá, {userName}! 👋
          </h3>
          <p className="text-xs leading-relaxed text-neutral-400">
            Aqui está um resumo das suas notas e atividades recentes.
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            {
              icon: <FileText className="h-4 w-4 text-neutral-300" />,
              label: "Total de Notas",
              value: stats.totalNotes,
            },
            {
              icon: <Tag className="h-4 w-4 text-neutral-300" />,
              label: "Tags Únicas",
              value: stats.totalTags,
            },
            {
              icon: <TrendingUp className="h-4 w-4 text-neutral-300" />,
              label: "Status Completo",
              value: stats.statusDistribution?.completed || 0,
            },
          ].map((item, i) => (
            <div
              key={i}
              className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 transition-colors hover:bg-neutral-900/80"
            >
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-md bg-neutral-800 p-1.5">{item.icon}</div>
                <h4 className="text-xs font-medium text-neutral-400">{item.label}</h4>
              </div>
              <p className="text-2xl font-bold tracking-tight text-neutral-100">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Tags mais usadas */}
        {stats.mostUsedTags.length > 0 && (
          <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
            <h3 className="mb-3 text-base font-semibold text-neutral-100">Tags Mais Usadas</h3>
            <div className="flex flex-wrap gap-2">
              {stats.mostUsedTags.map((tagInfo, index) => (
                <div
                  key={index}
                  className="flex cursor-pointer items-center gap-1.5 rounded-md bg-neutral-800 px-2.5 py-1.5 text-xs font-medium text-neutral-200 transition-colors hover:bg-neutral-800/70"
                >
                  <span>{tagInfo.tag}</span>
                  <span className="rounded bg-neutral-700 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-400">
                    {tagInfo.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notas Recentes */}
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
          <h3 className="mb-3 text-base font-semibold text-neutral-100">Notas Recentes</h3>

          {recentNotes.length === 0 ? (
            <div className="py-8 text-center text-neutral-400">
              <FileText className="mx-auto mb-2 h-10 w-10 text-neutral-600" />
              <p className="mb-1 text-base font-medium text-neutral-200">
                Você ainda não tem notas
              </p>
              <p className="mb-4 text-sm text-neutral-500">Que tal criar sua primeira nota?</p>
              <Link
                href="/notes"
                className="inline-flex items-center gap-2 rounded-md bg-yellow-500 px-3 py-1.5 text-sm font-medium text-neutral-950 transition-colors hover:bg-yellow-600"
              >
                <FileText className="h-4 w-4" />
                Criar Primeira Nota
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentNotes.map((note) => (
                <Link
                  key={note.id}
                  href={`/app/notes/view/${note.id}`}
                  className="group block cursor-pointer rounded-md bg-neutral-800 p-3 transition-all hover:bg-neutral-800/70"
                >
                  <div className="mb-1.5 flex items-start justify-between gap-2">
                    <h4 className="truncate text-sm font-semibold text-neutral-200 transition-colors group-hover:text-neutral-100">
                      {note.title}
                    </h4>
                    <div className="flex items-center gap-1 text-neutral-500">
                      <Clock className="h-3 w-3" />
                      <span className="text-[10px]">
                        {new Date(note.lastModified).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>

                  {note.preview && (
                    <p className="mb-2 line-clamp-2 text-xs leading-snug text-neutral-400">
                      {note.preview}
                    </p>
                  )}

                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {note.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="rounded bg-neutral-700 px-2 py-0.5 text-[10px] font-medium text-neutral-300"
                        >
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="px-1 py-0.5 text-[10px] font-medium text-neutral-500">
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
