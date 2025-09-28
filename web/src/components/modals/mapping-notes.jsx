import React from 'react';
import { FaEdit, FaTrash, FaEye, FaTag, FaClock, FaFileAlt, FaChevronRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const MappingNotes = ({ 
  notes, 
  onViewNote, 
  onEditNote, 
  onDeleteNote, 
  loading 
}) => {
  const navigate = useNavigate();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-400">Carregando suas notas...</div>
      </div>
    );
  }

  if (!notes || notes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-4">
          📝 Você ainda não tem notas
        </div>
        <p className="text-gray-500 text-sm">
          Que tal criar sua primeira nota?
        </p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Data inválida';
    }
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    return text.length > maxLength 
      ? text.substring(0, maxLength) + '...' 
      : text;
  };

  const handleNoteClick = (note) => {
    navigate(`/notes/edit/${note.id}`);
  };

  const handleActionClick = (e, action, note) => {
    e.stopPropagation(); // Impede que o clique na ação abra a nota
    action(note);
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      {notes.map((note) => (
        <div 
          key={note.id} 
          onClick={() => handleNoteClick(note)}
          className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 rounded-lg p-3 sm:p-4 transition-all duration-200 cursor-pointer group shadow-sm hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            {/* Ícone e conteúdo principal */}
            <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
              {/* Ícone da nota */}
              <div className="flex-shrink-0 mt-1">
                <FaFileAlt className="text-blue-400 text-base sm:text-lg" />
              </div>
              
              {/* Conteúdo principal */}
              <div className="flex-1 min-w-0">
                {/* Título e preview */}
                <div className="mb-2">
                  <h3 className="text-white font-semibold text-base sm:text-lg truncate mb-1 group-hover:text-blue-300 transition-colors">
                    {note.title || 'Nota sem título'}
                  </h3>
                  
                  {/* Preview do conteúdo */}
                  {(note.description || note.preview) && (
                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 sm:line-clamp-none">
                      {truncateText(note.description || note.preview, window.innerWidth < 640 ? 80 : 150)}
                    </p>
                  )}
                </div>

                {/* Tags e metadados */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs">
                  {/* Tags */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 min-w-0">
                      <FaTag className="text-gray-500 flex-shrink-0" />
                      <div className="flex flex-wrap gap-1 min-w-0">
                        {note.tags.slice(0, window.innerWidth < 640 ? 2 : 4).map((tag, index) => (
                          <span 
                            key={index}
                            className="bg-blue-600/20 border border-blue-600/30 text-blue-300 px-2 py-0.5 rounded-full text-xs whitespace-nowrap"
                          >
                            {tag}
                          </span>
                        ))}
                        {note.tags.length > (window.innerWidth < 640 ? 2 : 4) && (
                          <span className="text-gray-500 px-1 py-0.5 text-xs">
                            +{note.tags.length - (window.innerWidth < 640 ? 2 : 4)}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Data de modificação */}
                  <div className="flex items-center gap-1 text-gray-500 sm:ml-auto flex-shrink-0">
                    <FaClock size={10} />
                    <span className="whitespace-nowrap">
                      <span className="hidden sm:inline">Atualizada </span>
                      {formatDate(note.updated_at || note.lastModified)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ações e indicador */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {/* Botões de ação */}
              <div className="flex items-center gap-0.5 sm:gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => handleActionClick(e, onViewNote, note)}
                  className="p-1.5 sm:p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 rounded transition-colors"
                  title="Abrir nota"
                >
                  <FaEye size={12} className="sm:w-3.5 sm:h-3.5" />
                </button>
                <button
                  onClick={(e) => handleActionClick(e, onEditNote, note)}
                  className="p-1.5 sm:p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/30 rounded transition-colors"
                  title="Editar nota"
                >
                  <FaEdit size={12} className="sm:w-3.5 sm:h-3.5" />
                </button>
                <button
                  onClick={(e) => handleActionClick(e, onDeleteNote, note)}
                  className="p-1.5 sm:p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition-colors"
                  title="Deletar nota"
                >
                  <FaTrash size={12} className="sm:w-3.5 sm:h-3.5" />
                </button>
              </div>

              {/* Indicador de clique */}
              <FaChevronRight className="text-gray-500 group-hover:text-gray-400 transition-colors" size={10} />

              {/* Status indicator */}
              {note.status && (
                <div className="ml-1 sm:ml-2">
                  <span className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border ${
                    note.status === 'published' 
                      ? 'bg-green-600/20 border-green-600/30 text-green-300' 
                      : 'bg-gray-600/20 border-gray-600/30 text-gray-400'
                  }`}>
                    <span className="hidden sm:inline">
                      {note.status === 'published' ? 'Publicada' : 'Rascunho'}
                    </span>
                    <span className="sm:hidden">
                      {note.status === 'published' ? 'Pub' : 'Ras'}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MappingNotes;
