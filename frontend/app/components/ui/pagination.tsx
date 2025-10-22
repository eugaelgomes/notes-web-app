import React from 'react';
import { FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';

/**
 * =================== COMPONENTE DE PAGINAÇÃO ===================
 * 
 * Este componente cria uma interface de paginação completa com:
 * - Botões de primeira/última página
 * - Botões de página anterior/próxima  
 * - Números das páginas clicáveis
 * - Informações sobre total de itens
 * 
 * COMO USAR:
 * <Pagination
 *   currentPage={2}
 *   totalPages={10}
 *   totalItems={95}
 *   onPageChange={(page) => console.log('Ir para página:', page)}
 * />
 */

interface PaginationProps {
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  showInfo?: boolean;
  maxVisiblePages?: number;
  className?: string;
}

const Pagination = ({
  currentPage = 1,        // Página atual
  totalPages = 1,         // Total de páginas
  totalItems = 0,         // Total de itens
  itemsPerPage = 10,      // Itens por página
  onPageChange,           // Função chamada quando usuário troca de página
  showInfo = true,        // Mostrar informações "Mostrando X de Y"
  maxVisiblePages = 5,    // Quantos números de página mostrar
  className = ""          // Classes CSS extras
}: PaginationProps) => {
  
  // =================== LÓGICA PARA PÁGINAS VISÍVEIS ===================
  // Calcula quais números de página mostrar (ex: [1,2,3,4,5] ou [3,4,5,6,7])
  const getVisiblePages = () => {
    const pages = [];
    
    // Se tem poucas páginas, mostra todas
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }
    
    // Cálculo do range de páginas a mostrar
    const halfVisible = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(1, currentPage - halfVisible);
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Ajuste se chegou no final
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };
  
  const visiblePages = getVisiblePages();
  
  // =================== INFORMAÇÕES DE ITENS ===================
  // Calcula "Mostrando 11-20 de 95 itens"
  const getItemsInfo = () => {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    return { startItem, endItem };
  };
  
  const { startItem, endItem } = getItemsInfo();
  
  // =================== HANDLERS DE CLIQUE ===================
  const handlePageClick = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange?.(page);
    }
  };
  
  // =================== RENDER CONDICIONAL ===================
  // Se só tem 1 página ou menos, não mostra paginação
  if (totalPages <= 1) {
    return null;
  }
  
  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-2 px-2 ${className}`}>
      
      {/* =================== INFORMAÇÕES DOS ITENS =================== */}
      {showInfo && (
        <div className="text-sm text-neutral-400 order-2 sm:order-1">
          Mostrando <span className="font-medium text-neutral-300">{startItem}-{endItem}</span> de{' '}
          <span className="font-medium text-neutral-300">{totalItems}</span> notas
        </div>
      )}
      
      {/* =================== CONTROLES DE PAGINAÇÃO =================== */}
      <div className="flex items-center gap-1 order-1 sm:order-2">
        
        {/* PRIMEIRA PÁGINA */}
        <button
          onClick={() => handlePageClick(1)}
          disabled={currentPage === 1}
          className="p-2.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all border border-neutral-800 hover:border-neutral-700"
          title="Primeira página"
        >
          <FaAngleDoubleLeft size={14} />
        </button>
        
        {/* PÁGINA ANTERIOR */}
        <button
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all border border-neutral-800 hover:border-neutral-700"
          title="Página anterior"
        >
          <FaChevronLeft size={14} />
        </button>
        
        {/* NÚMEROS DAS PÁGINAS */}
        <div className="flex items-center gap-1 mx-2">
          {/* Mostra "..." se a primeira página visível não for a 1 */}
          {visiblePages[0] > 1 && (
            <>
              <button
                onClick={() => handlePageClick(1)}
                className="px-3 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all text-sm border border-neutral-800 hover:border-neutral-700 min-w-[40px]"
              >
                1
              </button>
              {visiblePages[0] > 2 && (
                <span className="text-neutral-500 px-2 text-sm">...</span>
              )}
            </>
          )}
          
          {/* PÁGINAS VISÍVEIS */}
          {visiblePages.map(page => (
            <button
              key={page}
              onClick={() => handlePageClick(page)}
              className={`px-3 py-2 rounded-lg text-sm transition-all min-w-[40px] border ${
                page === currentPage
                  ? 'bg-yellow-500 text-neutral-950 font-semibold border-yellow-500 shadow-md shadow-yellow-500/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              {page}
            </button>
          ))}
          
          {/* Mostra "..." se a última página visível não for a final */}
          {visiblePages[visiblePages.length - 1] < totalPages && (
            <>
              {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                <span className="text-neutral-500 px-2 text-sm">...</span>
              )}
              <button
                onClick={() => handlePageClick(totalPages)}
                className="px-3 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all text-sm border border-neutral-800 hover:border-neutral-700 min-w-[40px]"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>
        
        {/* PRÓXIMA PÁGINA */}
        <button
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all border border-neutral-800 hover:border-neutral-700"
          title="Próxima página"
        >
          <FaChevronRight size={14} />
        </button>
        
        {/* ÚLTIMA PÁGINA */}
        <button
          onClick={() => handlePageClick(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all border border-neutral-800 hover:border-neutral-700"
          title="Última página"
        >
          <FaAngleDoubleRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;