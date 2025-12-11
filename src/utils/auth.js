import { buildUrl } from "@/config/api";

let sessionPromise = null;

/**
 * Attempt to refresh the access token using refresh token from cookie
 */
async function tryRefreshToken() {
  try {
    const refreshRes = await fetch(buildUrl("auth/refresh"), {
      method: "POST",
      credentials: "include",
    });
    return refreshRes.ok;
  } catch (e) {
    console.error("Failed to refresh token:", e);
    return false;
  }
}

/**
 * Fetch the current authenticated session from the backend.
 * Relies on HttpOnly cookies (credentials: include).
 * 
 * Flow:
 * 1. Always try /auth/me first (uses cookies automatically)
 * 2. If 401, try token refresh
 * 3. If still fails, clear session and return unauthenticated
 * 4. Only fallback to sessionStorage if /auth/me endpoint doesn't exist (404)
 */
export async function fetchSession() {
  if (!sessionPromise) {
    sessionPromise = (async () => {
      // Fallback function - only used if /auth/me endpoint is unavailable (404)
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

      // Step 1: Try /auth/me endpoint (primary authentication method)
      let res = await fetch(buildUrl("auth/me"), {
        method: "GET",
        credentials: "include",
      });

      // Step 2: If 401, try refreshing the token
      if (res.status === 401) {
        console.log("🔄 Session expired, attempting token refresh...");
        const refreshed = await tryRefreshToken();
        
        if (refreshed) {
          // Retry /auth/me after successful refresh
          res = await fetch(buildUrl("auth/me"), {
            method: "GET",
            credentials: "include",
          });
        } else {
          // Refresh failed - clear session and return unauthenticated
          console.warn("❌ Token refresh failed, clearing session");
          clearSessionData();
          sessionPromise = null;
          return { isAuthenticated: false, user: null };
        }
      }

      // Step 3: Handle response
      if (res.status === 401) {
        // Still 401 after refresh attempt - session is invalid
        clearSessionData();
        sessionPromise = null;
        return { isAuthenticated: false, user: null };
      }

      if (!res.ok) {
        if (res.status === 404) {
          // Backend doesn't have /auth/me endpoint - fallback to storage
          console.warn("⚠️ /auth/me endpoint not found, using sessionStorage fallback");
          return fromStorage();
        }
        sessionPromise = null;
        throw new Error(`Failed to fetch session: ${res.status}`);
      }

      // Step 4: Parse successful response
      const data = await res.json().catch(() => ({}));
      const user = data?.user || data?.data?.user || data?.data || null;
      const role = (data?.role || data?.data?.role || user?.role || "USER").toString().toUpperCase();
      const userWithRole = user ? { ...user, role } : null;

      const normalized = {
        isAuthenticated: true,
        user: userWithRole,
        role,
      };

      // Step 5: Update sessionStorage for UI hints (cookies are source of truth)
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
 * Clear all session data (both storage and cache)
 * Use this on logout or when session is invalid
 */
export function clearSessionData() {
  sessionStorage.removeItem("isAuthenticated");
  sessionStorage.removeItem("role");
  sessionStorage.removeItem("userType");
  sessionStorage.removeItem("userProfile");
  sessionStorage.removeItem("userName");
  sessionStorage.removeItem("userEmail");
  sessionStorage.removeItem("userPhone");
  sessionStorage.removeItem("authToken");
  sessionStorage.removeItem("accessToken");
  localStorage.removeItem("userProfile");
  sessionPromise = null;
}

/**
 * Clear cached session so the next call refetches from backend.
 * Use this when you want to force a refetch but keep sessionStorage.
 */
export function resetSessionCache() {
  sessionPromise = null;
}

/**
 * Lightweight synchronous check based on cached flags.
 * NOTE: This is only for UI hints. Real authentication is checked via fetchSession().
 * For protected routes, always use fetchSession() instead.
 */
export function isAuthenticated() {
  return sessionStorage.getItem("isAuthenticated") === "true";
}

