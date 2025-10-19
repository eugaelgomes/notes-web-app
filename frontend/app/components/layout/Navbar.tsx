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
      className="block text-slate-700 font-semibold px-4 py-3 text-sm hover:bg-slate-100 transition-colors"
    >
      Configurações
    </Link>
    <button
      onClick={() => {
        logout();
        onLinkClick?.();
      }}
      className="w-full text-left block font-semibold px-4 py-3 text-sm hover:bg-slate-100 text-red-500 hover:text-red-600 transition-colors"
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
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
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
    <nav className="sticky top-0 z-30 bg-neutral-950 border-b border-neutral-800 shadow-lg">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile Menu Button + Logo */}
          <div className="flex items-center gap-3">
            {/* Hamburger Menu (Mobile) */}
            {authenticated && (
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 rounded-md text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-colors"
                aria-label="Abrir menu"
              >
                <FaBars size={20} />
              </button>
            )}

            {/* Logo */}
            <Link
              href={authenticated ? "/home" : "/"}
              className="text-lg sm:text-xl font-bold text-yellow-500 hover:text-yellow-400 transition-colors"
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
                  className="flex items-center gap-2 p-1 rounded-md hover:bg-neutral-800 transition-colors group"
                  aria-label="Menu do usuário"
                >
                  {/* User Name (Hidden on small screens) */}
                  <span className="hidden md:block text-sm font-medium text-gray-200 group-hover:text-slate-950 transition-colors">
                    {userName}
                  </span>

                  {/* Avatar */}
                  {user?.avatar_url && typeof user.avatar_url === "string" ? (
                    <div className="w-12 h-12 rounded-full border-2 border-neutral-800 overflow-hidden">
                      <Image
                        src={user.avatar_url}
                        alt={`Avatar de ${userName}`}
                        width={40}
                        height={40}
                        className="object-cover rounded-full"
                      />
                    </div>
                  ) : (
                    <IoPersonCircleSharp className="w-8 h-8 sm:w-10 sm:h-10 text-slate-600 group-hover:text-slate-700 transition-colors" />
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
                    <div className="hidden sm:block absolute right-0 mt-2 w-72 bg-white rounded-md shadow-xl border border-slate-200 overflow-hidden z-50">
                      {/* User Info Header */}
                      <div className="px-4 py-4 bg-slate-50 border-b border-slate-200">
                        <div className="flex items-center gap-3">
                          {user?.avatar_url &&
                          typeof user.avatar_url === "string" ? (
                    <div className="w-12 h-12 rounded-full border-2 border-neutral-800 overflow-hidden">
                      <Image
                        src={user.avatar_url}
                        alt={`Avatar de ${userName}`}
                        width={40}
                        height={40}
                        className="object-cover rounded-full"
                      />
                    </div>
                          ) : (
                            <IoPersonCircleSharp className="w-12 h-12 text-slate-600" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-950 truncate">
                              {String(user?.name || "Usuário")}
                            </p>
                            <p className="text-sm text-slate-600 truncate">
                              {String(user?.email || "")}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <UserMenuItems
                          logout={logout}
                          onLinkClick={closeUserMenu}
                        />
                      </div>
                    </div>

                    {/* Mobile Bottom Sheet */}
                    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-xl border-t border-slate-200 shadow-2xl">
                      {/* Handle */}
                      <div className="flex justify-center py-3">
                        <div className="w-10 h-1 bg-slate-400 rounded-full"></div>
                      </div>

                      {/* User Info */}
                      <div className="px-6 pb-4">
                        <div className="flex items-center gap-4 mb-4">
                          {user?.avatar_url &&
                          typeof user.avatar_url === "string" ? (
                            <Image
                              src={user.avatar_url}
                              alt="Avatar"
                              width={64}
                              height={64}
                              className="rounded-full border-2 border-neutral-800 object-cover"
                            />
                          ) : (
                            <IoPersonCircleSharp className="w-16 h-16 text-slate-600" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-950 text-lg">
                              {String(user?.name || "Usuário")}
                            </p>
                            <p className="text-slate-600">
                              {String(user?.email || "")}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="border-t border-slate-200">
                        <UserMenuItems
                          logout={logout}
                          onLinkClick={closeUserMenu}
                        />

                        {/* Close Button */}
                        <button
                          onClick={closeUserMenu}
                          className="w-full px-4 py-4 text-center text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
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
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
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
