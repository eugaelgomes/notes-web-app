"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../../contexts/AuthContext";
import { FaBars, FaTimes } from "react-icons/fa";
import { IoPersonCircleSharp } from "react-icons/io5";

interface NavbarProps {
  onToggleSidebar?: () => void;
}

// Função para extrair o primeiro e último nome do usuário
const nameExtractor = (user: { [key: string]: unknown } | null | undefined) => {
  const name = user?.name;
  if (!name || typeof name !== "string" || !name.trim()) {
    return "Usuário";
  }
  const nomes = name.trim().split(" ");
  if (nomes.length === 1) {
    return nomes[0];
  }
  return `${nomes[0]} ${nomes[nomes.length - 1]}`;
};

// Menu de itens/rotas do usuário
const UserMenuItems = ({
  logout,
  onLinkClick,
}: {
  logout: () => void;
  onLinkClick?: () => void;
}) => (
  <>
    <Link
      href="/settings"
      onClick={onLinkClick}
      className="block px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
    >
      Configurações
    </Link>
    <button
      onClick={() => {
        logout();
        onLinkClick?.();
      }}
      className="block w-full px-4 py-3 text-left text-sm font-semibold text-red-500 transition-colors hover:bg-slate-100 hover:text-red-600"
    >
      Sair
    </button>
  </>
);

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const { user, logout, authenticated } = useAuth();
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const userName = nameExtractor(user);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleUserMenu = () => {
    setUserMenuOpen(!isUserMenuOpen);
  };

  const closeUserMenu = () => {
    setUserMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-30 border-b border-neutral-800 bg-neutral-950 shadow-lg">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile Menu Button + Logo */}
          <div className="flex items-center gap-3">
            {/* Hamburger Menu (Mobile) */}
            {authenticated && (
              <button
                onClick={onToggleSidebar}
                className="rounded-md p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 lg:hidden"
                aria-label="Abrir menu"
              >
                <FaBars size={20} />
              </button>
            )}

            {/* Logo */}
            <Link
              href={authenticated ? "/home" : "/"}
              className="text-lg font-bold text-yellow-500 transition-colors hover:text-yellow-400 sm:text-xl"
            >
              <span className="hidden sm:inline">Codaweb Notes</span>
              <span className="sm:hidden">CW Notes</span>
            </Link>
          </div>

          {/* Right side - User menu or Login */}
          <div className="flex items-center">
            {authenticated && user ? (
              /* User Menu */
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={toggleUserMenu}
                  className="group flex items-center gap-2 rounded-md p-1 transition-colors hover:bg-neutral-800"
                  aria-label="Menu do usuário"
                >
                  {/* User Name (Hidden on small screens) */}
                  <span className="hidden text-sm font-medium text-gray-200 transition-colors group-hover:text-slate-950 md:block">
                    {userName}
                  </span>

                  {/* Avatar */}
                  {user?.avatar_url && typeof user.avatar_url === "string" ? (
                    <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-neutral-800">
                      <Image
                        src={user.avatar_url}
                        alt={`Avatar de ${userName}`}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    </div>
                  ) : (
                    <IoPersonCircleSharp className="h-8 w-8 text-slate-600 transition-colors group-hover:text-slate-700 sm:h-10 sm:w-10" />
                  )}
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <>
                    {/* Mobile Overlay */}
                    <div
                      className="fixed inset-0 z-40 bg-black/50 sm:hidden"
                      onClick={closeUserMenu}
                    />

                    {/* Desktop Dropdown */}
                    <div className="absolute right-0 z-50 mt-2 hidden w-72 overflow-hidden rounded-md border border-slate-200 bg-white shadow-xl sm:block">
                      {/* User Info Header */}
                      <div className="border-b border-slate-200 bg-slate-50 px-4 py-4">
                        <div className="flex items-center gap-3">
                          {user?.avatar_url && typeof user.avatar_url === "string" ? (
                            <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-neutral-800">
                              <Image
                                src={user.avatar_url}
                                alt={`Avatar de ${userName}`}
                                width={40}
                                height={40}
                                className="rounded-full object-cover"
                              />
                            </div>
                          ) : (
                            <IoPersonCircleSharp className="h-12 w-12 text-slate-600" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-slate-950">
                              {String(user?.name || "Usuário")}
                            </p>
                            <p className="truncate text-sm text-slate-600">
                              {String(user?.email || "")}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <UserMenuItems logout={logout} onLinkClick={closeUserMenu} />
                      </div>
                    </div>

                    {/* Mobile Bottom Sheet */}
                    <div className="fixed right-0 bottom-0 left-0 z-50 rounded-t-xl border-t border-slate-200 bg-white shadow-2xl sm:hidden">
                      {/* Handle */}
                      <div className="flex justify-center py-3">
                        <div className="h-1 w-10 rounded-full bg-slate-400"></div>
                      </div>

                      {/* User Info */}
                      <div className="px-6 pb-4">
                        <div className="mb-4 flex items-center gap-4">
                          {user?.avatar_url && typeof user.avatar_url === "string" ? (
                            <Image
                              src={user.avatar_url}
                              alt="Avatar"
                              width={64}
                              height={64}
                              className="rounded-full border-2 border-neutral-800 object-cover"
                            />
                          ) : (
                            <IoPersonCircleSharp className="h-16 w-16 text-slate-600" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-lg font-semibold text-slate-950">
                              {String(user?.name || "Usuário")}
                            </p>
                            <p className="text-slate-600">{String(user?.email || "")}</p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="border-t border-slate-200">
                        <UserMenuItems logout={logout} onLinkClick={closeUserMenu} />

                        {/* Close Button */}
                        <button
                          onClick={closeUserMenu}
                          className="flex w-full items-center justify-center gap-2 px-4 py-4 text-center text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
                        >
                          <FaTimes size={16} />
                          Fechar
                        </button>
                      </div>

                      {/* Safe Area */}
                      <div className="pb-safe-area-inset-bottom"></div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-yellow-700"
                >
                  Entrar
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
