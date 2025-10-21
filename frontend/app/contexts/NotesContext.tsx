"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  fetchNotes as fetchNotesService,
  fetchNoteById as fetchNoteByIdService,
  createNote as createNoteService,
  createCompleteNote as createCompleteNoteService,
  updateNote as updateNoteService,
  deleteNote as deleteNoteService,
  fetchBlocks as fetchBlocksService,
  createBlock as createBlockService,
  updateBlock as updateBlockService,
  deleteBlock as deleteBlockService,
  reorderBlocks as reorderBlocksService,
  shareNote as shareNoteService,
  searchUsers as searchUsersService,
  getCollaborators as getCollaboratorsService,
  removeCollaborator as removeCollaboratorService,
  recuseCollaboration as recuseCollaborationService,
  type Note,
  type CreateNoteData,
  type UpdateNoteData,
  type Block,
  type CreateBlockData,
  type ShareNoteData,
  type User as SearchUser
} from '../services/notes-service/NotesService';

// Tipos específicos do contexto
export interface NoteOverview {
  id: string;
  title: string;
  tags: string[];
  lastModified: string;
  preview: string;
  status: string;
}

export interface NotesStats {
  totalNotes: number;
  totalTags: number;
  statusDistribution: Record<string, number>;
  mostUsedTags: Array<{ tag: string; count: number }>;
}

export interface NotesContextType {
  // Estado
  notes: Note[];
  notesOverview: NoteOverview[];
  loading: boolean;
  error: string | null;
  
  // Funções de notas
  fetchNotes: () => Promise<void>;
  getNoteById: (noteId: string) => Promise<Note | null>;
  createNote: (noteData: CreateNoteData) => Promise<Note | null>;
  createCompleteNote: (noteData: CreateNoteData) => Promise<Note | null>;
  updateNote: (noteId: string, noteData: UpdateNoteData) => Promise<Note | null>;
  deleteNote: (noteId: string) => Promise<boolean>;
  
  // Funções de dados derivados
  getRecentNotes: () => NoteOverview[];
  getNotesByTag: (tag: string) => NoteOverview[];
  getNotesStats: () => NotesStats;
  
  // Funções de blocos
  fetchBlocks: (noteId: string) => Promise<Block[]>;
  createBlock: (noteId: string, blockData: CreateBlockData) => Promise<Block | null>;
  updateBlock: (noteId: string, blockId: string, blockData: Partial<Block>) => Promise<Block | null>;
  deleteBlock: (noteId: string, blockId: string) => Promise<boolean>;
  reorderBlocks: (noteId: string, blockPositions: Array<{ id: string; position: number }>) => Promise<boolean>;
  
  // Funções de colaboração
  shareNote: (noteId: string, collaboratorData: ShareNoteData) => Promise<unknown>;
  searchUsers: (searchTerm: string) => Promise<SearchUser[]>;
  getCollaborators: (noteId: string) => Promise<SearchUser[]>;
  removeCollaborator: (noteId: string, collaboratorId: string) => Promise<boolean>;
  recuseCollaboration: (noteId: string) => Promise<boolean>;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function useNotes(): NotesContextType {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes deve ser usado dentro de um NotesProvider');
  }
  return context;
}

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  // Estado
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesOverview, setNotesOverview] = useState<NoteOverview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função auxiliar para extrair preview
  const extractPreview = (content: string | undefined): string => {
    if (!content) return '';
    // Remove tags HTML/Markdown e pega os primeiros 150 caracteres
    const cleanContent = content.replace(/<[^>]*>/g, '').replace(/[#*_`]/g, '');
    return cleanContent.length > 150 
      ? cleanContent.substring(0, 150) + '...' 
      : cleanContent;
  };

  // 1. BUSCAR NOTAS (READ)
  const fetchNotes = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const notesData = await fetchNotesService();
      
      // Se retornar NotesResponse (com paginação), usar notes; senão usar direct array
      const notes = Array.isArray(notesData) ? notesData : notesData.notes;
      
      setNotes(notes);

      // Cria a versão resumida das notas
      const overview: NoteOverview[] = notes.map((note: Note) => ({
        id: note.id,
        title: note.title || 'Nota sem título',
        tags: note.tags || [],
        lastModified: note.updated_at || note.created_at,
        preview: extractPreview(note.description),
        status: 'draft' // Default status, adjust based on your Note type
      }));
      
      setNotesOverview(overview);

    } catch (err: unknown) {
      console.error('Erro ao buscar notas:', err);
      setError(err instanceof Error ? err.message : 'Erro ao buscar notas');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // 1.1. BUSCAR NOTA POR ID
  const getNoteById = useCallback(async (noteId: string): Promise<Note | null> => {
    if (!user?.id || !noteId) return null;

    try {
      const noteData = await fetchNoteByIdService(noteId);
      return noteData;
    } catch (err: unknown) {
      console.error('Erro ao buscar nota:', err);
      throw err;
    }
  }, [user?.id]);

  // 2. CRIAR NOTA (CREATE)
  const createNote = useCallback(async (noteData: CreateNoteData): Promise<Note | null> => {
    if (!user?.id) return null;

    setLoading(true);
    setError(null);

    try {
      const newNote = await createNoteService(noteData);
      await fetchNotes(); // Atualiza a lista inteira após criar
      return newNote;

    } catch (err: unknown) {
      console.error('Erro ao criar nota:', err);
      setError(err instanceof Error ? err.message : 'Erro ao criar nota');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.id, fetchNotes]);

  // 2.1. CRIAR NOTA COMPLETA (CREATE COMPLETE)
  const createCompleteNote = useCallback(async (noteData: CreateNoteData): Promise<Note | null> => {
    if (!user?.id) return null;

    setLoading(true);
    setError(null);

    try {
      const newNote = await createCompleteNoteService(noteData);
      await fetchNotes(); // Atualiza a lista inteira após criar
      return newNote;

    } catch (err: unknown) {
      console.error('Erro ao criar nota completa:', err);
      setError(err instanceof Error ? err.message : 'Erro ao criar nota completa');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.id, fetchNotes]);

  // 3. ATUALIZAR NOTA (UPDATE)
  const updateNote = useCallback(async (noteId: string, noteData: UpdateNoteData): Promise<Note | null> => {
    if (!user?.id) return null;

    setLoading(true);
    setError(null);

    try {
      const updatedNote = await updateNoteService(noteId, noteData);
      await fetchNotes(); // Atualiza a lista para refletir a mudança
      return updatedNote;

    } catch (err: unknown) {
      console.error('Erro ao atualizar nota:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar nota');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.id, fetchNotes]);

  // 4. DELETAR NOTA (DELETE)
  const deleteNote = useCallback(async (noteId: string): Promise<boolean> => {
    if (!user?.id) return false;

    setLoading(true);
    setError(null);

    try {
      await deleteNoteService(noteId);
      await fetchNotes(); // Atualiza a lista após a exclusão
      return true;

    } catch (err: unknown) {
      console.error('Erro ao deletar nota:', err);
      setError(err instanceof Error ? err.message : 'Erro ao deletar nota');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id, fetchNotes]);

  // --- DADOS DERIVADOS ---

  const getRecentNotes = useCallback((): NoteOverview[] => {
    return notesOverview
      .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
      .slice(0, 5);
  }, [notesOverview]);

  const getNotesByTag = useCallback((tag: string): NoteOverview[] => {
    if (!tag) return notesOverview;
    return notesOverview.filter(note => 
      note.tags.some(noteTag => 
        noteTag.toLowerCase().includes(tag.toLowerCase())
      )
    );
  }, [notesOverview]);

  const getNotesStats = useCallback((): NotesStats => {
    const totalNotes = notesOverview.length;
    const allTags = notesOverview.flatMap(note => note.tags);
    const uniqueTags = [...new Set(allTags)];
    
    const statusDistribution = notesOverview.reduce((acc, note) => {
      acc[note.status] = (acc[note.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const tagCount = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostUsedTags = Object.entries(tagCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));

    return { 
      totalNotes, 
      totalTags: uniqueTags.length, 
      statusDistribution, 
      mostUsedTags 
    };
  }, [notesOverview]);

  // --- FUNÇÕES DE BLOCOS ---

  const fetchBlocks = useCallback(async (noteId: string): Promise<Block[]> => {
    if (!user?.id) return [];

    try {
      const blocks = await fetchBlocksService(noteId);
      return blocks;
    } catch (err: unknown) {
      console.error('Erro ao buscar blocos:', err);
      throw err;
    }
  }, [user?.id]);

  const createBlock = useCallback(async (noteId: string, blockData: CreateBlockData): Promise<Block | null> => {
    if (!user?.id) return null;

    try {
      const newBlock = await createBlockService(noteId, blockData);
      return newBlock;
    } catch (err: unknown) {
      console.error('Erro ao criar bloco:', err);
      throw err;
    }
  }, [user?.id]);

  const updateBlock = useCallback(async (noteId: string, blockId: string, blockData: Partial<Block>): Promise<Block | null> => {
    if (!user?.id) return null;

    try {
      const updatedBlock = await updateBlockService(noteId, blockId, blockData);
      return updatedBlock;
    } catch (err: unknown) {
      console.error('Erro ao atualizar bloco:', err);
      throw err;
    }
  }, [user?.id]);

  const deleteBlock = useCallback(async (noteId: string, blockId: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      await deleteBlockService(noteId, blockId);
      return true;
    } catch (err: unknown) {
      console.error('Erro ao deletar bloco:', err);
      throw err;
    }
  }, [user?.id]);

  const reorderBlocks = useCallback(async (noteId: string, blockPositions: Array<{ id: string; position: number }>): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      await reorderBlocksService(noteId, blockPositions);
      return true;
    } catch (err: unknown) {
      console.error('Erro ao reordenar blocos:', err);
      throw err;
    }
  }, [user?.id]);

  // --- FUNÇÕES DE COLABORAÇÃO ---

  const shareNote = useCallback(async (noteId: string, collaboratorData: ShareNoteData) => {
    if (!user?.id) return null;

    try {
      const sharedNote = await shareNoteService(noteId, collaboratorData);
      // Atualizar a lista de notas para refletir a mudança
      await fetchNotes();
      return sharedNote;
    } catch (err: unknown) {
      console.error('Erro ao compartilhar nota:', err);
      throw err;
    }
  }, [user?.id, fetchNotes]);

  const searchUsers = useCallback(async (searchTerm: string): Promise<SearchUser[]> => {
    if (!user?.id) return [];

    try {
      const users = await searchUsersService(searchTerm);
      return users;
    } catch (err: unknown) {
      console.error('Erro ao buscar usuários:', err);
      throw err;
    }
  }, [user?.id]);

  const getCollaborators = useCallback(async (noteId: string): Promise<SearchUser[]> => {
    if (!user?.id) return [];

    try {
      const collaborators = await getCollaboratorsService(noteId);
      return collaborators;
    } catch (err: unknown) {
      console.error('Erro ao buscar colaboradores:', err);
      throw err;
    }
  }, [user?.id]);

  const removeCollaborator = useCallback(async (noteId: string, collaboratorId: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      await removeCollaboratorService(noteId, collaboratorId);
      // Atualizar a lista de notas para refletir a mudança
      await fetchNotes();
      return true;
    } catch (err: unknown) {
      console.error('Erro ao remover colaborador:', err);
      throw err;
    }
  }, [user?.id, fetchNotes]);

  const recuseCollaboration = useCallback(async (noteId: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      await recuseCollaborationService(noteId);
      // Atualizar a lista de notas para refletir a mudança
      await fetchNotes();
      return true;
    } catch (err: unknown) {
      console.error('Erro ao recusar colaboração:', err);
      throw err;
    }
  }, [user?.id, fetchNotes]);

  // Efeito para buscar dados quando o usuário mudar
  useEffect(() => {
    if (user?.id) {
      fetchNotes();
    }
  }, [user?.id, fetchNotes]);

  const value: NotesContextType = {
    notes,
    notesOverview,
    loading,
    error,
    fetchNotes,
    getNoteById,
    createNote,
    createCompleteNote,
    updateNote,
    deleteNote,
    getRecentNotes,
    getNotesByTag,
    getNotesStats,
    fetchBlocks,
    createBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks,
    shareNote,
    searchUsers,
    getCollaborators,
    removeCollaborator,
    recuseCollaboration,
  };

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  );
}

export default NotesContext;