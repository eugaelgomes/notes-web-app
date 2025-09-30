import React from 'react';
import { Skeleton, SkeletonText } from './Skeleton';

/**
 * =================== SKELETON PARA CARDS E DASHBOARD ===================
 * 
 * Componentes de skeleton para cards estatísticos, dashboard
 * e outros elementos de interface.
 */

/**
 * Skeleton para card estatístico
 */
export const StatCardSkeleton = ({ className = '' }) => {
  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-md p-4 ${className}`}>
      
      {/* Header do card */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Skeleton width={20} height={20} variant="rectangular" className="rounded" />
          <Skeleton width="80px" height="16px" />
        </div>
        <Skeleton width={16} height={16} />
      </div>
      
      {/* Valor principal */}
      <div className="mb-2">
        <Skeleton width="60px" height="32px" className="mb-1" />
        <Skeleton width="100px" height="12px" />
      </div>
      
      {/* Indicador de mudança */}
      <div className="flex items-center gap-1">
        <Skeleton width={12} height={12} />
        <Skeleton width="80px" height="12px" />
      </div>
    </div>
  );
};

/**
 * Skeleton para grid de cards estatísticos
 */
export const StatsGridSkeleton = ({ 
  count = 4,          // Quantidade de cards
  className = '' 
}) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <StatCardSkeleton key={index} />
      ))}
    </div>
  );
};

/**
 * =================== SKELETON PARA LISTA COMPACTA ===================
 * Para listas menores como "Notas Recentes", "Tags Populares", etc.
 */
export const CompactListSkeleton = ({ 
  count = 5,
  showAvatar = false,
  className = '' 
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex items-center gap-3 p-2 rounded-md">
          
          {/* Avatar opcional */}
          {showAvatar && (
            <Skeleton width={32} height={32} variant="circular" />
          )}
          
          {/* Conteúdo principal */}
          <div className="flex-1 min-w-0">
            <Skeleton width="70%" height="16px" className="mb-1" />
            <Skeleton width="40%" height="12px" />
          </div>
          
          {/* Indicador à direita */}
          <Skeleton width={20} height={12} />
        </div>
      ))}
    </div>
  );
};

/**
 * =================== SKELETON PARA FORMULÁRIO ===================
 * Para simular formulários de criação/edição
 */
export const FormSkeleton = ({ className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      
      {/* Campo de título */}
      <div className="space-y-2">
        <Skeleton width="60px" height="14px" />
        <Skeleton width="100%" height="40px" className="rounded-md" />
      </div>
      
      {/* Campo de descrição */}
      <div className="space-y-2">
        <Skeleton width="80px" height="14px" />
        <Skeleton width="100%" height="100px" className="rounded-md" />
      </div>
      
      {/* Campo de tags */}
      <div className="space-y-2">
        <Skeleton width="40px" height="14px" />
        <div className="flex gap-2">
          <Skeleton width="60px" height="32px" className="rounded-full" />
          <Skeleton width="80px" height="32px" className="rounded-full" />
          <Skeleton width="50px" height="32px" className="rounded-full" />
        </div>
      </div>
      
      {/* Botões do formulário */}
      <div className="flex justify-end gap-3 pt-4">
        <Skeleton width="80px" height="36px" className="rounded-md" />
        <Skeleton width="90px" height="36px" className="rounded-md" />
      </div>
    </div>
  );
};

/**
 * =================== SKELETON PARA TABELA ===================
 * Para simular tabelas de dados
 */
export const TableSkeleton = ({ 
  rows = 5,           // Número de linhas
  columns = 4,        // Número de colunas
  className = '' 
}) => {
  return (
    <div className={`w-full ${className}`}>
      
      {/* Header da tabela */}
      <div className="border-b border-gray-700 pb-2 mb-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }, (_, index) => (
            <Skeleton key={index} width="80%" height="16px" />
          ))}
        </div>
      </div>
      
      {/* Linhas da tabela */}
      <div className="space-y-3">
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }, (_, colIndex) => (
              <Skeleton 
                key={colIndex} 
                width={colIndex === 0 ? "90%" : "70%"} 
                height="14px" 
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * =================== SKELETON PARA SIDEBAR ===================
 * Para simular barras laterais com navegação
 */
export const SidebarSkeleton = ({ className = '' }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      
      {/* Logo/Título */}
      <div className="pb-4 border-b border-gray-700">
        <Skeleton width="120px" height="24px" />
      </div>
      
      {/* Menu principal */}
      <div className="space-y-2">
        <Skeleton width="60px" height="14px" className="mb-3" />
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="flex items-center gap-3 p-2">
            <Skeleton width={20} height={20} />
            <Skeleton width="100px" height="16px" />
          </div>
        ))}
      </div>
      
      {/* Seção secundária */}
      <div className="space-y-2">
        <Skeleton width="80px" height="14px" className="mb-3" />
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="flex items-center gap-3 p-2">
            <Skeleton width={16} height={16} />
            <Skeleton width="80px" height="14px" />
          </div>
        ))}
      </div>
      
      {/* Footer da sidebar */}
      <div className="pt-4 border-t border-gray-700">
        <div className="flex items-center gap-3">
          <Skeleton width={32} height={32} variant="circular" />
          <div className="flex-1">
            <Skeleton width="80px" height="14px" className="mb-1" />
            <Skeleton width="60px" height="12px" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCardSkeleton;