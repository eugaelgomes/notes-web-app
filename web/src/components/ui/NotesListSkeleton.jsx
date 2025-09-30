import React from 'react';
import { Skeleton, SkeletonText, SkeletonAvatar, SkeletonButton } from './Skeleton';

/**
 * =================== SKELETON PARA LISTA DE NOTAS ===================
 * 
 * Este componente simula a aparência da lista de notas enquanto carrega,
 * mantendo a mesma estrutura visual do componente final.
 * 
 * COMO USAR:
 * {loading ? <NotesListSkeleton count={5} /> : <NotesList notes={notes} />}
 */

/**
 * Skeleton para um item individual de nota
 */
export const NoteItemSkeleton = ({ className = '' }) => {
  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-md p-3 sm:p-4 shadow-sm ${className}`}>
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        
        {/* Ícone da nota */}
        <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
          <div className="flex-shrink-0 mt-1">
            <Skeleton width={18} height={18} variant="rectangular" className="rounded" />
          </div>
          
          {/* Conteúdo principal */}
          <div className="flex-1 min-w-0">
            
            {/* Título */}
            <div className="mb-2">
              <Skeleton width="60%" height="20px" className="mb-1" />
              
              {/* Preview do conteúdo (2 linhas) */}
              <div className="space-y-1">
                <Skeleton width="100%" height="14px" />
                <Skeleton width="75%" height="14px" />
              </div>
            </div>

            {/* Tags e metadados */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              
              {/* Tags simuladas */}
              <div className="flex items-center gap-1.5 min-w-0">
                <Skeleton width={12} height={12} variant="rectangular" className="flex-shrink-0" />
                <div className="flex gap-1">
                  <Skeleton width="50px" height="18px" className="rounded-full" />
                  <Skeleton width="65px" height="18px" className="rounded-full" />
                </div>
              </div>
              
              {/* Data */}
              <div className="flex items-center gap-1 sm:ml-auto flex-shrink-0">
                <Skeleton width={10} height={10} variant="circular" />
                <Skeleton width="120px" height="12px" />
              </div>
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <div className="flex items-center gap-0.5">
            <Skeleton width={28} height={28} className="rounded" />
            <Skeleton width={28} height={28} className="rounded" />
            <Skeleton width={28} height={28} className="rounded" />
          </div>
          
          {/* Indicador de clique */}
          <Skeleton width={10} height={10} className="ml-1" />
          
          {/* Status */}
          <div className="ml-1">
            <Skeleton width="60px" height="20px" className="rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton para lista completa de notas
 */
export const NotesListSkeleton = ({ 
  count = 5,          // Quantos itens skeleton mostrar
  className = '' 
}) => {
  return (
    <div className={`space-y-2 sm:space-y-3 ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <NoteItemSkeleton key={index} />
      ))}
    </div>
  );
};

/**
 * =================== SKELETON PARA HEADER DA PÁGINA ===================
 * Simula o cabeçalho da página de notas
 */
export const NotesHeaderSkeleton = ({ className = '' }) => {
  return (
    <div className={`flex-shrink-0 p-3 sm:p-4 lg:p-6 rounded-md shadow-md ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        
        {/* Título e estatísticas */}
        <div className="flex-1 min-w-0">
          <Skeleton width="200px" height="28px" className="mb-2" />
          <Skeleton width="150px" height="14px" />
        </div>
        
        {/* Controles */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          
          {/* Campo de busca */}
          <div className="relative flex-1 sm:flex-initial">
            <Skeleton width="200px" height="40px" className="rounded-md" />
          </div>

          {/* Botões */}
          <div className="flex gap-2 sm:gap-3">
            <SkeletonButton width="80px" height="40px" />
            <SkeletonButton width="90px" height="40px" />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * =================== SKELETON PARA PAGINAÇÃO ===================
 * Simula os controles de paginação
 */
export const PaginationSkeleton = ({ className = '' }) => {
  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 ${className}`}>
      
      {/* Informações dos itens */}
      <div className="order-2 sm:order-1">
        <Skeleton width="180px" height="14px" />
      </div>
      
      {/* Controles de paginação */}
      <div className="flex items-center gap-1 order-1 sm:order-2">
        
        {/* Botões de navegação */}
        <Skeleton width={32} height={32} className="rounded-md" />
        <Skeleton width={32} height={32} className="rounded-md" />
        
        {/* Números das páginas */}
        <div className="flex items-center gap-1 mx-2">
          <Skeleton width={28} height={28} className="rounded-md" />
          <Skeleton width={28} height={28} className="rounded-md" />
          <Skeleton width={28} height={28} className="rounded-md" />
        </div>
        
        <Skeleton width={32} height={32} className="rounded-md" />
        <Skeleton width={32} height={32} className="rounded-md" />
      </div>
    </div>
  );
};

/**
 * =================== SKELETON COMPLETO DA PÁGINA ===================
 * Combina todos os skeletons para simular a página inteira
 */
export const NotesPageSkeleton = ({ 
  noteCount = 5,      // Quantas notas skeleton mostrar
  showPagination = true // Se deve mostrar skeleton da paginação
}) => {
  return (
    <div className="h-full flex flex-col bg-slate-950 rounded-md">
      
      {/* Header skeleton */}
      <NotesHeaderSkeleton />
      
      {/* Lista skeleton */}
      <div className="flex-1 rounded-md shadow-md p-3 sm:p-4 lg:p-6 overflow-y-auto min-h-0">
        <NotesListSkeleton count={noteCount} />
      </div>
      
      {/* Paginação skeleton */}
      {showPagination && (
        <div className="flex-shrink-0 border-t border-gray-700 bg-gray-800/50">
          <PaginationSkeleton className="px-4" />
        </div>
      )}
    </div>
  );
};

export default NotesListSkeleton;