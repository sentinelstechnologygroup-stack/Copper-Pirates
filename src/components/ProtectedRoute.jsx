import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
export default function ProtectedRoute() {
  const { isAuthenticated, isLoadingAuth, authChecked } = useAuth();
  const location = useLocation();
  if(isLoadingAuth || !authChecked) return <div role="status" className="pt-32 text-center">Checking your session…</div>;
  if(!isAuthenticated) return <Navigate to={"/login?returnTo="+encodeURIComponent(location.pathname+location.search)} replace />;
  return <Outlet />;
}
