"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useAuth } from "../../contexts/AuthContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, authenticated, loginWithGoogle } = useAuth();

  // If already authenticated, redirect to home
  if (authenticated && typeof window !== "undefined") {
    window.location.href = "/app/home";
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    const u = username.trim();
    const p = password;
    if (!u || !p) {
      setErro("Por favor, preencha todos os campos para continuar.");
      return;
    }
    try {
      setSubmitting(true);
      const rememberCheckbox = (document.getElementById("remember-me") as HTMLInputElement | null)
        ?.checked;
      const result = await login({
        username: u,
        password: p,
        remember: !!rememberCheckbox,
      });
      if (result.success) {
        setStatus(result.message || "Login realizado com sucesso!");
        setTimeout(() => {
          setStatus("");
          window.location.href = "/app/home";
        }, 200);
      } else {
        let message = result.message || "Falha no login";
        if (message.includes("Usuário ou senha inválidos")) {
          message = "Usuário ou senha incorretos. Verifique seus dados e tente novamente.";
        }
        setErro(message);
      }
    } catch {
      setErro("Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.");
    } finally {
      setSubmitting(false);
      setTimeout(() => setErro(""), 5000);
    }
  };

  return (
    <div className="relative flex h-screen">
      {(erro || status) && (
        <div className="fixed top-4 left-1/2 z-50 w-full max-w-md -translate-x-1/2 transform px-4">
          {erro && (
            <div className="animate-in slide-in-from-top-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-xl backdrop-blur-sm duration-300">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="h-5 w-5 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <span className="flex-1 font-medium">{erro}</span>
            </div>
          )}
          {status && (
            <div className="animate-in slide-in-from-top-4 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 shadow-xl backdrop-blur-sm duration-300">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-5 w-5 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="flex-1 font-medium">{status}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-1 items-center justify-center bg-gray-50 px-4 py-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="mb-2 inline-flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-yellow-500 opacity-20 blur-xl"></div>

                <h1 className="relative rounded-2xl bg-yellow-500 px-8 py-4 text-4xl font-bold text-white shadow-2xl">
                  CodaWeb Notes
                </h1>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Entre ou cadastre-se para acessar utilizar o App
            </p>
          </div>

          {/*<button
            type="button"
            onClick={() => loginWithGoogle()}
            className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            disabled={submitting}
          >
            <Image
              src="https://www.svgrepo.com/show/355037/google.svg"
              alt="Google"
              width={16}
              height={16}
              className="mr-2"
              unoptimized
            />
            Entrar com Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">ou</span>
            </div>
          </div>

        */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="mb-2 block text-sm font-semibold text-gray-700">
                Usuário
              </label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Digite seu nome de usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={submitting}
                autoComplete="username"
                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm transition-all duration-200 placeholder:text-gray-400 hover:border-gray-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-gray-700">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                  autoComplete="current-password"
                  className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-12 text-gray-900 shadow-sm transition-all duration-200 placeholder:text-gray-400 hover:border-gray-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 transition-colors hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-yellow-600 transition-colors focus:ring-2 focus:ring-yellow-500/20"
                />
                <label htmlFor="remember-me" className="ml-2 block font-medium text-gray-700">
                  Lembrar por 30 dias
                </label>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => {}}
                  className="font-semibold text-yellow-600 transition-colors hover:text-yellow-700"
                >
                  Esqueceu a senha?
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full justify-center rounded-lg border border-transparent bg-yellow-500 px-4 py-3 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:bg-yellow-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{" "}
              <a
                href="/auth/signup"
                className="font-semibold text-yellow-600 transition-colors hover:text-yellow-700"
              >
                Cadastre-se
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="relative hidden flex-1 lg:block">
        <Image
          src="https://cwn.sfo3.cdn.digitaloceanspaces.com/medias/bg-studying_guy.webp"
          alt="Login visual"
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute right-0 bottom-0 left-0 p-6">
          <div className="max-w-lg">
            <h3 className="mb-2 text-xl font-bold text-white">Traga suas ideias à vida.</h3>
            <p className="text-sm text-white/90">
              Cadastre-se e aproveite as máximo a melhor experiência de organizar sua vida. Conte
              conosco!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
