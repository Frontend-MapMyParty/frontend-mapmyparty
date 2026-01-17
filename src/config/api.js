export const API_BASE_URL = (import.meta?.env?.VITE_API_BASE_URL || "http://localhost:9000/api/").replace(/\/$/, "");

export function buildUrl(path = "") {
  let cleanPath = String(path).replace(/^\/+/, "");

  // If base already ends with /api and caller also prefixes api/, avoid double api/api
  if (API_BASE_URL.endsWith("/api") && (cleanPath === "api" || cleanPath.startsWith("api/"))) {
    cleanPath = cleanPath.replace(/^api\/?/, "");
  }

  return `${API_BASE_URL}/${cleanPath}`;
}

// Create a custom fetch function with default options
const customFetch = async (url, options = {}) => {
  // Destructure headers separately to avoid overwriting them
  const { headers = {}, body, ...otherOptions } = options;
  
  // Only set Content-Type header if body is not FormData
  // (FormData sets its own Content-Type with boundary)
  const isFormData = body instanceof FormData;
  
  const fetchOptions = {
    credentials: 'include', // This is crucial for sending/receiving cookies
    headers: isFormData ? {
      ...headers,
    } : {
      'Content-Type': 'application/json',
      ...headers,
    },
    body,
    ...otherOptions,
  };

  console.log(`🌐 Fetching ${url}`);
  console.log(`📋 Method: ${fetchOptions.method || 'GET'}`);
  console.log(`📋 Headers:`, fetchOptions.headers);
  console.log(`📋 Body type:`, typeof fetchOptions.body);
  console.log(`📋 Is FormData:`, fetchOptions.body instanceof FormData);
  console.log(`📋 Body preview:`, 
    fetchOptions.body instanceof FormData ? '[FormData]' : 
    typeof fetchOptions.body === 'string' ? fetchOptions.body.substring(0, 200) : 
    fetchOptions.body
  );
  
  // Validate body for non-GET requests
  if (fetchOptions.method && fetchOptions.method !== 'GET' && fetchOptions.method !== 'HEAD') {
    if (!fetchOptions.body) {
      console.error('⚠️ Warning: No body provided for', fetchOptions.method, 'request');
    } else if (typeof fetchOptions.body === 'string' && fetchOptions.body.length === 0) {
      console.error('⚠️ Warning: Empty string body for', fetchOptions.method, 'request');
    }
  }

  const tryRefresh = async () => {
    try {
      const refreshRes = await fetch(buildUrl("auth/refresh"), {
        method: "POST",
        credentials: "include",
      });
      if (!refreshRes.ok) return false;
      return true;
    } catch (e) {
      console.error("Failed to refresh session:", e);
      return false;
    }
  };

  const doFetch = async (retrying = false) => {
    const res = await fetch(url, fetchOptions);

    if (res.status === 401 && !retrying) {
      console.warn("401 detected, attempting refresh...");
      const refreshed = await tryRefresh();
      if (refreshed) {
        return doFetch(true);
      }
    }
    
    // Handle response
    if (!res.ok) {
      let errorData = {};
      const contentType = res.headers.get('content-type');
      
      try {
        if (contentType && contentType.includes('application/json')) {
          errorData = await res.json();
        } else {
          const textError = await res.text();
          errorData = { message: textError };
        }
      } catch (parseError) {
        console.error('Failed to parse error response:', parseError);
        errorData = { message: 'Failed to parse error response' };
      }
      
      // Handle 401 Unauthorized - session is invalid or expired
      if (res.status === 401) {
        console.error('🔴 401 UNAUTHORIZED after refresh attempt: Session is invalid or expired!');
        // Import and use clearSessionData from auth utils (avoid circular dependency by using dynamic import if needed)
        // For now, clear sessionStorage here
        sessionStorage.removeItem("isAuthenticated");
        sessionStorage.removeItem("role");
        sessionStorage.removeItem("userType");
        sessionStorage.removeItem("userProfile");
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("accessToken");
        localStorage.removeItem("userProfile");
        // Don't redirect here - let ProtectedRoute handle it
      }
      
      // Handle 500 Internal Server Error - log details
      if (res.status === 500) {
        console.error('🔴 500 INTERNAL SERVER ERROR:');
        console.error('   URL:', url);
        console.error('   Method:', fetchOptions.method || 'GET');
        console.error('   Error data:', errorData);
        console.error('   Backend message:', errorData.errorMessage || errorData.message);
        console.error('');
        console.error('💡 Common causes:');
        console.error('   1. Backend validation failed (check required fields)');
        console.error('   2. Database connection issue');
        console.error('   3. File upload size exceeded');
        console.error('   4. Missing backend middleware (multer for files)');
        console.error('   5. Backend code error (check backend logs)');
      }
      
      // Backend uses 'errorMessage' field
      const errorMessage = errorData.errorMessage || errorData.message || errorData.error || `HTTP ${res.status}: An error occurred`;
      const error = new Error(errorMessage);
      error.status = res.status;
      error.data = errorData;
      throw error;
    }
    return res;
  };

  const res = await doFetch(false);

  // Handle different response types
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
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
