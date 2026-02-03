import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { fetchSession } from "@/utils/auth";

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const location = useLocation();
  const [state, setState] = useState({
    loading: true,
    isAuthenticated: false,
    user: null,
  });

  useEffect(() => {
    let mounted = true;

    const validateSession = async () => {
      try {
        // Always fetch fresh session from backend
        const session = await fetchSession(true);

        if (!mounted) return;

        setState({
          loading: false,
          isAuthenticated: session?.isAuthenticated || false,
          user: session?.user || null,
        });
      } catch (err) {
        console.error("Failed to validate session:", err);
        if (mounted) {
          setState({ loading: false, isAuthenticated: false, user: null });
        }
      }
    };

    validateSession();

    return () => {
      mounted = false;
    };
  }, [location.pathname]);

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0b1220] via-[#0c1426] to-[#0a0f1a] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-red-500/60 border-t-transparent animate-spin" />
          <div className="text-sm text-white/70">Checking your session...</div>
        </div>
      </div>
    );
  }

  if (!state.isAuthenticated) {
    return (
      <Navigate
        to={`/auth?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  if (requiredRole) {
    const userRole = (state.user?.role || "").toString().toUpperCase();
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
