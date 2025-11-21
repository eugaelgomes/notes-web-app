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
            className={`animate-in slide-in-from-top-4 flex items-center gap-3 rounded-md border p-4 text-sm shadow-xl backdrop-blur-sm duration-300 ${
              msg.type === "error"
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-green-200 bg-green-50 text-green-800"
            }`}
          >
            <div
              className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md ${
                msg.type === "error" ? "bg-red-100" : "bg-green-100"
              }`}
            >
              <svg
                className={`h-5 w-5 ${msg.type === "error" ? "text-red-600" : "text-green-600"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {msg.type === "error" ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                )}
              </svg>
            </div>
            <span className="flex-1 font-medium">{msg.text}</span>
          </div>
        </div>
      )}

      {/* Coluna esquerda - formulário */}
      <div className="flex flex-1 items-center justify-center bg-neutral-950 px-4 py-6 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <div className="text-center">
            <div className="flex items-center justify-center">
              <h1 className="relative w-full rounded-md bg-gradient-to-br from-yellow-500 via-yellow-500 to-yellow-500 px-8 py-3 text-3xl font-black tracking-tight text-white">
                CodaWeb Notes
              </h1>
            </div>
            <div className="">
              <p className="text-sm text-gray-400">
                Bem-vindo! Crie sua conta ou entre para começar a usar.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome, Email e Foto */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Nome e Email */}
              <div className="space-y-4 sm:col-span-2">
                {/* Nome */}
                <div>
                  <label htmlFor="name" className="mb-1 block text-sm font-semibold text-yellow-500">
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
                    className="block w-full rounded-md border border-neutral-600 bg-neutral-900 px-4 py-3 text-gray-400 shadow-sm transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="mb-1 block text-sm font-semibold text-yellow-500">
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
                    className="block w-full rounded-md border border-neutral-600 bg-neutral-900 px-4 py-3 text-gray-400 shadow-sm transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none"
                  />
                </div>
              </div>

              {/* Upload de Foto */}
              <div>
                <label className="mb-1 block text-sm font-semibold text-yellow-500">
                  Foto <span className="text-gray-400">(opcional)</span>
                </label>
                <div
                  className={`flex h-[calc(100%-28px)] w-full cursor-pointer items-center justify-center rounded-md border-2 border-dashed transition-colors ${
                    dragActive
                      ? "border-yellow-500 bg-neutral-800"
                      : "border-neutral-600 bg-neutral-900 hover:border-gray-400"
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
                      width={120}
                      height={120}
                      className="h-28 w-28 rounded-full object-cover"
                      alt="Preview da foto de perfil"
                    />
                  ) : (
                    <div className="text-center">
                      <FaCamera className="mx-auto text-3xl text-gray-400" />
                      <p className="mt-2 text-sm text-gray-400">Clique ou arraste</p>
                      <p className="mt-1 text-xs text-gray-500">Até 5MB</p>
                    </div>
                  )}
                </div>
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

            {/* Usuário + Senha */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Usuário */}
              <div>
                <label
                  htmlFor="username"
                  className="mb-1 block text-sm font-semibold text-yellow-500"
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
                  className="block w-full rounded-md border border-neutral-600 bg-neutral-900 px-4 py-3 text-gray-400 shadow-sm transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none"
                />
              </div>

              {/* Senha */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-1 block text-sm font-semibold text-yellow-500"
                >
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
                    className="block w-full rounded-md border border-neutral-600 bg-neutral-900 px-4 py-3 text-gray-400 shadow-sm transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 transition-colors hover:text-gray-600"
                    tabIndex={-1}
                    title={showPassword ? "Esconder senha" : "Mostrar senha"}
                    aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                  >
                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex items-center justify-between gap-4">
              {/* Login */}
              <Link
                href="/auth/signin"
                className="text-sm font-semibold text-yellow-500 transition-colors hover:text-yellow-600"
              >
                <span className="text-gray-500">Possui uma conta? </span>Entrar
              </Link>

              {/* Botão cadastrar */}
              <button
                type="submit"
                className="flex justify-center rounded-md border border-transparent bg-yellow-500 px-8 py-2 font-bold text-white shadow-lg transition-all duration-200 hover:bg-yellow-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? "Criando conta..." : "Criar Conta"}
              </button>
            </div>

          </form>
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
        {/* Overlay de vidro/claridade saindo da esquerda */}
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/40 to-transparent"></div>
      </div>
    </div>
  );
}
