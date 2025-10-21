"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { FaArrowLeft, FaTrash, FaTag, FaSpinner } from "react-icons/fa";
import { useNotes } from "@/app/hooks/useNotes";
import { Note } from "@/app/services/notes-service/NotesService";
import { getCollaboratorDisplayName, getCollaboratorAvatarUrl } from "@/app/utils/collaborators";

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
    deleteNote,
  } = useNotes();

  const [note, setNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Carregar nota específica
  useEffect(() => {
    if (id) {
      const loadNote = async () => {
        const loadedNote = await fetchNoteById(id);
        if (loadedNote) {
          setNote(loadedNote);
          setEditingTitle(loadedNote.title);
          setEditingDescription(loadedNote.description || "");
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
        setNote((prev) =>
          prev
            ? {
                ...prev,
                title: editingTitle,
                description: editingDescription,
              }
            : null
        );
      } catch (error) {
        console.error("Erro ao salvar:", error);
      } finally {
        setIsSaving(false);
      }
    };

    if (
      isEditing &&
      note &&
      (editingTitle !== note.title || editingDescription !== note.description)
    ) {
      const timeoutId = setTimeout(() => {
        handleAutoSave();
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [editingTitle, editingDescription, isEditing, note, updateNote]);

  const handleDelete = async () => {
    if (!note) return;

    if (window.confirm("Tem certeza que deseja deletar esta nota?")) {
      try {
        const success = await deleteNote(note.id);
        if (success) {
          router.push("/app/notes");
        }
      } catch (error) {
        console.error("Erro ao deletar nota:", error);
        alert("Erro ao deletar a nota. Tente novamente.");
      }
    }
  };

  const handleBack = () => {
    router.push("/app/notes");
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("pt-BR", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Data inválida";
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
        setNote((prev) =>
          prev
            ? {
                ...prev,
                title: editingTitle,
                description: editingDescription,
                updated_at: new Date().toISOString(),
              }
            : null
        );
      } catch (error) {
        console.error("Erro ao salvar:", error);
      } finally {
        setIsSaving(false);
      }
    };

    const handleDocumentKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "s":
            e.preventDefault();
            if (isEditing && note) {
              handleAutoSaveLocal();
            }
            break;
          case "e":
            e.preventDefault();
            if (!isEditing) {
              startEditing();
            }
            break;
          case "Escape":
            e.preventDefault();
            stopEditing();
            break;
        }
      }
    };

    document.addEventListener("keydown", handleDocumentKeyDown);
    return () => document.removeEventListener("keydown", handleDocumentKeyDown);
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
    <div className="min-h-screen bg-neutral-950 text-neutral-100 border border-neutral-800 rounded-md shadow-lg overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 bg-neutral-900 border-b border-neutral-800 px-4 py-3 z-10 shadow-sm">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={handleBack}
            className="p-2 text-neutral-300 hover:text-yellow-500 hover:bg-neutral-800 rounded-md transition-all"
            title="Voltar para lista de notas"
          >
            <FaArrowLeft size={16} />
          </button>

          <div className="flex items-center gap-3 text-sm text-neutral-400">
            {note.updated_at && (
              <span>Atualizada {formatDate(note.updated_at)}</span>
            )}
            <div className="flex items-center gap-1">
              <button
                onClick={handleDelete}
                className="p-2 text-yellow-500 hover:text-yellow-400 hover:bg-neutral-800 rounded-md transition-all"
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
              className="w-full text-2xl font-bold text-neutral-100 bg-transparent border-b-2 border-transparent focus:border-yellow-500 outline-none placeholder-neutral-500 pb-1"
              autoFocus={!editingTitle}
            />
          ) : (
            <h1
              onClick={startEditing}
              className="text-2xl font-bold text-neutral-100 cursor-text min-h-[2rem] flex items-center hover:text-yellow-500 transition-colors"
            >
              {note.title || "Clique para adicionar título..."}
            </h1>
          )}
        </div>

        {/* Meta informações */}
        <div className="flex flex-wrap items-center gap-6 mb-6 text-sm text-neutral-400 border-b border-neutral-800 pb-4">
          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <div className="flex items-center gap-2">
              <FaTag className="text-yellow-500" size={12} />
              <div className="flex gap-1">
                {note.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-neutral-800 text-yellow-500 text-xs px-2 py-1 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          {/* Colaboradores */}
          {note.collaborators && note.collaborators.length > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <div className="flex -space-x-2">
                {note.collaborators.slice(0, 3).map((collab, index) => {
                  const displayName = getCollaboratorDisplayName(collab);
                  const avatarUrl = getCollaboratorAvatarUrl(collab);
                  
                  return (
                    <div
                      key={index}
                      className="relative w-8 h-8 rounded-full bg-blue-600 border-2 border-slate-900 flex items-center justify-center overflow-hidden"
                      title={displayName}
                    >
                      {avatarUrl ? (
                        <Image
                          width={32}
                          height={32}
                          src={avatarUrl}
                          alt={displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-xs font-semibold">
                          {displayName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  );
                })}
                {note.collaborators.length > 3 && (
                  <div className="relative w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center">
                    <span className="text-slate-300 text-xs font-semibold">
                      +{note.collaborators.length - 3}
                    </span>
                  </div>
                )}
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
              className="w-full min-h-[300px] bg-transparent outline-none resize-none text-neutral-100 placeholder-neutral-500 leading-relaxed"
              rows={15}
            />
          ) : (
            <div
              onClick={startEditing}
              className="cursor-text min-h-[300px] whitespace-pre-wrap break-words"
            >
              {note.description ? (
                <p className="text-neutral-200 leading-relaxed">
                  {note.description}
                </p>
              ) : (
                <div className="text-neutral-500 py-8 text-center border-2 border-dashed border-neutral-700 rounded-lg hover:border-yellow-500 transition-colors">
                  <div className="mb-2">📝</div>
                  <p>Clique aqui para começar a escrever...</p>
                  <p className="text-sm mt-1">
                    Ou pressione Ctrl+E para editar
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Atalhos de teclado - mostrar quando não está editando */}
        {!isEditing && (
          <div className="mt-8 pt-4 border-t border-neutral-800">
            <div className="text-neutral-500 text-xs">
              <span className="font-semibold">Atalhos:</span>
              <span className="ml-2">Ctrl+E para editar</span>
              <span className="ml-3">Ctrl+S para salvar</span>
              <span className="ml-3">Esc para sair da edição</span>
            </div>
          </div>
        )}

        {/* Indicador de salvamento */}
        {isSaving && (
          <div className="fixed top-4 right-4 bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 flex items-center gap-2 shadow-lg z-50">
            <FaSpinner className="animate-spin text-yellow-500" size={14} />
            <span className="text-neutral-200 text-sm">Salvando...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteDetail;
