"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import {
  FaArrowLeft,
  FaTrash,
  FaTag,
  FaSpinner,
  FaShare,
  FaPlus,
  FaTimes,
  FaUserPlus,
  FaSearch,
} from "react-icons/fa";
import { useNotes } from "@/app/contexts/NotesContext";
import { Note, User as SearchUser } from "@/app/services/notes-service/NotesService";
import {
  getCollaboratorDisplayName,
  getCollaboratorAvatarUrl,
  getCollaboratorId,
} from "@/app/utils/collaborators";

// =================== SKELETON SIMPLES ===================
const NoteDetailSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <div className="h-6 w-6 animate-pulse rounded bg-gray-300" />
        <div className="flex items-center gap-3">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-300" />
          <div className="h-6 w-6 animate-pulse rounded bg-gray-300" />
        </div>
      </div>
    </div>

    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6">
        <div className="mb-3 h-8 w-1/2 animate-pulse rounded bg-gray-300" />
      </div>
      <div className="space-y-4">
        <div className="h-5 w-4/5 animate-pulse rounded bg-gray-300" />
        <div className="h-4 w-full animate-pulse rounded bg-gray-300" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-300" />
        <div className="h-20 w-full animate-pulse rounded-md bg-gray-200" />
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
    getNoteById,
    updateNote,
    deleteNote,
    shareNote,
    searchUsers,
    removeCollaborator,
  } = useNotes();

  const [note, setNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Estados para modais e funcionalidades
  const [showShareModal, setShowShareModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Carregar nota específica
  useEffect(() => {
    if (id) {
      const loadNote = async () => {
        const loadedNote = await getNoteById(id);
        if (loadedNote) {
          setNote(loadedNote);
          setEditingTitle(loadedNote.title);
          setEditingDescription(loadedNote.description || "");
        }
      };
      loadNote();
    }
  }, [id, getNoteById]);

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

  // =================== FUNCÇÕES PARA COLABORAÇÃO ===================
  const handleSearchUsers = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const users = await searchUsers(searchTerm);
      setSearchResults(users);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleShareNote = async (userId: string) => {
    if (!note) return;

    try {
      await shareNote(note.id, {
        userId: userId,
      });

      // Recarregar a nota para mostrar o novo colaborador
      const updatedNote = await getNoteById(note.id);
      if (updatedNote) {
        setNote(updatedNote);
      }

      setShowShareModal(false);
      setSearchTerm("");
      setSearchResults([]);
    } catch (error) {
      console.error("Erro ao compartilhar nota:", error);
      alert("Erro ao compartilhar nota. Tente novamente.");
    }
  };

  const handleRemoveCollaborator = async (collaborator: unknown) => {
    if (!note) return;

    const collaboratorId = getCollaboratorId(collaborator);
    const collaboratorName = getCollaboratorDisplayName(collaborator);

    if (!collaboratorId) {
      alert("ID do colaborador não encontrado.");
      return;
    }

    if (window.confirm(`Tem certeza que deseja remover ${collaboratorName} desta nota?`)) {
      try {
        const success = await removeCollaborator(note.id, collaboratorId);

        if (success) {
          // Recarregar a nota para mostrar a mudança
          const updatedNote = await getNoteById(note.id);
          if (updatedNote) {
            setNote(updatedNote);
          }
        }
      } catch (error) {
        console.error("Erro ao remover colaborador:", error);
        alert("Erro ao remover colaborador. Tente novamente.");
      }
    }
  };

  // =================== FUNÇÕES PARA TAGS ===================
  const handleAddTag = async () => {
    if (!note || !newTag.trim()) return;

    const currentTags = note.tags || [];
    if (currentTags.includes(newTag.trim())) {
      alert("Esta tag já existe nesta nota.");
      return;
    }

    try {
      const updatedTags = [...currentTags, newTag.trim()];
      const updatedNote = await updateNote(note.id, {
        tags: updatedTags,
      });

      if (updatedNote) {
        setNote(updatedNote);
        setNewTag("");
        setShowTagModal(false);
      }
    } catch (error) {
      console.error("Erro ao adicionar tag:", error);
      alert("Erro ao adicionar tag. Tente novamente.");
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    if (!note) return;

    try {
      const updatedTags = (note.tags || []).filter((tag) => tag !== tagToRemove);
      const updatedNote = await updateNote(note.id, {
        tags: updatedTags,
      });

      if (updatedNote) {
        setNote(updatedNote);
      }
    } catch (error) {
      console.error("Erro ao remover tag:", error);
      alert("Erro ao remover tag. Tente novamente.");
    }
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
          <div className="mb-4 text-lg text-gray-600">⚠️ {error}</div>
          <button
            onClick={handleBack}
            className="mx-auto flex items-center gap-2 rounded-md bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
          >
            <FaArrowLeft size={14} />
            Voltar para Notas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden rounded-md border border-neutral-800 bg-neutral-950 text-neutral-100 shadow-lg">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-neutral-800 bg-neutral-900 px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <button
            onClick={handleBack}
            className="rounded-md p-2 text-neutral-300 transition-all hover:bg-neutral-800 hover:text-yellow-500"
            title="Voltar para lista de notas"
          >
            <FaArrowLeft size={16} />
          </button>

          <div className="flex items-center gap-3 text-sm text-neutral-400">
            {note.updated_at && <span>Atualizada {formatDate(note.updated_at)}</span>}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowTagModal(true)}
                className="rounded-md p-2 text-neutral-400 transition-all hover:bg-neutral-800 hover:text-yellow-500"
                title="Gerenciar tags"
              >
                <FaTag size={14} />
              </button>

              <button
                onClick={() => setShowShareModal(true)}
                className="rounded-md p-2 text-neutral-400 transition-all hover:bg-neutral-800 hover:text-yellow-500"
                title="Compartilhar nota"
              >
                <FaShare size={14} />
              </button>

              <button
                onClick={handleDelete}
                className="rounded-md p-2 text-red-400 transition-all hover:bg-neutral-800 hover:text-red-300"
                title="Deletar nota"
              >
                <FaTrash size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Título */}
        <div className="mb-6">
          {isEditing ? (
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              placeholder="Título da nota..."
              className="w-full border-b-2 border-transparent bg-transparent pb-1 text-2xl font-bold text-neutral-100 placeholder-neutral-500 outline-none focus:border-yellow-500"
              autoFocus={!editingTitle}
            />
          ) : (
            <h1
              onClick={startEditing}
              className="flex min-h-[2rem] cursor-text items-center text-2xl font-bold text-neutral-100 transition-colors hover:text-yellow-500"
            >
              {note.title || "Clique para adicionar título..."}
            </h1>
          )}
        </div>

        {/* Meta informações */}
        <div className="mb-6 flex flex-wrap items-center gap-6 border-b border-neutral-800 pb-4 text-sm text-neutral-400">
          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <div className="flex items-center gap-2">
              <FaTag className="text-yellow-500" size={12} />
              <div className="flex flex-wrap gap-1">
                {note.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="group flex items-center gap-1 rounded-md bg-neutral-800 px-2 py-1 text-xs text-yellow-500 transition-colors hover:bg-neutral-700"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-neutral-400 opacity-0 transition-all group-hover:opacity-100 hover:text-red-400"
                      title="Remover tag"
                    >
                      <FaTimes size={10} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
          {/* Colaboradores */}
          {note.collaborators && note.collaborators.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-neutral-500">Colaboradores:</span>
              <div className="flex flex-wrap gap-2">
                {note.collaborators.map((collab, index) => {
                  const displayName = getCollaboratorDisplayName(collab);
                  const avatarUrl = getCollaboratorAvatarUrl(collab);

                  return (
                    <div
                      key={index}
                      className="group flex items-center gap-2 rounded-lg bg-neutral-800 px-2 py-1 transition-colors hover:bg-neutral-700"
                    >
                      <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border border-neutral-700 bg-yellow-500">
                        {avatarUrl ? (
                          <Image
                            width={24}
                            height={24}
                            src={avatarUrl}
                            alt={displayName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-semibold text-neutral-950">
                            {displayName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <span className="text-xs font-medium text-neutral-300">{displayName}</span>

                      <button
                        onClick={() => handleRemoveCollaborator(collab)}
                        className="ml-1 text-neutral-500 opacity-0 transition-all group-hover:opacity-100 hover:text-red-400"
                        title="Remover colaborador"
                      >
                        <FaTimes size={10} />
                      </button>
                    </div>
                  );
                })}
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
              className="min-h-[300px] w-full resize-none bg-transparent leading-relaxed text-neutral-100 placeholder-neutral-500 outline-none"
              rows={15}
            />
          ) : (
            <div
              onClick={startEditing}
              className="min-h-[300px] cursor-text break-words whitespace-pre-wrap"
            >
              {note.description ? (
                <p className="leading-relaxed text-neutral-200">{note.description}</p>
              ) : (
                <div className="rounded-lg border-2 border-dashed border-neutral-700 py-8 text-center text-neutral-500 transition-colors hover:border-yellow-500">
                  <div className="mb-2">📝</div>
                  <p>Clique aqui para começar a escrever...</p>
                  <p className="mt-1 text-sm">Ou pressione Ctrl+E para editar</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Atalhos de teclado - mostrar quando não está editando */}
        {!isEditing && (
          <div className="mt-8 border-t border-neutral-800 pt-4">
            <div className="text-xs text-neutral-500">
              <span className="font-semibold">Atalhos:</span>
              <span className="ml-2">Ctrl+E para editar</span>
              <span className="ml-3">Ctrl+S para salvar</span>
              <span className="ml-3">Esc para sair da edição</span>
            </div>
          </div>
        )}

        {/* Indicador de salvamento */}
        {isSaving && (
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 shadow-lg">
            <FaSpinner className="animate-spin text-yellow-500" size={14} />
            <span className="text-sm text-neutral-200">Salvando...</span>
          </div>
        )}
      </div>

      {/* Modal de Compartilhamento */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-neutral-700 bg-neutral-900 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-neutral-100">
                <FaUserPlus className="text-yellow-500" size={16} />
                Compartilhar Nota
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-200"
                title="Fechar modal"
              >
                <FaTimes size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-300">
                  Buscar usuário por email
                </label>
                <div className="relative">
                  <FaSearch
                    className="absolute top-1/2 left-3 -translate-y-1/2 transform text-neutral-400"
                    size={14}
                  />
                  <input
                    type="email"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      handleSearchUsers(e.target.value);
                    }}
                    placeholder="Digite o email do usuário..."
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-800 py-2 pr-4 pl-10 text-neutral-100 placeholder-neutral-500 focus:border-transparent focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                  />
                  {isSearching && (
                    <div className="absolute top-1/2 right-3 -translate-y-1/2 transform">
                      <FaSpinner className="animate-spin text-yellow-500" size={14} />
                    </div>
                  )}
                </div>
              </div>

              {searchResults.length > 0 && (
                <div className="max-h-32 space-y-2 overflow-y-auto">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between rounded-lg bg-neutral-800 p-2 transition-colors hover:bg-neutral-700"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500">
                          <span className="text-xs font-semibold text-neutral-950">
                            {(user.name || user.username).charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-neutral-200">
                            {user.name || user.username}
                          </div>
                          <div className="text-xs text-neutral-400">{user.email}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleShareNote(user.id)}
                        className="rounded bg-yellow-500 px-3 py-1 text-xs font-medium text-neutral-950 transition-colors hover:bg-yellow-400"
                      >
                        Adicionar
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-2 border-t border-neutral-700 pt-4">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 text-neutral-400 transition-colors hover:text-neutral-200"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Tags */}
      {showTagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-neutral-700 bg-neutral-900 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-neutral-100">
                <FaTag className="text-yellow-500" size={16} />
                Gerenciar Tags
              </h3>
              <button
                onClick={() => setShowTagModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-200"
                title="Fechar modal"
              >
                <FaTimes size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-300">Nova tag</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Digite o nome da tag..."
                    className="flex-1 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 placeholder-neutral-500 focus:border-transparent focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <button
                    onClick={handleAddTag}
                    disabled={!newTag.trim()}
                    className="flex items-center gap-1 rounded-lg bg-yellow-500 px-3 py-2 text-neutral-950 transition-colors hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FaPlus size={12} />
                    Adicionar
                  </button>
                </div>
              </div>

              {note && note.tags && note.tags.length > 0 && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-300">
                    Tags existentes
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {note.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="group flex items-center gap-2 rounded-lg bg-neutral-800 px-3 py-1 text-sm text-yellow-500 transition-colors hover:bg-neutral-700"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="text-neutral-400 transition-colors hover:text-red-400"
                          title="Remover tag"
                        >
                          <FaTimes size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 border-t border-neutral-700 pt-4">
                <button
                  onClick={() => setShowTagModal(false)}
                  className="px-4 py-2 text-neutral-400 transition-colors hover:text-neutral-200"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteDetail;
