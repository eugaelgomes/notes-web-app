import { Routes, Route } from "react-router-dom";
import { Suspense, lazy, useState } from "react";
import PrivateRoute from "./PrivateRoutes";

// Authentication
const Login = lazy(() => import("../pages/auth/SignInPage"));
const SignUp = lazy(() => import("../pages/auth/SignUpPage"));

// Páginas principais (carregadas sob demanda)
const Dashboard = lazy(() => import("../pages/app/Home"));
const Notes = lazy(() => import("../pages/app/NotesPage"));
const Social = lazy(() => import("../pages/app/Social"));
const Settings = lazy(() => import("../pages/app/SettingsPage"));

// Página de detalhe da nota
const NoteDetail = lazy(() => import("../pages/NoteDetail"));

// Página 404
const NotFoundRoute = lazy(() => import("../pages/404NotFound"));

// Página sobre o app
const AboutPage = lazy(() => import("../pages/app/AboutApp"));

// Componentes do layout (carregados imediatamente)
import Navbar from "../components/ui/Navbar";
import Footer from "../components/ui/Footer";
import Sidebar from "../components/ui/Sidebar";

// Context específico para notas
import { NotesProvider } from "../context/NotesContext";


// Layout componente para páginas privadas
const PrivateLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900">
      <Navbar onToggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1 relative overflow-hidden">
        {/* Overlay para mobile quando sidebar está aberta */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={closeSidebar}
          />
        )}
        
        {/* Sidebar */}
        <div className={`
          fixed lg:static lg:translate-x-0 z-50 lg:z-auto
          transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-64 lg:w-64 h-full lg:h-full
          top-0 lg:top-auto left-0 lg:left-auto
          pt-16 lg:pt-0
          lg:flex lg:flex-col
        `}>
          <Sidebar onLinkClick={closeSidebar} />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-2 lg:p-4">
            <div className="max-w-full mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

// Layout para páginas que precisam de notas
const NotesLayout = ({ children }) => {
  return (
    <NotesProvider>
      <PrivateLayout>
        {children}
      </PrivateLayout>
    </NotesProvider>
  );
};

export default function Rotas() {
  return (
    <Suspense>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/sign-in" element={<Login />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/about" element={<AboutPage />} />

        {/* Rotas privadas COM notas */}
        <Route element={<PrivateRoute />}>
          <Route
            path="/home"
            element={
              <NotesLayout>
                <Dashboard />
              </NotesLayout>
            }
          />
        </Route>

        <Route element={<PrivateRoute />}>
          <Route
            path="/notes"
            element={
              <NotesLayout>
                <Notes />
              </NotesLayout>
            }
          />
        </Route>

        {/* Nova rota para visualizar nota individual */}
        <Route element={<PrivateRoute />}>
          <Route
            path="/notes/edit/:id"
            element={
              <NotesLayout>
                <NoteDetail />
              </NotesLayout>
            }
          />
        </Route>

        {/* Rotas privadas SEM notas */}
        <Route element={<PrivateRoute />}>
          <Route
            path="/settings"
            element={
              <PrivateLayout>
                <Settings />
              </PrivateLayout>
            }
          />
        </Route>

        {/* Rotas Sociais */}
        {/* Rotas privadas COM notas */}
        <Route element={<PrivateRoute />}>
          <Route
            path="/social"
            element={
              <NotesLayout>
                <Social />
              </NotesLayout>
            }
          />
        </Route>
        {/* Fallback */}
        <Route path="*" element={<NotFoundRoute />} />
      </Routes>
    </Suspense>
  );
}
