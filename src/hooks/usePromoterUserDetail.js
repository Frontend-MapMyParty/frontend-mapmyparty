import { useState, useEffect, useCallback, useRef } from "react";
import { apiFetch } from "@/config/api";

export const usePromoterUserDetail = (userId) => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [isFetching, setIsFetching] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  const abortRef = useRef(null);
  const requestIdRef = useRef(0);

  const fetchUser = useCallback(async (page = 1) => {
    if (!userId) return;

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const requestId = ++requestIdRef.current;

    setIsFetching(true);
    setError(null);

    try {
      const response = await apiFetch(`/promoter/users/${userId}?page=${page}&limit=10`, {
        method: "GET",
        signal: controller.signal,
      });

      if (requestId !== requestIdRef.current) return;

      setUser(response?.data?.user || null);
      setBookings(response?.data?.bookings || []);
      setPagination(
        response?.data?.pagination || {
          page,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      );
    } catch (err) {
      if (err.name === "AbortError" || requestId !== requestIdRef.current) return;
      console.error("Error fetching promoter user detail:", err);
      setError(err.message || "Failed to fetch user details");
      setUser(null);
      setBookings([]);
    } finally {
      if (requestId === requestIdRef.current) {
        setIsFetching(false);
        setInitialLoading(false);
      }
    }
  }, [userId]);

  useEffect(() => {
    fetchUser(1);
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchUser]);

  const changePage = useCallback((page) => {
    fetchUser(page);
  }, [fetchUser]);

  return {
    user,
    bookings,
    pagination,
    loading: initialLoading,
    isFetching,
    error,
    changePage,
  };
};
