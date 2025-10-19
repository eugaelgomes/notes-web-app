"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/app/contexts/AuthContext";
import { User } from "@/app/services/auth-service/AuthService";

interface FormData {
  name: string;
  email: string;
  username: string;
  avatar_url: string;
  profilePicture: File | null;
}

const SettingsPage = () => {
  const { user, updateUser, deleteUserPermanently, updateUserPassword } =
    useAuth();
  const [userData, setUserData] = useState<User | null>(null);
  const [error, setError] = useState("");

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    username: "",
    avatar_url: "",
    profilePicture: null,
  });

  // Password change state
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    if (user) {
      setUserData(user);
      setFormData({
        name: user.name || "",
        email: user.email || "",
        username: user.username || "",
        avatar_url: user.avatar_url || "",
        profilePicture: null,
      });
    }
  }, [user]);

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

      // Prepare data for update
      const dataToUpdate: Partial<User> & { profilePicture?: File } = {
        name: formData.name,
        email: formData.email,
        username: formData.username,
      };

      // If there's a profile picture file, add it to the data
      if (formData.profilePicture && formData.profilePicture instanceof File) {
        dataToUpdate.profilePicture = formData.profilePicture;
      }

      const result = await updateUser(dataToUpdate);

      if (result.success) {
        setUserData((prev) =>
          prev
            ? {
                ...prev,
                name: formData.name,
                email: formData.email,
                username: formData.username,
                avatar_url: formData.avatar_url,
              }
            : null
        );
        setFormData((prev) => ({ ...prev, profilePicture: null }));
        setEditMode(false);
      } else {
        setError(
          result.message || "Erro ao atualizar os dados. Tente novamente."
        );
      }
    } catch (err) {
      setError("Erro ao atualizar os dados. Tente novamente.");
      console.error("Erro na atualização:", err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        name: userData.name || "",
        email: userData.email || "",
        username: userData.username || "",
        avatar_url: userData.avatar_url || "",
        profilePicture: null,
      });
    }
    setEditMode(false);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    // Clear errors when user starts typing
    if (passwordError) setPasswordError("");
    if (passwordSuccess) setPasswordSuccess("");
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    // Validate password fields
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setPasswordError("Todos os campos de senha são obrigatórios.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("A nova senha e a confirmação não coincidem.");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError("A nova senha deve ser diferente da senha atual.");
      return;
    }

    try {
      const result = await updateUserPassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      if (result.success) {
        setPasswordSuccess("Senha alterada com sucesso!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordSection(false);
      } else {
        setPasswordError(
          result.message || "Erro ao alterar senha. Tente novamente."
        );
      }
    } catch (err) {
      setPasswordError("Erro ao alterar senha. Tente novamente.");
      console.error("Erro na alteração da senha:", err);
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
    <div className="h-full flex flex-col bg-neutral-950 border border-neutral-800 rounded-md shadow-md overflow-hidden">
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Header */}
        <div className="bg-neutral-800 px-6 py-4 mb-4">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-white">
                Configurações
              </h1>
              <p className="text-sm text-gray-400">
                Gerencie suas informações e preferências
              </p>
            </div>
            <div className="rounded-md bg-neutral-950 px-3 py-1.5 text-sm text-gray-400">
              <span className="text-gray-500">Última atualização: </span>
              {userData?.updatedAt
                ? new Date(userData.updatedAt as string).toLocaleString()
                : "—"}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-5xl mx-auto px-2 sm:px-4 lg:px-6 space-y-6">
          {/* Profile Section */}
          <div className="bg-neutral-900 rounded-xl shadow-lg border border-neutral-800 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-neutral-800">
              <h2 className="text-xl font-semibold text-neutral-100">
                Meu Perfil
              </h2>
              <p className="text-sm text-neutral-400 mt-1">
                Informações sobre sua conta
              </p>
            </div>

            <div className="p-4 sm:p-6">
              {error && (
                <div className="mb-6 bg-red-950 border border-red-800 p-4 rounded-lg">
                  <p className="text-red-300">{error}</p>
                </div>
              )}

              {userData ? (
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                  {/* Avatar Section */}
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <div className="relative group">
                      <Image
                        src={
                          formData.avatar_url ||
                          userData.avatar_url ||
                          "/default-avatar.png"
                        }
                        alt="Foto de Perfil"
                        width={160}
                        height={160}
                        className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full border-4 border-neutral-700 object-cover shadow-lg"
                      />

                      {editMode && (
                        <label className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer">
                          <input
                            type="file"
                            name="profilePicture"
                            className="hidden"
                            accept="image/*"
                            onChange={handleInputChange}
                            aria-label="Alterar foto de perfil"
                          />
                          <div className="bg-neutral-800 hover:bg-neutral-700 text-neutral-100 p-3 rounded-full shadow-lg transition-colors">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </div>
                        </label>
                      )}
                    </div>

                    <div className="text-center mt-4">
                      <h3 className="text-lg sm:text-xl font-bold text-neutral-100">
                        {userData.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                        Membro desde{" "}
                        {userData && userData.createdAt
                          ? new Date(
                              userData.createdAt as string
                            ).toLocaleDateString()
                          : "—"}
                      </p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="flex-1 space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-300">
                          Nome
                        </label>
                        {editMode ? (
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 placeholder-neutral-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                            placeholder="Seu nome"
                          />
                        ) : (
                          <div className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-neutral-800 border border-neutral-700 rounded-lg">
                            <p className="text-neutral-100 font-medium">
                              {userData.name}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-300">
                          Email
                        </label>
                        {editMode ? (
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 placeholder-neutral-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                            placeholder="seu@exemplo.com"
                          />
                        ) : (
                          <div className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-neutral-800 border border-neutral-700 rounded-lg">
                            <p className="text-neutral-100 font-medium break-all text-sm sm:text-base">
                              {userData.email}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-neutral-300">
                          Nome de usuário
                        </label>
                        {editMode ? (
                          <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 placeholder-neutral-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                            placeholder="seu_usuario"
                          />
                        ) : (
                          <div className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-neutral-800 border border-neutral-700 rounded-lg">
                            <p className="text-neutral-100 font-medium">
                              {userData.username}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 sm:pt-6 border-t border-neutral-700">
                      {editMode ? (
                        <>
                          <button
                            onClick={handleCancelEdit}
                            className="px-4 sm:px-6 py-2 border border-neutral-600 text-neutral-300 rounded-lg hover:bg-neutral-800 hover:text-neutral-100 font-medium transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={handleSaveChanges}
                            className="px-4 sm:px-6 py-2 bg-yellow-500 text-neutral-950 rounded-lg hover:bg-yellow-600 font-medium transition-colors shadow-lg"
                          >
                            Salvar Alterações
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setEditMode(true)}
                          className="px-4 sm:px-6 py-2 bg-yellow-500 text-neutral-950 rounded-lg hover:bg-yellow-600 font-medium transition-colors shadow-lg"
                        >
                          Editar Perfil
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-pulse">
                  <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    {/* Avatar Skeleton */}
                    <div className="flex-shrink-0 flex flex-col items-center">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-neutral-700 rounded-full"></div>
                      <div className="text-center mt-4 space-y-2">
                        <div className="h-5 sm:h-6 bg-neutral-700 rounded w-24 sm:w-32"></div>
                        <div className="h-3 sm:h-4 bg-neutral-700 rounded w-16 sm:w-24"></div>
                      </div>
                    </div>

                    {/* Form Fields Skeleton */}
                    <div className="flex-1 space-y-4 sm:space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {/* Nome Field */}
                        <div className="space-y-2">
                          <div className="h-4 bg-neutral-700 rounded w-12"></div>
                          <div className="w-full h-10 sm:h-12 bg-neutral-700 rounded-lg"></div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                          <div className="h-4 bg-neutral-700 rounded w-10"></div>
                          <div className="w-full h-10 sm:h-12 bg-neutral-700 rounded-lg"></div>
                        </div>

                        {/* Username Field */}
                        <div className="space-y-2 md:col-span-2">
                          <div className="h-4 bg-neutral-700 rounded w-24"></div>
                          <div className="w-full h-10 sm:h-12 bg-neutral-700 rounded-lg"></div>
                        </div>
                      </div>

                      {/* Action Button Skeleton */}
                      <div className="flex justify-end pt-4 sm:pt-6 border-t border-neutral-700">
                        <div className="h-8 sm:h-10 bg-neutral-700 rounded-lg w-24 sm:w-32"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Password Change Section */}
          <div className="bg-neutral-900 rounded-xl shadow-lg border border-neutral-800 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-neutral-800">
              <h2 className="text-xl font-semibold text-neutral-100">
                Alterar Senha
              </h2>
              <p className="text-sm text-neutral-400 mt-1">
                Mantenha sua conta segura com uma senha forte
              </p>
            </div>

            <div className="p-4 sm:p-6">
              {passwordError && (
                <div className="mb-6 bg-red-950 border border-red-800 p-4 rounded-lg">
                  <p className="text-red-300">{passwordError}</p>
                </div>
              )}

              {passwordSuccess && (
                <div className="mb-6 bg-green-950 border border-green-800 p-4 rounded-lg">
                  <p className="text-green-300">{passwordSuccess}</p>
                </div>
              )}

              {!showPasswordSection ? (
                <div className="text-center py-6 sm:py-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-neutral-800 rounded-full mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 sm:h-8 sm:w-8 text-neutral-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-neutral-100 mb-2">
                    Alterar sua senha
                  </h3>
                  <p className="text-neutral-400 mb-6 text-sm sm:text-base">
                    Você pode alterar sua senha a qualquer momento para manter
                    sua conta segura.
                  </p>
                  <button
                    onClick={() => setShowPasswordSection(true)}
                    className="px-4 sm:px-6 py-2 bg-yellow-500 text-neutral-950 rounded-lg hover:bg-yellow-600 font-medium transition-colors shadow-lg"
                  >
                    Alterar Senha
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePasswordSubmit} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-300">
                        Senha Atual
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 placeholder-neutral-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                        placeholder="Digite sua senha atual"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-300">
                        Nova Senha
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 placeholder-neutral-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                        placeholder="Digite sua nova senha"
                        required
                        minLength={6}
                      />
                      <p className="text-xs text-neutral-500">
                        A senha deve ter pelo menos 6 caracteres
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-300">
                        Confirmar Nova Senha
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 placeholder-neutral-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                        placeholder="Confirme sua nova senha"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 sm:pt-6 border-t border-neutral-700">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordSection(false);
                        setPasswordData({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        });
                        setPasswordError("");
                        setPasswordSuccess("");
                      }}
                      className="px-4 sm:px-6 py-2 border border-neutral-600 text-neutral-300 rounded-lg hover:bg-neutral-800 hover:text-neutral-100 font-medium transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 sm:px-6 py-2 bg-yellow-500 text-neutral-950 rounded-lg hover:bg-yellow-600 font-medium transition-colors shadow-lg"
                    >
                      Alterar Senha
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-neutral-900 rounded-xl shadow-lg border border-red-800 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-red-800 bg-red-950/50">
              <h2 className="text-xl font-semibold text-red-300">
                Zona de Perigo
              </h2>
              <p className="text-sm text-red-400 mt-1">
                Ações irreversíveis para sua conta
              </p>
            </div>

            <div className="p-4 sm:p-6">
              <div className="space-y-4 text-neutral-400">
                <div className="bg-red-950/30 border border-red-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-red-300 mb-2">
                    Deletar minha conta
                  </h3>
                  <p className="text-sm text-red-400 mb-4">
                    Ao deletar sua conta, todos os seus dados pessoais serão
                    removidos permanentemente dos nossos sistemas. Esta ação é{" "}
                    <strong className="text-red-300">irreversível</strong>.
                  </p>
                  <ul className="text-sm text-red-400 space-y-1 mb-4 list-disc list-inside">
                    <li>Todos os seus dados pessoais serão excluídos</li>
                    <li>Suas notas e conteúdos serão removidos</li>
                    <li>Não será possível recuperar sua conta</li>
                  </ul>
                  <p className="text-sm text-red-400 mb-4">
                    Certifique-se de fazer backup de qualquer informação que
                    deseja manter antes de prosseguir.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition-colors shadow-lg"
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
};

export default SettingsPage;
