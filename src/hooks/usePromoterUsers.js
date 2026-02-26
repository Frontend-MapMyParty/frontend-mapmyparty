import { useState, useEffect, useCallback, useRef } from "react";
import { apiFetch } from "@/config/api";

const DEBOUNCE_MS = 350;

export const usePromoterUsers = (initialFilters = {}) => {
  const [users, setUsers] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const filtersRef = useRef({
    search: initialFilters.search || "",
  });
  const [filters, setFilters] = useState(filtersRef.current);

  const abortRef = useRef(null);
  const debounceRef = useRef(null);
  const requestIdRef = useRef(0);

  const fetchUsers = useCallback(async (pageNum = 1) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const requestId = ++requestIdRef.current;
    const currentFilters = filtersRef.current;

    setIsFetching(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("page", String(pageNum));
      params.set("limit", "20");

      if (currentFilters.search?.trim()) {
        params.set("search", currentFilters.search.trim());
      }

      const response = await apiFetch(`/promoter/users?${params.toString()}`, {
        method: "GET",
        signal: controller.signal,
      });

      if (requestId !== requestIdRef.current) return;

      setUsers(response?.data?.users || []);
      setPagination(
        response?.data?.pagination || {
          page: pageNum,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      );
    } catch (err) {
      if (err.name === "AbortError" || requestId !== requestIdRef.current) return;
      console.error("Error fetching promoter users:", err);
      setError(err.message || "Failed to fetch users");
    } finally {
      if (requestId === requestIdRef.current) {
        setIsFetching(false);
        setInitialLoading(false);
      }
    }
  }, []);

  const updateFilters = useCallback((newFilters) => {
    const merged = { ...filtersRef.current, ...newFilters };
    filtersRef.current = merged;
    setFilters(merged);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (newFilters.search !== undefined) {
      debounceRef.current = setTimeout(() => fetchUsers(1), DEBOUNCE_MS);
      return;
    }

    fetchUsers(1);
  }, [fetchUsers]);

  const changePage = useCallback((pageNum) => {
    fetchUsers(pageNum);
  }, [fetchUsers]);

  useEffect(() => {
    fetchUsers(1);
    return () => {
      if (abortRef.current) abortRef.current.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [fetchUsers]);

  return {
    users,
    loading: initialLoading,
    isFetching,
    error,
    pagination,
    filters,
    updateFilters,
    changePage,
  };
};
