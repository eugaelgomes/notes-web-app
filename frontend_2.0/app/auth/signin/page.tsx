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
      const rememberCheckbox = (
        document.getElementById("remember-me") as HTMLInputElement | null
      )?.checked;
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
          message =
            "Usuário ou senha incorretos. Verifique seus dados e tente novamente.";
        }
        setErro(message);
      }
    } catch {
      setErro(
        "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente."
      );
    } finally {
      setSubmitting(false);
      setTimeout(() => setErro(""), 5000);
    }
  };

  return (
    <div className="h-screen flex relative">
      {(erro || status) && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
          {erro && (
            <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg shadow-lg backdrop-blur-sm">
              <span className="flex-1">{erro}</span>
            </div>
          )}
          {status && (
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg shadow-lg backdrop-blur-sm">
              <span className="flex-1">{status}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-4 bg-white">
        <div className="w-full max-w-sm space-y-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-yellow-500 p-4 rounded-md text-white">
              CodaWeb Notes
            </h1>
          </div>

          <div className="flex text-center justify-center">
            <p className="text-sm text-gray-600">
              Bem-vindos! Entre ou cadastre-se em nosso app.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loginWithGoogle()}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
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
              <span className="px-2 bg-white text-gray-500">ou</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
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
                className="block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
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
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-yellow-600"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-gray-900"
                >
                  Lembrar por 30 dias
                </label>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => {}}
                  className="font-medium text-yellow-600 hover:text-yellow-500"
                >
                  Esqueceu a senha?
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
              disabled={submitting}
            >
              {submitting ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{" "}
              <a href="/auth/signup" className="font-medium text-yellow-600">
                Cadastre-se
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="hidden lg:block relative flex-1">
        <Image
          src="https://cwn.sfo3.cdn.digitaloceanspaces.com/medias/bg-studying_guy.webp"
          alt="Login visual"
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-lg">
            <h3 className="text-xl font-bold text-white mb-2">
              Traga suas ideias à vida.
            </h3>
            <p className="text-sm text-white/90">
              Cadastre-se e aproveite as máximo a melhor experiência de
              organizar sua vida. Conte conosco!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
