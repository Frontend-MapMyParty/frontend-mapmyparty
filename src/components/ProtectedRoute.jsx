import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { fetchSession, resetSessionCache } from '@/utils/auth';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const location = useLocation();
  const [state, setState] = useState({ loading: true, isAuthenticated: false, user: null });

  useEffect(() => {
    let mounted = true;
    fetchSession()
      .then((session) => {
        if (!mounted) return;
        setState({
          loading: false,
          isAuthenticated: session?.isAuthenticated,
          user: session?.user || null,
        });
      })
      .catch((err) => {
        console.error("❌ Failed to fetch session:", err);
        if (mounted) {
          resetSessionCache();
          setState({ loading: false, isAuthenticated: false, user: null });
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Checking your session...</div>
      </div>
    );
  }

  if (!state.isAuthenticated) {
    console.warn("❌ User not authenticated, redirecting to auth");
    return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (requiredRole) {
    const normalizedRequiredRole = requiredRole.toLowerCase();
    const normalizedUserRole = (state.user?.role || '').toLowerCase();

    if (normalizedUserRole !== normalizedRequiredRole) {
      console.warn("❌ User role mismatch, redirecting to home");
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
