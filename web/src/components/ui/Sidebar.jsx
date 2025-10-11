import { FaBook, FaHome, FaTimes } from "react-icons/fa";
import { MdPersonAdd } from "react-icons/md";
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
      path: "/community",
      icon: MdPersonAdd,
      label: "Comunidade"
    },
    {
      path: "/settings",
      icon: IoMdSettings,
      label: "Configurações"
    }
  ];

  return (
    <aside className="h-full bg-white m-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex flex-col h-full">
        {/* Header da Sidebar (Mobile) */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-950">Menu</h2>
          <button
            onClick={handleLinkClick}
            className="p-2 text-slate-600 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Fechar menu"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 lg:p-6">
          <ul className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={handleLinkClick}
                    className={`group flex items-center p-3 rounded-lg transition-all duration-200 ${
                      active
                        ? "bg-slate-950 text-white shadow-md"
                        : "text-slate-700 hover:text-slate-950 hover:bg-slate-50"
                    }`}
                  >
                    {/* Icon */}
                    <Icon 
                      className={`flex-shrink-0 transition-colors duration-200 ${
                        active 
                          ? "text-white" 
                          : "text-slate-500 group-hover:text-slate-700"
                      }`}
                      size={18}
                    />
                    
                    {/* Label */}
                    <span className={`ml-3 font-medium transition-colors ${
                      active ? "text-white" : "group-hover:text-slate-950"
                    }`}>
                      {item.label}
                    </span>

                    {/* Active Indicator */}
                    {active && (
                      <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />
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
