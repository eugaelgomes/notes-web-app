import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import {
  fetchNotes,
  fetchNoteById,
  createNote as createNoteService,
  updateNote as updateNoteService,
  deleteNote as deleteNoteService,
  createBlock as createBlockService,
  updateBlock as updateBlockService,
  deleteBlock as deleteBlockService,
  reorderBlocks as reorderBlocksService,
  shareNote as shareNoteService,
  searchUsers as searchUsersService
} from '../services/notes-service/NotesService';

// =================== CHAVES DO CACHE ===================
// Query keys para organização do cache - VERSÃO EXPANDIDA
export const queryKeys = {
  // Cache básico (mantido para compatibilidade)
  notes: ['notes'],
  note: (id) => ['note', id],
  noteBlocks: (noteId) => ['noteBlocks', noteId],
  
  // Cache para paginação
  notesPaginated: (page, limit, search, tags, sortBy, sortOrder) => 
    ['notes-paginated', page, limit, search, tags, sortBy, sortOrder],
  
  // Cache para scroll infinito
  notesInfinite: (search, tags, sortBy, sortOrder, limit) => 
    ['notes-infinite', search, tags, sortBy, sortOrder, limit],
};

// =================== HOOK BÁSICO (SEM PAGINAÇÃO) ===================
// Hook para listar todas as notas - VERSÃO ORIGINAL
export const useNotesQuery = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.notes,
    queryFn: fetchNotes,
    enabled: !!user?.id, // Só executa se o usuário estiver logado
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchOnMount: true,
  });
};

// =================== HOOK COM PAGINAÇÃO ===================
// Hook para listar notas COM PAGINAÇÃO - VERSÃO OTIMIZADA
export const useNotesQueryPaginated = (options = {}) => {
  const { user } = useAuth();
  
  // Configurações padrão para paginação
  const {
    page = 1,           // Página atual (começa em 1)
    limit = 10,         // Quantos itens por página
    search = '',        // Termo de busca
    tags = [],          // Filtros por tags
    sortBy = 'updated_at', // Campo para ordenação
    sortOrder = 'desc'     // Ordem: 'asc' ou 'desc'
  } = options;
  
  return useQuery({
    // CHAVE DO CACHE: Inclui todos os parâmetros para cache único por combinação
    queryKey: ['notes-paginated', page, limit, search, tags, sortBy, sortOrder],
    
    // FUNÇÃO QUE FAZ A REQUISIÇÃO: Passa todos os parâmetros para o backend
    queryFn: () => fetchNotes({
      page,
      limit, 
      search,
      tags: tags.join(','), // Backend espera tags separadas por vírgula
      sortBy,
      sortOrder
    }),
    
    // SÓ EXECUTA SE: Usuário logado
    enabled: !!user?.id,
    
    // CACHE: Dados ficam "frescos" por 5 minutos (não refaz requisição)
    staleTime: 5 * 60 * 1000,
    
    // PERFORMANCE: Mantém dados anteriores durante carregamento da nova página
    keepPreviousData: true,
    
    // UX: Não refaz requisição quando usuário volta à aba
    refetchOnWindowFocus: false,
  });
};

// =================== HOOK COM SCROLL INFINITO ===================
// Hook para carregar notas automaticamente conforme usuário scrolla
export const useInfiniteNotesQuery = (options = {}) => {
  const { user } = useAuth();
  
  // Configurações para scroll infinito
  const {
    limit = 20,         // Quantos itens carregar por vez (maior que paginação normal)
    search = '',        // Termo de busca
    tags = [],          // Filtros por tags
    sortBy = 'updated_at',
    sortOrder = 'desc'
  } = options;

  return useInfiniteQuery({
    // CHAVE DO CACHE: Única para scroll infinito
    queryKey: ['notes-infinite', search, tags, sortBy, sortOrder, limit],
    
    // FUNÇÃO DE REQUISIÇÃO: Recebe pageParam automaticamente
    queryFn: ({ pageParam = 1 }) => fetchNotes({
      page: pageParam,
      limit,
      search,
      tags: tags.join(','),
      sortBy,
      sortOrder
    }),
    
    // LÓGICA PARA PRÓXIMA PÁGINA: Como saber se tem mais dados?
    getNextPageParam: (lastPage, allPages) => {
      // Se a última página trouxe menos itens que o limite, não tem mais dados
      if (!lastPage.notes || lastPage.notes.length < limit) {
        return undefined; // Para o carregamento
      }
      // Senão, próxima página é o número atual + 1
      return allPages.length + 1;
    },
    
    // HABILITAÇÃO E CACHE
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// Hook para buscar uma nota específica
export const useNoteQuery = (noteId) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.note(noteId),
    queryFn: () => fetchNoteById(noteId),
    enabled: !!user?.id && !!noteId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para criar nota
export const useCreateNoteMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createNoteService,
    onSuccess: (newNote) => {
      // Invalida e atualiza a lista de notas
      queryClient.invalidateQueries({ queryKey: queryKeys.notes });
      
      // Adiciona a nova nota ao cache
      queryClient.setQueryData(queryKeys.note(newNote.id), newNote);
    },
    onError: (error) => {
      console.error('Erro ao criar nota:', error);
    },
  });
};

// Hook para atualizar nota
export const useUpdateNoteMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ noteId, noteData }) => updateNoteService(noteId, noteData),
    onSuccess: (updatedNote, { noteId }) => {
      // Atualiza o cache da nota específica
      queryClient.setQueryData(queryKeys.note(noteId), (oldData) => ({
        ...oldData,
        ...updatedNote,
      }));
      
      // Invalida a lista de notas para refresh
      queryClient.invalidateQueries({ queryKey: queryKeys.notes });
    },
    onError: (error) => {
      console.error('Erro ao atualizar nota:', error);
    },
  });
};

// Hook para deletar nota
export const useDeleteNoteMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteNoteService,
    onSuccess: (_, noteId) => {
      // Remove a nota do cache
      queryClient.removeQueries({ queryKey: queryKeys.note(noteId) });
      
      // Atualiza a lista de notas
      queryClient.setQueryData(queryKeys.notes, (oldNotes) =>
        oldNotes?.notes?.filter(note => note.id !== noteId) || []
      );
      
      // Invalida queries relacionadas
      queryClient.invalidateQueries({ queryKey: queryKeys.notes });
    },
    onError: (error) => {
      console.error('Erro ao deletar nota:', error);
    },
  });
};

// Hook para criar bloco
export const useCreateBlockMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ noteId, blockData }) => createBlockService(noteId, blockData),
    onSuccess: (newBlock, { noteId }) => {
      // Atualiza o cache da nota adicionando o novo bloco
      queryClient.setQueryData(queryKeys.note(noteId), (oldData) => {
        if (!oldData) return oldData;
        
        const newBlocks = [...(oldData.blocks || []), newBlock];
        return {
          ...oldData,
          blocks: newBlocks.sort((a, b) => a.position - b.position),
        };
      });
    },
    onError: (error) => {
      console.error('Erro ao criar bloco:', error);
    },
  });
};

// Hook para atualizar bloco
export const useUpdateBlockMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ noteId, blockId, blockData }) => 
      updateBlockService(noteId, blockId, blockData),
    onSuccess: (updatedBlock, { noteId, blockId }) => {
      // Atualiza o bloco específico no cache da nota
      queryClient.setQueryData(queryKeys.note(noteId), (oldData) => {
        if (!oldData) return oldData;
        
        const updatedBlocks = oldData.blocks?.map(block =>
          block.id === blockId ? { ...block, ...updatedBlock } : block
        ) || [];
        
        return {
          ...oldData,
          blocks: updatedBlocks.sort((a, b) => a.position - b.position),
        };
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar bloco:', error);
    },
  });
};

// Hook para deletar bloco
export const useDeleteBlockMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ noteId, blockId }) => deleteBlockService(noteId, blockId),
    onSuccess: (_, { noteId, blockId }) => {
      // Remove o bloco do cache da nota
      queryClient.setQueryData(queryKeys.note(noteId), (oldData) => {
        if (!oldData) return oldData;
        
        const filteredBlocks = oldData.blocks?.filter(block => block.id !== blockId) || [];
        return {
          ...oldData,
          blocks: filteredBlocks,
        };
      });
    },
    onError: (error) => {
      console.error('Erro ao deletar bloco:', error);
    },
  });
};

// Hook para reordenar blocos
export const useReorderBlocksMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ noteId, blockPositions }) => 
      reorderBlocksService(noteId, blockPositions),
    onMutate: async ({ noteId, blockPositions }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.note(noteId) });
      
      // Snapshot the previous value
      const previousNote = queryClient.getQueryData(queryKeys.note(noteId));
      
      // Optimistically update the cache
      queryClient.setQueryData(queryKeys.note(noteId), (oldData) => {
        if (!oldData) return oldData;
        
        // Criar mapa de novas posições
        const positionMap = blockPositions.reduce((acc, { id, position }) => {
          acc[id] = position;
          return acc;
        }, {});
        
        // Atualizar posições dos blocos
        const reorderedBlocks = oldData.blocks?.map(block => ({
          ...block,
          position: positionMap[block.id] ?? block.position
        })).sort((a, b) => a.position - b.position) || [];
        
        return {
          ...oldData,
          blocks: reorderedBlocks,
        };
      });
      
      // Return a context object with the snapshotted value
      return { previousNote };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousNote) {
        queryClient.setQueryData(queryKeys.note(variables.noteId), context.previousNote);
      }
    },
    onSettled: (_, __, { noteId }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.note(noteId) });
    },
  });
};

// Hook para compartilhar nota
export const useShareNoteMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ noteId, shareData }) => shareNoteService(noteId, shareData),
    onSuccess: (_, { noteId }) => {
      // Invalidar a nota específica para recarregar colaboradores
      queryClient.invalidateQueries({ queryKey: queryKeys.note(noteId) });
      // Invalidar a lista de notas para atualizar metadados
      queryClient.invalidateQueries({ queryKey: queryKeys.notes });
    },
    onError: (error) => {
      console.error('Erro ao compartilhar nota:', error);
    },
  });
};

// Hook para buscar usuários
export const useSearchUsers = (searchTerm) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['users', 'search', searchTerm],
    queryFn: () => searchUsersService(searchTerm),
    enabled: !!user?.id && !!searchTerm && searchTerm.length >= 2,
    staleTime: 30 * 1000, // 30 segundos
    refetchOnWindowFocus: false,
  });
};

// Hook para invalidar cache manualmente
export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidateNotes: () => queryClient.invalidateQueries({ queryKey: queryKeys.notes }),
    invalidateNote: (noteId) => queryClient.invalidateQueries({ queryKey: queryKeys.note(noteId) }),
    invalidateAll: () => queryClient.invalidateQueries(),
  };
};