import React from 'react';
import { Skeleton, SkeletonText } from './Skeleton';

/**
 * =================== SKELETON FACTORY ===================
 * 
 * Componente genérico que pode criar skeletons para qualquer situação
 * usando apenas configurações simples.
 * 
 * VANTAGENS:
 * ✅ Um único componente para tudo
 * ✅ Configurável via props
 * ✅ Reutilizável em qualquer contexto
 * ✅ Menos código para manter
 */

/**
 * Skeleton genérico configurável
 */
export const GenericSkeleton = ({ 
  type = 'list',           // Tipo: 'list', 'card', 'form', 'detail', 'custom'
  count = 3,               // Quantidade de itens (para listas)
  layout = 'vertical',     // Layout: 'vertical', 'horizontal', 'grid'
  size = 'medium',         // Tamanho: 'small', 'medium', 'large'
  showHeader = false,      // Se deve mostrar header
  showActions = false,     // Se deve mostrar área de ações
  children,                // Conteúdo customizado
  className = ''
}) => {
  
  // =================== CONFIGURAÇÕES DE TAMANHO ===================
  const sizes = {
    small: { height: '16px', spacing: 'space-y-2', padding: 'p-2' },
    medium: { height: '20px', spacing: 'space-y-3', padding: 'p-3' },
    large: { height: '24px', spacing: 'space-y-4', padding: 'p-4' }
  };
  
  const currentSize = sizes[size] || sizes.medium;
  
  // =================== RENDERS POR TIPO ===================
  
  if (type === 'custom' && children) {
    return <div className={`animate-pulse ${className}`}>{children}</div>;
  }
  
  if (type === 'list') {
    return (
      <div className={`${currentSize.spacing} ${className}`}>
        {showHeader && (
          <div className="flex justify-between items-center mb-4">
            <Skeleton width="200px" height="24px" />
            {showActions && <Skeleton width="100px" height="32px" className="rounded" />}
          </div>
        )}
        
        {Array.from({ length: count }, (_, index) => (
          <div key={index} className={`bg-gray-800 border border-gray-700 rounded-lg ${currentSize.padding}`}>
            <div className="flex items-start gap-3">
              <Skeleton width={layout === 'horizontal' ? '40px' : '20px'} height="20px" />
              <div className="flex-1 space-y-2">
                <Skeleton width="70%" height={currentSize.height} />
                <Skeleton width="50%" height="14px" />
                {size === 'large' && <Skeleton width="60%" height="14px" />}
              </div>
              {showActions && (
                <div className="flex gap-1">
                  <Skeleton width="24px" height="24px" className="rounded" />
                  <Skeleton width="24px" height="24px" className="rounded" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (type === 'card') {
    const gridCols = layout === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : currentSize.spacing;
    
    return (
      <div className={`${gridCols} ${className}`}>
        {Array.from({ length: count }, (_, index) => (
          <div key={index} className={`bg-gray-800 border border-gray-700 rounded-lg ${currentSize.padding}`}>
            <Skeleton width="100%" height="120px" className="rounded mb-3" />
            <Skeleton width="80%" height={currentSize.height} className="mb-2" />
            <Skeleton width="60%" height="14px" />
          </div>
        ))}
      </div>
    );
  }
  
  if (type === 'form') {
    return (
      <div className={`${currentSize.spacing} ${className}`}>
        {Array.from({ length: count }, (_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton width="80px" height="16px" />
            <Skeleton width="100%" height="40px" className="rounded" />
          </div>
        ))}
        
        {showActions && (
          <div className="flex gap-3 pt-4">
            <Skeleton width="80px" height="36px" className="rounded" />
            <Skeleton width="90px" height="36px" className="rounded" />
          </div>
        )}
      </div>
    );
  }
  
  if (type === 'detail') {
    return (
      <div className={`${currentSize.spacing} ${className}`}>
        {/* Header */}
        <div className="space-y-3 mb-6">
          <Skeleton width="60%" height="32px" />
          <div className="flex gap-2">
            <Skeleton width="60px" height="20px" className="rounded-full" />
            <Skeleton width="80px" height="20px" className="rounded-full" />
          </div>
        </div>
        
        {/* Conteúdo */}
        <div className="space-y-6">
          <SkeletonText lines={2} />
          <Skeleton width="100%" height="80px" className="rounded" />
          <SkeletonText lines={3} />
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton width="16px" height="16px" />
                <Skeleton width="70%" height="16px" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Default: lista simples
  return (
    <div className={`${currentSize.spacing} ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <Skeleton key={index} width="100%" height={currentSize.height} />
      ))}
    </div>
  );
};

/**
 * =================== WRAPPER PARA LOADING STATES ===================
 * Componente que automaticamente mostra skeleton ou conteúdo
 */
export const SkeletonWrapper = ({ 
  loading, 
  fallback, 
  children,
  ...skeletonProps 
}) => {
  if (loading) {
    return fallback || <GenericSkeleton {...skeletonProps} />;
  }
  return children;
};

/**
 * =================== SKELETON INTELIGENTE ===================
 * Detecta automaticamente o tipo de skeleton baseado no conteúdo
 */
export const SmartSkeleton = ({ children, loading = true, ...props }) => {
  if (!loading) return children;
  
  // Tenta detectar o tipo baseado nas props ou children
  const childrenCount = React.Children.count(children);
  
  if (childrenCount > 5) {
    return <GenericSkeleton type="list" count={Math.min(childrenCount, 8)} {...props} />;
  } else if (childrenCount > 1) {
    return <GenericSkeleton type="card" count={childrenCount} {...props} />;
  } else {
    return <GenericSkeleton type="detail" {...props} />;
  }
};

export default GenericSkeleton;