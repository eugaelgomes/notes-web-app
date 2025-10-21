"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { FaArrowLeft, FaTrash, FaTag, FaSpinner, FaShare, FaPlus, FaTimes, FaUserPlus, FaSearch } from "react-icons/fa";
import { useNotes } from "@/app/contexts/NotesContext";
import { Note, User as SearchUser } from "@/app/services/notes-service/NotesService";
import { getCollaboratorDisplayName, getCollaboratorAvatarUrl, getCollaboratorId } from "@/app/utils/collaborators";

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
        userId: userId
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
        tags: updatedTags
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
      const updatedTags = (note.tags || []).filter(tag => tag !== tagToRemove);
      const updatedNote = await updateNote(note.id, {
        tags: updatedTags
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
                onClick={() => setShowTagModal(true)}
                className="p-2 text-neutral-400 hover:text-yellow-500 hover:bg-neutral-800 rounded-md transition-all"
                title="Gerenciar tags"
              >
                <FaTag size={14} />
              </button>
              
              <button
                onClick={() => setShowShareModal(true)}
                className="p-2 text-neutral-400 hover:text-yellow-500 hover:bg-neutral-800 rounded-md transition-all"
                title="Compartilhar nota"
              >
                <FaShare size={14} />
              </button>
              
              <button
                onClick={handleDelete}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-neutral-800 rounded-md transition-all"
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
              <div className="flex flex-wrap gap-1">
                {note.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-neutral-800 text-yellow-500 text-xs px-2 py-1 rounded-md flex items-center gap-1 group hover:bg-neutral-700 transition-colors"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="opacity-0 group-hover:opacity-100 ml-1 text-neutral-400 hover:text-red-400 transition-all"
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
              <span className="text-neutral-500 text-xs">Colaboradores:</span>
              <div className="flex flex-wrap gap-2">
                {note.collaborators.map((collab, index) => {
                  const displayName = getCollaboratorDisplayName(collab);
                  const avatarUrl = getCollaboratorAvatarUrl(collab);
                  
                  return (
                    <div
                      key={index}
                      className="group flex items-center gap-2 bg-neutral-800 rounded-lg px-2 py-1 hover:bg-neutral-700 transition-colors"
                    >
                      <div className="w-6 h-6 rounded-full bg-yellow-500 border border-neutral-700 flex items-center justify-center overflow-hidden">
                        {avatarUrl ? (
                          <Image
                            width={24}
                            height={24}
                            src={avatarUrl}
                            alt={displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-neutral-950 text-xs font-semibold">
                            {displayName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      
                      <span className="text-neutral-300 text-xs font-medium">
                        {displayName}
                      </span>
                      
                      <button
                        onClick={() => handleRemoveCollaborator(collab)}
                        className="opacity-0 group-hover:opacity-100 ml-1 text-neutral-500 hover:text-red-400 transition-all"
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

      {/* Modal de Compartilhamento */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-100 flex items-center gap-2">
                <FaUserPlus className="text-yellow-500" size={16} />
                Compartilhar Nota
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-neutral-400 hover:text-neutral-200 p-1"
                title="Fechar modal"
              >
                <FaTimes size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Buscar usuário por email
                </label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={14} />
                  <input
                    type="email"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      handleSearchUsers(e.target.value);
                    }}
                    placeholder="Digite o email do usuário..."
                    className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <FaSpinner className="animate-spin text-yellow-500" size={14} />
                    </div>
                  )}
                </div>
              </div>

              {searchResults.length > 0 && (
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-2 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center">
                          <span className="text-neutral-950 text-xs font-semibold">
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
                        className="px-3 py-1 bg-yellow-500 text-neutral-950 rounded text-xs font-medium hover:bg-yellow-400 transition-colors"
                      >
                        Adicionar
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-neutral-700">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 text-neutral-400 hover:text-neutral-200 transition-colors"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-100 flex items-center gap-2">
                <FaTag className="text-yellow-500" size={16} />
                Gerenciar Tags
              </h3>
              <button
                onClick={() => setShowTagModal(false)}
                className="text-neutral-400 hover:text-neutral-200 p-1"
                title="Fechar modal"
              >
                <FaTimes size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Nova tag
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Digite o nome da tag..."
                    className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <button
                    onClick={handleAddTag}
                    disabled={!newTag.trim()}
                    className="px-3 py-2 bg-yellow-500 text-neutral-950 rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                  >
                    <FaPlus size={12} />
                    Adicionar
                  </button>
                </div>
              </div>

              {note && note.tags && note.tags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Tags existentes
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {note.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-neutral-800 text-yellow-500 text-sm px-3 py-1 rounded-lg flex items-center gap-2 group hover:bg-neutral-700 transition-colors"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="text-neutral-400 hover:text-red-400 transition-colors"
                          title="Remover tag"
                        >
                          <FaTimes size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-neutral-700">
                <button
                  onClick={() => setShowTagModal(false)}
                  className="px-4 py-2 text-neutral-400 hover:text-neutral-200 transition-colors"
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
