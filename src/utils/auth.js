import { apiFetch } from "@/config/api";

let sessionPromise = null;
let cachedSession = null;
let sessionCacheTime = 0;

// In-memory cache only. Cookies remain the only auth source of truth.
const SESSION_CACHE_TTL = 60 * 1000;

function normalizeSessionResponse(data) {
  const payload = data?.data || data || {};
  const user = payload?.user || data?.user || null;
  const role = (
    payload?.role ||
    data?.role ||
    user?.role ||
    null
  )
    ?.toString()
    .toUpperCase();

  if (!user) {
    return { isAuthenticated: false, user: null, role: null };
  }

  return {
    isAuthenticated: true,
    user: role ? { ...user, role } : user,
    role: role || null,
    organizer: payload?.organizer || data?.organizer || null,
    organizerWarning: payload?.organizerWarning || data?.organizerWarning || null,
  };
}

async function fetchSessionInternal() {
  try {
    const data = await apiFetch("auth/me", { method: "GET" });
    return normalizeSessionResponse(data);
  } catch (error) {
    if (error?.status === 401) {
      return { isAuthenticated: false, user: null, role: null };
    }
    throw error;
  }
}

export async function fetchSession(forceRefresh = false) {
  if (forceRefresh) {
    resetSessionCache();
  }

  if (cachedSession && Date.now() - sessionCacheTime < SESSION_CACHE_TTL) {
    return cachedSession;
  }

  if (!sessionPromise) {
    sessionPromise = fetchSessionInternal()
      .then((session) => {
        cachedSession = session;
        sessionCacheTime = Date.now();
        return session;
      })
      .finally(() => {
        sessionPromise = null;
      });
  }

  return sessionPromise;
}

export function getCachedSession() {
  if (cachedSession && Date.now() - sessionCacheTime < SESSION_CACHE_TTL) {
    return cachedSession;
  }
  return null;
}

export async function tryRefreshToken() {
  try {
    await apiFetch("auth/refresh", { method: "POST" });
    return true;
  } catch {
    return false;
  }
}

// Cache clear only. No token/user profile persistence in web storage.
export function clearSessionData() {
  resetSessionCache();
}

export function resetSessionCache() {
  sessionPromise = null;
  cachedSession = null;
  sessionCacheTime = 0;
}

export function isAuthenticated() {
  return Boolean(getCachedSession()?.isAuthenticated);
}
