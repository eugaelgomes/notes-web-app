import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ChangePasswordSection } from "../components/modals/change-password-section";

export default function Settings() {
  const { getUserData, updateUser, updateUserPassword, deleteUserPermanently } = useAuth();
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    avatar_url: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getUserData();
        if (response.success) {
          setUserData(response.data);
          setFormData({
            name: response.data.name || "",
            email: response.data.email || "",
            username: response.data.username || "",
            avatar_url: response.data.avatar_url || "",
            profilePicture: null,
          });
        } else {
          setError(response.message);
          console.error("Erro ao buscar dados do usuário:", response.message);
        }
      } catch (err) {
        setError("Ocorreu um erro ao carregar os dados. Verifique sua conexão.");
        console.error("Erro na requisição:", err);
      }
    };
    fetchUserData();
  }, [getUserData]);

  useEffect(() => {
    return () => {
      if (formData.avatar_url && formData.avatar_url.startsWith("blob:")) {
        URL.revokeObjectURL(formData.avatar_url);
      }
    };
  }, [formData.avatar_url]);

  const handleSaveChanges = async () => {
    try {
      setError("");
      let dataToSend;
      if (formData.profilePicture && formData.profilePicture instanceof File) {
        dataToSend = new FormData();
        dataToSend.append("name", formData.name);
        dataToSend.append("email", formData.email);
        dataToSend.append("username", formData.username);
        dataToSend.append("profilePicture", formData.profilePicture);
      } else {
        dataToSend = {
          name: formData.name,
          email: formData.email,
          username: formData.username,
        };
      }

      const result = await updateUser(dataToSend);

      if (result.success) {
        setUserData((prev) => ({
          ...prev,
          name: formData.name,
          email: formData.email,
          username: formData.username,
          avatar_url: formData.avatar_url,
        }));
        setFormData((prev) => ({ ...prev, profilePicture: null }));
        setEditMode(false);
      } else {
        setError(result.message || "Erro ao atualizar os dados. Tente novamente.");
      }
    } catch (err) {
      setError("Erro ao atualizar os dados. Tente novamente.");
      console.error("Erro na atualização:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file" && files && files[0]) {
      const file = files[0];
      if (formData.avatar_url && formData.avatar_url.startsWith("blob:")) {
        URL.revokeObjectURL(formData.avatar_url);
      }
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        avatar_url: previewUrl,
        profilePicture: file,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCancelEdit = () => {
    if (formData.avatar_url && formData.avatar_url.startsWith("blob:")) {
      URL.revokeObjectURL(formData.avatar_url);
    }
    if (userData) {
      setFormData({
        name: userData.name,
        email: userData.email,
        username: userData.username,
        avatar_url: userData.avatar_url,
        profilePicture: null,
      });
    }
    setEditMode(false);
  };

  const handlwePasswordChange = async (currentPassword, newPassword) => {
    try {
      setError("");
      const result = await updateUserPassword(currentPassword, newPassword);
      if (result.success) {
        alert("Senha atualizada com sucesso!");
      } else {
        setError(result.message || "Erro ao atualizar a senha. Tente novamente.");
      }
    } catch (err) {
      setError("Erro ao atualizar a senha. Tente novamente.");
      console.error("Erro na atualização da senha:", err);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm(
      "Tem certeza que deseja deletar sua conta? Esta ação é irreversível."
    );
    if (!confirmation) return;

    try {
      setError("");
      const result = await deleteUserPermanently();
      if (result.success) {
        alert("Sua conta foi deletada com sucesso.");
        window.location.href = "/";
      } else {
        setError(result.message || "Erro ao deletar a conta. Tente novamente.");
      }
    } catch (err) {
      setError("Erro ao deletar a conta. Tente novamente.");
      console.error("Erro na deleção da conta:", err);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 rounded-md overflow-hidden">
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 gap-3 sm:gap-6 border-b border-slate-700 shadow-sm">
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-white">Configurações</h1>
              <p className="text-slate-400 text-sm sm:text-base mt-1">Gerencie suas informações pessoais e preferências</p>
            </div>
            <div className="mt-2 sm:mt-0">
              <div className="text-sm text-slate-400">Última atualização:</div>
              <div className="text-xs text-slate-400">{userData ? new Date(userData.updatedAt).toLocaleString() : "—"}</div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6">
          <section className="mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-lg sm:text-xl font-semibold text-white">Meu Perfil</h2>
              <p className="text-xs sm:text-sm text-slate-400">Informações sobre sua conta no Codaweb</p>
            </div>

            <div className="p-3 sm:p-4 lg:p-6 bg-transparent">
              {error && (
                <div className="mb-4 sm:mb-6 bg-red-900/20 border-l-4 border-red-500 p-3 sm:p-4 rounded">
                  <p className="text-red-400 text-sm sm:text-base">{error}</p>
                </div>
              )}

              {userData ? (
                <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
                  {/* Avatar */}
                  <div className="flex-shrink-0 flex flex-col items-center w-full sm:w-auto">
                    <div className="relative group">
                      <img
                        src={formData.avatar_url || userData.avatar_url}
                        alt="Foto de Perfil"
                        className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full border-4 border-slate-700 object-cover"
                      />

                      {/* overlay apenas em editMode */}
                      {editMode && (
                        <label className="absolute inset-0 rounded-full bg-black/40 flex items-end justify-center p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer">
                          <input
                            type="file"
                            name="profilePicture"
                            className="hidden"
                            accept="image/*"
                            onChange={handleInputChange}
                            aria-label="Alterar foto de perfil"
                          />
                          <div className="bg-slate-600 hover:bg-slate-500 p-2 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </div>
                        </label>
                      )}
                    </div>

                    <div className="text-center mt-3">
                      <h3 className="text-lg sm:text-xl font-bold text-white break-words max-w-48">{userData.name}</h3>
                      <p className="text-xs sm:text-sm text-slate-400">Membro desde: {new Date(userData.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Form section */}
                  <div className="flex-1 space-y-4 sm:space-y-6 min-w-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="bg-slate-700/50 rounded-md p-3 sm:p-4">
                        <label className="text-xs sm:text-sm font-medium text-slate-400 mb-2 block">Nome</label>
                        {editMode ? (
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="bg-slate-600 text-white px-3 py-2 rounded w-full border border-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm sm:text-base"
                            placeholder="Seu nome"
                            aria-label="Nome"
                          />
                        ) : (
                          <p className="text-white font-medium text-base sm:text-lg break-words">{userData.name}</p>
                        )}
                      </div>

                      <div className="bg-slate-700/50 rounded-md p-3 sm:p-4">
                        <label className="text-xs sm:text-sm font-medium text-slate-400 mb-2 block">Email</label>
                        {editMode ? (
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="bg-slate-600 text-white px-3 py-2 rounded w-full border border-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm sm:text-base"
                            placeholder="seu@exemplo.com"
                            aria-label="Email"
                          />
                        ) : (
                          <p className="text-white font-medium text-base sm:text-lg break-all">{userData.email}</p>
                        )}
                      </div>

                      <div className="bg-slate-700/50 rounded-md p-3 sm:p-4 sm:col-span-2 lg:col-span-1">
                        <label className="text-xs sm:text-sm font-medium text-slate-400 mb-2 block">Usuário</label>
                        {editMode ? (
                          <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className="bg-slate-600 text-white px-3 py-2 rounded w-full border border-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm sm:text-base"
                            placeholder="seu_usuario"
                            aria-label="Nome de usuário"
                          />
                        ) : (
                          <p className="text-white font-medium text-base sm:text-lg break-words">{userData.username}</p>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-end gap-3 pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-slate-700">
                      {editMode ? (
                        <>
                          <button
                            onClick={handleSaveChanges}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-semibold transition-colors text-sm sm:text-base"
                            aria-label="Salvar alterações"
                          >
                            Salvar
                          </button>

                          <button
                            onClick={handleCancelEdit}
                            className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-md font-semibold transition-colors text-sm sm:text-base"
                            aria-label="Cancelar edição"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setEditMode(true)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-semibold transition-colors text-sm sm:text-base"
                        >
                          Editar Perfil
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center p-8 sm:p-12">
                  <div className="animate-pulse flex space-x-4 w-full max-w-md">
                    <div className="w-12 h-12 bg-slate-700 rounded-full flex-shrink-0"></div>
                    <div className="space-y-3 flex-1 min-w-0">
                      <div className="h-3 sm:h-4 bg-slate-700 rounded w-3/4"></div>
                      <div className="h-3 sm:h-4 bg-slate-700 rounded"></div>
                      <div className="h-3 sm:h-4 bg-slate-700 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Security section */}
          <section className="mb-6 bg-slate-800 rounded-md shadow-lg border border-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 border-b border-slate-700 p-3 sm:p-4">
              <h2 className="text-lg sm:text-xl font-semibold text-white">Segurança</h2>
              <p className="text-xs sm:text-sm text-slate-400">Gerencie suas credenciais de acesso</p>
            </div>
            <div className="p-3 sm:p-4 lg:p-6">
              <ChangePasswordSection onChangePassword={handlwePasswordChange} />
            </div>
          </section>

          {/* Delete account */}
          <section className="mb-6">
            <div className="border-b border-slate-700 p-3 sm:p-4">
              <h2 className="text-lg sm:text-xl font-semibold text-white">Deletar meus dados</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">Remover meus dados pessoais e encerrar minha conta</p>
            </div>

            <div className="p-3 sm:p-4 lg:p-6 bg-transparent">
              <div className="text-sm sm:text-base text-slate-400 space-y-3">
                <p>Ao deletar sua conta, todos os seus dados pessoais serão removidos permanentemente dos nossos sistemas. Esta ação é irreversível.</p>
                <p>Certifique-se de fazer backup de qualquer informação ou conteúdo que deseja manter antes de prosseguir.</p>
                <p>Se você estiver certo de que deseja deletar sua conta, clique no botão abaixo.</p>

                <div className="mt-2">
                  <button
                    onClick={handleDeleteAccount}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-semibold transition-colors text-sm sm:text-base"
                  >
                    Deletar Minha Conta
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
