"use client";

import React, { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  X,
  Clock,
  Calendar,
  SortAsc,
} from "lucide-react";
import { getCollaboratorDisplayName, getCollaboratorAvatarUrl } from "@/app/utils/collaborators";

// =================== TYPES ===================
interface PaginationData {
  currentPage: number;
  totalPages: number;
  total: number;
}

type SortBy = "updated_at" | "title" | "created_at";
type SortOrder = "asc" | "desc";

// =================== IMPORTS DOS NOSSOS NOVOS HOOKS ===================
import { useNotes } from "../../hooks/useNotes";
import { useRouter } from "next/navigation";
// import { useDebounce } from "../../hooks/UseDebounce"
import Pagination from "../../components/ui/pagination";
import Link from "next/link";
import Image from "next/image";

// =================== IMPORTS DOS SKELETONS ===================
// import {
//   NotesPageSkeleton,
//   NotesHeaderSkeleton,
//   NotesListSkeleton,
//   PaginationSkeleton,
// } from "../../components/ui/NotesListSkeleton"

// Imports originais
// remover import futuramente
// import MappingNotes from "../../components/modals/MappingNotes"

const NotesWithPagination = () => {
  // =================== ROUTER ===================
  const router = useRouter();

  // =================== ESTADOS DA INTERFACE ===================
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);

  const [sortBy, setSortBy] = useState<SortBy>("updated_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // =================== HOOK DE DADOS ===================
  const { notes: allNotes, loading: isLoading, error, createNote } = useNotes();

  // =================== LÓGICA DE PAGINAÇÃO E FILTROS ===================
  const debouncedSearch = searchTerm; // Temporário - usar useDebounce quando disponível

  // Filtrar notas baseado na busca e tags selecionadas
  const filteredNotes = React.useMemo(() => {
    let result = allNotes;

    // Filtro por busca
    if (debouncedSearch.trim()) {
      const searchLower = debouncedSearch.toLowerCase();
      result = result.filter(
        (note) =>
          note.title.toLowerCase().includes(searchLower) ||
          note.description?.toLowerCase().includes(searchLower) ||
          note.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    // Filtro por tags
    if (selectedTags.length > 0) {
      result = result.filter((note) =>
        selectedTags.every((selectedTag) => note.tags?.includes(selectedTag))
      );
    }

    // Ordenação
    result.sort((a, b) => {
      let aValue: string | Date = "";
      let bValue: string | Date = "";

      switch (sortBy) {
        case "title":
          aValue = a.title;
          bValue = b.title;
          break;
        case "created_at":
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case "updated_at":
        default:
          aValue = new Date(a.updated_at || a.created_at);
          bValue = new Date(b.updated_at || b.created_at);
          break;
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return result;
  }, [allNotes, debouncedSearch, selectedTags, sortBy, sortOrder]);

  // Paginação manual
  const totalNotes = filteredNotes.length;
  const totalPages = Math.ceil(totalNotes / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const notes = filteredNotes.slice(startIndex, endIndex);

  const pagination: PaginationData = {
    currentPage: currentPage,
    totalPages: totalPages,
    total: totalNotes,
  };

  // Estados de loading (simplificados)
  const isPreviousData = false; // Como não temos cache, sempre é false

  // =================== LÓGICA DE LOADING INTELIGENTE ===================
  const showFullSkeleton = isLoading && !isPreviousData && notes.length === 0;
  const showOverlayLoading = isLoading && isPreviousData;
  const showListSkeleton =
    isLoading && !isPreviousData && debouncedSearch !== searchTerm;

  React.useEffect(() => {
    console.log("🔍 Estados de loading:", {
      isLoading,
      isPreviousData,
      showFullSkeleton,
      showOverlayLoading,
      showListSkeleton,
      notesCount: notes.length,
    });
  }, [
    isLoading,
    isPreviousData,
    showFullSkeleton,
    showOverlayLoading,
    showListSkeleton,
    notes.length,
  ]);

  // Resetar página quando totalPages mudar devido a filtros
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  // =================== HANDLERS DE EVENTOS ===================
  const handlePageChange = (newPage: number) => {
    console.log(`📄 Mudando para página ${newPage}`);
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) => {
      const newTags = prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag];

      setCurrentPage(1);
      return newTags;
    });
  };

  const handleSortChange = (
    newSortBy: SortBy,
    newSortOrder: SortOrder = sortOrder
  ) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTags([]);
    setCurrentPage(1);
    setShowFilters(false);
  };

  const handleCreateNote = async () => {
    try {
      const newNote = await createNote({
        title: 'Nova Nota',
        description: '',
        tags: []
      });
      
      if (newNote) {
        // Redirecionar para a página de edição da nova nota
        router.push(`/app/notes/view/[${newNote.id}]`);
      }
    } catch (error) {
      console.error('Erro ao criar nota:', error);
      alert('Erro ao criar nova nota. Tente novamente.');
    }
  };

  // =================== COMPUTAÇÕES DERIVADAS ===================
  const availableTags: string[] = [
    ...new Set(allNotes.flatMap((note) => note.tags || [])),
  ].sort();

  // =================== RENDER CONDICIONAL SIMPLIFICADO ===================
  if (error) {
    return (
      <div className="flex-1 flex flex-col p-6 space-y-6">
        <div className="bg-slate-900 p-4 rounded-lg shadow-lg border border-slate-800">
          <h2 className="text-white text-2xl font-bold">Notas</h2>
        </div>
        <div className="bg-red-950/30 border border-red-800 rounded-lg p-8 text-center">
          <div className="text-red-400 text-xl font-semibold mb-3">
            Erro ao carregar notas
          </div>
          <p className="text-red-300/80 text-sm">Erro desconhecido</p>
        </div>
      </div>
    );
  }

  if (showFullSkeleton) {
    return (
      <div className="h-full flex flex-col bg-slate-950 rounded-lg">
        <div className="flex-shrink-0 p-4 lg:p-6 rounded-lg shadow-lg border-b border-slate-800">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-800 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-slate-800 rounded w-1/2"></div>
          </div>
        </div>
        <div className="flex-1 p-6 lg:p-8">
          <div className="space-y-4">
            {Array.from({ length: itemsPerPage }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-6 bg-slate-800 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-800 rounded w-full mb-1"></div>
                <div className="h-4 bg-slate-800 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-neutral-950 border border-neutral-800 rounded-lg">
      {/* =================== HEADER COM LOADING INTELIGENTE =================== */}
      {showListSkeleton ? (
        <div className="flex-shrink-0 p-4 lg:p-6 rounded-lg shadow-lg border-b border-slate-800">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-800 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-slate-800 rounded w-1/2"></div>
          </div>
        </div>
      ) : (
        <div className="flex-shrink-0 p-4 lg:p-6 rounded-lg shadow-lg border-b border-slate-800">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1 min-w-0">
              <h2 className="text-white text-2xl lg:text-3xl font-bold tracking-tight mb-2">
                Minhas Notas
              </h2>
              <div className="flex items-center gap-2 text-sm">
                {showOverlayLoading ? (
                  <span className="inline-flex items-center gap-2 text-slate-400">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>Atualizando...</span>
                  </span>
                ) : (
                  <p className="text-slate-400">
                    <span className="font-medium text-slate-300">
                      Página {pagination.currentPage}
                    </span>{" "}
                    de {pagination.totalPages}
                    <span className="text-slate-600 mx-2">•</span>
                    <span className="font-medium text-slate-300">
                      {pagination.total}
                    </span>{" "}
                    notas no total
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:flex-initial">
                <Search
                  className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Buscar notas..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full lg:w-72 text-sm transition-all"
                />
                {searchTerm !== debouncedSearch && (
                  <div className="absolute right-3.5 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2.5 rounded-lg transition-all flex items-center gap-2 text-sm font-medium flex-1 sm:flex-initial justify-center ${
                    showFilters || selectedTags.length > 0
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
                  }`}
                >
                  <Filter size={16} />
                  <span>Filtros</span>
                  {selectedTags.length > 0 && (
                    <span className="bg-blue-500 text-white text-xs font-semibold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                      {selectedTags.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={handleCreateNote}
                  className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2 text-sm font-medium flex-1 sm:flex-initial justify-center shadow-lg shadow-green-600/20"
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">Nova Nota</span>
                  <span className="sm:hidden">Nova</span>
                </button>
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="mt-6 pt-6 border-t border-slate-800 space-y-5">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-slate-300 text-sm font-semibold">
                    Filtrar por Tags
                  </span>
                  {selectedTags.length > 0 && (
                    <span className="text-xs text-slate-500">
                      ({selectedTags.length} selecionada
                      {selectedTags.length > 1 ? "s" : ""})
                    </span>
                  )}
                </div>

                {availableTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                          selectedTags.includes(tag)
                            ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                            : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">
                    Nenhuma tag disponível
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <span className="text-slate-300 text-sm font-semibold flex items-center gap-2">
                  <SortAsc size={16} />
                  Ordenar por
                </span>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleSortChange("updated_at", "desc")}
                    className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      sortBy === "updated_at" && sortOrder === "desc"
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                        : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
                    }`}
                  >
                    <Clock size={14} />
                    Mais recentes
                  </button>

                  <button
                    onClick={() => handleSortChange("title", "asc")}
                    className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      sortBy === "title" && sortOrder === "asc"
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                        : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
                    }`}
                  >
                    <SortAsc size={14} />
                    Alfabética A-Z
                  </button>

                  <button
                    onClick={() => handleSortChange("created_at", "asc")}
                    className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      sortBy === "created_at" && sortOrder === "asc"
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                        : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
                    }`}
                  >
                    <Calendar size={14} />
                    Mais antigas
                  </button>
                </div>
              </div>

              {(searchTerm || selectedTags.length > 0) && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-red-600/90 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-all flex items-center gap-2 shadow-md shadow-red-600/20"
                  >
                    <X size={14} />
                    Limpar todos os filtros
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =================== LISTA DE NOTAS COM SKELETON LOADING =================== */}
      <div className="flex-1 rounded-lg shadow-lg p-6 lg:p-8 overflow-y-auto no-scrollbar min-h-0">
        {showListSkeleton && (
          <div className="space-y-4">
            {Array.from({ length: itemsPerPage }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-6 bg-slate-800 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-800 rounded w-full mb-1"></div>
                <div className="h-4 bg-slate-800 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        )}

        {isLoading &&
          !isPreviousData &&
          !showListSkeleton &&
          notes.length === 0 && (
            <div className="space-y-4">
              {Array.from({ length: itemsPerPage }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-6 bg-slate-800 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-slate-800 rounded w-full mb-1"></div>
                  <div className="h-4 bg-slate-800 rounded w-5/6"></div>
                </div>
              ))}
            </div>
          )}

        {!isLoading && !showListSkeleton && notes.length === 0 && (
          <div className="text-center py-16">
            <div className="text-slate-400 text-xl font-semibold mb-3">
              {searchTerm || selectedTags.length > 0
                ? "🔍 Nenhuma nota encontrada"
                : "📝 Você ainda não tem notas"}
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              {searchTerm || selectedTags.length > 0
                ? "Tente ajustar sua busca ou filtros para encontrar o que procura"
                : "Comece criando sua primeira nota para organizar suas ideias"}
            </p>
          </div>
        )}

        {!showListSkeleton && notes.length > 0 && (
          <div
            className={`relative ${
              showOverlayLoading ? "opacity-70" : ""
            } transition-opacity duration-200`}
          >
            {showOverlayLoading && (
              <div className="absolute top-0 right-0 z-10">
                <div className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-xl shadow-blue-600/30">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Atualizando
                </div>
              </div>
            )}

            {/* Lista simples de notas - substituir pelo MappingNotes quando disponível */}
            <div className="space-y-4">
              {notes.map((note) => (
                <Link
                  key={note.id}
                  href={`/app/notes/view/${note.id}`}
                  className="block"
                >
                  <div className="bg-neutral-950 border border-slate-800 rounded-lg p-4 hover:bg-slate-800 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-white font-semibold group-hover:text-blue-400 transition-colors">
                        {note.title || 'Nota sem título'}
                      </h3>
                      {note.updated_at && (
                        <span className="text-slate-500 text-xs">
                          {new Date(note.updated_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      )}
                    </div>
                    {note.description && (
                      <p className="text-slate-400 text-sm line-clamp-2 mb-2">
                        {note.description.length > 150 
                          ? note.description.substring(0, 150) + '...'
                          : note.description
                        }
                      </p>
                    )}
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {note.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {note.tags.length > 3 && (
                          <span className="text-slate-500 text-xs px-2 py-0.5">
                            +{note.tags.length - 3} mais
                          </span>
                        )}
                      </div>
                    )}

                    {note.collaborators && note.collaborators.length > 0 && (
                      <div className="flex items-center gap-2 mt-3">
                      <div className="flex -space-x-2">
                        {note.collaborators.slice(0, 3).map((collab, index) => {
                          const displayName = getCollaboratorDisplayName(collab);
                          const avatarUrl = getCollaboratorAvatarUrl(collab);
                          
                          return (
                            <div
                              key={index}
                              className="relative w-8 h-8 rounded-full bg-blue-600 border-2 border-slate-900 flex items-center justify-center overflow-hidden"
                              title={displayName}
                            >
                              {avatarUrl ? (
                                <Image
                                  width={32}
                                  height={32}
                                  src={avatarUrl}
                                  alt={displayName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-white text-xs font-semibold">
                                  {displayName.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                          );
                        })}
                        {note.collaborators.length > 3 && (
                        <div className="relative w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center">
                          <span className="text-slate-300 text-xs font-semibold">
                          +{note.collaborators.length - 3}
                          </span>
                        </div>
                        )}
                      </div>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* =================== PAGINAÇÃO COM SKELETON =================== */}
      {pagination.totalPages > 1 && (
        <div className="flex-shrink-0 border-t border-slate-800 bg-slate-900/50">
          {showListSkeleton ? (
            <div className="px-6 py-4">
              <div className="animate-pulse flex items-center justify-center">
                <div className="h-8 bg-slate-800 rounded w-32"></div>
              </div>
            </div>
          ) : (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              showInfo={true}
              className="px-6"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default NotesWithPagination;
