"use client"

import React, { useState } from "react"
import { Search, Filter, Plus, X, Clock, Calendar, SortAsc } from "lucide-react"

// =================== IMPORTS DOS NOSSOS NOVOS HOOKS ===================
import { useNotesQueryPaginated } from "../../hooks/useNotesQuery"
import { useDebounce } from "../../hooks/UseDebounce"
import { useLoadingState } from "../../hooks/UseLoadingState"
import Pagination from "../../components/ui/Pagination"

// =================== IMPORTS DOS SKELETONS ===================
import {
  NotesPageSkeleton,
  NotesHeaderSkeleton,
  NotesListSkeleton,
  PaginationSkeleton,
} from "../../components/ui/NotesListSkeleton"

// Imports originais
import MappingNotes from "../../components/modals/MappingNotes"

const NotesWithPagination = () => {
  // =================== ESTADOS DA INTERFACE ===================
  const [selectedNote, setSelectedNote] = useState(null)
  const [modalMode, setModalMode] = useState("view")
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTags, setSelectedTags] = useState([])
  const [showFilters, setShowFilters] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  const [sortBy, setSortBy] = useState("updated_at")
  const [sortOrder, setSortOrder] = useState("desc")

  // =================== OTIMIZAÇÃO COM DEBOUNCE ===================
  const debouncedSearch = useDebounce(searchTerm, 300)

  // =================== HOOK DE DADOS COM PAGINAÇÃO ===================
  const {
    data: paginatedData,
    isLoading,
    error,
    isPreviousData,
    isInitialLoading,
  } = useNotesQueryPaginated({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch,
    tags: selectedTags,
    sortBy,
    sortOrder,
  })

  const loadingState = useLoadingState({
    minLoadingTime: 300,
    showSkeletonTime: 200,
  })

  const notes = paginatedData?.notes || []
  const pagination = paginatedData?.pagination || {
    currentPage: 1,
    totalPages: 1,
    total: 0,
  }

  // =================== LÓGICA DE LOADING INTELIGENTE ===================
  const showFullSkeleton = isLoading && !isPreviousData && notes.length === 0
  const showOverlayLoading = isLoading && isPreviousData
  const showListSkeleton = isLoading && !isPreviousData && debouncedSearch !== searchTerm

  React.useEffect(() => {
    console.log("🔍 Estados de loading:", {
      isLoading,
      isPreviousData,
      showFullSkeleton,
      showOverlayLoading,
      showListSkeleton,
      notesCount: notes.length,
    })
  }, [isLoading, isPreviousData, showFullSkeleton, showOverlayLoading, showListSkeleton, notes.length])

  // =================== HANDLERS DE EVENTOS ===================
  const handlePageChange = (newPage) => {
    console.log(`📄 Mudando para página ${newPage}`)
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleTagToggle = (tag) => {
    setSelectedTags((prev) => {
      const newTags = prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]

      setCurrentPage(1)
      return newTags
    })
  }

  const handleSortChange = (newSortBy, newSortOrder = sortOrder) => {
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedTags([])
    setCurrentPage(1)
    setShowFilters(false)
  }

  // =================== COMPUTAÇÕES DERIVADAS ===================
  const availableTags = [...new Set(notes.flatMap((note) => note.tags || []))].sort()

  // =================== RENDER CONDICIONAL COM SKELETON ===================
  if (error) {
    return (
      <div className="flex-1 flex flex-col p-6 space-y-6">
        <div className="bg-slate-900 p-4 rounded-lg shadow-lg border border-slate-800">
          <h2 className="text-white text-2xl font-bold">Notas</h2>
        </div>
        <div className="bg-red-950/30 border border-red-800 rounded-lg p-8 text-center">
          <div className="text-red-400 text-xl font-semibold mb-3">Erro ao carregar notas</div>
          <p className="text-red-300/80 text-sm">{error.message || error}</p>
        </div>
      </div>
    )
  }

  if (showFullSkeleton) {
    return <NotesPageSkeleton noteCount={itemsPerPage} showPagination={true} />
  }

  return (
    <div className="h-full flex flex-col bg-slate-950 rounded-lg">
      {/* =================== HEADER COM LOADING INTELIGENTE =================== */}
      {showListSkeleton ? (
        <NotesHeaderSkeleton />
      ) : (
        <div className="flex-shrink-0 p-4 lg:p-6 rounded-lg shadow-lg border-b border-slate-800">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1 min-w-0">
              <h2 className="text-white text-2xl lg:text-3xl font-bold tracking-tight mb-2">Minhas Notas</h2>
              <div className="flex items-center gap-2 text-sm">
                {showOverlayLoading ? (
                  <span className="inline-flex items-center gap-2 text-slate-400">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>Atualizando...</span>
                  </span>
                ) : (
                  <p className="text-slate-400">
                    <span className="font-medium text-slate-300">Página {pagination.currentPage}</span> de{" "}
                    {pagination.totalPages}
                    <span className="text-slate-600 mx-2">•</span>
                    <span className="font-medium text-slate-300">{pagination.total}</span> notas no total
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:flex-initial">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
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
                  onClick={() => {
                    /* handleCreateNote */
                  }}
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
                  <span className="text-slate-300 text-sm font-semibold">Filtrar por Tags</span>
                  {selectedTags.length > 0 && (
                    <span className="text-xs text-slate-500">
                      ({selectedTags.length} selecionada{selectedTags.length > 1 ? "s" : ""})
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
                  <p className="text-slate-500 text-sm">Nenhuma tag disponível</p>
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
      <div className="flex-1 rounded-lg shadow-lg p-6 lg:p-8 overflow-y-auto min-h-0">
        {showListSkeleton && <NotesListSkeleton count={itemsPerPage} />}

        {isLoading && !isPreviousData && !showListSkeleton && notes.length === 0 && (
          <NotesListSkeleton count={itemsPerPage} />
        )}

        {!isLoading && !showListSkeleton && notes.length === 0 && (
          <div className="text-center py-16">
            <div className="text-slate-400 text-xl font-semibold mb-3">
              {searchTerm || selectedTags.length > 0 ? "🔍 Nenhuma nota encontrada" : "📝 Você ainda não tem notas"}
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              {searchTerm || selectedTags.length > 0
                ? "Tente ajustar sua busca ou filtros para encontrar o que procura"
                : "Comece criando sua primeira nota para organizar suas ideias"}
            </p>
          </div>
        )}

        {!showListSkeleton && notes.length > 0 && (
          <div className={`relative ${showOverlayLoading ? "opacity-70" : ""} transition-opacity duration-200`}>
            {showOverlayLoading && (
              <div className="absolute top-0 right-0 z-10">
                <div className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-xl shadow-blue-600/30">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Atualizando
                </div>
              </div>
            )}

            <MappingNotes
              notes={notes}
              onViewNote={() => {
                /* handleViewNote */
              }}
              onEditNote={() => {
                /* handleEditNote */
              }}
              onDeleteNote={() => {
                /* handleDeleteNote */
              }}
              loading={false}
            />
          </div>
        )}
      </div>

      {/* =================== PAGINAÇÃO COM SKELETON =================== */}
      {pagination.totalPages > 1 && (
        <div className="flex-shrink-0 border-t border-slate-800 bg-slate-900/50">
          {showListSkeleton ? (
            <PaginationSkeleton className="px-6" />
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
  )
}

export default NotesWithPagination
