import { FaBook, FaHome, FaTimes } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import { useLocation, Link } from "react-router-dom";

export default function Sidebar({ onLinkClick }) {
  const location = useLocation();

  const isActive = (path) => {
    // Verifica se é a página de nota individual
    if (path === "/notes" && location.pathname.startsWith("/notes")) {
      return true;
    }
    return location.pathname === path;
  };

  const handleLinkClick = () => {
    if (onLinkClick) {
      onLinkClick();
    }
  };

  const navigationItems = [
    {
      path: "/home",
      icon: FaHome,
      label: "Início"
    },
    {
      path: "/notes",
      icon: FaBook,
      label: "Notas"
    },
    {
      path: "/settings",
      icon: IoMdSettings,
      label: "Configurações"
    }
  ];

  return (
    <aside className="h-full bg-slate-950 border-r border-gray-800 lg:border-r-0">
      <div className="flex flex-col h-full">
        {/* Header da Sidebar (Mobile) */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Menu</h2>
          <button
            onClick={handleLinkClick}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Fechar menu"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 lg:p-6">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={handleLinkClick}
                    className={`group flex items-center p-2 lg:p-3 rounded-xl transition-all duration-200 ${
                      active
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                        : "text-gray-300 hover:text-white hover:bg-gray-800/80"
                    }`}
                  >
                    {/* Icon */}
                    <Icon 
                      className={`flex-shrink-0 transition-transform duration-200 ${
                        active 
                          ? "text-white scale-110" 
                          : "text-gray-400 group-hover:text-white group-hover:scale-105"
                      }`}
                      size={20}
                    />
                    
                    {/* Label & Description */}
                    <div className="ml-4 min-w-0 flex-1">
                      <div className={`font-medium transition-colors ${
                        active ? "text-white" : "group-hover:text-white"
                      }`}>
                        {item.label}
                      </div>
                      <div className={`text-sm mt-0.5 transition-colors lg:block hidden ${
                        active 
                          ? "text-blue-100" 
                          : "text-gray-500 group-hover:text-gray-400"
                      }`}>
                      </div>
                    </div>

                    {/* Active Indicator */}
                    {active && (
                      <div className="w-2 h-2 bg-white rounded-full ml-2 animate-pulse" />
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
