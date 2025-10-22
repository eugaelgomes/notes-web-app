"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/app/contexts/AuthContext";
import { User } from "@/app/services/auth-service/AuthService";
import {
  createBackup as createBackupService,
  downloadBackupFile,
} from "@/app/services/backup-service/BackupService";

interface FormData {
  name: string;
  email: string;
  username: string;
  avatar_url: string;
  profilePicture: File | null;
}

const SettingsPage = () => {
  const { user, updateUser, deleteUserPermanently, updateUserPassword } = useAuth();
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
        setError(result.message || "Erro ao atualizar os dados. Tente novamente.");
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
        setPasswordError(result.message || "Erro ao alterar senha. Tente novamente.");
      }
    } catch (err) {
      setPasswordError("Erro ao alterar senha. Tente novamente.");
      console.error("Erro na alteração da senha:", err);
    }
  };

  // Função para criar backup
  const handleCreateBackup = async () => {
    try {
      const backupData = await createBackupService();
      downloadBackupFile(backupData);
      alert("Backup criado e baixado com sucesso!");
    } catch (err) {
      setError("Erro ao criar backup. Tente novamente.");
      console.error("Erro na criação do backup:", err);
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
    <div className="flex h-full flex-col overflow-hidden rounded-md border border-neutral-800 bg-neutral-950 shadow-md">
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
        {/* Header */}
        <div className="mb-4 bg-neutral-800 px-6 py-4">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white">Configurações</h1>
              <p className="text-sm text-gray-400">Gerencie suas informações e preferências</p>
            </div>
            <div className="rounded-md bg-neutral-950 px-3 py-1.5 text-sm text-gray-400">
              <span className="text-gray-500">Última atualização: </span>
              {userData?.updatedAt ? new Date(userData.updatedAt as string).toLocaleString() : "—"}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="mx-auto max-w-5xl space-y-6 px-2 sm:px-4 lg:px-6">
          {/* Profile Section */}
          <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 shadow-lg">
            <div className="border-b border-neutral-800 px-4 py-4 sm:px-6">
              <h2 className="text-xl font-semibold text-neutral-100">Meu Perfil</h2>
              <p className="mt-1 text-sm text-neutral-400">Informações sobre sua conta</p>
            </div>

            <div className="p-4 sm:p-6">
              {error && (
                <div className="mb-6 rounded-lg border border-red-800 bg-red-950 p-4">
                  <p className="text-red-300">{error}</p>
                </div>
              )}

              {userData ? (
                <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
                  {/* Avatar Section */}
                  <div className="flex flex-shrink-0 flex-col items-center">
                    <div className="group relative">
                      <Image
                        src={formData.avatar_url || userData.avatar_url || "/default-avatar.png"}
                        alt="Foto de Perfil"
                        width={160}
                        height={160}
                        className="h-24 w-24 rounded-full border-4 border-neutral-700 object-cover shadow-lg sm:h-32 sm:w-32 lg:h-40 lg:w-40"
                      />

                      {editMode && (
                        <label className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/60 opacity-0 transition-all duration-200 group-hover:opacity-100">
                          <input
                            type="file"
                            name="profilePicture"
                            className="hidden"
                            accept="image/*"
                            onChange={handleInputChange}
                            aria-label="Alterar foto de perfil"
                          />
                          <div className="rounded-full bg-neutral-800 p-3 text-neutral-100 shadow-lg transition-colors hover:bg-neutral-700">
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

                    <div className="mt-4 text-center">
                      <h3 className="text-lg font-bold text-neutral-100 sm:text-xl">
                        {userData.name}
                      </h3>
                      <p className="mt-1 text-xs text-neutral-400 sm:text-sm">
                        Membro desde{" "}
                        {userData && userData.createdAt
                          ? new Date(userData.createdAt as string).toLocaleDateString()
                          : "—"}
                      </p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="flex-1 space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-300">Nome</label>
                        {editMode ? (
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-neutral-100 placeholder-neutral-400 transition-colors focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500 sm:px-4 sm:py-3"
                            placeholder="Seu nome"
                          />
                        ) : (
                          <div className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 sm:px-4 sm:py-3">
                            <p className="font-medium text-neutral-100">{userData.name}</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-300">Email</label>
                        {editMode ? (
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-neutral-100 placeholder-neutral-400 transition-colors focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500 sm:px-4 sm:py-3"
                            placeholder="seu@exemplo.com"
                          />
                        ) : (
                          <div className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 sm:px-4 sm:py-3">
                            <p className="text-sm font-medium break-all text-neutral-100 sm:text-base">
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
                            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-neutral-100 placeholder-neutral-400 transition-colors focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500 sm:px-4 sm:py-3"
                            placeholder="seu_usuario"
                          />
                        ) : (
                          <div className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 sm:px-4 sm:py-3">
                            <p className="font-medium text-neutral-100">{userData.username}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col justify-end gap-3 border-t border-neutral-700 pt-4 sm:flex-row sm:pt-6">
                      {editMode ? (
                        <>
                          <button
                            onClick={handleCancelEdit}
                            className="rounded-lg border border-neutral-600 px-4 py-2 font-medium text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-neutral-100 sm:px-6"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={handleSaveChanges}
                            className="rounded-lg bg-yellow-500 px-4 py-2 font-medium text-neutral-950 shadow-lg transition-colors hover:bg-yellow-600 sm:px-6"
                          >
                            Salvar Alterações
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setEditMode(true)}
                          className="rounded-lg bg-yellow-500 px-4 py-2 font-medium text-neutral-950 shadow-lg transition-colors hover:bg-yellow-600 sm:px-6"
                        >
                          Editar Perfil
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-pulse">
                  <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
                    {/* Avatar Skeleton */}
                    <div className="flex flex-shrink-0 flex-col items-center">
                      <div className="h-24 w-24 rounded-full bg-neutral-700 sm:h-32 sm:w-32 lg:h-40 lg:w-40"></div>
                      <div className="mt-4 space-y-2 text-center">
                        <div className="h-5 w-24 rounded bg-neutral-700 sm:h-6 sm:w-32"></div>
                        <div className="h-3 w-16 rounded bg-neutral-700 sm:h-4 sm:w-24"></div>
                      </div>
                    </div>

                    {/* Form Fields Skeleton */}
                    <div className="flex-1 space-y-4 sm:space-y-6">
                      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                        {/* Nome Field */}
                        <div className="space-y-2">
                          <div className="h-4 w-12 rounded bg-neutral-700"></div>
                          <div className="h-10 w-full rounded-lg bg-neutral-700 sm:h-12"></div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                          <div className="h-4 w-10 rounded bg-neutral-700"></div>
                          <div className="h-10 w-full rounded-lg bg-neutral-700 sm:h-12"></div>
                        </div>

                        {/* Username Field */}
                        <div className="space-y-2 md:col-span-2">
                          <div className="h-4 w-24 rounded bg-neutral-700"></div>
                          <div className="h-10 w-full rounded-lg bg-neutral-700 sm:h-12"></div>
                        </div>
                      </div>

                      {/* Action Button Skeleton */}
                      <div className="flex justify-end border-t border-neutral-700 pt-4 sm:pt-6">
                        <div className="h-8 w-24 rounded-lg bg-neutral-700 sm:h-10 sm:w-32"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Password Change Section */}
          <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 shadow-lg">
            <div className="border-b border-neutral-800 px-4 py-4 sm:px-6">
              <h2 className="text-xl font-semibold text-neutral-100">Alterar Senha</h2>
              <p className="mt-1 text-sm text-neutral-400">
                Mantenha sua conta segura com uma senha forte
              </p>
            </div>

            <div className="p-4 sm:p-6">
              {passwordError && (
                <div className="mb-6 rounded-lg border border-red-800 bg-red-950 p-4">
                  <p className="text-red-300">{passwordError}</p>
                </div>
              )}

              {passwordSuccess && (
                <div className="mb-6 rounded-lg border border-green-800 bg-green-950 p-4">
                  <p className="text-green-300">{passwordSuccess}</p>
                </div>
              )}

              {!showPasswordSection ? (
                <div className="py-6 text-center sm:py-8">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-neutral-800 sm:h-16 sm:w-16">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-neutral-400 sm:h-8 sm:w-8"
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
                  <h3 className="mb-2 text-lg font-medium text-neutral-100">Alterar sua senha</h3>
                  <p className="mb-6 text-sm text-neutral-400 sm:text-base">
                    Você pode alterar sua senha a qualquer momento para manter sua conta segura.
                  </p>
                  <button
                    onClick={() => setShowPasswordSection(true)}
                    className="rounded-lg bg-yellow-500 px-4 py-2 font-medium text-neutral-950 shadow-lg transition-colors hover:bg-yellow-600 sm:px-6"
                  >
                    Alterar Senha
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePasswordSubmit} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-300">Senha Atual</label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-neutral-100 placeholder-neutral-400 transition-colors focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500 sm:px-4 sm:py-3"
                        placeholder="Digite sua senha atual"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-neutral-300">Nova Senha</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-neutral-100 placeholder-neutral-400 transition-colors focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500 sm:px-4 sm:py-3"
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
                        className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-neutral-100 placeholder-neutral-400 transition-colors focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500 sm:px-4 sm:py-3"
                        placeholder="Confirme sua nova senha"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col justify-end gap-3 border-t border-neutral-700 pt-4 sm:flex-row sm:pt-6">
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
                      className="rounded-lg border border-neutral-600 px-4 py-2 font-medium text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-neutral-100 sm:px-6"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-yellow-500 px-4 py-2 font-medium text-neutral-950 shadow-lg transition-colors hover:bg-yellow-600 sm:px-6"
                    >
                      Alterar Senha
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="overflow-hidden rounded-xl border border-red-800 bg-neutral-900 shadow-lg">
            <div className="border-b border-red-800 bg-red-950/50 px-4 py-4 sm:px-6">
              <h2 className="text-xl font-semibold text-red-300">Zona de Perigo</h2>
              <p className="mt-1 text-sm text-red-400">Ações irreversíveis para sua conta</p>
            </div>

            <div className="p-4 sm:p-6">
              <div className="space-y-4 text-neutral-400">
                <div className="rounded-lg border border-red-800 bg-red-950/30 p-4">
                  <h3 className="mb-2 text-lg font-semibold text-red-300">Deletar minha conta</h3>
                  <p className="mb-4 text-sm text-red-400">
                    Ao deletar sua conta, todos os seus dados pessoais serão removidos
                    permanentemente dos nossos sistemas. Esta ação é{" "}
                    <strong className="text-red-300">irreversível</strong>.
                  </p>
                  <ul className="mb-4 list-inside list-disc space-y-1 text-sm text-red-400">
                    <li>Todos os seus dados pessoais serão excluídos</li>
                    <li>Suas notas e conteúdos serão removidos</li>
                    <li>Não será possível recuperar sua conta</li>
                  </ul>
                  <p className="mb-4 text-sm text-red-400">
                    Certifique-se de fazer backup de qualquer informação que deseja manter antes de
                    prosseguir.
                  </p>
                  <button
                    onClick={handleCreateBackup}
                    className="mr-2 rounded-lg bg-yellow-500 px-4 py-2.5 font-semibold text-neutral-950 shadow-lg transition-colors hover:bg-yellow-600 sm:px-6 sm:py-3"
                  >
                    Criar Backup
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="rounded-lg bg-red-600 px-4 py-2.5 font-semibold text-white shadow-lg transition-colors hover:bg-red-700 sm:px-6 sm:py-3"
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
