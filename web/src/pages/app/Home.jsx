"use client";
import { useNotes } from "../../context/NotesContext";
import { useAuth } from "../../context/AuthContext";
import { SkeletonWrapper } from "../../components/ui/GenericSkeleton";
import { FileText, Tag, TrendingUp, Clock } from "lucide-react";

const Home = () => {
  const { user } = useAuth();
  const { loading, error, getRecentNotes, getNotesStats } = useNotes();

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
      <div className="p-4 space-y-4 overflow-y-auto flex-1 min-h-0">
        <div className="bg-slate-900 rounded-lg p-5">
          <h3 className="text-slate-50 text-xl font-semibold mb-2 tracking-tight">
            Olá, {user?.name || "Usuário"}! 👋
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Aqui está um resumo das suas notas e atividades recentes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-slate-900 rounded-lg p-5 hover:bg-slate-900/80 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-slate-800 rounded-lg">
                <FileText className="w-5 h-5 text-slate-300" />
              </div>
              <h4 className="font-medium text-sm text-slate-300">
                Total de Notas
              </h4>
            </div>
            <p className="text-3xl font-bold text-slate-50 tracking-tight">
              {stats.totalNotes}
            </p>
          </div>

          <div className="bg-slate-900 rounded-lg p-5 hover:bg-slate-900/80 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-slate-800 rounded-lg">
                <Tag className="w-5 h-5 text-slate-300" />
              </div>
              <h4 className="font-medium text-sm text-slate-300">
                Tags Únicas
              </h4>
            </div>
            <p className="text-3xl font-bold text-slate-50 tracking-tight">
              {stats.totalTags}
            </p>
          </div>

          <div className="bg-slate-900 rounded-lg p-5 hover:bg-slate-900/80 transition-colors sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-slate-800 rounded-lg">
                <TrendingUp className="w-5 h-5 text-slate-300" />
              </div>
              <h4 className="font-medium text-sm text-slate-300">
                Atividade Semanal
              </h4>
            </div>
            <p className="text-3xl font-bold text-slate-50 tracking-tight">
              {stats.doneStatus}
            </p>
          </div>
        </div>

        <div className="">
          {stats.mostUsedTags.length > 0 && (
            <div className="bg-slate-900 rounded-lg p-4">
              <h3 className="text-slate-50 text-lg font-semibold mb-4 tracking-tight">
                Tags Mais Usadas
              </h3>

              <div className="flex flex-wrap gap-2.5">
                {stats.mostUsedTags.map((tagInfo, index) => (
                  <div
                    key={index}
                    className="bg-slate-800 hover:bg-slate-750 text-slate-100 px-3.5 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer"
                  >
                    <span>{tagInfo.tag}</span>
                    <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-md font-semibold">
                      {tagInfo.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-900 rounded-lg p-4">
          <h3 className="text-slate-50 text-lg font-semibold mb-4 tracking-tight">
            Notas Recentes
          </h3>

          {recentNotes.length === 0 ? (
            <div className="text-slate-400 text-center py-8 text-sm leading-relaxed">
              Você ainda não tem notas. Que tal criar sua primeira nota?
            </div>
          ) : (
            <div className="space-y-3">
              {recentNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-slate-800 rounded-lg p-4 hover:bg-slate-750 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <h4 className="text-slate-100 font-semibold text-base truncate group-hover:text-slate-50 transition-colors">
                      {note.title}
                    </h4>
                    <div className="flex items-center gap-1.5 text-slate-400 flex-shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-xs">
                        {new Date(note.lastModified).toLocaleDateString(
                          "pt-BR"
                        )}
                      </span>
                    </div>
                  </div>

                  {note.preview && (
                    <p className="text-slate-400 text-sm mb-3 line-clamp-2 leading-relaxed">
                      {note.preview}
                    </p>
                  )}

                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {note.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="bg-slate-700 text-slate-300 text-xs px-2.5 py-1 rounded-md font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="text-slate-400 text-xs px-2 py-1 font-medium">
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
      </div>
    </div>
  );
};

export default Home;
