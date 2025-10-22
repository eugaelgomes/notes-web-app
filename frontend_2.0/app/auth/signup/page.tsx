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
    if (file.size > 5 * 1024 * 1024) return "Imagem deve ter até 5MB.";
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

      // Por enquanto, o backend não suporta upload de imagens
      // Enviamos apenas os dados do formulário como JSON
      const payload = {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
      };

      const res = await createUser(payload);

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
            className={`flex items-center gap-3 rounded-lg border p-3 text-sm shadow-lg backdrop-blur-sm ${
              msg.type === "error"
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-green-200 bg-green-50 text-green-800"
            }`}
          >
            <svg
              className={`h-4 w-4 flex-shrink-0 ${
                msg.type === "error" ? "text-red-500" : "text-green-500"
              }`}
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
            <span className="flex-1">{msg.text}</span>
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
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
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
      <div className="flex flex-1 items-center justify-center bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-sm space-y-4">
          {/* Logo */}
          <div className="text-center">
            <h1 className="rounded-md bg-yellow-500 p-4 text-3xl font-bold text-white">
              CodaWeb Notes
            </h1>
          </div>

          {/* Título */}
          <div className="flex justify-center text-center">
            <p className="text-sm text-gray-600">Bem-vindos! Entre ou cadastre-se em nosso app.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Upload de Foto */}
            <div className="text-center">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Foto de Perfil (opcional)
              </label>
              <div
                className={`mx-auto flex h-16 w-16 cursor-pointer items-center justify-center rounded-full border-2 border-dashed transition-colors duration-200 ${
                  dragActive
                    ? "border-yellow-400 bg-yellow-50"
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
                    width={64}
                    height={64}
                    className="h-full w-full rounded-full object-cover"
                    alt="Preview da foto de perfil"
                  />
                ) : (
                  <FaCamera className="text-sm text-gray-400" />
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">Clique ou arraste uma imagem</p>
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

            {/* Nome e Usuário */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
                  Nome
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Seu nome"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={submitting}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 transition-colors duration-200 focus:border-transparent focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="username" className="mb-1 block text-sm font-medium text-gray-700">
                  Usuário
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Nome de usuário"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={submitting}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 transition-colors duration-200 focus:border-transparent focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
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
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 transition-colors duration-200 focus:border-transparent focus:ring-2 focus:ring-yellow-500 focus:outline-none"
              />
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={submitting}
                  autoComplete="new-password"
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-gray-900 placeholder-gray-500 transition-colors duration-200 focus:border-transparent focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                  tabIndex={-1}
                  title={showPassword ? "Esconder senha" : "Mostrar senha"}
                  aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-4 w-4" />
                  ) : (
                    <FaEye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Botão cadastrar */}
            <button
              type="submit"
              className="flex w-full justify-center rounded-md border border-transparent bg-yellow-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? (
                <span className="flex items-center">
                  <svg
                    className="mr-3 -ml-1 h-4 w-4 animate-spin text-white"
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
            <p className="text-sm text-gray-600">
              Já possui uma conta?{" "}
              <Link
                href="/auth/login"
                className="font-medium text-yellow-600 transition-colors duration-200 hover:text-yellow-500"
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute right-0 bottom-0 left-0 p-6">
          <div className="max-w-md">
            <h3 className="mb-2 text-xl font-bold text-white">Comece sua jornada hoje.</h3>
            <p className="text-sm text-white/90">
              Junte-se a milhares de usuários que já organizam suas ideias com nossa plataforma
              intuitiva.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
