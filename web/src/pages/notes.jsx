import React, { useState } from 'react';
import { FaPlus, FaSearch, FaFilter, FaTimes } from 'react-icons/fa';

// =================== IMPORTS DOS NOSSOS NOVOS HOOKS ===================
import { useNotesQueryPaginated } from '../hooks/useNotesQuery'; // Hook com paginação
import { useDebounce } from '../hooks/useDebounce'; // Hook para debounce
import { useLoadingState } from '../hooks/useLoadingState'; // Hook para loading states
import Pagination from '../components/UI/Pagination.jsx'; // Componente de paginação

// =================== IMPORTS DOS SKELETONS ===================
import { SkeletonWrapper } from '../components/UI/GenericSkeleton.jsx';

// Imports originais
import MappingNotes from '../components/Modals/mapping-notes.jsx';
//import ViewNotes from '../components/Modals/view-notes.jsx';

/**
 * =================== PÁGINA DE NOTAS COM PAGINAÇÃO ===================
 * 
 * Esta versão implementa:
 * ✅ Paginação inteligente
 * ✅ Busca com debounce (não faz requisição a cada letra digitada)
 * ✅ Filtros por tags
 * ✅ Ordenação
 * ✅ Loading states otimizados
 * ✅ Feedback visual para o usuário
 */

const Notes = () => {
  
  // =================== ESTADOS DA INTERFACE ===================
  
  // Estados para modals (mesmo da versão original)
  const [selectedNote, setSelectedNote] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'create'
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados para filtros e busca
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Fixo, mas poderia ser variável
  
  // Estados para ordenação
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // =================== OTIMIZAÇÃO COM DEBOUNCE ===================
  // A busca só acontece 300ms após o usuário parar de digitar
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  // =================== HOOK DE DADOS COM PAGINAÇÃO ===================
  const { 
    data: paginatedData, 
    isLoading, 
    error,
    isPreviousData, // Para mostrar loading state suave
    isInitialLoading, // Primeira vez carregando
  } = useNotesQueryPaginated({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch,
    tags: selectedTags,
    sortBy,
    sortOrder
  });
  
  // =================== LOADING STATE INTELIGENTE ===================
  const loadingState = useLoadingState({
    minLoadingTime: 300, // Mínimo de 300ms para evitar flash
    showSkeletonTime: 200,
  });
  
  // Extrai os dados da resposta paginada
  const notes = paginatedData?.notes || [];
  const pagination = paginatedData?.pagination || {
    currentPage: 1,
    totalPages: 1,
    total: 0
  };
  
  // =================== LÓGICA DE LOADING INTELIGENTE ===================
  
  // PRIMEIRO CARREGAMENTO: Mostra skeleton completo
  const showFullSkeleton = isLoading && !isPreviousData && notes.length === 0;
  
  // CARREGAMENTO COM DADOS ANTERIORES: Mostra overlay sutil
  const showOverlayLoading = isLoading && isPreviousData;
  
  // CARREGAMENTO DE BUSCA: Mostra skeleton da lista apenas
  const showListSkeleton = isLoading && !isPreviousData && (debouncedSearch !== searchTerm);
  
  // ESTADOS COMPUTADOS PARA DEBUG
  React.useEffect(() => {
    console.log('🔍 Estados de loading:', {
      isLoading,
      isPreviousData,
      showFullSkeleton,
      showOverlayLoading,
      showListSkeleton,
      notesCount: notes.length
    });
  }, [isLoading, isPreviousData, showFullSkeleton, showOverlayLoading, showListSkeleton, notes.length]);
  
  // =================== HANDLERS DE EVENTOS ===================
  
  // Handler para mudança de página
  const handlePageChange = (newPage) => {
    console.log(`📄 Mudando para página ${newPage}`); // Debug educativo
    setCurrentPage(newPage);
    
    // Scroll suave para o topo quando muda de página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Handler para busca (atualiza imediatamente na interface)
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Volta para primeira página quando busca
  };
  
  // Handler para filtro de tags
  const handleTagToggle = (tag) => {
    setSelectedTags(prev => {
      const newTags = prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag];
      
      setCurrentPage(1); // Volta para primeira página quando filtra
      return newTags;
    });
  };
  
  // Handler para ordenação
  const handleSortChange = (newSortBy, newSortOrder = sortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1); // Volta para primeira página quando ordena
  };
  
  // Handler para limpar filtros
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
    setCurrentPage(1);
    setShowFilters(false);
  };
  
  // =================== HANDLERS DE MODAL (mesmo da versão original) ===================
  // ... (mantém os mesmos handlers da versão original)
  
  // =================== COMPUTAÇÕES DERIVADAS ===================
  // Obter todas as tags únicas das notas atuais
  const availableTags = [...new Set(notes.flatMap(note => note.tags || []))].sort();
  
  // =================== RENDER CONDICIONAL COM SKELETON ===================
  
  // ERRO: Mostra tela de erro
  if (error) {
    return (
      <div className="flex-1 flex flex-col p-4 space-y-6">
        <div className="bg-gray-800 p-2 rounded-md text-center shadow-md">
          <h2 className="text-white text-xl font-bold">Notas</h2>
        </div>
        <div className="bg-red-900/20 border border-red-700 rounded-md p-6 text-center">
          <div className="text-red-400 text-lg mb-2">Erro ao carregar notas</div>
          <p className="text-red-300 text-sm">{error.message || error}</p>
        </div>
      </div>
    );
  }

  // PRIMEIRO CARREGAMENTO: Mostra skeleton completo
  if (showFullSkeleton) {
    return (
      <SkeletonWrapper 
        loading={true}
        type="list"
        count={itemsPerPage}
        showHeader={true}
        showActions={true}
        showPagination={true}
      />
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-950 rounded-md">
      
      {/* =================== HEADER COM LOADING INTELIGENTE =================== */}
      {showListSkeleton ? (
        <SkeletonWrapper loading={true} type="form" count={1} showActions={true} />
      ) : (
        <div className="flex-shrink-0 p-3 sm:p-4 lg:p-6 rounded-md shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
            
            {/* Título e estatísticas */}
            <div className="flex-1 min-w-0">
              <h2 className="text-white text-lg sm:text-xl lg:text-2xl font-bold truncate">
                Minhas Notas
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">
                {/* FEEDBACK VISUAL OTIMIZADO */}
                {showOverlayLoading ? (
                  <span className="inline-flex items-center gap-1">
                    <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="opacity-70">Atualizando...</span>
                  </span>
                ) : (
                  <>
                    Página {pagination.currentPage} de {pagination.totalPages} 
                    <span className="text-gray-500 mx-1">•</span>
                    {pagination.total} notas no total
                  </>
                )}
              </p>
            </div>
          
          {/* Controles de busca e ações */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            
            {/* Campo de busca */}
            <div className="relative flex-1 sm:flex-initial">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Buscar notas..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-9 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-48 lg:w-64 text-sm"
              />
              {/* INDICADOR VISUAL: mostra quando está fazendo busca com debounce */}
              {searchTerm !== debouncedSearch && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Botões de ação */}
            <div className="flex gap-2 sm:gap-3">
              
              {/* Botão de filtros */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 sm:px-4 py-2 rounded-md transition-colors flex items-center gap-1.5 sm:gap-2 text-sm flex-1 sm:flex-initial justify-center ${
                  showFilters || selectedTags.length > 0
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <FaFilter size={12} />
                <span className="hidden sm:inline">Filtros</span>
                {selectedTags.length > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full px-1.5">
                    {selectedTags.length}
                  </span>
                )}
              </button>

              {/* Botão criar nota */}
              <button
                onClick={() => {/* handleCreateNote */}}
                className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-1.5 sm:gap-2 text-sm flex-1 sm:flex-initial justify-center"
              >
                <FaPlus size={12} />
                <span className="hidden sm:inline">Nova Nota</span>
                <span className="sm:hidden">Nova</span>
              </button>
            </div>
          </div>
        </div>

        {/* =================== ÁREA DE FILTROS EXPANDIDA =================== */}
        {showFilters && (
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-700">
            
            {/* Filtros por tag */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-3 mb-3">
              <span className="text-gray-300 text-xs sm:text-sm font-medium flex-shrink-0">
                Tags:
              </span>
              
              {availableTags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              ) : (
                <span className="text-gray-400 text-xs sm:text-sm">Nenhuma tag disponível</span>
              )}
            </div>
            
            {/* Controles de ordenação */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
              <span className="text-gray-300 text-xs sm:text-sm font-medium flex-shrink-0">
                Ordenar por:
              </span>
              
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <button
                  onClick={() => handleSortChange('updated_at', 'desc')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    sortBy === 'updated_at' && sortOrder === 'desc'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Mais recentes
                </button>
                
                <button
                  onClick={() => handleSortChange('title', 'asc')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    sortBy === 'title' && sortOrder === 'asc'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Alfabética A-Z
                </button>
                
                <button
                  onClick={() => handleSortChange('created_at', 'asc')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    sortBy === 'created_at' && sortOrder === 'asc'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Mais antigas
                </button>
              </div>
            </div>
            
            {/* Botão para limpar filtros */}
            {(searchTerm || selectedTags.length > 0) && (
              <div className="flex justify-end">
                <button
                  onClick={clearFilters}
                  className="px-3 py-1.5 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors flex items-center gap-1"
                >
                  <FaTimes size={8} />
                  Limpar filtros
                </button>
              </div>
            )}
            </div>
          )}
        </div>
      )}

      {/* =================== LISTA DE NOTAS COM SKELETON LOADING =================== */}
      <div className="flex-1 rounded-md shadow-md p-3 sm:p-4 lg:p-6 overflow-y-auto min-h-0">
        
        {/* LOADING DE BUSCA: Mostra skeleton da lista */}
        {showListSkeleton && (
          <SkeletonWrapper loading={true} type="list" count={itemsPerPage} />
        )}
        
        {/* LOADING TRADICIONAL: Só para carregamento sem dados anteriores */}
        {isLoading && !isPreviousData && !showListSkeleton && notes.length === 0 && (
          <SkeletonWrapper loading={true} type="list" count={itemsPerPage} />
        )}
        
        {/* ESTADO SEM NOTAS */}
        {!isLoading && !showListSkeleton && notes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">
              {searchTerm || selectedTags.length > 0 ? '🔍 Nenhuma nota encontrada' : '📝 Você ainda não tem notas'}
            </div>
            <p className="text-gray-500 text-sm">
              {searchTerm || selectedTags.length > 0 
                ? 'Tente ajustar sua busca ou filtros' 
                : 'Que tal criar sua primeira nota?'
              }
            </p>
          </div>
        )}
        
        {/* LISTA DE NOTAS COM OVERLAY DE LOADING */}
        {!showListSkeleton && notes.length > 0 && (
          <div className={`relative ${showOverlayLoading ? 'opacity-70' : ''} transition-opacity duration-200`}>
            
            {/* OVERLAY DE LOADING SUTIL */}
            {showOverlayLoading && (
              <div className="absolute top-2 right-2 z-10">
                <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2 shadow-lg">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Atualizando
                </div>
              </div>
            )}
            
            {/* LISTA REAL DE NOTAS */}
            <MappingNotes
              notes={notes}
              onViewNote={() => {/* handleViewNote */}}
              onEditNote={() => {/* handleEditNote */}}
              onDeleteNote={() => {/* handleDeleteNote */}}
              loading={false}
            />
          </div>
        )}
      </div>

      {/* =================== PAGINAÇÃO COM SKELETON =================== */}
      {pagination.totalPages > 1 && (
        <div className="flex-shrink-0 border-t border-gray-700 bg-gray-800/50">
          {showListSkeleton ? (
            <SkeletonWrapper loading={true} type="custom" className="px-4">
              <div className="flex justify-between items-center py-3">
                <div className="w-24 h-6 bg-gray-600 rounded animate-pulse"></div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="w-8 h-8 bg-gray-600 rounded animate-pulse"></div>
                  ))}
                </div>
                <div className="w-20 h-6 bg-gray-600 rounded animate-pulse"></div>
              </div>
            </SkeletonWrapper>
          ) : (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              showInfo={true}
              className="px-4"
            />
          )}
        </div>
      )}

      {/* =================== MODAL DE VISUALIZAÇÃO/EDIÇÃO =================== */}
      {/* <ViewNotes
        note={selectedNote}
        isOpen={isModalOpen}
        mode={modalMode}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveNote}
        onDelete={handleDeleteNote}
      /> */}
    </div>
  );
};

export default Notes;