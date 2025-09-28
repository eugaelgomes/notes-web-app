import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute() {
  const { authenticated, loading } = useAuth();

  if (loading) {
    return <div className="w-full h-screen bg-slate-950 text-gray-800">Carregando...</div>;
  }

  if (!authenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
