import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const location = useLocation();
  const { isAuthenticated, user, loading } = useAuth();
  const redirectTarget = `${location.pathname}${location.search}`;

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
    const normalizedRequiredRole = requiredRole?.toUpperCase();

    // Use dedicated login page for promoter/admin class routes.
    if (normalizedRequiredRole === "PROMOTER" || normalizedRequiredRole === "ADMIN") {
      return (
        <Navigate
          to={`/promoter/login?redirect=${encodeURIComponent(redirectTarget)}`}
          replace
        />
      );
    }

    return (
      <Navigate
        to={`/auth?redirect=${encodeURIComponent(redirectTarget)}`}
        replace
      />
    );
  }

  if (requiredRole) {
    const userRole = (user?.role || "").toString().toUpperCase();
    const normalizedRequiredRole = requiredRole.toUpperCase();

    // App aliases promoter -> admin in backend role naming.
    const roleAliases = {
      PROMOTER: ["PROMOTER", "ADMIN"],
      ADMIN: ["PROMOTER", "ADMIN"],
      USER: ["USER"],
      ORGANIZER: ["ORGANIZER"],
    };

    const acceptedRoles = roleAliases[normalizedRequiredRole] || [normalizedRequiredRole];

    if (!acceptedRoles.includes(userRole)) {
      console.warn(
        `Role mismatch: required one of [${acceptedRoles.join(", ")}], got "${userRole}"`
      );
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
