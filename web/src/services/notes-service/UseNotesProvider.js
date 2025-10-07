import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext'; // Hook de autenticação
import {
  fetchNotes as fetchNotesService,
  fetchNoteById as fetchNoteByIdService,
  createNote as createNoteService,
  updateNote as updateNoteService,
  deleteNote as deleteNoteService,
  createBlock as createBlockService,
  updateBlock as updateBlockService,
  deleteBlock as deleteBlockService,
  reorderBlocks as reorderBlocksService,
  shareNote as shareNoteService,
  searchUsers as searchUsersService
} from './NotesService';

export function useNotesProvider() {
  // --- ESTADO (STATE) ---
  const { user } = useAuth();
  const [notes, setNotes] = useState([]); // Dados completos das notas
  const [loading, setLoading] = useState(false); // Feedback visual para o usuário
  const [error, setError] = useState(null); // Para exibir mensagens de erro
  const [notesOverview, setNotesOverview] = useState([]); // Dados resumidos para dashboards

  // --- FUNÇÕES AUXILIARES ---

  // Extrai um preview do conteúdo da nota, removendo formatação
  const extractPreview = (content) => {
    if (!content) return '';
    // Remove tags HTML/Markdown e pega os primeiros 150 caracteres
    const cleanContent = content.replace(/<[^>]*>/g, '').replace(/[#*_`]/g, '');
    return cleanContent.length > 150 
      ? cleanContent.substring(0, 150) + '...' 
      : cleanContent;
  };

  // --- LÓGICA PRINCIPAL ---

  // 1. BUSCAR NOTAS (READ)
  const fetchNotes = useCallback(async () => {
    if (!user?.id) return; // Só busca se o usuário estiver logado

    setLoading(true);
    setError(null);

    try {
      const notesData = await fetchNotesService(); // Remove token, usa cookies
      
      setNotes(notesData); // Atualiza o estado com as notas completas

      // Cria a versão resumida das notas
      const overview = notesData.map(note => ({
        id: note.id,
        title: note.title || 'Nota sem título',
        tags: note.tags || [],
        lastModified: note.updated_at || note.created_at, // Backend usa snake_case
        preview: extractPreview(note.description), // Backend usa description, não content
        status: note.status || 'draft'
      }));
      
      setNotesOverview(overview); // Atualiza o estado com o resumo

    } catch (err) {
      console.error('Erro ao buscar notas:', err);
      setError(err.message);
    } finally {
      // Este bloco SEMPRE executa, seja com sucesso ou erro
      setLoading(false);
    }
  }, [user?.id]); // Dependência: A função só será recriada se o ID do usuário mudar

  // 1.1. BUSCAR NOTA POR ID
  const getNoteById = useCallback(async (noteId) => {
    if (!user?.id || !noteId) return null;

    try {
      const noteData = await fetchNoteByIdService(noteId);
      return noteData;
    } catch (err) {
      console.error('Erro ao buscar nota:', err);
      throw err; // Re-throw para o componente lidar
    }
  }, [user?.id]);

  // 2. CRIAR NOTA (CREATE)
  const createNote = useCallback(async (noteData) => {
    if (!user?.id) return null;

    setLoading(true);
    setError(null);

    try {
      const newNote = await createNoteService(noteData); // Remove token, usa cookies
      await fetchNotes(); // << PONTO CHAVE: Atualiza a lista inteira após criar uma nova nota
      return newNote;

    } catch (err) {
      console.error('Erro ao criar nota:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.id, fetchNotes]);


    // 3. ATUALIZAR NOTA (UPDATE)
  const updateNote = useCallback(async (noteId, noteData) => {
    if (!user?.id) return null;

    setLoading(true);
    setError(null);

    try {
      const updatedNote = await updateNoteService(noteId, noteData); // Remove token, usa cookies
      await fetchNotes(); // << Atualiza a lista para refletir a mudança
      return updatedNote;

    } catch (err) {
      console.error('Erro ao atualizar nota:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.id, fetchNotes]);


  // 4. DELETAR NOTA (DELETE)
  const deleteNote = useCallback(async (noteId) => {
    if (!user?.id) return false;

    setLoading(true);
    setError(null);

    try {
      await deleteNoteService(noteId); // Remove token, usa cookies
      await fetchNotes(); // << Atualiza a lista após a exclusão
      return true;

    } catch (err) {
      console.error('Erro ao deletar nota:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id, fetchNotes]);


  // --- DADOS DERIVADOS (CÁLCULOS SOBRE O ESTADO ATUAL) ---
  
  const getRecentNotes = useCallback(() => {
    return notesOverview
      .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))
      .slice(0, 5);
  }, [notesOverview]);

  const getNotesByTag = useCallback((tag) => {
    if (!tag) return notesOverview;
    return notesOverview.filter(note => 
      note.tags.some(noteTag => 
        noteTag.toLowerCase().includes(tag.toLowerCase())
      )
    );
  }, [notesOverview]);

  const getNotesStats = useCallback(() => {
    const totalNotes = notesOverview.length;
    const allTags = notesOverview.flatMap(note => note.tags);
    const uniqueTags = [...new Set(allTags)];
    
    const statusCount = notesOverview.reduce((acc, note) => {
      acc[note.status] = (acc[note.status] || 0) + 1;
      return acc;
    }, {});

    const tagCount = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {});
    const mostUsedTags = Object.entries(tagCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));

    return { totalNotes, totalTags: uniqueTags.length, statusDistribution: statusCount, mostUsedTags };
  }, [notesOverview]);


  // --- FUNÇÕES DE BLOCOS ---
  const createBlock = useCallback(async (noteId, blockData) => {
    if (!user?.id) return null;

    try {
      const newBlock = await createBlockService(noteId, blockData);
      return newBlock;
    } catch (err) {
      console.error('Erro ao criar bloco:', err);
      throw err;
    }
  }, [user?.id]);

  const updateBlock = useCallback(async (noteId, blockId, blockData) => {
    if (!user?.id) return null;

    try {
      const updatedBlock = await updateBlockService(noteId, blockId, blockData);
      return updatedBlock;
    } catch (err) {
      console.error('Erro ao atualizar bloco:', err);
      throw err;
    }
  }, [user?.id]);

  const deleteBlock = useCallback(async (noteId, blockId) => {
    if (!user?.id) return false;

    try {
      await deleteBlockService(noteId, blockId);
      return true;
    } catch (err) {
      console.error('Erro ao deletar bloco:', err);
      throw err;
    }
  }, [user?.id]);

  const reorderBlocks = useCallback(async (noteId, blockPositions) => {
    if (!user?.id) return false;

    try {
      await reorderBlocksService(noteId, blockPositions);
      return true;
    } catch (err) {
      console.error('Erro ao reordenar blocos:', err);
      throw err;
    }
  }, [user?.id]);


  //
  // --- FUNÇÕES DE COLABORAÇÃO ---
  //
  const shareNote = useCallback(async (noteId, collaboratorData) => {
    if (!user?.id) return null;

    try {
      const sharedNote = await shareNoteService(noteId, collaboratorData);
      // Atualizar a lista de notas para refletir a mudança
      await fetchNotes();
      return sharedNote;
    } catch (err) {
      console.error('Erro ao compartilhar nota:', err);
      throw err;
    }
  }, [user?.id, fetchNotes]);

  const searchUsers = useCallback(async (searchTerm) => {
    if (!user?.id) return [];

    try {
      const users = await searchUsersService(searchTerm);
      return users;
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
      throw err;
    }
  }, [user?.id]);

  // --- EFEITO (EFFECT) ---
  // Gatilho para buscar os dados quando o componente for montado ou o usuário mudar
  useEffect(() => {
    if (user?.id) {
      fetchNotes();
    }
  }, [user?.id, fetchNotes]); // O fetchNotes está aqui por boas práticas do linter do React


  // --- EFEITO (EFFECT) ---
  // Gatilho para buscar os dados quando o componente for montado ou o usuário mudar
  useEffect(() => {
    if (user?.id) {
      fetchNotes();
    }
  }, [user?.id, fetchNotes]); // O fetchNotes está aqui por boas práticas do linter do React


  // --- RETORNO DO HOOK ---
  // Disponibiliza o estado e as funções para os componentes
  return {
    notes,
    notesOverview,
    loading,
    error,
    fetchNotes, // Para refresh manual
    getNoteById, // Nova função para buscar nota individual
    createNote,
    updateNote,
    deleteNote,
    getRecentNotes,
    getNotesByTag,
    getNotesStats,
    // Funções de blocos
    createBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks,
    // Funções de colaboração
    shareNote,
    searchUsers,
  };
}