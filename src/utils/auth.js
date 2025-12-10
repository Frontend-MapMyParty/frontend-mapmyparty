import { buildUrl } from "@/config/api";

let sessionPromise = null;

/**
 * Fetch the current authenticated session from the backend.
 * Relies on HttpOnly cookies (credentials: include).
 */
export async function fetchSession() {
  if (!sessionPromise) {
    sessionPromise = (async () => {
      const fromStorage = () => {
        const storedProfile = sessionStorage.getItem("userProfile");
        const storedRole = sessionStorage.getItem("role") || "USER";
        const storedType = sessionStorage.getItem("userType") || null;
        const isAuth = sessionStorage.getItem("isAuthenticated") === "true";
        let parsedProfile = null;
        try {
          parsedProfile = storedProfile ? JSON.parse(storedProfile) : null;
        } catch {
          parsedProfile = null;
        }
        return {
          isAuthenticated: isAuth,
          user: parsedProfile ? { ...parsedProfile, role: storedRole, type: storedType } : null,
          role: storedRole,
        };
      };

      const res = await fetch(buildUrl("auth/me"), {
        method: "GET",
        credentials: "include",
      });

      if (res.status === 401) {
        sessionPromise = null; // allow retry after unauthorized
        return { isAuthenticated: false, user: null };
      }

      if (!res.ok) {
        if (res.status === 404) {
          // If backend has no /auth/me, fall back to cached hints
          return fromStorage();
        }
        sessionPromise = null;
        throw new Error(`Failed to fetch session: ${res.status}`);
      }

      const data = await res.json().catch(() => ({}));
      const user = data?.user || data?.data?.user || data?.data || null;
      const role = (data?.role || data?.data?.role || user?.role || "USER").toString().toUpperCase();
      const userWithRole = user ? { ...user, role } : null;

      const normalized = {
        isAuthenticated: true,
        user: userWithRole,
        role,
      };

      try {
        sessionStorage.setItem("isAuthenticated", "true");
        if (role) sessionStorage.setItem("role", role);
        if (userWithRole?.type) sessionStorage.setItem("userType", userWithRole.type);
        if (userWithRole) sessionStorage.setItem("userProfile", JSON.stringify(userWithRole));
      } catch (e) {
        // best-effort; ignore storage errors
      }

      return normalized;
    })();
  }

  return sessionPromise;
}

/**
 * Clear cached session so the next call refetches from backend.
 */
export function resetSessionCache() {
  sessionPromise = null;
}

/**
 * Lightweight synchronous check based on cached flags.
 * Relies on server-set HttpOnly cookies for real auth; this is only for UI hints.
 */
export function isAuthenticated() {
  return sessionStorage.getItem("isAuthenticated") === "true";
}

