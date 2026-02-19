import { useState, useEffect, useCallback, useRef } from "react";
import { apiFetch } from "@/config/api";

/**
 * Hook for fetching organizer dashboard analytics
 * Fetches comprehensive analytics data including refunds, trends, financials, and breakdowns
 */
export const useOrganizerAnalytics = (initialPeriod = "month") => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState(initialPeriod);

  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Fetch analytics from API
   */
  const fetchAnalytics = useCallback(async () => {
    if (!isMountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (period) params.append("period", period);

      const url = `api/organizer/me/analytics${params.toString() ? `?${params.toString()}` : ""}`;

      console.log("🌐 Fetching organizer analytics from:", url);

      const response = await apiFetch(url, {
        method: "GET",
        credentials: "include",
      });

      console.log("✅ Analytics API Response:", response);

      if (!response.success) {
        throw new Error(response.message || "Failed to fetch analytics");
      }

      const analyticsData = response.data || {};

      if (isMountedRef.current) {
        setAnalytics(analyticsData);
        setError(null);
      }
    } catch (apiError) {
      console.error("❌ Error fetching organizer analytics:", apiError);

      const errorMessage = apiError.message || apiError.data?.message || "Failed to fetch analytics data";

      if (isMountedRef.current) {
        setError(errorMessage);
        setAnalytics(null);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [period]);

  /**
   * Update period and refetch
   */
  const updatePeriod = useCallback((newPeriod) => {
    setPeriod(newPeriod);
  }, []);

  /**
   * Refresh analytics (force refetch)
   */
  const refresh = useCallback(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Fetch on mount and when period changes
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Calculate derived metrics for dashboard
  const metrics = {
    // Refund rate (percentage)
    refundRate: analytics?.refunds ?
      Object.values(analytics.refunds).reduce((sum, stat) => sum + (stat.count || 0), 0) : 0,

    // Total refund amount
    totalRefundAmount: analytics?.refunds ?
      Object.values(analytics.refunds).reduce((sum, stat) => sum + (stat.amountCents || 0), 0) / 100 : 0,

    // Check-in rate (we'll calculate this from booking status breakdown)
    checkInRate: analytics?.breakdown?.byBookingStatus ?
      (() => {
        const total = Object.values(analytics.breakdown.byBookingStatus).reduce((sum, count) => sum + count, 0);
        const confirmed = analytics.breakdown.byBookingStatus.CONFIRMED || 0;
        return total > 0 ? Math.round((confirmed / total) * 100) : 0;
      })() : 0,

    // No-show risk (inverse of check-in rate, rough estimate)
    noShowRisk: analytics?.breakdown?.byBookingStatus ?
      (() => {
        const total = Object.values(analytics.breakdown.byBookingStatus).reduce((sum, count) => sum + count, 0);
        const pending = analytics.breakdown.byBookingStatus.PENDING || 0;
        return total > 0 ? Math.round((pending / total) * 100) : 0;
      })() : 0,

    // Average ticket price
    avgTicketPrice: analytics?.financials?.averageTicketPrice || 0,

    // Platform fees
    platformFeeTotal: analytics?.financials?.platformFeeTotal || 0,
    gstTotal: analytics?.financials?.gstTotal || 0,
  };

  return {
    analytics,
    loading,
    error,
    period,
    updatePeriod,
    refresh,
    metrics,
  };
};
