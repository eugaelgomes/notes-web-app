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
} from '../../hooks/useNotesQuery';

// =================== IMPORTS DOS SKELETONS REUTILIZÁVEIS ===================
import { Skeleton, SkeletonText, SkeletonButton } from '../../components/ui/Skeleton';

// =================== IMPORT DO MODAL DE COMPARTILHAMENTO ===================
import ShareNoteModal from '../../components/modals/ShareNoteModal';

// =================== SKELETON SIMPLES E REUTILIZÁVEL ===================
const NoteDetailSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    
    {/* Header skeleton */}
    <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <Skeleton width={24} height={24} className="rounded" />
        <div className="flex items-center gap-3">
          <Skeleton width="100px" height="14px" />
          <Skeleton width={24} height={24} className="rounded" />
        </div>
      </div>
    </div>

    {/* Conteúdo principal skeleton */}
    <div className="max-w-4xl mx-auto px-4 py-6">
      
      {/* Título skeleton */}
      <div className="mb-6">
        <Skeleton width="50%" height="32px" className="mb-3" />
      </div>

      {/* Meta info skeleton */}
      <div className="flex items-center gap-6 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <Skeleton width={12} height={12} />
          <Skeleton width="80px" height="14px" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton width={12} height={12} />
          <Skeleton width="120px" height="14px" />
        </div>
      </div>

      {/* Conteúdo dos blocos skeleton */}
      <div className="space-y-4">
        <Skeleton width="90%" height="20px" />
        <SkeletonText lines={3} />
        <Skeleton width="100%" height="80px" className="rounded-md bg-gray-200" />
        <SkeletonText lines={2} />
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton width={14} height={14} />
              <Skeleton width="60%" height="14px" />
            </div>
          ))}
        </div>
        <SkeletonText lines={2} />
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
      className: "w-full bg-transparent outline-none resize-none text-gray-900 placeholder-gray-400",
      autoFocus: index === editingBlocks.length - 1
    };

    const blockContent = (() => {
      switch (block.type) {
        case 'heading':
          return (
            <input
              {...commonProps}
              className="w-full bg-transparent outline-none text-xl font-semibold text-gray-900 placeholder-gray-400 mb-4"
              placeholder="Título"
            />
          );

        case 'quote':
          return (
            <textarea
              {...commonProps}
              rows={2}
              className="w-full bg-transparent outline-none border-l-3 border-blue-400 pl-3 italic text-gray-700 placeholder-gray-400 resize-none mb-3"
              placeholder="Citação"
            />
          );

        case 'code':
          return (
            <textarea
              {...commonProps}
              rows={4}
              className="w-full bg-gray-100 text-gray-800 p-3 rounded-md font-mono text-sm resize-none outline-none mb-3"
              placeholder="Código"
            />
          );

        case 'todo':
          return (
            <div className="flex items-start gap-3 mb-2">
              <input
                type="checkbox"
                checked={block.done || false}
                onChange={(e) => handleBlockChange(index, 'done', e.target.checked)}
                className="mt-1 accent-blue-500"
              />
              <input
                {...commonProps}
                className={`flex-1 bg-transparent outline-none ${block.done ? 'line-through text-gray-500' : 'text-gray-900'} placeholder-gray-400`}
                placeholder="Tarefa"
              />
            </div>
          );

        case 'list':
          return (
            <textarea
              {...commonProps}
              rows={3}
              className="w-full bg-transparent outline-none text-gray-900 placeholder-gray-400 resize-none mb-3"
              placeholder="• Item da lista"
            />
          );

        default:
          return (
            <textarea
              {...commonProps}
              rows={2}
              className="w-full bg-transparent outline-none text-gray-900 placeholder-gray-400 resize-none leading-relaxed mb-3"
            />
          );
      }
    })();

    return (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        className={`group relative transition-all ${
          snapshot.isDragging ? 'bg-blue-50 shadow-md scale-105 rounded-md' : ''
        }`}
      >
        {/* Drag Handle */}
        <div 
          {...provided.dragHandleProps}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-6 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        >
          <FaGripVertical className="text-gray-400 hover:text-gray-600" size={12} />
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
          <h1 key={index} className="text-xl font-semibold text-gray-900 mb-4 break-words">
            {block.text}
          </h1>
        );

      case 'quote':
        return (
          <blockquote key={index} className="border-l-3 border-blue-400 pl-3 italic text-gray-700 mb-3 break-words">
            {block.text}
          </blockquote>
        );

      case 'code':
        return (
          <pre key={index} className="bg-gray-100 text-gray-800 p-3 rounded-md font-mono text-sm overflow-x-auto mb-3">
            <code className="break-all">{block.text}</code>
          </pre>
        );

      case 'todo':
        return (
          <div key={index} className="flex items-center gap-3 mb-2">
            <input 
              type="checkbox" 
              checked={block.done} 
              readOnly 
              className="accent-blue-500" 
            />
            <span className={`${block.done ? 'line-through text-gray-500' : 'text-gray-900'} break-words`}>
              {block.text}
            </span>
          </div>
        );

      case 'list':
        const items = block.text.split('\n').filter(item => item.trim());
        return (
          <ul key={index} className="list-disc list-inside text-gray-800 space-y-1 mb-3">
            {items.map((item, i) => (
              <li key={i} className="break-words">{item.replace(/^[•-]\s*/, '')}</li>
            ))}
          </ul>
        );

      default:
        return (
          <p key={index} className="text-gray-800 leading-relaxed mb-3 break-words">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-md">
          <div className="text-gray-600 text-lg mb-4">⚠️ {error.message || 'Erro ao carregar nota'}</div>
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

  if (!note) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-md">
          <div className="text-gray-600 text-lg mb-4">📝 Nota não encontrada</div>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header limpo */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10 shadow-sm">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={handleBack}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
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
                onClick={() => setShowShareModal(true)}
                className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title="Compartilhar nota"
              >
                <FaShare size={14} />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-gray-500 hover:text-gray-600 hover:bg-red-50 rounded-md transition-colors"
                title="Deletar nota"
              >
                <FaTrash size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div 
        ref={containerRef}
        onClick={handleContainerClick}
        className="max-w-4xl mx-auto px-4 py-6"
      >
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

        {/* Meta informações compactas */}
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

          {/* Colaboradores */}
          {note.collaborators && note.collaborators.length > 0 && (
            <div className="flex items-center gap-2">
              <FaUsers className="text-gray-400" size={12} />
              <span className="text-xs">Compartilhado com:</span>
              <div className="flex gap-1">
                {note.collaborators.map((collaborator, index) => (
                  <span 
                    key={index}
                    className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-md"
                    title={`${collaborator.name} (${collaborator.email})`}
                  >
                    {collaborator.username}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Autor da nota */}
          {note.user && (
            <div className="flex items-center gap-2">
              <FaUser size={10} className="text-gray-400" />
              <span className="text-xs">
                Por: <Link to={`/user-profile/${note.user.id}`} className="text-blue-600 hover:text-blue-700">@{note.user.username}</Link>
                {note.access && note.access.isCollaborator && !note.access.isOwner && (
                  <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md text-xs ml-2">
                    Colaborador
                  </span>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Conteúdo dos blocos */}
        <div className="space-y-0">
          {isEditing ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="blocks">
                {(provided, snapshot) => (
                  <div 
                    {...provided.droppableProps} 
                    ref={provided.innerRef}
                    className={`min-h-[150px] transition-colors ${
                      snapshot.isDraggingOver ? 'bg-blue-50 border-2 border-dashed border-blue-300 rounded-md p-2' : ''
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
                        className="text-gray-500 cursor-text py-8 text-center border-2 border-dashed border-gray-300 rounded-md hover:border-gray-400 transition-colors"
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
              className="cursor-text min-h-[150px]"
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
          <div className="fixed top-4 right-4 bg-white border border-gray-300 rounded-md px-3 py-2 flex items-center gap-2 shadow-lg z-50">
            <FaSpinner className="animate-spin text-blue-500" size={14} />
            <span className="text-gray-700 text-sm">Salvando...</span>
          </div>
        )}
      </div>

      {/* Seletor de tipo de bloco horizontal */}
      {showBlockSelector && (
        <div
          ref={blockSelectorRef}
          className="fixed bg-white border border-gray-300 rounded-lg shadow-xl z-50 p-2"
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
                className="flex flex-col items-center gap-1 p-3 hover:bg-gray-100 rounded-md transition-colors min-w-[60px]"
                title={blockType.label}
              >
                <span className="text-gray-600 text-lg">{blockType.icon}</span>
                <span className="text-xs text-gray-500">{blockType.label}</span>
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