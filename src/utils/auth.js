import { buildUrl } from "@/config/api";

let sessionPromise = null;
let isRefreshing = false;
let refreshSubscribers = [];

/**
 * Subscribe to token refresh completion
 */
function subscribeToRefresh(callback) {
  refreshSubscribers.push(callback);
}

/**
 * Notify all subscribers of refresh result
 */
function notifyRefreshSubscribers(success) {
  refreshSubscribers.forEach(callback => callback(success));
  refreshSubscribers = [];
}

/**
 * Attempt to refresh the access token using refresh token from cookie.
 * Handles concurrent refresh requests by queuing them.
 * @returns {Promise<boolean>} Whether the refresh was successful
 */
export async function tryRefreshToken() {
  // If already refreshing, wait for the result
  if (isRefreshing) {
    return new Promise(resolve => {
      subscribeToRefresh(resolve);
    });
  }

  isRefreshing = true;

  try {
    const refreshRes = await fetch(buildUrl("auth/refresh"), {
      method: "POST",
      credentials: "include",
    });
    const success = refreshRes.ok;
    notifyRefreshSubscribers(success);
    return success;
  } catch (e) {
    console.error("Failed to refresh token:", e);
    notifyRefreshSubscribers(false);
    return false;
  } finally {
    isRefreshing = false;
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
 */
export async function fetchSession(forceRefresh = false) {
  // Clear cache if force refresh requested
  if (forceRefresh) {
    sessionPromise = null;
  }

  if (!sessionPromise) {
    sessionPromise = fetchSessionInternal();
  }

  try {
    return await sessionPromise;
  } catch (error) {
    // Reset cache on error so next call retries
    sessionPromise = null;
    throw error;
  }
}

/**
 * Internal session fetch logic - separated to handle caching properly
 */
async function fetchSessionInternal() {
  // Step 1: Try /auth/me endpoint (primary authentication method)
  let res;
  try {
    res = await fetch(buildUrl("auth/me"), {
      method: "GET",
      credentials: "include",
    });
  } catch (networkError) {
    console.error("Network error fetching session:", networkError);
    throw new Error("Network error: Unable to verify session");
  }

  // Step 2: If 401, try refreshing the token
  if (res.status === 401) {
    const refreshed = await tryRefreshToken();

    if (refreshed) {
      // Retry /auth/me after successful refresh
      res = await fetch(buildUrl("auth/me"), {
        method: "GET",
        credentials: "include",
      });
    } else {
      // Refresh failed - clear session and return unauthenticated
      clearSessionData();
      return { isAuthenticated: false, user: null, role: null };
    }
  }

  // Step 3: Handle response
  if (res.status === 401) {
    // Still 401 after refresh attempt - session is invalid
    clearSessionData();
    return { isAuthenticated: false, user: null, role: null };
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch session: ${res.status}`);
  }

  // Step 4: Parse successful response
  const data = await res.json().catch(() => ({}));
  const payload = data?.data || data || {};
  const user = payload?.user || data?.user || null;
  const role = (payload?.role || data?.role || user?.role || "USER").toString().toUpperCase();
  const userWithRole = user ? { ...user, role } : null;
  const organizer = payload?.organizer || data?.organizer || null;
  const organizerWarning = payload?.organizerWarning || data?.organizerWarning || null;

  const normalized = {
    isAuthenticated: true,
    user: userWithRole,
    role,
    organizer,
    organizerWarning,
  };

  // Step 5: Update sessionStorage for UI hints (cookies are source of truth)
  syncSessionStorage(normalized);

  return normalized;
}

/**
 * Sync session data to sessionStorage for UI hints only.
 * Backend cookies remain the source of truth for authentication.
 */
function syncSessionStorage(session) {
  try {
    if (session.isAuthenticated) {
      sessionStorage.setItem("isAuthenticated", "true");
      if (session.role) sessionStorage.setItem("role", session.role);
      if (session.user?.type) sessionStorage.setItem("userType", session.user.type);
      if (session.user) sessionStorage.setItem("userProfile", JSON.stringify(session.user));
    } else {
      clearSessionData();
    }
  } catch (e) {
    // Ignore storage errors - sessionStorage is just for UI hints
  }
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
  sessionStorage.removeItem("authProvider");
  sessionStorage.removeItem("hasPassword");
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

