"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaEye, FaEyeSlash, FaCamera } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";

// Interfaces para tipagem
interface FormData {
  name: string;
  username: string;
  email: string;
  password: string;
}

interface Message {
  type: "error" | "success" | "";
  text: string;
}

export default function SignUp() {
  const { createUser } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<Message>({ type: "", text: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateImage = (file: File): string | null => {
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) return "Formato inválido. Use JPEG, PNG, GIF ou WebP.";
    if (file.size > 5 * 1024 * 1024) return "Imagem deve ter até 2MB.";
    return null;
  };

  const handleImage = (file: File) => {
    const error = validateImage(file);
    if (error) return setMsg({ type: "error", text: error });

    setProfileImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setImagePreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleImage(e.target.files[0]);
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleImage(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    if (!formData.name.trim())
      return setMsg({ type: "error", text: "Por favor, digite seu nome completo." });
    if (!formData.username.trim())
      return setMsg({ type: "error", text: "Por favor, escolha um nome de usuário." });
    if (!formData.email.trim())
      return setMsg({ type: "error", text: "Por favor, digite um email válido." });
    if (!formData.password)
      return setMsg({ type: "error", text: "Por favor, crie uma senha segura." });

    try {
      setSubmitting(true);

      // Prepara FormData para enviar imagem junto com os dados do usuário
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("username", formData.username);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);
      
      // Adiciona a imagem se existir
      if (profileImage) {
        formDataToSend.append("profileImage", profileImage);
      }

      const res = await createUser(formDataToSend);

      if (res.success) {
        setMsg({ type: "success", text: "Conta criada com sucesso! Redirecionando..." });
        setTimeout(() => router.push("/"), 1200);
      } else {
        // Mensagens mais amigáveis baseadas no erro do backend
        let errorMessage = res.message || "Falha ao criar conta.";

        if (errorMessage.includes("already exists") || errorMessage.includes("já existe")) {
          errorMessage = "Este email ou usuário já está em uso. Tente outro.";
        } else if (errorMessage.includes("validation")) {
          errorMessage = "Por favor, verifique os dados inseridos.";
        } else if (errorMessage.includes("Internal Server Error")) {
          errorMessage = "Erro temporário no servidor. Tente novamente em alguns momentos.";
        }

        setMsg({ type: "error", text: errorMessage });
      }
    } catch {
      setMsg({
        type: "error",
        text: "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
      });
    } finally {
      setSubmitting(false);
      setTimeout(() => setMsg({ type: "", text: "" }), 5000);
    }
  };

  return (
    <div className="relative flex h-screen">
      {/* Toast de Mensagens - Flutuante no topo */}
      {msg.text && (
        <div className="fixed top-4 left-1/2 z-50 w-full max-w-md -translate-x-1/2 transform px-4">
          <div
            className={`flex items-center gap-3 rounded-xl border p-4 text-sm shadow-xl backdrop-blur-sm ${
              msg.type === "error"
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-green-200 bg-green-50 text-green-800"
            }`}
          >
            <div
              className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                msg.type === "error" ? "bg-red-100" : "bg-green-100"
              }`}
            >
              <svg
                className={`h-5 w-5 ${msg.type === "error" ? "text-red-600" : "text-green-600"}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                {msg.type === "error" ? (
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                ) : (
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L7.53 10.25a.75.75 0 00-1.06 1.5l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                    clipRule="evenodd"
                  />
                )}
              </svg>
            </div>
            <span className="flex-1 font-medium">{msg.text}</span>
            <button
              onClick={() => setMsg({ type: "", text: "" })}
              className={`transition-colors ${
                msg.type === "error"
                  ? "text-red-400 hover:text-red-600"
                  : "text-green-400 hover:text-green-600"
              }`}
              title="Fechar mensagem"
              aria-label="Fechar mensagem"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Coluna esquerda - formulário */}
      <div className="flex flex-1 items-center justify-center bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-4">
          {/* Logo */}
          <div className="text-center">
            <h1 className="inline-block w-full rounded-lg bg-yellow-500 px-6 py-2 text-xl font-bold text-white shadow-md">
              CodaWeb Notes | Crie sua conta
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Nome, Usuário e Foto */}
            <div className="flex flex-col items-start justify-between gap-3 rounded-md border border-gray-300 bg-white p-3 sm:flex-row">
              {/* Nome e Usuário */}
              <div className="w-full flex-1 space-y-2.5">
                <div>
                  <label htmlFor="name" className="mb-1 block text-xs font-medium text-gray-700">
                    Nome
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={submitting}
                    className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="username"
                    className="mb-1 block text-xs font-medium text-gray-700"
                  >
                    Usuário
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="seu_usuario"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={submitting}
                    className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Upload de Foto */}
              <div className="flex w-full flex-col items-center text-center sm:w-auto">
                <label className="mb-1.5 block text-xs font-medium text-gray-700">
                  Foto de Perfil {"(opcional)"}
                </label>
                <div
                  className={`flex h-20 w-20 cursor-pointer items-center justify-center rounded-full border-2 border-dashed transition-colors ${
                    dragActive
                      ? "border-yellow-500 bg-yellow-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      width={80}
                      height={80}
                      className="h-full w-full rounded-full object-cover"
                      alt="Preview da foto de perfil"
                    />
                  ) : (
                    <FaCamera className="text-xl text-gray-400" />
                  )}
                </div>
                <p className="mt-1 text-[10px] text-gray-500">Até 5MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  title="Selecionar foto de perfil"
                  aria-label="Selecionar foto de perfil"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-1 block text-xs font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange}
                disabled={submitting}
                autoComplete="email"
                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none"
              />
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="password" className="mb-1 block text-xs font-medium text-gray-700">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={submitting}
                  autoComplete="new-password"
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                  tabIndex={-1}
                  title={showPassword ? "Esconder senha" : "Mostrar senha"}
                  aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                >
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>

            {/* Botão cadastrar */}
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-yellow-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Criando conta...
                </span>
              ) : (
                "Criar Conta"
              )}
            </button>
          </form>

          {/* Login */}
          <div className="text-center">
            <p className="text-xs text-gray-600">
              Já possui uma conta?{" "}
              <Link
                href="/auth/signin"
                className="font-semibold text-yellow-600 transition-colors duration-200 hover:text-yellow-700"
              >
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Coluna direita - imagem */}
      <div className="relative hidden flex-1 lg:block">
        <Image
          src="https://cwn.sfo3.cdn.digitaloceanspaces.com/medias/bg-studying_guy.webp"
          alt="Registro visual"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
    </div>
  );
}
