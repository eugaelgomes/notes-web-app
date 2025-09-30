import React from "react";
import { useNotes } from "../context/NotesContext";
import { useAuth } from "../context/AuthContext";
import { SkeletonWrapper } from "../components/ui/GenericSkeleton";

const Home = () => {
  const { user } = useAuth();
  const { notesOverview, loading, error, getRecentNotes, getNotesStats } =
    useNotes();

  const recentNotes = getRecentNotes();
  const stats = getNotesStats();

  if (loading) {
    return (
      <SkeletonWrapper 
        loading={true}
        type="detail"
        showHeader={true}
        className="h-full bg-slate-950 rounded-md"
      />
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col bg-slate-950 rounded-md">
        <div className="flex justify-center border-b border-slate-800 p-2 flex-shrink-0">
          <h2 className="text-slate-200 text-base font-medium">Início</h2>
        </div>
        <div className="flex-1 flex justify-center items-center">
          <div className="text-red-400 text-sm">
            Erro ao carregar notas: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-950 rounded-md overflow-hidden">
      <div className="flex justify-center border-b border-slate-800 p-2 flex-shrink-0">
        <h2 className="text-slate-200 text-base font-medium">Início</h2>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto flex-1 min-h-0">
        {/* Boas-vindas */}

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-slate-900 rounded-md p-3">
            <h3 className="text-slate-100 text-sm font-medium mb-1">
              Olá, {user?.name || "Usuário"}! 👋
            </h3>
            <p className="text-slate-400 text-xs">
              Aqui está um resumo das suas notas e atividades recentes.
            </p>
          </div>

          <div className="bg-slate-900 rounded-md p-3 text-slate-200">
            <h4 className="font-medium text-xs">Total de Notas</h4>
            <p className="text-lg font-semibold">{stats.totalNotes}</p>
          </div>
          <div className="bg-slate-900 rounded-md p-3 text-slate-200">
            <h4 className="font-medium text-xs">Tags Únicas</h4>
            <p className="text-lg font-semibold">{stats.totalTags}</p>
          </div>
          <div className="bg-slate-900 rounded-md p-3 text-slate-200">
            <h4 className="font-medium text-xs">Atividade Semanal</h4>
            <p className="text-lg font-semibold">{stats.recentActivity}</p>
          </div>
        </div>

        {/* Notas Recentes */}
        <div className="bg-slate-900 rounded-md p-3">
          <h3 className="text-slate-100 text-sm font-medium mb-2">
            Notas Recentes
          </h3>

          {recentNotes.length === 0 ? (
            <div className="text-slate-500 text-center py-4 text-sm">
              Você ainda não tem notas. Que tal criar sua primeira nota?
            </div>
          ) : (
            <div className="space-y-2">
              {recentNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-slate-800 rounded-md p-2 hover:bg-slate-700 transition-colors"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-slate-200 font-medium text-sm truncate">
                      {note.title}
                    </h4>
                    <span className="text-xs text-slate-500 ml-2">
                      {new Date(note.lastModified).toLocaleDateString("pt-BR")}
                    </span>
                  </div>

                  {note.preview && (
                    <p className="text-slate-400 text-xs mb-1 line-clamp-2">
                      {note.preview}
                    </p>
                  )}

                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="bg-slate-700 text-slate-300 text-[10px] px-1.5 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="text-slate-500 text-[10px] px-1 py-0.5">
                          +{note.tags.length - 3} mais
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tags Mais Usadas */}
        {stats.mostUsedTags.length > 0 && (
          <div className="bg-slate-900 rounded-md p-3">
            <h3 className="text-slate-100 text-sm font-medium mb-2">
              Tags Mais Usadas
            </h3>

            <div className="flex flex-wrap gap-1.5">
              {stats.mostUsedTags.map((tagInfo, index) => (
                <div
                  key={index}
                  className="bg-slate-800 text-slate-200 px-2 py-1 rounded-md flex items-center gap-1 text-xs"
                >
                  <span>{tagInfo.tag}</span>
                  <span className="bg-slate-700 text-[10px] px-1.5 py-0.5 rounded">
                    {tagInfo.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ações Rápidas */}
        <div className="bg-slate-900 rounded-md p-3">
          <h3 className="text-slate-100 text-sm font-medium mb-2">
            Ações Rápidas
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <button className="bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 px-3 rounded-md text-sm transition-colors">
              ✏️ Criar Nova Nota
            </button>
            <button className="bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 px-3 rounded-md text-sm transition-colors">
              📝 Ver Todas as Notas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
