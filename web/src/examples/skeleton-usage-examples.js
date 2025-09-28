/**
 * =================== EXEMPLOS DE USO - SKELETON GENÉRICO ===================
 * 
 * Este arquivo mostra como usar o GenericSkeleton em diferentes cenários
 * sem precisar criar componentes específicos para cada caso.
 */

import React from 'react';
import { GenericSkeleton, SkeletonWrapper, SmartSkeleton } from '../components/ui/GenericSkeleton';

// =================== EXEMPLO 1: LISTA SIMPLES ===================
const ExemploListaSimples = ({ loading, items }) => (
  <SkeletonWrapper 
    loading={loading}
    type="list"
    count={5}
    showHeader={true}
    showActions={true}
  >
    {items.map(item => <div key={item.id}>{item.name}</div>)}
  </SkeletonWrapper>
);

// =================== EXEMPLO 2: CARDS EM GRID ===================
const ExemploCardsGrid = ({ loading, cards }) => (
  <SkeletonWrapper
    loading={loading}
    type="card"
    layout="grid"
    count={6}
  >
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map(card => (
        <div key={card.id} className="bg-gray-800 p-4 rounded">
          <h3>{card.title}</h3>
          <p>{card.description}</p>
        </div>
      ))}
    </div>
  </SkeletonWrapper>
);

// =================== EXEMPLO 3: FORMULÁRIO ===================
const ExemploFormulario = ({ loading, onSubmit }) => (
  <SkeletonWrapper
    loading={loading}
    type="form"
    count={4}
    showActions={true}
  >
    <form onSubmit={onSubmit}>
      <input placeholder="Nome" />
      <input placeholder="Email" />
      <textarea placeholder="Mensagem" />
      <button type="submit">Enviar</button>
    </form>
  </SkeletonWrapper>
);

// =================== EXEMPLO 4: PÁGINA DE DETALHES ===================
const ExemploPaginaDetalhes = ({ loading, item }) => (
  <SkeletonWrapper
    loading={loading}
    type="detail"
  >
    <div>
      <h1>{item?.title}</h1>
      <div className="tags">
        {item?.tags?.map(tag => <span key={tag}>{tag}</span>)}
      </div>
      <p>{item?.description}</p>
    </div>
  </SkeletonWrapper>
);

// =================== EXEMPLO 5: SKELETON CUSTOMIZADO ===================
const ExemploCustomizado = ({ loading }) => (
  <SkeletonWrapper
    loading={loading}
    type="custom"
  >
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton width={50} height={50} variant="circular" />
        <div className="space-y-2">
          <Skeleton width="200px" height="20px" />
          <Skeleton width="150px" height="16px" />
        </div>
      </div>
      <Skeleton width="100%" height="200px" />
    </div>
  </SkeletonWrapper>
);

// =================== EXEMPLO 6: SKELETON INTELIGENTE ===================
const ExemploInteligente = ({ loading, children }) => (
  <SmartSkeleton loading={loading} size="large">
    {children}
  </SmartSkeleton>
);

// =================== EXEMPLO 7: USO DIRETO NO COMPONENTE ===================
const MeuComponente = () => {
  const { data, loading } = useMinhaQuery();
  
  if (loading) {
    return <GenericSkeleton type="list" count={5} showHeader />;
  }
  
  return (
    <div>
      <h2>Meus Dados</h2>
      {data.map(item => <div key={item.id}>{item.name}</div>)}
    </div>
  );
};

export {
  ExemploListaSimples,
  ExemploCardsGrid,
  ExemploFormulario,
  ExemploPaginaDetalhes,
  ExemploCustomizado,
  ExemploInteligente,
  MeuComponente
};