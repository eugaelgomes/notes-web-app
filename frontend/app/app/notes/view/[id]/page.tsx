"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { 
  FaArrowLeft, FaTrash, FaTag, FaSpinner
} from 'react-icons/fa';
import { useNotes } from '../../../../hooks/useNotes';
import { Note } from '../../../../services/notes-service/NotesService';

// =================== SKELETON SIMPLES ===================
const NoteDetailSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="w-6 h-6 bg-gray-300 rounded animate-pulse" />
        <div className="flex items-center gap-3">
          <div className="w-24 h-4 bg-gray-300 rounded animate-pulse" />
          <div className="w-6 h-6 bg-gray-300 rounded animate-pulse" />
        </div>
      </div>
    </div>

    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="w-1/2 h-8 bg-gray-300 rounded animate-pulse mb-3" />
      </div>
      <div className="space-y-4">
        <div className="w-4/5 h-5 bg-gray-300 rounded animate-pulse" />
        <div className="w-full h-4 bg-gray-300 rounded animate-pulse" />
        <div className="w-3/4 h-4 bg-gray-300 rounded animate-pulse" />
        <div className="w-full h-20 bg-gray-200 rounded-md animate-pulse" />
      </div>
    </div>
  </div>
);

const NoteDetail = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  // Hook para gerenciar notas
  const { 
    loading: isLoading, 
    error, 
    fetchNoteById, 
    updateNote, 
    deleteNote 
  } = useNotes();

  const [note, setNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingDescription, setEditingDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Carregar nota específica
  useEffect(() => {
    if (id) {
      const loadNote = async () => {
        const loadedNote = await fetchNoteById(id);
        if (loadedNote) {
          setNote(loadedNote);
          setEditingTitle(loadedNote.title);
          setEditingDescription(loadedNote.description || '');
        }
      };
      loadNote();
    }
  }, [id, fetchNoteById]);

  // Auto-salvar quando houver mudanças
  useEffect(() => {
    const handleAutoSave = async () => {
      if (!note) return;
      
      setIsSaving(true);
      try {
        await updateNote(note.id, {
          title: editingTitle,
          description: editingDescription,
        });
        
        // Atualizar estado local
        setNote(prev => prev ? {
          ...prev,
          title: editingTitle,
          description: editingDescription,
        } : null);
      } catch (error) {
        console.error('Erro ao salvar:', error);
      } finally {
        setIsSaving(false);
      }
    };

    if (isEditing && note && (editingTitle !== note.title || editingDescription !== note.description)) {
      const timeoutId = setTimeout(() => {
        handleAutoSave();
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [editingTitle, editingDescription, isEditing, note, updateNote]);

  const handleDelete = async () => {
    if (!note) return;
    
    if (window.confirm('Tem certeza que deseja deletar esta nota?')) {
      try {
        const success = await deleteNote(note.id);
        if (success) {
          router.push('/app/notes');
        }
      } catch (error) {
        console.error('Erro ao deletar nota:', error);
        alert('Erro ao deletar a nota. Tente novamente.');
      }
    }
  };

  const handleBack = () => {
    router.push('/app/notes');
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Data inválida';
    }
  };

  const startEditing = () => {
    setIsEditing(true);
  };

  const stopEditing = () => {
    setIsEditing(false);
  };

  // Adicionar listener para teclas de atalho
  useEffect(() => {
    const handleAutoSaveLocal = async () => {
      if (!note) return;
      
      setIsSaving(true);
      try {
        await updateNote(note.id, {
          title: editingTitle,
          description: editingDescription,
        });
        
        // Atualizar estado local
        setNote(prev => prev ? {
          ...prev,
          title: editingTitle,
          description: editingDescription,
          updated_at: new Date().toISOString(),
        } : null);
      } catch (error) {
        console.error('Erro ao salvar:', error);
      } finally {
        setIsSaving(false);
      }
    };

    const handleDocumentKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            if (isEditing && note) {
              handleAutoSaveLocal();
            }
            break;
          case 'e':
            e.preventDefault();
            if (!isEditing) {
              startEditing();
            }
            break;
          case 'Escape':
            e.preventDefault();
            stopEditing();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleDocumentKeyDown);
    return () => document.removeEventListener('keydown', handleDocumentKeyDown);
  }, [isEditing, note, editingTitle, editingDescription, updateNote]);

  if (isLoading || !note) {
    return <NoteDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-md">
          <div className="text-gray-600 text-lg mb-4">⚠️ {error}</div>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <FaArrowLeft size={14} />
            Voltar para Notas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 border border-neutral-800 rounded-md shadow-md overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10 shadow-sm">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={handleBack}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            title="Voltar para lista de notas"
          >
            <FaArrowLeft size={16} />
          </button>
          
          <div className="flex items-center gap-3 text-sm text-gray-500">
            {note.updated_at && (
              <span>
                Atualizada {formatDate(note.updated_at)}
              </span>
            )}
            <div className="flex items-center gap-1">
              <button
                onClick={handleDelete}
                className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Deletar nota"
              >
                <FaTrash size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Título */}
        <div className="mb-6">
          {isEditing ? (
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              placeholder="Título da nota..."
              className="w-full text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-transparent focus:border-blue-500 outline-none placeholder-gray-400 pb-1"
              autoFocus={!editingTitle}
            />
          ) : (
            <h1 
              onClick={startEditing}
              className="text-2xl font-bold text-gray-900 cursor-text min-h-[2rem] flex items-center hover:text-gray-700 transition-colors"
            >
              {note.title || 'Clique para adicionar título...'}
            </h1>
          )}
        </div>

        {/* Meta informações */}
        <div className="flex flex-wrap items-center gap-6 mb-6 text-sm text-gray-600 border-b border-gray-200 pb-4">
          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <div className="flex items-center gap-2">
              <FaTag className="text-gray-400" size={12} />
              <div className="flex gap-1">
                {note.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Conteúdo */}
        <div className="space-y-4">
          {isEditing ? (
            <textarea
              value={editingDescription}
              onChange={(e) => setEditingDescription(e.target.value)}
              placeholder="Comece a escrever sua nota..."
              className="w-full min-h-[300px] bg-transparent outline-none resize-none text-gray-900 placeholder-gray-400 leading-relaxed"
              rows={15}
            />
          ) : (
            <div 
              onClick={startEditing}
              className="cursor-text min-h-[300px] whitespace-pre-wrap break-words"
            >
              {note.description ? (
                <p className="text-gray-800 leading-relaxed">
                  {note.description}
                </p>
              ) : (
                <div className="text-gray-500 py-8 text-center border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                  <div className="mb-2">📝</div>
                  <p>Clique aqui para começar a escrever...</p>
                  <p className="text-sm mt-1">Ou pressione Ctrl+E para editar</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Atalhos de teclado - mostrar quando não está editando */}
        {!isEditing && (
          <div className="mt-8 pt-4 border-t border-gray-200">
            <div className="text-gray-500 text-xs">
              <span className="font-semibold">Atalhos:</span>
              <span className="ml-2">Ctrl+E para editar</span>
              <span className="ml-3">Ctrl+S para salvar</span>
              <span className="ml-3">Esc para sair da edição</span>
            </div>
          </div>
        )}

        {/* Indicador de salvamento */}
        {isSaving && (
          <div className="fixed top-4 right-4 bg-white border border-gray-300 rounded-md px-3 py-2 flex items-center gap-2 shadow-lg z-50">
            <FaSpinner className="animate-spin text-blue-500" size={14} />
            <span className="text-gray-700 text-sm">Salvando...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteDetail;