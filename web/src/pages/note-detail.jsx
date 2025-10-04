import React, { useState, useEffect, useRef, use } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  FaArrowLeft, FaTrash, FaTag, FaClock, FaUser, FaUsers, FaShare,
  FaSpinner, FaHeading, FaParagraph, FaQuoteRight, 
  FaCode, FaCheckSquare, FaList, FaGripVertical
} from 'react-icons/fa';
import { 
  useNoteQuery, 
  useUpdateNoteMutation, 
  useDeleteNoteMutation, 
  useCreateBlockMutation, 
  useUpdateBlockMutation, 
  useDeleteBlockMutation,
  useReorderBlocksMutation,
  useShareNoteMutation
} from '../hooks/useNotesQuery';

// =================== IMPORTS DOS SKELETONS REUTILIZÁVEIS ===================
import { Skeleton, SkeletonText, SkeletonButton } from '../components/UI/Skeleton.jsx';

// =================== IMPORT DO MODAL DE COMPARTILHAMENTO ===================
import ShareNoteModal from '../components/Modals/ShareNoteModal.jsx';

// =================== SKELETON SIMPLES E REUTILIZÁVEL ===================
const NoteDetailSkeleton = () => (
  <div className="min-h-screen bg-slate-950">
    
    {/* Header skeleton */}
    <div className="sticky top-0 bg-slate-950/80 backdrop-blur border-b border-gray-800 px-6 py-4 z-10">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <Skeleton width={32} height={32} className="rounded" />
        <div className="flex items-center gap-2">
          <Skeleton width="120px" height="16px" />
          <Skeleton width={32} height={32} className="rounded" />
        </div>
      </div>
    </div>

    {/* Conteúdo principal skeleton */}
    <div className="max-w-4xl mx-auto px-6 py-8">
      
      {/* Título skeleton */}
      <div className="mb-8">
        <Skeleton width="60%" height="48px" className="mb-2" />
      </div>

      {/* Tags skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <Skeleton width={16} height={16} />
        <div className="flex gap-2">
          <Skeleton width="60px" height="24px" className="rounded-full" />
          <Skeleton width="80px" height="24px" className="rounded-full" />
          <Skeleton width="45px" height="24px" className="rounded-full" />
        </div>
      </div>

      {/* Colaboradores skeleton */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Skeleton width={16} height={16} />
          <Skeleton width="100px" height="16px" />
        </div>
        <div className="flex gap-2">
          <Skeleton width="90px" height="24px" className="rounded-full" />
          <Skeleton width="110px" height="24px" className="rounded-full" />
        </div>
      </div>

      {/* Autor skeleton */}
      <div className="flex items-center gap-2 mb-8">
        <Skeleton width={12} height={12} />
        <Skeleton width="180px" height="16px" />
      </div>

      {/* Conteúdo dos blocos skeleton */}
      <div className="space-y-6">
        {/* Simula diferentes tipos de blocos */}
        
        {/* Bloco de título */}
        <Skeleton width="40%" height="32px" />
        
        {/* Bloco de parágrafo */}
        <SkeletonText lines={3} />
        
        {/* Bloco de código */}
        <Skeleton width="100%" height="100px" className="rounded-md bg-gray-700" />
        
        {/* Bloco de lista/todo */}
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton width={16} height={16} />
              <Skeleton width="70%" height="16px" />
            </div>
          ))}
        </div>
        
        {/* Mais parágrafos */}
        <SkeletonText lines={2} />
        <SkeletonText lines={4} />
      </div>
    </div>
  </div>
);

// Tipos de blocos disponíveis
const BLOCK_TYPES = [
  { type: 'heading', label: 'Título', icon: <FaHeading /> },
  { type: 'paragraph', label: 'Parágrafo', icon: <FaParagraph /> },
  { type: 'quote', label: 'Citação', icon: <FaQuoteRight /> },
  { type: 'code', label: 'Código', icon: <FaCode /> },
  { type: 'todo', label: 'Tarefa', icon: <FaCheckSquare /> },
  { type: 'list', label: 'Lista', icon: <FaList /> }
];

const NoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // React Query hooks
  const { data: note, isLoading, error } = useNoteQuery(id);
  const updateNoteMutation = useUpdateNoteMutation();
  const deleteNoteMutation = useDeleteNoteMutation();
  const createBlockMutation = useCreateBlockMutation();
  const updateBlockMutation = useUpdateBlockMutation();
  const deleteBlockMutation = useDeleteBlockMutation();
  const reorderBlocksMutation = useReorderBlocksMutation();
  const shareNoteMutation = useShareNoteMutation();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingBlocks, setEditingBlocks] = useState([]);
  const [editingTitle, setEditingTitle] = useState('');
  const [collaborators, setCollaborators] = useState([]);
  const [showBlockSelector, setShowBlockSelector] = useState(false);
  const [blockSelectorPosition, setBlockSelectorPosition] = useState({ x: 0, y: 0 });
  const [focusedBlockIndex, setFocusedBlockIndex] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  
  const containerRef = useRef(null);
  const blockSelectorRef = useRef(null);

  useEffect(() => {
    if (note) {
      setEditingTitle(note.title || '');
      
      // Garantir que os blocos tenham IDs únicos e estrutura adequada
      const blocks = note.blocks || [];
      const processedBlocks = blocks.length > 0 
        ? blocks.map(block => ({
            id: block.id || Date.now().toString() + Math.random(),
            type: block.type || 'paragraph',
            text: block.text || '',
            done: block.done,
            position: block.position
          }))
        : [{ type: 'paragraph', text: '', id: Date.now().toString() }];
      
      setEditingBlocks(processedBlocks);
    }
  }, [note]);

  // Auto-salvar quando houver mudanças
  useEffect(() => {
    if (isEditing && note && (editingTitle !== note.title || editingBlocks.some(b => b.text.trim()))) {
      const timeoutId = setTimeout(() => {
        handleAutoSave();
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [editingBlocks, editingTitle, isEditing]);

  useEffect(() => {
    if (note) {
      setCollaborators(note.collaborators || []);
    }
  }, [note]);

  // Clique fora para fechar seletor de blocos
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (blockSelectorRef.current && !blockSelectorRef.current.contains(event.target)) {
        setShowBlockSelector(false);
      }
    };

    if (showBlockSelector) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showBlockSelector]);

  const handleAutoSave = async () => {
    if (!note) return;
    
    try {
      // Salvar título da nota se mudou
      if (editingTitle !== note.title) {
        await updateNoteMutation.mutateAsync({ 
          noteId: note.id, 
          noteData: { title: editingTitle } 
        });
      }

      // Processar blocos
      const originalBlocks = note.blocks || [];
      const validEditingBlocks = editingBlocks.filter(block => block.text.trim() !== '');
      
      // Criar/atualizar blocos
      for (let i = 0; i < validEditingBlocks.length; i++) {
        const editingBlock = validEditingBlocks[i];
        
        if (editingBlock.isNew || editingBlock.id.toString().startsWith('temp_')) {
          // Criar novo bloco
          try {
            const newBlock = await createBlockMutation.mutateAsync({
              noteId: note.id,
              blockData: {
                type: editingBlock.type,
                text: editingBlock.text,
                done: editingBlock.done,
                position: i
              }
            });
            
            // Atualizar o bloco local com o ID real do backend
            const blockIndex = editingBlocks.findIndex(b => b.id === editingBlock.id);
            if (blockIndex !== -1) {
              setEditingBlocks(prev => {
                const updated = [...prev];
                updated[blockIndex] = {
                  ...updated[blockIndex],
                  id: newBlock.id,
                  isNew: false
                };
                return updated;
              });
            }
          } catch (error) {
            console.error('Erro ao criar bloco:', error);
          }
        } else {
          // Verificar se o bloco existente precisa ser atualizado
          const originalBlock = originalBlocks.find(b => b.id === editingBlock.id);
          
          if (originalBlock && (
            originalBlock.text !== editingBlock.text || 
            originalBlock.type !== editingBlock.type ||
            originalBlock.done !== editingBlock.done
          )) {
            try {
              await updateBlockMutation.mutateAsync({
                noteId: note.id,
                blockId: editingBlock.id,
                blockData: {
                  type: editingBlock.type,
                  text: editingBlock.text,
                  done: editingBlock.done,
                  position: i
                }
              });
            } catch (error) {
              console.error('Erro ao atualizar bloco:', error);
            }
          }
        }
      }

      // Deletar blocos removidos
      for (const originalBlock of originalBlocks) {
        const stillExists = editingBlocks.find(b => 
          b.id === originalBlock.id && !b.id.toString().startsWith('temp_')
        );
        if (!stillExists) {
          try {
            await deleteBlockMutation.mutateAsync({
              noteId: note.id,
              blockId: originalBlock.id
            });
          } catch (error) {
            console.error('Erro ao deletar bloco:', error);
          }
        }
      }
      
    } catch (error) {
      console.error('Erro ao auto-salvar:', error);
    }
  };

  const startEditing = () => {
    setIsEditing(true);
  };

  const handleContainerClick = (e) => {
    if (!isEditing && e.target === containerRef.current) {
      startEditing();
    }
  };

  const handleBlockChange = (index, field, value) => {
    const updatedBlocks = [...editingBlocks];
    updatedBlocks[index] = { ...updatedBlocks[index], [field]: value };
    setEditingBlocks(updatedBlocks);
  };

  const handleKeyDown = (event, index) => {
    if (event.key === '/') {
      const rect = event.target.getBoundingClientRect();
      setBlockSelectorPosition({ 
        x: rect.left, 
        y: rect.bottom + window.scrollY + 5
      });
      setFocusedBlockIndex(index);
      setShowBlockSelector(true);
      return;
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      addNewBlock(index + 1);
    } else if (event.key === 'Backspace' && event.target.value === '' && editingBlocks.length > 1) {
      event.preventDefault();
      removeBlock(index);
    }
  };

  const addNewBlock = (insertIndex = null) => {
    const tempId = `temp_${Date.now()}_${Math.random()}`;
    const newBlock = {
      id: tempId,
      type: 'paragraph',
      text: '',
      isNew: true, // Flag para identificar blocos novos
    };

    const updatedBlocks = [...editingBlocks];
    if (insertIndex !== null) {
      updatedBlocks.splice(insertIndex, 0, newBlock);
    } else {
      updatedBlocks.push(newBlock);
    }
    
    setEditingBlocks(updatedBlocks);
    
    // Focar no novo bloco
    setTimeout(() => {
      const targetIndex = insertIndex !== null ? insertIndex : updatedBlocks.length - 1;
      const input = document.querySelector(`[data-block-index="${targetIndex}"] input, [data-block-index="${targetIndex}"] textarea`);
      if (input) input.focus();
    }, 50);
  };

  const removeBlock = (index) => {
    if (editingBlocks.length <= 1) return;
    
    const updatedBlocks = editingBlocks.filter((_, i) => i !== index);
    setEditingBlocks(updatedBlocks);
    
    // Focar no bloco anterior
    if (index > 0) {
      setTimeout(() => {
        const input = document.querySelector(`[data-block-index="${index - 1}"] input, [data-block-index="${index - 1}"] textarea`);
        if (input) {
          input.focus();
          input.setSelectionRange(input.value.length, input.value.length);
        }
      }, 50);
    }
  };

  const handleBlockTypeSelect = (type) => {
    if (focusedBlockIndex !== null) {
      const updatedBlocks = [...editingBlocks];
      const currentBlock = updatedBlocks[focusedBlockIndex];
      
      updatedBlocks[focusedBlockIndex] = {
        ...currentBlock,
        type,
        text: currentBlock.text.replace(/^\/.*/, ''), // Remove a barra e o comando
        done: type === 'todo' ? false : currentBlock.done
      };
      setEditingBlocks(updatedBlocks);
    }
    setShowBlockSelector(false);
    setFocusedBlockIndex(null);
    
    // Focar de volta no input
    setTimeout(() => {
      const input = document.querySelector(`[data-block-index="${focusedBlockIndex}"] input, [data-block-index="${focusedBlockIndex}"] textarea`);
      if (input) input.focus();
    }, 50);
  };

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja deletar esta nota?')) {
      try {
        await deleteNoteMutation.mutateAsync(note.id);
        navigate('/notes');
      } catch (error) {
        console.error('Erro ao deletar nota:', error);
        alert('Erro ao deletar a nota. Tente novamente.');
      }
    }
  };

  const handleShare = async (noteId, shareData) => {
    try {
      await shareNoteMutation.mutateAsync({ noteId, shareData });
      // O cache será invalidado automaticamente pela mutation
    } catch (error) {
      console.error('Erro ao compartilhar nota:', error);
      throw error; // Re-throw para que o modal possa lidar com o erro
    }
  };

  // Função para drag & drop
  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    
    const { source, destination } = result;
    
    // Se a posição não mudou, não fazer nada
    if (source.index === destination.index) return;
    
    // Reordenar blocos localmente
    const newBlocks = Array.from(editingBlocks);
    const [reorderedBlock] = newBlocks.splice(source.index, 1);
    newBlocks.splice(destination.index, 0, reorderedBlock);
    
    // Atualizar posições
    const updatedBlocks = newBlocks.map((block, index) => ({
      ...block,
      position: index
    }));
    
    setEditingBlocks(updatedBlocks);
    
    // Enviar para o backend
    try {
      const blockPositions = updatedBlocks
        .filter(block => !block.id.toString().startsWith('temp_') && !block.isNew)
        .map(block => ({
          id: block.id,
          position: block.position
        }));
      
      if (blockPositions.length > 0) {
        await reorderBlocksMutation.mutateAsync({
          noteId: note.id,
          blockPositions
        });
      }
    } catch (error) {
      console.error('Erro ao reordenar blocos:', error);
      // Reverter em caso de erro
      setEditingBlocks(editingBlocks);
    }
  };

  const handleBack = () => {
    navigate('/notes');
  };

  const formatDate = (dateString) => {
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

  const renderEditableBlock = (block, index, provided, snapshot) => {
    const commonProps = {
      key: block.id || index,
      'data-block-index': index,
      value: block.text,
      onChange: (e) => handleBlockChange(index, 'text', e.target.value),
      onKeyDown: (e) => handleKeyDown(e, index),
      placeholder: index === 0 ? "Comece a escrever ou digite '/' para ver opções..." : "Digite '/' para ver opções de bloco",
      className: "w-full bg-transparent outline-none resize-none text-gray-200 placeholder-gray-500",
      autoFocus: index === editingBlocks.length - 1
    };

    const blockContent = (() => {
      switch (block.type) {
        case 'heading':
          return (
            <input
              {...commonProps}
              className="w-full bg-transparent outline-none text-2xl font-bold text-gray-100 placeholder-gray-500"
              placeholder="Título"
            />
          );

        case 'quote':
          return (
            <textarea
              {...commonProps}
              rows={2}
              className="w-full bg-transparent outline-none border-l-4 border-blue-500 pl-4 italic text-gray-300 placeholder-gray-500 resize-none"
              placeholder="Citação"
            />
          );

        case 'code':
          return (
            <textarea
              {...commonProps}
              rows={4}
              className="w-full bg-gray-800 text-gray-300 p-4 rounded-md font-mono resize-none outline-none"
              placeholder="Código"
            />
          );

        case 'todo':
          return (
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={block.done || false}
                onChange={(e) => handleBlockChange(index, 'done', e.target.checked)}
                className="mt-1 accent-blue-600"
              />
              <input
                {...commonProps}
                className={`flex-1 bg-transparent outline-none ${block.done ? 'line-through text-gray-500' : 'text-gray-200'} placeholder-gray-500`}
                placeholder="Tarefa"
              />
            </div>
          );

        case 'list':
          return (
            <textarea
              {...commonProps}
              rows={3}
              className="w-full bg-transparent outline-none text-gray-200 placeholder-gray-500 resize-none list-disc list-inside"
              placeholder="• Item da lista"
            />
          );

        default:
          return (
            <textarea
              {...commonProps}
              rows={2}
              className="w-full bg-transparent outline-none text-gray-200 placeholder-gray-500 resize-none"
            />
          );
      }
    })();

    return (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        className={`mb-4 group relative p-2 rounded-md transition-all ${
          snapshot.isDragging ? 'bg-gray-800/50 shadow-lg scale-105' : 'hover:bg-gray-800/20'
        }`}
      >
        {/* Drag Handle */}
        <div 
          {...provided.dragHandleProps}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-8 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        >
          <FaGripVertical className="text-gray-500 hover:text-gray-300" size={12} />
        </div>

        {blockContent}
      </div>
    );
  };

  const renderBlock = (block, index) => {
    if (!block.text.trim()) return null;

    switch (block.type) {
      case 'heading':
        return (
          <h1 key={index} className="text-3xl font-bold text-gray-100 mb-6 break-words">
            {block.text}
          </h1>
        );

      case 'quote':
        return (
          <blockquote key={index} className="border-l-4 border-blue-500 pl-4 italic text-gray-400 mb-4 break-words">
            {block.text}
          </blockquote>
        );

      case 'code':
        return (
          <pre key={index} className="bg-gray-800 text-gray-300 p-4 rounded-md font-mono text-sm overflow-x-auto mb-4">
            <code className="break-all">{block.text}</code>
          </pre>
        );

      case 'todo':
        return (
          <div key={index} className="flex items-center gap-3 mb-3">
            <input 
              type="checkbox" 
              checked={block.done} 
              readOnly 
              className="accent-blue-600" 
            />
            <span className={`${block.done ? 'line-through text-gray-500' : 'text-gray-200'} break-words`}>
              {block.text}
            </span>
          </div>
        );

      case 'list':
        const items = block.text.split('\n').filter(item => item.trim());
        return (
          <ul key={index} className="list-disc list-inside text-gray-300 space-y-1 mb-4">
            {items.map((item, i) => (
              <li key={i} className="break-words">{item.replace(/^[•-]\s*/, '')}</li>
            ))}
          </ul>
        );

      default:
        return (
          <p key={index} className="text-gray-300 leading-relaxed mb-4 break-words">
            {block.text}
          </p>
        );
    }
  };

  if (isLoading) {
    return <NoteDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-4">⚠️ {error.message || 'Erro ao carregar nota'}</div>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600 transition-colors flex items-center gap-2 mx-auto"
          >
            <FaArrowLeft size={14} />
            Voltar para Notas
          </button>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-gray-400 text-lg mb-4">📝 Nota não encontrada</div>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600 transition-colors flex items-center gap-2 mx-auto"
          >
            <FaArrowLeft size={14} />
            Voltar para Notas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header simples */}
      <div className="sticky top-0 bg-slate-950/80 backdrop-blur border-b border-gray-800 px-6 py-4 z-10">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={handleBack}
            className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
          >
            <FaArrowLeft size={16} />
          </button>
          
          <div className="flex items-center gap-2">
            {note.updated_at && (
              <span className="text-xs text-gray-500">
                Atualizada {formatDate(note.updated_at)}
              </span>
            )}
            {/* Botão de compartilhamento - só aparece para o dono da nota */}
            {note && (
              <button
                onClick={() => setShowShareModal(true)}
                className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                title="Compartilhar nota"
              >
                <FaShare size={14} />
              </button>
            )}
            <button
              onClick={handleDelete}
              className="p-2 text-red-400 hover:text-red-300 transition-colors"
            >
              <FaTrash size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div 
        ref={containerRef}
        onClick={handleContainerClick}
        className="max-w-4xl mx-auto px-6 py-8 min-h-[calc(100vh-80px)]"
      >
        {/* Título */}
        <div className="mb-8">
          {isEditing ? (
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              placeholder="Título da nota..."
              className="w-full text-4xl font-bold text-gray-100 bg-transparent outline-none placeholder-gray-500"
              autoFocus={!editingTitle}
            />
          ) : (
            <h1 
              onClick={startEditing}
              className="text-4xl font-bold text-gray-100 cursor-text min-h-[3rem] flex items-center"
            >
              {note.title || 'Clique para adicionar título...'}
            </h1>
          )}
        </div>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex items-center gap-2 mb-6">
            <FaTag className="text-gray-500" size={12} />
            <div className="flex gap-2">
              {note.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="bg-blue-600/20 text-blue-300 text-sm px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Colaboradores */}
        {note.collaborators && note.collaborators.length > 0 && (
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <FaUsers className="text-gray-500" size={12} />
              <span className="text-sm text-gray-400">Compartilhado com:</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {note.collaborators.map((collaborator, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 bg-green-600/20 text-green-300 text-sm px-3 py-1 rounded-full"
                  title={`${collaborator.name} (${collaborator.email}) - Adicionado em ${new Date(collaborator.added_at).toLocaleDateString('pt-BR')}`}
                >
                  {collaborator.avatar_url ? (
                    <img 
                      src={collaborator.avatar_url} 
                      alt={collaborator.name}
                      className="w-4 h-4 rounded-full"
                    />
                  ) : (
                    <FaUser size={10} />
                  )}
                  <span>{collaborator.username}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Autor da nota */}
        {note.user && (
          <div className="flex items-center gap-2 mb-8 text-sm text-gray-400">
            <FaUser size={10} />
            <span>Criado por: <span className="text-gray-300">
              <Link to={`/user-profile/${note.user.id}`}>@{note.user.username}</Link></span></span>
            {note.access && note.access.isCollaborator && !note.access.isOwner && (
              <span className="bg-yellow-600/20 text-yellow-300 px-2 py-1 rounded-full text-xs ml-2">
                Colaborador
              </span>
            )}
          </div>
        )}

        {/* Conteúdo dos blocos */}
        <div className="space-y-4">
          {isEditing ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="blocks">
                {(provided, snapshot) => (
                  <div 
                    {...provided.droppableProps} 
                    ref={provided.innerRef}
                    className={`space-y-2 min-h-[200px] transition-colors ${
                      snapshot.isDraggingOver ? 'bg-gray-800/10 rounded-md' : ''
                    }`}
                  >
                    {editingBlocks.map((block, index) => (
                      <Draggable key={block.id} draggableId={block.id.toString()} index={index}>
                        {(provided, snapshot) => renderEditableBlock(block, index, provided, snapshot)}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    
                    {editingBlocks.length === 0 && (
                      <div 
                        onClick={() => addNewBlock()}
                        className="text-gray-500 cursor-text py-4 text-center border-2 border-dashed border-gray-700 rounded-md"
                      >
                        Clique aqui para começar a escrever...
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <div 
              onClick={startEditing}
              className="space-y-4 cursor-text min-h-[200px]"
            >
              {note.blocks && note.blocks.length > 0 ? (
                note.blocks.map((block, index) => renderBlock(block, index))
              ) : (
                <div className="text-gray-500 py-8 text-center">
                  Clique em qualquer lugar para começar a escrever...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Indicador de salvamento */}
        {(updateNoteMutation.isPending || createBlockMutation.isPending || updateBlockMutation.isPending || reorderBlocksMutation.isPending) && (
          <div className="fixed top-4 right-4 bg-gray-800 border border-gray-600 rounded-md px-4 py-2 flex items-center gap-2 shadow-lg z-50">
            <FaSpinner className="animate-spin text-blue-400" size={14} />
            <span className="text-gray-200 text-sm">Salvando...</span>
          </div>
        )}
      </div>

      {/* Seletor de tipo de bloco horizontal */}
      {showBlockSelector && (
        <div
          ref={blockSelectorRef}
          className="fixed bg-gray-800 border border-gray-600 rounded-md shadow-xl z-50 p-2"
          style={{
            left: blockSelectorPosition.x,
            top: blockSelectorPosition.y
          }}
        >
          <div className="flex gap-1">
            {BLOCK_TYPES.map((blockType) => (
              <button
                key={blockType.type}
                onClick={() => handleBlockTypeSelect(blockType.type)}
                className="flex flex-col items-center gap-1 p-3 hover:bg-gray-700 rounded-md transition-colors min-w-[60px]"
                title={blockType.label}
              >
                <span className="text-gray-300 text-lg">{blockType.icon}</span>
                <span className="text-xs text-gray-400">{blockType.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modal de compartilhamento */}
      <ShareNoteModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onShare={handleShare}
        note={note}
      />
    </div>
  );
};

export default NoteDetail;