import React, { useState, useEffect } from 'react';
import { FaTimes, FaSearch, FaUser, FaSpinner, FaShare, FaCheck } from 'react-icons/fa';
import { searchUsers } from '../../services/notes-service/NotesService';
import useDebounce from '../../hooks/UseDebounce';

const ShareNoteModal = ({ isOpen, onClose, onShare, note }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Debounce da busca para evitar muitas requisições
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Reset do estado quando o modal abre/fecha
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setUsers([]);
      setSelectedUser(null);
      setShowConfirmation(false);
      setError('');
      setSuccessMessage('');
    }
  }, [isOpen]);

  // Busca usuários quando o termo de busca muda
  useEffect(() => {
    const handleSearch = async () => {
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
        setUsers([]);
        return;
      }

      setIsSearching(true);
      setError('');

      try {
        const searchResults = await searchUsers(debouncedSearchTerm);
        setUsers(searchResults || []);
      } catch (err) {
        console.error('Erro ao buscar usuários:', err);
        setError('Erro ao buscar usuários. Tente novamente.');
      } finally {
        setIsSearching(false);
      }
    };

    handleSearch();
  }, [debouncedSearchTerm]);

  const handleUserSelect = (user) => {
    // Verificar se o usuário já é colaborador
    const isAlreadyCollaborator = note?.collaborators?.some(
      collaborator => collaborator.id === user.id || collaborator.email === user.email
    );

    if (isAlreadyCollaborator) {
      setError('Este usuário já é colaborador desta nota.');
      return;
    }

    // Verificar se é o próprio dono da nota (através do email do usuário logado)
    if (note?.user?.email === user.email) {
      setError('Você não pode compartilhar uma nota consigo mesmo.');
      return;
    }

    setSelectedUser(user);
    setShowConfirmation(true);
    setError('');
  };

  const handleConfirmShare = async () => {
    if (!selectedUser) return;

    setIsSharing(true);
    setError('');

    try {
      const shareData = {
        email: selectedUser.email,
        permission: 'edit' // Por padrão, dar permissão de edição
      };

      await onShare(note.id, shareData);
      
      // Mostrar mensagem de sucesso
      setSuccessMessage(`Nota compartilhada com sucesso com ${selectedUser.name}!`);
      
      // Fechar modal após um pequeno delay
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      console.error('Erro ao compartilhar nota:', err);
      setError(err.message || 'Erro ao compartilhar nota. Tente novamente.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleClose = () => {
    setShowConfirmation(false);
    setSelectedUser(null);
    onClose();
  };

  const handleBackToSearch = () => {
    setShowConfirmation(false);
    setSelectedUser(null);
    setError('');
    setSuccessMessage('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col shadow-xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-lg font-medium text-gray-200 flex items-center gap-2">
            <FaShare size={16} />
            Compartilhar Nota
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {!showConfirmation ? (
            <>
              {/* Busca de usuários */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Buscar usuário para compartilhar
                </label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Digite nome, usuário ou email..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {isSearching && (
                    <FaSpinner className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin" size={14} />
                  )}
                </div>
              </div>

              {/* Resultados da busca */}
              {searchTerm.length >= 2 && (
                <div className="space-y-2">
                  {users.length > 0 ? (
                    <>
                      <p className="text-sm text-gray-400">
                        {users.length} usuário(s) encontrado(s)
                      </p>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {users.map(user => (
                          <div
                            key={user.id}
                            onClick={() => handleUserSelect(user)}
                            className="flex items-center gap-3 p-3 bg-gray-800 rounded-md hover:bg-gray-700 cursor-pointer transition-colors"
                          >
                            {user.avatar_url ? (
                              <img
                                src={user.avatar_url}
                                alt={user.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                                <FaUser className="text-gray-300" size={14} />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-200 font-medium truncate">{user.name}</p>
                              <p className="text-gray-400 text-sm truncate">@{user.username}</p>
                              <p className="text-gray-500 text-xs truncate">{user.email}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    !isSearching && (
                      <p className="text-sm text-gray-400 text-center py-4">
                        Nenhum usuário encontrado.
                      </p>
                    )
                  )}
                </div>
              )}

              {/* Instruções */}
              {searchTerm.length < 2 && (
                <div className="text-center py-8">
                  <FaSearch className="mx-auto text-gray-500 mb-3" size={24} />
                  <p className="text-gray-400 text-sm">
                    Digite pelo menos 2 caracteres para buscar usuários
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Confirmação de compartilhamento */
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-200 mb-2">
                  Confirmar Compartilhamento
                </h3>
                <p className="text-gray-400 text-sm">
                  Você tem certeza que deseja compartilhar esta nota?
                </p>
              </div>

              {/* Informações da nota */}
              <div className="bg-gray-800 rounded-md p-3">
                <p className="text-gray-300 font-medium truncate">{note?.title || 'Nota sem título'}</p>
                <p className="text-gray-500 text-sm">
                  Será compartilhada com permissão de edição
                </p>
              </div>

              {/* Usuário selecionado */}
              <div className="bg-gray-800 rounded-md p-3">
                <div className="flex items-center gap-3">
                  {selectedUser?.avatar_url ? (
                    <img
                      src={selectedUser.avatar_url}
                      alt={selectedUser.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                      <FaUser className="text-gray-300" size={16} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-200 font-medium">{selectedUser?.name}</p>
                    <p className="text-gray-400 text-sm">@{selectedUser?.username}</p>
                    <p className="text-gray-500 text-xs">{selectedUser?.email}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mensagem de erro */}
          {error && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-800 rounded-md">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Mensagem de sucesso */}
          {successMessage && (
            <div className="mt-4 p-3 bg-green-900/50 border border-green-800 rounded-md">
              <p className="text-green-200 text-sm">{successMessage}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-800 p-4">
          <div className="flex justify-end gap-3">
            {showConfirmation ? (
              <>
                <button
                  onClick={handleBackToSearch}
                  className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
                  disabled={isSharing}
                >
                  Voltar
                </button>
                <button
                  onClick={handleConfirmShare}
                  disabled={isSharing || successMessage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSharing ? (
                    <>
                      <FaSpinner className="animate-spin" size={14} />
                      Compartilhando...
                    </>
                  ) : successMessage ? (
                    <>
                      <FaCheck size={14} />
                      Compartilhado!
                    </>
                  ) : (
                    <>
                      <FaCheck size={14} />
                      Confirmar
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareNoteModal;