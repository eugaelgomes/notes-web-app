"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import { usePathname } from "next/navigation";
import { FaBook, FaHome, FaTimes } from "react-icons/fa";
import { MdPersonAdd } from "react-icons/md";
import { IoMdSettings } from "react-icons/io";

interface SidebarProps {
  onLinkClick?: () => void;
}

export default function Sidebar({ onLinkClick }: SidebarProps) {
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
    <aside className="h-full bg-neutral-950 border border-neutral-800 rounded-lg shadow-md">
      <div className="flex flex-col h-full">
        {/* Header da Sidebar (Mobile) */}
        <div className="lg:hidden flex items-center justify-between p-3 border-b border-neutral-800">
          <h2 className="text-sm font-semibold text-neutral-100">Menu</h2>
          <button
            onClick={handleLinkClick}
            className="p-2 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-md transition-colors"
            aria-label="Fechar menu"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 p-3 lg:p-4">
          <ul className="space-y-1.5">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    onClick={handleLinkClick}
                    className={`group flex items-center gap-3 p-2.5 rounded-md transition-all duration-200 ${
                      active
                        ? "bg-yellow-500 text-neutral-950 shadow-sm"
                        : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 transition-colors ${
                        active
                          ? "text-neutral-950"
                          : "text-neutral-500 group-hover:text-neutral-100"
                      }`}
                    />
                    <span
                      className={`font-medium text-sm ${
                        active ? "text-neutral-950" : "text-neutral-300"
                      }`}
                    >
                      {item.label}
                    </span>

                    {/* Indicador ativo */}
                    {active && (
                      <div className="ml-auto w-1.5 h-1.5 bg-neutral-950 rounded-full" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
