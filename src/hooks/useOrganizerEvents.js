import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/config/api";

/**
 * Hook for fetching and managing organizer's events from the API
 * Supports filtering, pagination, search, and date range queries
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
   * Fetch events from API
   */
  const fetchEvents = useCallback(async (filterParams = filters) => {
    try {
      setLoading(true);
      setError(null);

      const queryString = buildQueryString(filterParams);
      
      try {
        const response = await apiFetch(`api/event/my-events${queryString}`, {
          method: "GET",
          credentials: "include"
        });

        console.log("📅 Fetched organizer events:", response);

        // Handle different response structures
        // Backend returns: { code, data: { events: [], pagination: {} }, success, message }
        const eventsData = response.data?.events || response.events || response.data || response;
        const paginationData = response.data?.pagination || response.pagination || {};

        setEvents(Array.isArray(eventsData) ? eventsData : []);
        setPagination({
          page: paginationData.page || paginationData.currentPage || filterParams.page || 1,
          limit: paginationData.limit || filterParams.limit || 20,
          totalPages: paginationData.totalPages || 1,
          totalEvents: paginationData.total || paginationData.totalEvents || (Array.isArray(eventsData) ? eventsData.length : 0),
        });
      } catch (apiError) {
        // Check if it's a 404 error (endpoint not implemented yet)
        if (apiError.message?.includes("404") || apiError.message?.includes("Cannot GET")) {
          console.warn("⚠️ API endpoint not available yet. Using localStorage fallback.");
          
          // Fallback to localStorage data
          const STORAGE_KEY = "mapMyParty_events";
          const stored = localStorage.getItem(STORAGE_KEY);
          const localEvents = stored ? JSON.parse(stored) : [];
          
          // Apply client-side filtering
          let filteredEvents = [...localEvents];
          
          // Filter by search
          if (filterParams.search) {
            const searchLower = filterParams.search.toLowerCase();
            filteredEvents = filteredEvents.filter(event => 
              (event.eventTitle || event.title || "").toLowerCase().includes(searchLower) ||
              (event.description || "").toLowerCase().includes(searchLower)
            );
          }
          
          // Filter by category
          if (filterParams.category) {
            filteredEvents = filteredEvents.filter(event => 
              (event.mainCategory || event.category || "").toUpperCase() === filterParams.category.toUpperCase()
            );
          }
          
          // Filter by status
          if (filterParams.status2) {
            filteredEvents = filteredEvents.filter(event => 
              (event.status || "").toUpperCase() === filterParams.status2.toUpperCase()
            );
          }
          
          // Apply pagination
          const page = filterParams.page || 1;
          const limit = filterParams.limit || 20;
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          const paginatedEvents = filteredEvents.slice(startIndex, endIndex);
          
          setEvents(paginatedEvents);
          setPagination({
            page,
            limit,
            totalPages: Math.ceil(filteredEvents.length / limit) || 1,
            totalEvents: filteredEvents.length,
          });
          
          // Set a warning message instead of error
          setError("Using local data - API endpoint pending backend implementation");
        } else {
          throw apiError;
        }
      }
    } catch (err) {
      console.error("❌ Error fetching organizer events:", err);
      setError(err.message || "Failed to fetch events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [filters, buildQueryString]);

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
  }, []);

  /**
   * Refresh events (refetch with current filters)
   */
  const refresh = useCallback(() => {
    fetchEvents(filters);
  }, [fetchEvents, filters]);

  // Fetch events when filters change
  useEffect(() => {
    fetchEvents(filters);
  }, [filters, fetchEvents]);

  // Calculate statistics from events
  const statistics = {
    totalEvents: pagination.totalEvents || events.length,
    publishedEvents: events.filter((e) => 
      (e.status2 || e.status) === "PUBLISHED" || 
      (e.status2 || e.status)?.toLowerCase() === "published"
    ).length,
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
  };

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
  };
};

