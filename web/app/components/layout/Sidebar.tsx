"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/app/contexts/AuthContext";
import { usePathname } from "next/navigation";
import { FaBook, FaHome, FaTimes } from "react-icons/fa";
import { MdPersonAdd } from "react-icons/md";
import { IoMdSettings } from "react-icons/io";

interface SidebarProps {
  onLinkClick?: () => void;
}

const Sidebar = ({ onLinkClick }: SidebarProps) => {
  const { authenticated } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/notes" && pathname.startsWith("/notes")) {
      return true;
    }
    return pathname === path;
  };

  const handleLinkClick = () => {
    if (onLinkClick) onLinkClick();
  };

  const navigationItems = [
    { path: "/app/home", icon: FaHome, label: "Início" },
    { path: "/app/notes", icon: FaBook, label: "Notas" },
    { path: "/app/community", icon: MdPersonAdd, label: "Comunidade" },
    { path: "/app/settings", icon: IoMdSettings, label: "Configurações" },
  ];

  if (!authenticated) return null;

  return (
    <aside className="h-full rounded-xl border border-neutral-800/60 bg-neutral-950/80 shadow-lg backdrop-blur-sm">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-neutral-800/50 p-4 lg:hidden">
          <h2 className="text-sm font-semibold text-neutral-200">Menu</h2>
          <button
            onClick={handleLinkClick}
            className="rounded-lg p-1.5 text-neutral-400 transition-all hover:bg-neutral-800/50 hover:text-neutral-200"
            aria-label="Fechar menu"
          >
            <FaTimes size={18} />
          </button>
        </div>

        <div className="hidden border-b border-neutral-800/30 p-6 lg:block">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
              <Image src="/cw-notes.png" alt="Logo" width={32} height={32} className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-neutral-100">Codaweb Notes</h1>
              <p className="text-xs text-neutral-500">Suas anotações</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 lg:p-5">
          <ul className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    onClick={handleLinkClick}
                    className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 ${
                      active
                        ? "bg-yellow-500/90 text-neutral-950 shadow-sm"
                        : "text-neutral-400 hover:bg-neutral-900/60 hover:text-neutral-100"
                    }`}
                  >
                    {/* Indicador lateral (quando ativo) */}
                    {active && (
                      <div className="absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-r-full bg-neutral-950" />
                    )}

                    <Icon
                      className={`h-5 w-5 flex-shrink-0 transition-all duration-200 ${
                        active ? "text-neutral-950" : "text-neutral-500 group-hover:text-yellow-500"
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        active ? "text-neutral-950" : "text-neutral-300"
                      }`}
                    >
                      {item.label}
                    </span>

                    {!active && (
                      <span className="ml-auto text-xs text-neutral-600 opacity-0 transition-opacity group-hover:opacity-100">
                        →
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex justify-evenly border-t border-neutral-800/30 p-4">
          <Link
            href="https://github.com/eugaelgomes/notes-web-app"
            className="block rounded-lg px-3 py-2 text-center text-xs text-neutral-500 transition-colors hover:bg-neutral-900/60 hover:text-neutral-300"
          >
            Github
          </Link>
          <Link
            href="/about"
            className="block rounded-lg px-3 py-2 text-center text-xs text-neutral-500 transition-colors hover:bg-neutral-900/60 hover:text-neutral-300"
          >
            Sobre
          </Link>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;