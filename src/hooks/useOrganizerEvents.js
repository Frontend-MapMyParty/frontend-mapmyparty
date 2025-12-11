import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { apiFetch } from "@/config/api";

// Global cache and request deduplication
const eventsCache = {
  data: null,
  filters: null,
  timestamp: null,
  CACHE_DURATION: 30000, // 30 seconds cache
};

const pendingRequests = new Map(); // Track pending requests by filter key

/**
 * Global function to invalidate the events cache
 * Can be called from anywhere (e.g., after creating/updating/deleting events)
 */
export const invalidateOrganizerEventsCache = () => {
  eventsCache.data = null;
  eventsCache.filters = null;
  eventsCache.timestamp = null;
  pendingRequests.clear();
  console.log("🗑️ Organizer events cache invalidated");
};

/**
 * Generate a cache key from filters
 */
const getCacheKey = (filterParams) => {
  const normalized = {
    category: filterParams.category || null,
    status2: filterParams.status2 || null,
    search: filterParams.search || null,
    startDateFrom: filterParams.startDateFrom || null,
    startDateTo: filterParams.startDateTo || null,
    page: filterParams.page || 1,
    limit: filterParams.limit || 20,
  };
  return JSON.stringify(normalized);
};

/**
 * Check if cache is still valid
 */
const isCacheValid = (cacheKey) => {
  if (!eventsCache.data || eventsCache.filters !== cacheKey) {
    return false;
  }
  const now = Date.now();
  return eventsCache.timestamp && (now - eventsCache.timestamp) < eventsCache.CACHE_DURATION;
};

/**
 * Hook for fetching and managing organizer's events from the API
 * Supports filtering, pagination, search, and date range queries
 * Includes caching and request deduplication to prevent unnecessary API calls
 */
export const useOrganizerEvents = (initialFilters = {}) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalPages: 0,
    totalEvents: 0,
  });

  // Filters state
  const [filters, setFilters] = useState({
    category: initialFilters.category || null,
    status2: initialFilters.status2 || null,
    search: initialFilters.search || null,
    startDateFrom: initialFilters.startDateFrom || null,
    startDateTo: initialFilters.startDateTo || null,
    page: initialFilters.page || 1,
    limit: initialFilters.limit || 20,
  });

  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Build query string from filters
   */
  const buildQueryString = useCallback((filterParams) => {
    const params = new URLSearchParams();
    
    Object.entries(filterParams).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        params.append(key, value);
      }
    });

    const queryString = params.toString();
    return queryString ? `?${queryString}` : "";
  }, []);

  /**
   * Fetch events from API with caching and deduplication
   */
  const fetchEvents = useCallback(async (filterParams, forceRefresh = false) => {
    // Use provided filters or fallback to state
    const activeFilters = filterParams || filters;
    const cacheKey = getCacheKey(activeFilters); // Use activeFilters, not filterParams
    
    // Check cache first (unless force refresh)
    if (!forceRefresh && isCacheValid(cacheKey)) {
      console.log("📦 Using cached events data");
      if (isMountedRef.current) {
        setEvents(eventsCache.data.events);
        setPagination(eventsCache.data.pagination);
        setError(null);
        setLoading(false);
      }
      return;
    }

    // Check if there's already a pending request for these filters
    if (pendingRequests.has(cacheKey)) {
      console.log("⏳ Waiting for existing request...");
      try {
        const result = await pendingRequests.get(cacheKey);
        if (isMountedRef.current) {
          setEvents(result.events);
          setPagination(result.pagination);
          setError(null);
          setLoading(false);
        }
        return;
      } catch (err) {
        // If pending request failed, continue with new request
      }
    }

    // Create new request
    const requestPromise = (async () => {
      try {
        if (isMountedRef.current) {
          setLoading(true);
          setError(null);
        }

        const queryString = buildQueryString(activeFilters);
        const url = `api/event/my-events${queryString}`;
        
        // Get token if available (for Bearer auth, cookies are handled automatically via credentials: 'include')
        const token = sessionStorage.getItem("authToken") || sessionStorage.getItem("accessToken");
        const headers = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
          console.log("🔑 Using Bearer token for authentication");
        } else {
          console.log("🍪 Using cookie authentication (credentials: include)");
        }
        
        console.log("🌐 Fetching events from:", url);
        console.log("📋 Query params:", queryString || "none");
        
        const response = await apiFetch(url, {
          method: "GET",
          credentials: "include",
          headers,
        });

        console.log("✅ API Response received:", response);
        console.log("📅 Events count:", response.data?.events?.length || 0);

        // Handle API response format: { success: true, data: { events: [...] }, message: "..." }
        if (!response.success) {
          throw new Error(response.message || "Failed to fetch events");
        }

        // Extract events from response.data.events (as per API documentation)
        const eventsData = response.data?.events || [];
        const paginationData = response.data?.pagination || {};

        // Ensure events is an array
        const processedEvents = Array.isArray(eventsData) ? eventsData : [];
        
        // Handle pagination (API may or may not include pagination in response)
        const processedPagination = {
          page: paginationData.page || paginationData.currentPage || activeFilters.page || 1,
          limit: paginationData.limit || activeFilters.limit || 20,
          totalPages: paginationData.totalPages || Math.ceil(processedEvents.length / (paginationData.limit || activeFilters.limit || 20)) || 1,
          totalEvents: paginationData.total || paginationData.totalEvents || processedEvents.length,
        };

        // Update cache
        eventsCache.data = {
          events: processedEvents,
          pagination: processedPagination,
        };
        eventsCache.filters = cacheKey;
        eventsCache.timestamp = Date.now();

        if (isMountedRef.current) {
          setEvents(processedEvents);
          setPagination(processedPagination);
          setError(null);
        }

        return { events: processedEvents, pagination: processedPagination };
      } catch (apiError) {
        // Handle API error responses according to documentation
        const errorStatus = apiError.status || apiError.data?.code;
        let errorMessage = apiError.message || "Failed to fetch events";

        // Parse error response based on API documentation
        if (apiError.data) {
          errorMessage = apiError.data.message || apiError.data.errorMessage || errorMessage;
        }

        // Handle specific error codes from API documentation
        if (errorStatus === 401) {
          errorMessage = apiError.data?.message || "Authentication required. Please provide a valid token.";
          console.error("🔴 401 Unauthorized:", errorMessage);
          // Clear session and redirect to auth (handled by api.js)
        } else if (errorStatus === 403) {
          errorMessage = apiError.data?.message || "Forbidden: Organizer role required.";
          console.error("🔴 403 Forbidden:", errorMessage);
        } else if (errorStatus === 404) {
          errorMessage = apiError.data?.message || "No event organizer found for this user.";
          console.error("🔴 404 Not Found:", errorMessage);
        } else if (errorStatus === 500) {
          errorMessage = apiError.data?.message || "Internal server error. Please try again later.";
          console.error("🔴 500 Server Error:", errorMessage);
        }

        if (isMountedRef.current) {
          setError(errorMessage);
          setEvents([]);
        }

        throw apiError;
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
        // Remove from pending requests
        pendingRequests.delete(cacheKey);
      }
    })();

    // Store pending request
    pendingRequests.set(cacheKey, requestPromise);

    try {
      await requestPromise;
    } catch (err) {
      console.error("❌ Error fetching organizer events:", err);
      if (isMountedRef.current) {
        setError(err.message || "Failed to fetch events");
        setEvents([]);
      }
    }
  }, [buildQueryString, filters]); // Include filters for fallback

  /**
   * Update filters and refetch
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => {
      const updated = { ...prev, ...newFilters };
      // Reset to page 1 when filters change (except when explicitly setting page)
      if (!newFilters.page && (newFilters.category || newFilters.status2 || newFilters.search)) {
        updated.page = 1;
      }
      return updated;
    });
  }, []);

  /**
   * Change page
   */
  const changePage = useCallback((page) => {
    updateFilters({ page });
  }, [updateFilters]);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setFilters({
      category: null,
      status2: null,
      search: null,
      startDateFrom: null,
      startDateTo: null,
      page: 1,
      limit: 20,
    });
    // Clear cache when filters are cleared
    eventsCache.data = null;
    eventsCache.filters = null;
    eventsCache.timestamp = null;
  }, []);

  /**
   * Refresh events (force refetch)
   */
  const refresh = useCallback(() => {
    fetchEvents(filters, true);
  }, [fetchEvents, filters]);

  /**
   * Invalidate cache (useful after mutations like create/update/delete)
   */
  const invalidateCache = useCallback(() => {
    eventsCache.data = null;
    eventsCache.filters = null;
    eventsCache.timestamp = null;
  }, []);

  // Fetch events when filters change (with debouncing for search)
  const filtersRef = useRef(filters);
  const searchTimeoutRef = useRef(null);
  
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Track previous filter values to detect changes and initial mount
  const prevFiltersRef = useRef(null);
  const hasInitializedRef = useRef(false);
  
  // Handle filter changes (with debouncing for search)
  useEffect(() => {
    const prevFilters = prevFiltersRef.current;
    const isInitialMount = prevFilters === null || !hasInitializedRef.current;

    // On initial mount, fetch immediately
    if (isInitialMount) {
      console.log("🔄 Initial fetch on mount - My Events");
      console.log("📋 Filters:", filters);
      fetchEvents(filters, false); // Allow cache on mount, but still trigger fetch if no cache
      prevFiltersRef.current = filters;
      hasInitializedRef.current = true;
      return;
    }

    const hasSearchChanged = prevFilters.search !== filters.search;
    const hasOtherFiltersChanged = 
      prevFilters.category !== filters.category ||
      prevFilters.status2 !== filters.status2 ||
      prevFilters.page !== filters.page ||
      prevFilters.limit !== filters.limit ||
      prevFilters.startDateFrom !== filters.startDateFrom ||
      prevFilters.startDateTo !== filters.startDateTo;

    // Clear any pending search timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }

    // If search changed, debounce it
    if (hasSearchChanged) {
      searchTimeoutRef.current = setTimeout(() => {
        fetchEvents(filters);
        prevFiltersRef.current = filters;
      }, 300);
    } 
    // If other filters changed, fetch immediately
    else if (hasOtherFiltersChanged) {
      fetchEvents(filters);
      prevFiltersRef.current = filters;
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [filters, fetchEvents]);

  // Calculate statistics from events (memoized)
  const statistics = useMemo(() => ({
    totalEvents: pagination.totalEvents || events.length,
    publishedEvents: events.filter((e) => {
      const status2 = (e.status2 || e.status || "").toUpperCase();
      return status2 === "PUBLISHED" || status2 === "ACTIVE";
    }).length,
    draftEvents: events.filter((e) => 
      (e.status2 || e.status) === "DRAFT" || 
      (e.status2 || e.status)?.toLowerCase() === "draft"
    ).length,
    totalTicketsSold: events.reduce((sum, e) => 
      sum + (e.stats?.totalTicketsSold || e.ticketsSold || 0), 0
    ),
    totalRevenue: events.reduce((sum, e) => 
      sum + (e.stats?.totalRevenue || e.revenue || 0), 0
    ),
    totalAttendees: events.reduce((sum, e) => 
      sum + (e.stats?.totalTicketsSold || e.attendees || e.ticketsSold || 0), 0
    ),
  }), [events, pagination.totalEvents]);

  return {
    events,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    changePage,
    clearFilters,
    refresh,
    statistics,
    invalidateCache,
  };
};
