// hooks/useNotes.ts
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  fetchNotes as fetchNotesService,
  fetchNoteById as fetchNoteByIdService,
  createNote as createNoteService,
  updateNote as updateNoteService,
  deleteNote as deleteNoteService,
  type Note,
  type FetchNotesParams,
  type NotesResponse,
  type CreateNoteData,
  type UpdateNoteData,
} from "../services/notes-service/NotesService";

export interface NotesOverview {
  id: string;
  title: string;
  preview?: string;
  tags?: string[];
  lastModified?: string;
  collaborators?: Array<{
    id: string;
    name?: string;
    username?: string;
    email?: string;
    avatarUrl?: string;
  }>;
}

interface NotesStats {
  totalNotes: number;
  totalTags: number;
  doneStatus: number;
  mostUsedTags: Array<{ tag: string; count: number }>;
}

export function useNotes() {
  // --- ESTADO (STATE) ---
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]); // Dados completos das notas
  const [loading, setLoading] = useState(false); // Feedback visual para o usuário
  const [error, setError] = useState<string | null>(null); // Para exibir mensagens de erro
  const [notesOverview, setNotesOverview] = useState<NotesOverview[]>([]); // Dados resumidos para dashboards

  // --- FUNÇÕES AUXILIARES ---

  // Extrai um preview do conteúdo da nota, removendo formatação
  const extractPreview = (content?: string) => {
    if (!content) return "";
    // Remove tags HTML/Markdown e pega os primeiros 150 caracteres
    const cleanContent = content.replace(/<[^>]*>/g, "").replace(/[#*_`]/g, "");
    return cleanContent.length > 150 ? cleanContent.substring(0, 150) + "..." : cleanContent;
  };

  // --- LÓGICA PRINCIPAL ---

  // 1. BUSCAR NOTAS (READ)
  const fetchNotes = useCallback(
    async (params?: FetchNotesParams) => {
      if (!user?.id) return; // Só busca se o usuário estiver logado

      setLoading(true);
      setError(null);

      // Atualiza a versão resumida das notas
      const updateNotesOverview = (notesData: Note[]) => {
        const overview = notesData.map((note) => ({
          id: note.id,
          title: note.title,
          preview: extractPreview(note.description),
          tags: note.tags || [],
          lastModified: note.updated_at || note.created_at,
        }));
        setNotesOverview(overview);
      };

      try {
        const notesData = await fetchNotesService(params);

        // Se é uma resposta paginada
        if ("notes" in notesData && Array.isArray(notesData.notes)) {
          setNotes(notesData.notes);
          updateNotesOverview(notesData.notes);
          return notesData as NotesResponse;
        } else {
          // Resposta simples (array de notas)
          const notesArray = notesData as Note[];
          setNotes(notesArray);
          updateNotesOverview(notesArray);
          return notesArray;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao buscar notas";
        setError(message);
        console.error("Erro ao buscar notas:", err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [user?.id]
  );

  // Atualiza a versão resumida das notas (função auxiliar)
  const updateNotesOverviewHelper = useCallback((notesData: Note[]) => {
    const overview = notesData.map((note) => ({
      id: note.id,
      title: note.title,
      preview: extractPreview(note.description),
      tags: note.tags || [],
      lastModified: note.updated_at || note.created_at,
    }));
    setNotesOverview(overview);
  }, []);

  // 2. BUSCAR NOTA POR ID
  const fetchNoteById = useCallback(async (noteId: string): Promise<Note | null> => {
    if (!noteId) return null;

    setLoading(true);
    setError(null);

    try {
      const note = await fetchNoteByIdService(noteId);
      return note;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao buscar nota";
      setError(message);
      console.error("Erro ao buscar nota:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. CRIAR NOTA (CREATE)
  const createNote = useCallback(
    async (noteData: CreateNoteData): Promise<Note | null> => {
      setLoading(true);
      setError(null);

      try {
        const newNote = await createNoteService(noteData);

        // Atualiza o estado local
        setNotes((prev) => [newNote, ...prev]);
        updateNotesOverviewHelper([newNote, ...notes]);

        return newNote;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao criar nota";
        setError(message);
        console.error("Erro ao criar nota:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [notes, updateNotesOverviewHelper]
  );

  // 4. ATUALIZAR NOTA (UPDATE)
  const updateNote = useCallback(
    async (noteId: string, noteData: UpdateNoteData): Promise<Note | null> => {
      setLoading(true);
      setError(null);

      try {
        const updatedNote = await updateNoteService(noteId, noteData);

        // Atualiza o estado local
        const updatedNotes = notes.map((note) => (note.id === noteId ? updatedNote : note));
        setNotes(updatedNotes);
        updateNotesOverviewHelper(updatedNotes);

        return updatedNote;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao atualizar nota";
        setError(message);
        console.error("Erro ao atualizar nota:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [notes, updateNotesOverviewHelper]
  );

  // 5. DELETAR NOTA (DELETE)
  const deleteNote = useCallback(async (noteId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const success = await deleteNoteService(noteId);

      if (success) {
        // Remove do estado local
        setNotes((prev) => prev.filter((note) => note.id !== noteId));
        setNotesOverview((prev) => prev.filter((note) => note.id !== noteId));
      }

      return success;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao deletar nota";
      setError(message);
      console.error("Erro ao deletar nota:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // --- FUNÇÕES UTILITÁRIAS ---

  // Obter notas recentes (últimas 5)
  const getRecentNotes = useCallback((): NotesOverview[] => {
    return notesOverview
      .sort(
        (a, b) => new Date(b.lastModified || 0).getTime() - new Date(a.lastModified || 0).getTime()
      )
      .slice(0, 5);
  }, [notesOverview]);

  // Obter estatísticas das notas
  const getNotesStats = useCallback((): NotesStats => {
    const totalNotes = notes.length;

    // Contar tags únicas
    const allTags = notes.flatMap((note) => note.tags || []);
    const uniqueTags = new Set(allTags);
    const totalTags = uniqueTags.size;

    // Contar notas concluídas
    const doneStatus = notes.filter((note) => note.done).length;

    // Tags mais usadas
    const tagCount = allTags.reduce(
      (acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const mostUsedTags = Object.entries(tagCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));

    return {
      totalNotes,
      totalTags,
      doneStatus,
      mostUsedTags,
    };
  }, [notes]);

  // --- EFEITOS ---

  // Carrega as notas quando o usuário faz login
  useEffect(() => {
    if (user?.id) {
      fetchNotes();
    }
  }, [user?.id, fetchNotes]);

  // --- RETORNO ---
  return {
    // Estado
    notes,
    notesOverview,
    loading,
    error,

    // Ações
    fetchNotes,
    fetchNoteById,
    createNote,
    updateNote,
    deleteNote,

    // Utilitários
    getRecentNotes,
    getNotesStats,

    // Limpeza de erro
    clearError: () => setError(null),
  };
}

export default useNotes;
