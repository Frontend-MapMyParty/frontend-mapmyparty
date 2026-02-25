import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { apiFetch } from "@/config/api";

/**
 * Hook for fetching organizer payouts
 * Fetches payout data from /api/organizer/me/payouts with filtering and pagination
 */
export const useOrganizerPayouts = (options = {}) => {
  const {
    page: initialPage = 1,
    limit: initialLimit = 20,
    status: initialStatus = null,
    autoFetch = true,
  } = options;

  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    status: initialStatus,
    startDate: null,
    endDate: null,
  });

  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Build query string from filters and pagination
   */
  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();

    params.append("page", pagination.page);
    params.append("limit", pagination.limit);

    if (filters.status) params.append("status", filters.status);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);

    return params.toString();
  }, [pagination.page, pagination.limit, filters]);

  /**
   * Fetch payouts from API
   */
  const fetchPayouts = useCallback(async () => {
    if (!isMountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const queryString = buildQueryString();
      const url = `api/organizer/me/payouts${queryString ? `?${queryString}` : ""}`;

      console.log("🌐 Fetching organizer payouts from:", url);

      const response = await apiFetch(url, {
        method: "GET",
        credentials: "include",
      });

      console.log("✅ Payouts API Response:", response);

      if (!response.success) {
        throw new Error(response.message || "Failed to fetch payouts");
      }

      const payoutsData = response.data?.payouts || [];
      const paginationData = response.data?.pagination || {};

      if (isMountedRef.current) {
        setPayouts(payoutsData);
        setPagination({
          page: paginationData.page || pagination.page,
          limit: paginationData.limit || pagination.limit,
          total: paginationData.total || 0,
          totalPages: paginationData.totalPages || 0,
        });
        setError(null);
      }
    } catch (apiError) {
      console.error("❌ Error fetching organizer payouts:", apiError);

      const errorMessage = apiError.message || apiError.data?.message || "Failed to fetch payouts data";

      if (isMountedRef.current) {
        setError(errorMessage);
        setPayouts([]);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [buildQueryString, pagination.page, pagination.limit]);

  /**
   * Update filters and refetch
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    // Reset to page 1 when filters change
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  /**
   * Change page
   */
  const changePage = useCallback((newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  }, []);

  /**
   * Refresh payouts (force refetch)
   */
  const refresh = useCallback(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetchPayouts();
    }
  }, [fetchPayouts, autoFetch]);

  // Calculate summary statistics from payouts
  const summary = useMemo(() => {
    const clearedPayouts = payouts.filter(p => p.status === 'COMPLETED' || p.status === 'SUCCESS');
    const pendingPayouts = payouts.filter(p => p.status === 'PENDING' || p.status === 'PROCESSING');
    const failedPayouts = payouts.filter(p => p.status === 'FAILED');

    const clearedAmount = clearedPayouts.reduce((sum, p) => sum + (p.amount || 0), 0);
    const pendingAmount = pendingPayouts.reduce((sum, p) => sum + (p.amount || 0), 0);
    const failedAmount = failedPayouts.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Find next scheduled payout (pending with nearest payoutDate)
    const nextPayout = pendingPayouts
      .filter(p => p.payoutDate)
      .sort((a, b) => new Date(a.payoutDate) - new Date(b.payoutDate))[0];

    return {
      cleared: {
        count: clearedPayouts.length,
        amount: clearedAmount,
      },
      pending: {
        count: pendingPayouts.length,
        amount: pendingAmount,
      },
      failed: {
        count: failedPayouts.length,
        amount: failedAmount,
      },
      total: {
        count: payouts.length,
        amount: clearedAmount + pendingAmount,
      },
      nextPayout: nextPayout ? {
        date: nextPayout.payoutDate,
        amount: nextPayout.amount,
        id: nextPayout.id,
      } : null,
    };
  }, [payouts]);

  return {
    payouts,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    changePage,
    refresh,
    summary,
  };
};
