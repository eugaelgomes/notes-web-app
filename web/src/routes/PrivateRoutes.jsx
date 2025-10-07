import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute() {
  const { authenticated } = useAuth();


  if (!authenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
