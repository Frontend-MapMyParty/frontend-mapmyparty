import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { fetchSession, clearSessionData, resetSessionCache } from "@/utils/auth";
import { buildUrl } from "@/config/api";

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchingRef = useRef(false);

  const initAuth = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      const session = await fetchSession(true);
      if (session?.isAuthenticated) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  // Single auth fetch on mount
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Listen for token refresh events from api.js
  useEffect(() => {
    const handleTokenRefresh = () => {
      refreshAuth();
    };
    window.addEventListener("auth:token-refreshed", handleTokenRefresh);
    return () => window.removeEventListener("auth:token-refreshed", handleTokenRefresh);
  }, []);

  const login = useCallback((session) => {
    if (session?.user) {
      setUser(session.user);
    } else if (session?.isAuthenticated && session?.user) {
      setUser(session.user);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(buildUrl("auth/logout"), {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Continue even if logout API fails
    }

    clearSessionData();
    resetSessionCache();
    setUser(null);
  }, []);

  const refreshAuth = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      resetSessionCache();
      const session = await fetchSession(true);
      if (session?.isAuthenticated) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  const isAuthenticated = !!user;
  const role = user?.role || null;

  const value = {
    user,
    role,
    isAuthenticated,
    loading,
    login,
    logout,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
