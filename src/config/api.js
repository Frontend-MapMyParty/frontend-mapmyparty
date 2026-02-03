const rawEnvBase = import.meta.env.VITE_API_BASE_URL;
const hostedDefault = "http://localhost:9090/api";

// Prefer env; fallback to hosted default
export const API_BASE_URL = (rawEnvBase || hostedDefault).replace(/\/+$/, "");

// Only log in development
if (import.meta.env.DEV && !rawEnvBase) {
  console.warn(`VITE_API_BASE_URL is not set. Using default: ${hostedDefault}`);
}

export function buildUrl(path = "") {
  let cleanPath = String(path).replace(/^\/+/, "");

  // If base already ends with /api and caller also prefixes api/, avoid double api/api
  if (API_BASE_URL.endsWith("/api") && (cleanPath === "api" || cleanPath.startsWith("api/"))) {
    cleanPath = cleanPath.replace(/^api\/?/, "");
  }
 
  return `${API_BASE_URL}/${cleanPath}`;
}

// Lazy import to avoid circular dependency
let tryRefreshToken = null;
let clearSessionData = null;

async function getAuthUtils() {
  if (!tryRefreshToken || !clearSessionData) {
    const authModule = await import("@/utils/auth");
    tryRefreshToken = authModule.tryRefreshToken;
    clearSessionData = authModule.clearSessionData;
  }
  return { tryRefreshToken, clearSessionData };
}

// Create a custom fetch function with default options
const customFetch = async (url, options = {}) => {
  const { headers = {}, body, ...otherOptions } = options;

  // Only set Content-Type header if body is not FormData
  const isFormData = body instanceof FormData;

  const fetchOptions = {
    credentials: "include",
    headers: isFormData
      ? { ...headers }
      : { "Content-Type": "application/json", ...headers },
    body,
    ...otherOptions,
  };

  const doFetch = async (retrying = false) => {
    const res = await fetch(url, fetchOptions);

    // Handle 401 with token refresh (only once)
    if (res.status === 401 && !retrying) {
      const { tryRefreshToken: refresh } = await getAuthUtils();
      const refreshed = await refresh();
      if (refreshed) {
        return doFetch(true);
      }
    }

    if (!res.ok) {
      let errorData = {};
      const contentType = res.headers.get("content-type");

      try {
        if (contentType && contentType.includes("application/json")) {
          errorData = await res.json();
        } else {
          const textError = await res.text();
          errorData = { message: textError };
        }
      } catch (parseError) {
        errorData = { message: "Failed to parse error response" };
      }

      // Handle 401 - clear session data
      if (res.status === 401) {
        const { clearSessionData: clearSession } = await getAuthUtils();
        clearSession();
      }

      // Log 500 errors in development only
      if (res.status === 500 && import.meta.env.DEV) {
        console.error("500 Error:", url, errorData);
      }

      const errorMessage =
        errorData.errorMessage ||
        errorData.message ||
        errorData.error ||
        `HTTP ${res.status}: An error occurred`;
      const error = new Error(errorMessage);
      error.status = res.status;
      error.data = errorData;
      throw error;
    }
    return res;
  };

  const res = await doFetch(false);

  // Handle different response types
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
};

export async function apiFetch(path, { headers = {}, parse = "json", ...options } = {}) {
  const url = /^https?:/i.test(path) ? path : buildUrl(path);
  
  try {
    const response = await customFetch(url, {
      headers: {
        ...headers,
        // Add any additional headers here
      },
      ...options,
    });
    
    return response;
  } catch (error) {
    console.error(`API Error for ${path}:`, error);
    throw error;
  }
}
