import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchEventSummary,
  fetchEventTicketBreakdown,
  fetchEventSalesTimeline,
  fetchEventRevenueBreakdown,
  fetchEventBookingStats,
  fetchEventCheckinStats,
} from "@/services/analyticsService";

const INITIAL_SECTION = { data: null, loading: true, error: null };

/**
 * Fetches all 6 event analytics endpoints in parallel.
 * Each section has independent loading/error state for progressive rendering.
 */
export function useEventAnalytics(organizerId, eventId) {
  const [summary, setSummary] = useState(INITIAL_SECTION);
  const [ticketBreakdown, setTicketBreakdown] = useState(INITIAL_SECTION);
  const [salesTimeline, setSalesTimeline] = useState(INITIAL_SECTION);
  const [revenueBreakdown, setRevenueBreakdown] = useState(INITIAL_SECTION);
  const [bookingStats, setBookingStats] = useState(INITIAL_SECTION);
  const [checkinStats, setCheckinStats] = useState(INITIAL_SECTION);
  const abortRef = useRef(false);

  const fetchSection = useCallback(async (fetcher, setter) => {
    setter({ data: null, loading: true, error: null });
    try {
      const data = await fetcher();
      if (!abortRef.current) {
        setter({ data, loading: false, error: null });
      }
    } catch (err) {
      if (!abortRef.current) {
        setter({ data: null, loading: false, error: err.message || "Failed to load" });
      }
    }
  }, []);

  const fetchAll = useCallback(() => {
    if (!organizerId || !eventId) return;
    abortRef.current = false;

    // Fire all 6 requests in parallel - each resolves independently
    fetchSection(() => fetchEventSummary(organizerId, eventId), setSummary);
    fetchSection(() => fetchEventTicketBreakdown(organizerId, eventId), setTicketBreakdown);
    fetchSection(() => fetchEventSalesTimeline(organizerId, eventId), setSalesTimeline);
    fetchSection(() => fetchEventRevenueBreakdown(organizerId, eventId), setRevenueBreakdown);
    fetchSection(() => fetchEventBookingStats(organizerId, eventId), setBookingStats);
    fetchSection(() => fetchEventCheckinStats(organizerId, eventId), setCheckinStats);
  }, [organizerId, eventId, fetchSection]);

  useEffect(() => {
    fetchAll();
    return () => { abortRef.current = true; };
  }, [fetchAll]);

  const refetch = useCallback(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    summary,
    ticketBreakdown,
    salesTimeline,
    revenueBreakdown,
    bookingStats,
    checkinStats,
    refetch,
  };
}
