import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { apiFetch, setAuthFailureHandler } from "@/config/api";
import { fetchSession, clearSessionData, resetSessionCache } from "@/utils/auth";

const AuthContext = createContext(null);
const AUTH_CHANNEL_NAME = "auth-sync";
const AUTH_STORAGE_EVENT_KEY = "__auth_sync_event__";
const TAB_ID = Math.random().toString(36).slice(2);

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
  const channelRef = useRef(null);

  const handleCrossTabEvent = useCallback(async (eventType) => {
    if (eventType === "logout") {
      clearSessionData();
      setUser(null);
      return;
    }

    if (eventType === "session-updated") {
      resetSessionCache();
      const session = await fetchSession(true);
      setUser(session?.isAuthenticated ? session.user : null);
    }
  }, []);

  const emitCrossTabEvent = useCallback((eventType) => {
    const payload = {
      type: eventType,
      source: TAB_ID,
      timestamp: Date.now(),
    };

    if (channelRef.current) {
      channelRef.current.postMessage(payload);
    }

    // Storage event fallback for browsers without BroadcastChannel support.
    localStorage.setItem(AUTH_STORAGE_EVENT_KEY, JSON.stringify(payload));
    localStorage.removeItem(AUTH_STORAGE_EVENT_KEY);
  }, []);

  const syncSession = useCallback(async (forceRefresh = true) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      const session = await fetchSession(forceRefresh);
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

  // Bootstrap current cookie session with /auth/me
  useEffect(() => {
    syncSession(true);
  }, [syncSession]);

  // Keep context in sync after automatic refresh or forced logout.
  useEffect(() => {
    const onTokenRefreshed = () => {
      syncSession(true);
    };

    const onLogoutEvent = () => {
      clearSessionData();
      setUser(null);
    };

    window.addEventListener("auth:token-refreshed", onTokenRefreshed);
    window.addEventListener("auth:logout", onLogoutEvent);
    return () => {
      window.removeEventListener("auth:token-refreshed", onTokenRefreshed);
      window.removeEventListener("auth:logout", onLogoutEvent);
    };
  }, [syncSession]);

  // Cross-tab auth synchronization.
  useEffect(() => {
    if ("BroadcastChannel" in window) {
      channelRef.current = new BroadcastChannel(AUTH_CHANNEL_NAME);
      channelRef.current.onmessage = (event) => {
        const data = event?.data;
        if (!data || data.source === TAB_ID) return;
        handleCrossTabEvent(data.type);
      };
    }

    const onStorage = (event) => {
      if (event.key !== AUTH_STORAGE_EVENT_KEY || !event.newValue) return;
      try {
        const data = JSON.parse(event.newValue);
        if (!data || data.source === TAB_ID) return;
        handleCrossTabEvent(data.type);
      } catch {
        // Ignore invalid cross-tab payloads.
      }
    };

    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      if (channelRef.current) {
        channelRef.current.close();
        channelRef.current = null;
      }
    };
  }, [handleCrossTabEvent]);

  // API wrapper calls this when refresh fails (hard auth failure).
  useEffect(() => {
    setAuthFailureHandler(() => {
      clearSessionData();
      setUser(null);
      emitCrossTabEvent("logout");
    });

    return () => {
      setAuthFailureHandler(null);
    };
  }, [emitCrossTabEvent]);

  // Supports both:
  // 1) login({ email, password, role }) canonical flow
  // 2) login(sessionObject) for backward compatibility
  const login = useCallback(async (params) => {
    const isSessionObject = params?.isAuthenticated || params?.user;
    if (isSessionObject) {
      const nextUser = params?.isAuthenticated ? params.user : null;
      setUser(nextUser || null);
      emitCrossTabEvent("session-updated");
      return params;
    }

    const credentials = params || {};
    await apiFetch("auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    resetSessionCache();
    const session = await fetchSession(true);
    if (!session?.isAuthenticated) {
      throw new Error("Login succeeded but session validation failed");
    }

    setUser(session.user);
    emitCrossTabEvent("session-updated");
    return session;
  }, [emitCrossTabEvent]);

  const logout = useCallback(async () => {
    try {
      await apiFetch("auth/logout", {
        method: "POST",
      });
    } catch {
      // Continue even if logout API fails
    }

    clearSessionData();
    setUser(null);
    emitCrossTabEvent("logout");
  }, [emitCrossTabEvent]);

  const refreshAuth = useCallback(async () => {
    await syncSession(true);
  }, [syncSession]);

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
    syncSession: refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
