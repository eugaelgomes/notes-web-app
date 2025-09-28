import React, { useState, useEffect } from 'react';
import { 
  FaTimes, FaSave, FaEdit, FaTag, FaPlus, FaTrash, 
  FaHeading, FaParagraph, FaQuoteRight, FaCode, FaCheckSquare 
} from 'react-icons/fa';

const BLOCK_TYPES = [
  { type: 'heading', label: 'Título', icon: <FaHeading />, properties: { level: 1 } },
  { type: 'paragraph', label: 'Parágrafo', icon: <FaParagraph />, properties: {} },
  { type: 'quote', label: 'Citação', icon: <FaQuoteRight />, properties: {} },
  { type: 'code', label: 'Código', icon: <FaCode />, properties: { language: 'javascript' } },
  { type: 'todo', label: 'Tarefa', icon: <FaCheckSquare />, properties: {} }
];

const ViewNotes = ({ 
  note, 
  isOpen, 
  onClose, 
  onSave, 
  onDelete,
  mode = 'view'
}) => {
  const [isEditing, setIsEditing] = useState(mode === 'edit' || mode === 'create');
  const [formData, setFormData] = useState({
    title: '',
    tags: [],
    blocks: []
  });
  const [newTag, setNewTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Função para achatar a árvore de blocos para edição
  const flattenBlocks = (blocks, parentId = null) => {
    const result = [];
    blocks.forEach(block => {
      result.push({
        ...block,
        parent_id: parentId,
        properties: block.properties || {}
      });
      if (block.children && block.children.length > 0) {
        result.push(...flattenBlocks(block.children, block.id));
      }
    });
    return result;
  };

  // Função para construir árvore de blocos para envio
  const buildBlockTree = (flatBlocks) => {
    const blockMap = new Map();
    const rootBlocks = [];

    // Criar mapa de blocos
    flatBlocks.forEach(block => {
      block.children = [];
      blockMap.set(block.id, block);
    });

    // Construir árvore
    flatBlocks.forEach(block => {
      if (block.parent_id) {
        const parent = blockMap.get(block.parent_id);
        if (parent) {
          parent.children.push(block);
        }
      } else {
        rootBlocks.push(block);
      }
    });

    return rootBlocks;
  };

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title || '',
        tags: note.tags || [],
        blocks: flattenBlocks(note.blocks || []) // Achata os blocos para edição
      });
    } else if (mode === 'create') {
      setFormData({ title: '', tags: [], blocks: [] });
    }
    setIsEditing(mode === 'edit' || mode === 'create');
  }, [note, mode]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBlockChange = (index, field, value) => {
    setFormData(prev => {
      const updatedBlocks = [...prev.blocks];
      if (field === 'properties') {
        updatedBlocks[index] = { 
          ...updatedBlocks[index], 
          properties: { ...updatedBlocks[index].properties, ...value }
        };
      } else {
        updatedBlocks[index] = { ...updatedBlocks[index], [field]: value };
      }
      return { ...prev, blocks: updatedBlocks };
    });
  };

  const handleAddBlock = (type) => {
    const blockType = BLOCK_TYPES.find(bt => bt.type === type);
    setFormData(prev => ({
      ...prev,
      blocks: [
        ...prev.blocks,
        { 
          id: Date.now().toString(), 
          type, 
          text: '', 
          done: type === 'todo' ? false : undefined,
          properties: blockType?.properties || {},
          position: prev.blocks.length
        }
      ]
    }));
  };

  const handleRemoveBlock = (index) => {
    setFormData(prev => ({
      ...prev,
      blocks: prev.blocks.filter((_, i) => i !== index)
    }));
  };

  const handleToggleTodo = (index) => {
    setFormData(prev => {
      const updated = [...prev.blocks];
      updated[index].done = !updated[index].done;
      return { ...prev, blocks: updated };
    });
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert('Por favor, adicione um título à nota.');
      return;
    }
    setIsSaving(true);
    try {
      await onSave(formData);
      if (mode !== 'create') setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar nota:', error);
      alert('Erro ao salvar a nota. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja deletar esta nota?')) {
      try {
        await onDelete(note);
        onClose();
      } catch (error) {
        console.error('Erro ao deletar nota:', error);
        alert('Erro ao deletar a nota. Tente novamente.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-lg font-medium text-gray-200">
            {mode === 'create' ? 'Nova Nota' : isEditing ? 'Editar Nota' : 'Nota'}
          </h2>
          <div className="flex items-center gap-2">
            {!isEditing && mode !== 'create' && (
              <button onClick={() => setIsEditing(true)} className="p-2 text-gray-400 hover:text-gray-200">
                <FaEdit size={16} />
              </button>
            )}
            {note && mode !== 'create' && (
              <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-gray-200">
                <FaTrash size={16} />
              </button>
            )}
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-200">
              <FaTimes size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Título */}
          {isEditing ? (
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full bg-transparent text-2xl font-bold text-gray-100 placeholder-gray-500 outline-none"
              placeholder="Título da nota..."
            />
          ) : (
            <h1 className="text-2xl font-bold text-gray-100">{formData.title || 'Sem título'}</h1>
          )}

          {/* Tags */}
          <div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag, i) => (
                  <span key={i} className="bg-gray-800 text-gray-300 text-sm px-3 py-1 rounded-full flex items-center gap-1">
                    {tag}
                    {isEditing && (
                      <button onClick={() => handleRemoveTag(tag)} className="text-gray-400 hover:text-gray-200">
                        <FaTimes size={10} />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            )}
            {isEditing && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  className="flex-1 bg-transparent border-b border-gray-700 text-gray-200 placeholder-gray-500 outline-none"
                  placeholder="Adicionar tag..."
                />
                <button onClick={handleAddTag} className="px-3 py-1 text-gray-400 hover:text-gray-200">
                  <FaPlus size={12} />
                </button>
              </div>
            )}
          </div>

          {/* Blocos */}
          <div className="space-y-4">
            {formData.blocks.map((block, index) => (
              <div key={block.id} className="group relative">
                {isEditing ? (
                  <div className="relative">
                    <button
                      onClick={() => handleRemoveBlock(index)}
                      className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 bg-gray-700 hover:bg-gray-600 text-gray-300 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-opacity"
                    >
                      <FaTimes />
                    </button>
                    {block.type === 'heading' && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <select
                            value={block.properties?.level || 1}
                            onChange={(e) => handleBlockChange(index, 'properties', { level: parseInt(e.target.value) })}
                            className="bg-gray-800 text-gray-200 px-2 py-1 rounded text-sm"
                          >
                            {[1,2,3,4,5,6].map(level => (
                              <option key={level} value={level}>H{level}</option>
                            ))}
                          </select>
                        </div>
                        <input
                          type="text"
                          value={block.text}
                          onChange={(e) => handleBlockChange(index, 'text', e.target.value)}
                          className="w-full bg-transparent text-xl font-semibold text-gray-100 placeholder-gray-500 outline-none"
                          placeholder="Título..."
                        />
                      </div>
                    )}
                    {block.type === 'paragraph' && (
                      <textarea
                        value={block.text}
                        onChange={(e) => handleBlockChange(index, 'text', e.target.value)}
                        rows={2}
                        className="w-full bg-transparent text-gray-200 placeholder-gray-500 outline-none resize-none"
                        placeholder="Digite..."
                      />
                    )}
                    {block.type === 'quote' && (
                      <textarea
                        value={block.text}
                        onChange={(e) => handleBlockChange(index, 'text', e.target.value)}
                        rows={2}
                        className="w-full bg-transparent border-l-4 border-gray-700 pl-3 italic text-gray-400 outline-none"
                        placeholder="Citação..."
                      />
                    )}
                    {block.type === 'code' && (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={block.properties?.language || 'javascript'}
                          onChange={(e) => handleBlockChange(index, 'properties', { language: e.target.value })}
                          className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-sm"
                          placeholder="Linguagem (ex: javascript, python...)"
                        />
                        <textarea
                          value={block.text}
                          onChange={(e) => handleBlockChange(index, 'text', e.target.value)}
                          rows={4}
                          className="w-full font-mono bg-gray-800 text-gray-300 p-3 rounded-md outline-none"
                          placeholder="Escreva código..."
                        />
                      </div>
                    )}
                    {block.type === 'todo' && (
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={block.done}
                          onChange={() => handleToggleTodo(index)}
                          className="accent-gray-600"
                        />
                        <input
                          type="text"
                          value={block.text}
                          onChange={(e) => handleBlockChange(index, 'text', e.target.value)}
                          className="flex-1 bg-transparent text-gray-200 outline-none"
                          placeholder="Tarefa..."
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {block.type === 'heading' && (
                      React.createElement(
                        `h${block.properties?.level || 1}`,
                        { className: "text-xl font-semibold text-gray-100" },
                        block.text
                      )
                    )}
                    {block.type === 'paragraph' && <p className="text-gray-300">{block.text}</p>}
                    {block.type === 'quote' && <blockquote className="border-l-4 border-gray-700 pl-3 italic text-gray-400">{block.text}</blockquote>}
                    {block.type === 'code' && (
                      <div className="space-y-1">
                        {block.properties?.language && (
                          <div className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-t">{block.properties.language}</div>
                        )}
                        <pre className="bg-gray-800 text-gray-300 p-3 rounded-md font-mono">{block.text}</pre>
                      </div>
                    )}
                    {block.type === 'todo' && (
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={block.done} readOnly className="accent-gray-600" />
                        <span className={block.done ? 'line-through text-gray-500' : 'text-gray-200'}>
                          {block.text}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Adicionar Bloco */}
          {isEditing && (
            <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-800">
              {BLOCK_TYPES.map(bt => (
                <button
                  key={bt.type}
                  onClick={() => handleAddBlock(bt.type)}
                  className="px-3 py-1 text-sm text-gray-400 hover:text-gray-200 flex items-center gap-1"
                >
                  {bt.icon} {bt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {isEditing && (
          <div className="border-t border-gray-800 p-4 flex justify-end gap-3">
            <button
              onClick={() => mode === 'create' ? onClose() : setIsEditing(false)}
              className="px-4 py-1 text-gray-400 hover:text-gray-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-1 bg-gray-800 text-gray-200 rounded-md hover:bg-gray-700 flex items-center gap-2"
            >
              {isSaving ? 'Salvando...' : <><FaSave size={14} /> {mode === 'create' ? 'Criar' : 'Salvar'}</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewNotes;
