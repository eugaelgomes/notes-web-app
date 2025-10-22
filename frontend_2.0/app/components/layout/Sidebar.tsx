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
    <aside className="h-full rounded-lg border border-neutral-800 bg-neutral-950 shadow-md">
      <div className="flex h-full flex-col">
        {/* Header da Sidebar (Mobile) */}
        <div className="flex items-center justify-between border-b border-neutral-800 p-3 lg:hidden">
          <h2 className="text-sm font-semibold text-neutral-100">Menu</h2>
          <button
            onClick={handleLinkClick}
            className="rounded-md p-2 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-100"
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
                    className={`group flex items-center gap-3 rounded-md p-2.5 transition-all duration-200 ${
                      active
                        ? "bg-yellow-500 text-neutral-950 shadow-sm"
                        : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 flex-shrink-0 transition-colors ${
                        active
                          ? "text-neutral-950"
                          : "text-neutral-500 group-hover:text-neutral-100"
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        active ? "text-neutral-950" : "text-neutral-300"
                      }`}
                    >
                      {item.label}
                    </span>

                    {/* Indicador ativo */}
                    {active && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-neutral-950" />}
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
