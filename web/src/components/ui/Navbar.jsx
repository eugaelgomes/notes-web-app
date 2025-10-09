import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { IoPersonCircleSharp } from "react-icons/io5";
import { FaBars, FaTimes } from "react-icons/fa";

// Função para extrair o primeiro e último nome do usuário
const nameExtrator = (user) => {
  if (!user?.name?.trim()) {
    return "Usuário";
  }
  const nomes = user.name.trim().split(" ");
  if (nomes.length === 1) {
    return nomes[0];
  }
  return `${nomes[0]} ${nomes[nomes.length - 1]}`;
};

// Menu de itens/rotas do usuário
const UserMenuItems = ({ logout, onLinkClick }) => (
  <>
    <Link
      to="/settings"
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

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const userName = nameExtrator(user);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
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
    <nav className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-lg">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Mobile Menu Button + Logo */}
          <div className="flex items-center gap-3">
            {/* Hamburger Menu (Mobile) */}
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-md text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-colors"
              aria-label="Abrir menu"
            >
              <FaBars size={20} />
            </button>
            
            {/* Logo */}
            <Link 
              to="/home" 
              className="text-lg sm:text-xl font-bold text-yellow-600 hover:text-yellow-500 transition-colors"
            >
              <span className="hidden sm:inline">Codaweb Notes</span>
              <span className="sm:hidden">CW Notes</span>
            </Link>
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={toggleUserMenu}
              className="flex items-center gap-2 p-1 rounded-md hover:bg-slate-100 transition-colors group"
              aria-label="Menu do usuário"
            >
              {/* User Name (Hidden on small screens) */}
              <span className="hidden md:block text-sm font-medium text-slate-700 group-hover:text-slate-950 transition-colors">
                {userName}
              </span>
              
              {/* Avatar */}
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={`Avatar de ${userName}`}
                  className="w-10 h-10 sm:w-10 sm:h-10 rounded-full border-2 border-slate-200 group-hover:border-slate-300 transition-colors object-cover"
                />
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
                      {user?.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt="Avatar"
                          className="w-12 h-12 rounded-full border-2 border-slate-200 object-cover"
                        />
                      ) : (
                        <IoPersonCircleSharp className="w-12 h-12 text-slate-600" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-950 truncate">{user?.name}</p>
                        <p className="text-sm text-slate-600 truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="py-2">
                    <UserMenuItems logout={logout} onLinkClick={closeUserMenu} />
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
                      {user?.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt="Avatar"
                          className="w-16 h-16 rounded-full border-2 border-slate-200 object-cover"
                        />
                      ) : (
                        <IoPersonCircleSharp className="w-16 h-16 text-slate-600" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-950 text-lg">{user?.name}</p>
                        <p className="text-slate-600">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="border-t border-slate-200">
                    <UserMenuItems logout={logout} onLinkClick={closeUserMenu} />
                    
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
