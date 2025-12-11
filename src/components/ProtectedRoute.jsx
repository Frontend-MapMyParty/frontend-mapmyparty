import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { fetchSession, resetSessionCache } from '@/utils/auth';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const location = useLocation();
  const [state, setState] = useState({ loading: true, isAuthenticated: false, user: null });

  useEffect(() => {
    let mounted = true;
    const validateSession = async (retryCount = 0) => {
      try {
        console.log(`🔒 ProtectedRoute: Validating access to ${location.pathname}${requiredRole ? ` (required role: ${requiredRole})` : ''}${retryCount > 0 ? ` (retry ${retryCount})` : ''}`);
        
        // Check sessionStorage first as a hint
        const storageAuth = sessionStorage.getItem("isAuthenticated") === "true";
        const storageRole = sessionStorage.getItem("role") || "";
        const storageProfile = sessionStorage.getItem("userProfile");
        
        let session = null;
        try {
          session = await fetchSession();
        } catch (fetchErr) {
          console.warn("⚠️ ProtectedRoute: fetchSession() failed, checking sessionStorage fallback:", fetchErr);
          
          // If fetchSession failed but we have sessionStorage indicating auth, 
          // and this is the first attempt, wait a bit and retry (cookies might not be set yet)
          if (storageAuth && retryCount === 0) {
            console.log("🔄 ProtectedRoute: fetchSession failed but sessionStorage indicates auth, retrying in 500ms...");
            await new Promise(resolve => setTimeout(resolve, 500));
            resetSessionCache(); // Clear cache before retry
            return validateSession(1); // Retry once
          }
          
          // If still failing but we have storage data, use it as temporary fallback
          if (storageAuth) {
            console.warn("⚠️ ProtectedRoute: Using sessionStorage fallback (cookies may not be set yet)");
            let parsedProfile = null;
            try {
              parsedProfile = storageProfile ? JSON.parse(storageProfile) : null;
            } catch {
              parsedProfile = null;
            }
            
            session = {
              isAuthenticated: true,
              user: parsedProfile || { role: storageRole },
              role: storageRole,
            };
          }
        }
        
        if (!mounted) return;
        
        const isAuth = session?.isAuthenticated || false;
        const user = session?.user || null;
        const role = (session?.role || user?.role || storageRole || "").toString().toUpperCase();
        
        console.log(`🔒 ProtectedRoute: Session check - authenticated: ${isAuth}, role: ${role}, user:`, user ? "present" : "null");
        
        setState({
          loading: false,
          isAuthenticated: isAuth,
          user: user ? { ...user, role } : null,
        });
      } catch (err) {
        console.error("❌ ProtectedRoute: Failed to validate session:", err);
        if (mounted) {
          // Last resort: check sessionStorage
          const storageAuth = sessionStorage.getItem("isAuthenticated") === "true";
          const storageRole = sessionStorage.getItem("role") || "";
          const storageProfile = sessionStorage.getItem("userProfile");
          
          if (storageAuth && retryCount === 0) {
            // One more retry with delay
            console.log("🔄 ProtectedRoute: Error but sessionStorage indicates auth, retrying once more...");
            await new Promise(resolve => setTimeout(resolve, 500));
            resetSessionCache();
            return validateSession(1);
          }
          
          if (storageAuth) {
            // Use sessionStorage as fallback
            let parsedProfile = null;
            try {
              parsedProfile = storageProfile ? JSON.parse(storageProfile) : null;
            } catch {
              parsedProfile = null;
            }
            
            setState({
              loading: false,
              isAuthenticated: true,
              user: parsedProfile ? { ...parsedProfile, role: storageRole } : { role: storageRole },
            });
          } else {
            resetSessionCache();
            setState({ loading: false, isAuthenticated: false, user: null });
          }
        }
      }
    };
    
    validateSession();
    
    return () => {
      mounted = false;
    };
  }, [location.pathname, requiredRole]);

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
    // Get role from user object or fallback to sessionStorage
    const userRole = (state.user?.role || sessionStorage.getItem("role") || "").toString().toUpperCase();
    const normalizedUserRole = userRole.toLowerCase();

    console.log(`🔒 ProtectedRoute: Role check - required: "${normalizedRequiredRole}", user: "${normalizedUserRole}"`);

    if (normalizedUserRole !== normalizedRequiredRole) {
      console.warn(`❌ User role mismatch: expected "${normalizedRequiredRole}", got "${normalizedUserRole}", redirecting to home`);
      return <Navigate to="/" replace />;
    }
    
    console.log(`✅ ProtectedRoute: Role check passed for ${location.pathname}`);
  }

  return children;
};

export default ProtectedRoute;
