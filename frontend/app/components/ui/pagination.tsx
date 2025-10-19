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

const Pagination = ({
  currentPage = 1,        // Página atual
  totalPages = 1,         // Total de páginas
  totalItems = 0,         // Total de itens
  itemsPerPage = 10,      // Itens por página
  onPageChange,           // Função chamada quando usuário troca de página
  showInfo = true,        // Mostrar informações "Mostrando X de Y"
  maxVisiblePages = 5,    // Quantos números de página mostrar
  className = ""          // Classes CSS extras
}) => {
  
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
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
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
  const handlePageClick = (page) => {
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
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 ${className}`}>
      
      {/* =================== INFORMAÇÕES DOS ITENS =================== */}
      {showInfo && (
        <div className="text-sm text-gray-400 order-2 sm:order-1">
          Mostrando <span className="font-semibold text-white">{startItem}-{endItem}</span> de{' '}
          <span className="font-semibold text-white">{totalItems}</span> notas
        </div>
      )}
      
      {/* =================== CONTROLES DE PAGINAÇÃO =================== */}
      <div className="flex items-center gap-1 order-1 sm:order-2">
        
        {/* PRIMEIRA PÁGINA */}
        <button
          onClick={() => handlePageClick(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Primeira página"
        >
          <FaAngleDoubleLeft size={14} />
        </button>
        
        {/* PÁGINA ANTERIOR */}
        <button
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                className="px-3 py-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors text-sm"
              >
                1
              </button>
              {visiblePages[0] > 2 && (
                <span className="text-gray-500 px-1">...</span>
              )}
            </>
          )}
          
          {/* PÁGINAS VISÍVEIS */}
          {visiblePages.map(page => (
            <button
              key={page}
              onClick={() => handlePageClick(page)}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                page === currentPage
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {page}
            </button>
          ))}
          
          {/* Mostra "..." se a última página visível não for a final */}
          {visiblePages[visiblePages.length - 1] < totalPages && (
            <>
              {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                <span className="text-gray-500 px-1">...</span>
              )}
              <button
                onClick={() => handlePageClick(totalPages)}
                className="px-3 py-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors text-sm"
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
          className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Próxima página"
        >
          <FaChevronRight size={14} />
        </button>
        
        {/* ÚLTIMA PÁGINA */}
        <button
          onClick={() => handlePageClick(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Última página"
        >
          <FaAngleDoubleRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;