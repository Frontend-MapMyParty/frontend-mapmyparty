import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/config/api';

/**
 * React Query hook for fetching user bookings with pagination
 * @param {Object} options - Query options
 * @param {number} options.page - Current page number (default: 1)
 * @param {number} options.limit - Items per page (default: 10)
 * @param {string} options.status - Filter by booking status (optional)
 * @returns {Object} Query result with bookings data, pagination, and status
 */
export const useBookings = (options = {}) => {
  const { page = 1, limit = 10, status } = options;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['userBookings', { page, limit, status }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (status && status !== 'all') {
        params.append('status', status.toUpperCase());
      }

      const response = await apiFetch(`/api/user/bookings?${params}`, { method: 'GET' });

      if (response?.success && response?.data) {
        return response.data;
      }

      // Fallback structure if response format differs
      return {
        items: response?.data?.items || response?.items || [],
        pagination: response?.data?.pagination || response?.pagination || {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
      };
    },
    staleTime: 3 * 60 * 1000,  // 3 minutes - bookings don't change frequently
    gcTime: 10 * 60 * 1000,    // 10 minutes garbage collection time
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new page
  });

  // Prefetch next page for smoother pagination
  const prefetchNextPage = () => {
    if (query.data?.pagination?.totalPages > page) {
      queryClient.prefetchQuery({
        queryKey: ['userBookings', { page: page + 1, limit, status }],
        queryFn: async () => {
          const params = new URLSearchParams({
            page: String(page + 1),
            limit: String(limit)
          });
          if (status && status !== 'all') {
            params.append('status', status.toUpperCase());
          }

          const response = await apiFetch(`/api/user/bookings?${params}`, { method: 'GET' });
          return response?.data || { items: [], pagination: {} };
        },
        staleTime: 3 * 60 * 1000,
      });
    }
  };

  // Invalidate all booking queries (useful after booking actions)
  const invalidateBookings = () => {
    queryClient.invalidateQueries({ queryKey: ['userBookings'] });
  };

  return {
    // Data
    bookings: query.data?.items || [],
    pagination: query.data?.pagination || { total: 0, page, limit, totalPages: 0 },

    // Query state
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,

    // Actions
    refetch: query.refetch,
    prefetchNextPage,
    invalidateBookings,

    // Pagination helpers
    hasNextPage: page < (query.data?.pagination?.totalPages || 0),
    hasPrevPage: page > 1,
  };
};

/**
 * Hook to fetch a single booking by ID
 * @param {string} bookingId - The booking ID to fetch
 * @returns {Object} Query result with booking data
 */
export const useBookingDetail = (bookingId) => {
  return useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      const response = await apiFetch(`/api/booking/${bookingId}`, { method: 'GET' });
      return response?.data?.booking || response?.data || response;
    },
    enabled: !!bookingId,
    staleTime: 5 * 60 * 1000,  // 5 minutes
    gcTime: 15 * 60 * 1000,    // 15 minutes
  });
};

export default useBookings;
