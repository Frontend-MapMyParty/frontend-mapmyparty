import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const location = useLocation();
  const { isAuthenticated, user, loading } = useAuth();

  // Promoter guest bypass — check before loading gate
  const guestRole = sessionStorage.getItem("role");
  const isPromoterGuest = sessionStorage.getItem("promoterGuest") === "true";

  if (requiredRole?.toUpperCase() === "PROMOTER" && isPromoterGuest && guestRole === "PROMOTER") {
    return children;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0b1220] via-[#0c1426] to-[#0a0f1a] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-red-500/60 border-t-transparent animate-spin" />
          <div className="text-sm text-white/70">Checking your session...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/auth?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  if (requiredRole) {
    const userRole = (user?.role || "").toString().toUpperCase();
    const normalizedRequiredRole = requiredRole.toUpperCase();

    if (userRole !== normalizedRequiredRole) {
      console.warn(
        `Role mismatch: required "${normalizedRequiredRole}", got "${userRole}"`
      );
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
