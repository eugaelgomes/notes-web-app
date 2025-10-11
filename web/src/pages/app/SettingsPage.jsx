import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { ChangePasswordSection } from "../../components/modals/ChangePasswordSection";

const SettingsPage = () => {
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
    <div className="h-full flex flex-col bg-gray-50 border border-gray-150 rounded-md shadow-md overflow-hidden">
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Configurações</h1>
                <p className="text-gray-600 mt-1">Gerencie suas informações pessoais e preferências</p>
              </div>
              <div className="bg-gray-50 rounded-lg px-4 py-2 text-sm">
                <div className="text-gray-500">Última atualização:</div>
                <div className="text-gray-700 font-medium">
                  {userData ? new Date(userData.updatedAt).toLocaleString() : "—"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Meu Perfil</h2>
              <p className="text-sm text-gray-600 mt-1">Informações sobre sua conta</p>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded">
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              {userData ? (
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Avatar Section */}
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <div className="relative group">
                      <img
                        src={formData.avatar_url || userData.avatar_url}
                        alt="Foto de Perfil"
                        className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-gray-200 object-cover shadow-lg"
                      />

                      {editMode && (
                        <label className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer">
                          <input
                            type="file"
                            name="profilePicture"
                            className="hidden"
                            accept="image/*"
                            onChange={handleInputChange}
                            aria-label="Alterar foto de perfil"
                          />
                          <div className="bg-white text-gray-700 p-3 rounded-full shadow-lg hover:bg-gray-50 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </div>
                        </label>
                      )}
                    </div>

                    <div className="text-center mt-4">
                      <h3 className="text-xl font-bold text-gray-900">{userData.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Membro desde {new Date(userData.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="flex-1 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Nome</label>
                        {editMode ? (
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Seu nome"
                          />
                        ) : (
                          <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <p className="text-gray-900 font-medium">{userData.name}</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        {editMode ? (
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="seu@exemplo.com"
                          />
                        ) : (
                          <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <p className="text-gray-900 font-medium break-all">{userData.email}</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-gray-700">Nome de usuário</label>
                        {editMode ? (
                          <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="seu_usuario"
                          />
                        ) : (
                          <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <p className="text-gray-900 font-medium">{userData.username}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                      {editMode ? (
                        <>
                          <button
                            onClick={handleCancelEdit}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={handleSaveChanges}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                          >
                            Salvar Alterações
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setEditMode(true)}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                        >
                          Editar Perfil
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-pulse">
                  <div className="flex flex-col lg:flex-row gap-8">
                    {/* Avatar Skeleton */}
                    <div className="flex-shrink-0 flex flex-col items-center">
                      <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gray-200 rounded-full"></div>
                      <div className="text-center mt-4 space-y-2">
                        <div className="h-6 bg-gray-200 rounded w-32"></div>
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>

                    {/* Form Fields Skeleton */}
                    <div className="flex-1 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Nome Field */}
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-12"></div>
                          <div className="w-full h-12 bg-gray-200 rounded-lg"></div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-10"></div>
                          <div className="w-full h-12 bg-gray-200 rounded-lg"></div>
                        </div>

                        {/* Username Field */}
                        <div className="space-y-2 md:col-span-2">
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                          <div className="w-full h-12 bg-gray-200 rounded-lg"></div>
                        </div>
                      </div>

                      {/* Action Button Skeleton */}
                      <div className="flex justify-end pt-6 border-t border-gray-200">
                        <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Segurança</h2>
              <p className="text-sm text-gray-600 mt-1">Gerencie suas credenciais de acesso</p>
            </div>
            <div className="p-6">
              {userData ? (
                <ChangePasswordSection onChangePassword={handlwePasswordChange} />
              ) : (
                <div className="animate-pulse space-y-6">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-12 bg-gray-200 rounded-lg"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-28"></div>
                    <div className="h-12 bg-gray-200 rounded-lg"></div>
                  </div>
                  <div className="flex justify-end">
                    <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-xl shadow-sm border border-red-200 mb-8">
            <div className="px-6 py-4 border-b border-red-200 bg-red-50">
              <h2 className="text-xl font-semibold text-red-900">Zona de Perigo</h2>
              <p className="text-sm text-red-700 mt-1">Ações irreversíveis para sua conta</p>
            </div>

            <div className="p-6">
              <div className="space-y-4 text-gray-600">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-red-900 mb-2">Deletar minha conta</h3>
                  <p className="text-sm text-red-700 mb-4">
                    Ao deletar sua conta, todos os seus dados pessoais serão removidos permanentemente dos nossos sistemas. 
                    Esta ação é <strong>irreversível</strong>.
                  </p>
                  <ul className="text-sm text-red-700 space-y-1 mb-4 list-disc list-inside">
                    <li>Todos os seus dados pessoais serão excluídos</li>
                    <li>Suas notas e conteúdos serão removidos</li>
                    <li>Não será possível recuperar sua conta</li>
                  </ul>
                  <p className="text-sm text-red-700 mb-4">
                    Certifique-se de fazer backup de qualquer informação que deseja manter antes de prosseguir.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm"
                  >
                    Deletar Minha Conta Permanentemente
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;