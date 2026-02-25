import { useState, useEffect, useCallback, useRef } from "react";
import { apiFetch } from "@/config/api";

/**
 * Hook for fetching recent bookings across all organizer events
 * Fetches recent booking data from /api/organizer/me/bookings/recent
 */
export const useRecentBookings = (limit = 10) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Fetch recent bookings from API
   */
  const fetchBookings = useCallback(async () => {
    if (!isMountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (limit) params.append("limit", limit);

      const url = `api/organizer/me/bookings/recent${params.toString() ? `?${params.toString()}` : ""}`;

      console.log("🌐 Fetching recent bookings from:", url);

      const response = await apiFetch(url, {
        method: "GET",
        credentials: "include",
      });

      console.log("✅ Recent Bookings API Response:", response);

      if (!response.success) {
        throw new Error(response.message || "Failed to fetch recent bookings");
      }

      const bookingsData = response.data?.bookings || [];

      if (isMountedRef.current) {
        setBookings(bookingsData);
        setError(null);
      }
    } catch (apiError) {
      console.error("❌ Error fetching recent bookings:", apiError);

      const errorMessage = apiError.message || apiError.data?.message || "Failed to fetch recent bookings";

      if (isMountedRef.current) {
        setError(errorMessage);
        setBookings([]);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [limit]);

  /**
   * Refresh bookings (force refetch)
   */
  const refresh = useCallback(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Fetch on mount
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return {
    bookings,
    loading,
    error,
    refresh,
  };
};
