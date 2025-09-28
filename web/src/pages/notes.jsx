import React, { useState } from 'react';
import { FaPlus, FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import { useNotes } from '../context/NotesContext';
import MappingNotes from '../components/modals/mapping-notes';
import ViewNotes from '../components/modals/view-notes';

const Notes = () => {
  const { 
    notesOverview, 
    loading, 
    error, 
    createNote, 
    updateNote, 
    deleteNote,
    getNotesByTag 
  } = useNotes();

  // Estados para modals
  const [selectedNote, setSelectedNote] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'create'
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados para filtros e busca
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Buscar notas filtradas
  const getFilteredNotes = () => {
    let filtered = notesOverview || [];

    // Filtro por tag
    if (selectedTag) {
      filtered = getNotesByTag(selectedTag);
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(note => 
        note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.preview?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filtered;
  };

  // Obter todas as tags únicas
  const getAllTags = () => {
    const allTags = notesOverview?.flatMap(note => note.tags || []) || [];
    return [...new Set(allTags)].sort();
  };

  // Handlers para modal
  const handleViewNote = async (note) => {
    setSelectedNote(note);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEditNote = async (note) => {
    setSelectedNote(note);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCreateNote = () => {
    setSelectedNote(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleDeleteNote = async (note) => {
    if (window.confirm('Tem certeza que deseja deletar esta nota?')) {
      try {
        await deleteNote(note.id);
        // Fechar modal se a nota deletada estiver sendo visualizada
        if (selectedNote?.id === note.id) {
          setIsModalOpen(false);
        }
      } catch (error) {
        console.error('Erro ao deletar nota:', error);
        alert('Erro ao deletar a nota. Tente novamente.');
      }
    }
  };

  const handleSaveNote = async (noteData) => {
    try {
      if (modalMode === 'create') {
        await createNote(noteData);
        setIsModalOpen(false);
      } else if (modalMode === 'edit' && selectedNote) {
        await updateNote(selectedNote.id, noteData);
        // Atualizar a nota selecionada com os novos dados
        setSelectedNote(prev => ({ ...prev, ...noteData }));
      }
    } catch (error) {
      console.error('Erro ao salvar nota:', error);
      throw error; // Re-throw para o componente modal lidar
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTag('');
    setShowFilters(false);
  };

  const filteredNotes = getFilteredNotes();
  const allTags = getAllTags();

  if (error) {
    return (
      <div className="flex-1 flex flex-col p-4 space-y-6">
        <div className="bg-gray-800 p-2 rounded-md text-center shadow-md">
          <h2 className="text-white text-xl font-bold">Notas</h2>
        </div>
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 text-center">
          <div className="text-red-400 text-lg mb-2">Erro ao carregar notas</div>
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-950 rounded-md">
      {/* Header */}
      <div className="flex-shrink-0 p-3 sm:p-4 lg:p-6 rounded-md shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-white text-lg sm:text-xl lg:text-2xl font-bold truncate">Minhas Notas</h2>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              {filteredNotes.length} de {notesOverview?.length || 0} notas
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Busca */}
            <div className="relative flex-1 sm:flex-initial">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Buscar notas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-48 lg:w-64 text-sm"
              />
            </div>

            <div className="flex gap-2 sm:gap-3">
              {/* Botão de filtros */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 sm:px-4 py-2 rounded-md transition-colors flex items-center gap-1.5 sm:gap-2 text-sm flex-1 sm:flex-initial justify-center ${
                  showFilters || selectedTag 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <FaFilter size={12} />
                <span className="hidden sm:inline">Filtros</span>
                <span className="sm:hidden">Filtrar</span>
              </button>

              {/* Botão criar nota */}
              <button
                onClick={handleCreateNote}
                className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-1.5 sm:gap-2 text-sm flex-1 sm:flex-initial justify-center"
              >
                <FaPlus size={12} />
                <span className="hidden sm:inline">Nova Nota</span>
                <span className="sm:hidden">Nova</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filtros expandidos */}
        {showFilters && (
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-700">
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-3">
              <span className="text-gray-300 text-xs sm:text-sm font-medium flex-shrink-0">
                Filtrar por tag:
              </span>
              
              {allTags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                      className={`px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm transition-colors ${
                        selectedTag === tag
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                  
                  {(searchTerm || selectedTag) && (
                    <button
                      onClick={clearFilters}
                      className="px-2.5 sm:px-3 py-1 bg-red-600 text-white rounded-full text-xs sm:text-sm hover:bg-red-700 transition-colors flex items-center gap-1"
                    >
                      <FaTimes size={8} />
                      <span className="hidden sm:inline">Limpar filtros</span>
                      <span className="sm:hidden">Limpar</span>
                    </button>
                  )}
                </div>
              ) : (
                <span className="text-gray-400 text-xs sm:text-sm">Nenhuma tag encontrada</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lista de notas */}
      <div className="flex-1 rounded-md shadow-md p-3 sm:p-4 lg:p-6 overflow-y-auto min-h-0">
        <MappingNotes
          notes={filteredNotes}
          onViewNote={handleViewNote}
          onEditNote={handleEditNote}
          onDeleteNote={handleDeleteNote}
          loading={loading}
        />
      </div>

      {/* Modal de visualização/edição */}
      <ViewNotes
        note={selectedNote}
        isOpen={isModalOpen}
        mode={modalMode}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveNote}
        onDelete={handleDeleteNote}
      />
    </div>
  );
};

export default Notes;