import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchDashboardSummary,
  fetchRevenueOverTime,
  fetchEventsByCategory,
  fetchRevenueByOrganizer,
  fetchTicketDistribution,
} from "@/services/analyticsService";

const TIME_FRAME_MAP = {
  week: "this_week",
  month: "this_month",
  year: "this_year",
};

export const useAnalytics = (initialTimeFrame = "month") => {
  const [summary, setSummary] = useState(null);
  const [revenueOverTime, setRevenueOverTime] = useState([]);
  const [categories, setCategories] = useState([]);
  const [organizerRevenue, setOrganizerRevenue] = useState([]);
  const [ticketDistribution, setTicketDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    timeFrame: initialTimeFrame,
    scope: "overall",
    organizerId: null,
    groupBy: "day",
  });

  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const buildParams = useCallback(() => {
    const params = {
      range: TIME_FRAME_MAP[filters.timeFrame] || "this_month",
      scope: filters.scope,
    };
    if (filters.organizerId) {
      params.organizerId = filters.organizerId;
    }
    if (filters.groupBy) {
      params.groupBy = filters.groupBy;
    }
    return params;
  }, [filters]);

  const fetchData = useCallback(async () => {
    if (!isMountedRef.current) return;

    setLoading(true);
    setError(null);

    const params = buildParams();

    try {
      const [summaryData, revenueData, categoryData, ticketData] =
        await Promise.all([
          fetchDashboardSummary(params).catch(() => null),
          fetchRevenueOverTime(params).catch(() => []),
          fetchEventsByCategory(params).catch(() => []),
          fetchTicketDistribution(params).catch(() => []),
        ]);

      // Fetch organizer revenue separately — only succeeds for ADMIN
      let orgRevenueData = [];
      try {
        orgRevenueData = await fetchRevenueByOrganizer(params);
      } catch {
        // Non-admin users will get 403, which is expected
      }

      if (isMountedRef.current) {
        setSummary(summaryData);
        setRevenueOverTime(revenueData || []);
        setCategories(categoryData || []);
        setOrganizerRevenue(orgRevenueData || []);
        setTicketDistribution(ticketData || []);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message || "Failed to fetch analytics data");
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [buildParams]);

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    summary,
    revenueOverTime,
    categories,
    organizerRevenue,
    ticketDistribution,
    loading,
    error,
    filters,
    updateFilters,
    refresh: fetchData,
  };
};
