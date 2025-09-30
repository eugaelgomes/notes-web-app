import React from 'react';
import { Skeleton, SkeletonText, SkeletonButton } from './Skeleton';

/**
 * =================== SKELETON PARA MODAL DE NOTA ===================
 * 
 * Este componente simula o carregamento de uma nota individual
 * dentro do modal de visualização/edição.
 */

/**
 * Skeleton para o conteúdo de uma nota individual
 */
export const NoteContentSkeleton = ({ 
  mode = 'view',      // 'view' ou 'edit'
  className = '' 
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      
      {/* Cabeçalho da nota */}
      <div className="space-y-3">
        
        {/* Título */}
        {mode === 'edit' ? (
          <Skeleton width="100%" height="48px" className="rounded-md" />
        ) : (
          <Skeleton width="70%" height="32px" className="rounded-md" />
        )}
        
        {/* Metadados (autor, data) */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Skeleton width={24} height={24} variant="circular" />
            <Skeleton width="100px" height="14px" />
          </div>
          <Skeleton width="120px" height="14px" />
        </div>
        
        {/* Tags */}
        <div className="flex items-center gap-2">
          <Skeleton width={16} height={16} />
          <div className="flex gap-2">
            <Skeleton width="60px" height="20px" className="rounded-full" />
            <Skeleton width="80px" height="20px" className="rounded-full" />
            <Skeleton width="45px" height="20px" className="rounded-full" />
          </div>
        </div>
      </div>
      
      {/* Divisor */}
      <Skeleton width="100%" height="1px" />
      
      {/* Conteúdo da nota */}
      <div className="space-y-4">
        
        {/* Descrição */}
        {mode === 'edit' ? (
          <Skeleton width="100%" height="100px" className="rounded-md" />
        ) : (
          <SkeletonText lines={3} />
        )}
        
        {/* Blocos de conteúdo */}
        <div className="space-y-3">
          <div className="space-y-2">
            <Skeleton width="40%" height="18px" />
            <SkeletonText lines={2} />
          </div>
          
          <div className="space-y-2">
            <Skeleton width="60%" height="18px" />
            <SkeletonText lines={4} />
          </div>
          
          <div className="space-y-2">
            <Skeleton width="35%" height="18px" />
            <SkeletonText lines={1} />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton para os botões de ação do modal
 */
export const ModalActionsSkeleton = ({ 
  mode = 'view',
  className = '' 
}) => {
  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      
      {/* Botões à esquerda */}
      <div className="flex gap-2">
        {mode === 'view' && (
          <>
            <SkeletonButton width="80px" height="36px" />
            <SkeletonButton width="70px" height="36px" />
          </>
        )}
        {mode === 'edit' && (
          <SkeletonButton width="90px" height="36px" />
        )}
      </div>
      
      {/* Botões à direita */}
      <div className="flex gap-2">
        {mode === 'view' ? (
          <>
            <SkeletonButton width="70px" height="36px" />
            <SkeletonButton width="60px" height="36px" />
          </>
        ) : (
          <>
            <SkeletonButton width="80px" height="36px" />
            <SkeletonButton width="70px" height="36px" />
          </>
        )}
      </div>
    </div>
  );
};

/**
 * =================== SKELETON COMPLETO DO MODAL ===================
 * Modal de skeleton que imita exatamente a estrutura do modal real
 */
export const NoteModalSkeleton = ({ 
  mode = 'view',      // 'view', 'edit' ou 'create'
  isOpen = false,     // Se o modal está aberto
  className = ''
}) => {
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`bg-gray-800 rounded-md shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col ${className}`}>
        
        {/* Header do Modal */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Skeleton width={24} height={24} />
            <Skeleton width="150px" height="20px" />
          </div>
          
          <div className="flex items-center gap-2">
            <Skeleton width={32} height={32} className="rounded" />
            <Skeleton width={32} height={32} className="rounded" />
          </div>
        </div>
        
        {/* Conteúdo do Modal */}
        <div className="flex-1 overflow-y-auto p-4">
          <NoteContentSkeleton mode={mode} />
        </div>
        
        {/* Footer do Modal */}
        <div className="border-t border-gray-700 p-4">
          <ModalActionsSkeleton mode={mode} />
        </div>
      </div>
    </div>
  );
};

export default NoteContentSkeleton;