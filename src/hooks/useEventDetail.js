import { useQueries, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/config/api';

/**
 * React Query hook for fetching event details and tickets in parallel
 * Uses useQueries for concurrent data fetching with individual caching
 *
 * @param {string} eventId - The event ID or slug to fetch
 * @returns {Object} Combined query result with event and tickets data
 */
export const useEventDetail = (eventId) => {
  const queryClient = useQueryClient();

  const results = useQueries({
    queries: [
      {
        queryKey: ['event', eventId],
        queryFn: async () => {
          const response = await apiFetch(`/api/event/${eventId}`, { method: 'GET' });
          return response.data?.event || response.data || response;
        },
        staleTime: 10 * 60 * 1000,  // 10 minutes - event data changes infrequently
        gcTime: 30 * 60 * 1000,      // 30 minutes garbage collection
        enabled: !!eventId,
        retry: 2,
      },
      {
        queryKey: ['eventTickets', eventId],
        queryFn: async () => {
          const response = await apiFetch(`api/booking/event/${eventId}/tickets`, { method: 'GET' });
          return response?.data?.tickets ?? response?.tickets ?? [];
        },
        staleTime: 2 * 60 * 1000,   // 2 minutes - ticket availability changes more often
        gcTime: 10 * 60 * 1000,      // 10 minutes garbage collection
        enabled: !!eventId,
        retry: 1,
      },
    ],
  });

  const [eventQuery, ticketsQuery] = results;

  // Prefetch related events (for recommendations)
  const prefetchRelatedEvents = (categoryId) => {
    if (categoryId) {
      queryClient.prefetchQuery({
        queryKey: ['events', 'category', categoryId],
        queryFn: async () => {
          const response = await apiFetch(`/api/events?category=${categoryId}&limit=4`, { method: 'GET' });
          return response?.data?.events || [];
        },
        staleTime: 5 * 60 * 1000,
      });
    }
  };

  // Invalidate event and ticket data
  const invalidateEventData = () => {
    queryClient.invalidateQueries({ queryKey: ['event', eventId] });
    queryClient.invalidateQueries({ queryKey: ['eventTickets', eventId] });
  };

  // Invalidate only tickets (e.g., after purchase)
  const invalidateTickets = () => {
    queryClient.invalidateQueries({ queryKey: ['eventTickets', eventId] });
  };

  return {
    // Data
    event: eventQuery.data,
    tickets: ticketsQuery.data || [],

    // Loading states
    isLoading: eventQuery.isLoading || ticketsQuery.isLoading,
    isEventLoading: eventQuery.isLoading,
    isTicketsLoading: ticketsQuery.isLoading,
    isFetching: eventQuery.isFetching || ticketsQuery.isFetching,

    // Error states
    isError: eventQuery.isError || ticketsQuery.isError,
    isEventError: eventQuery.isError,
    isTicketsError: ticketsQuery.isError,
    eventError: eventQuery.error,
    ticketsError: ticketsQuery.error,

    // Actions
    refetch: () => {
      eventQuery.refetch();
      ticketsQuery.refetch();
    },
    refetchEvent: eventQuery.refetch,
    refetchTickets: ticketsQuery.refetch,
    prefetchRelatedEvents,
    invalidateEventData,
    invalidateTickets,
  };
};

/**
 * Hook to prefetch event data (useful for hover previews)
 * @param {string} eventId - The event ID to prefetch
 */
export const usePrefetchEvent = () => {
  const queryClient = useQueryClient();

  return (eventId) => {
    if (!eventId) return;

    queryClient.prefetchQuery({
      queryKey: ['event', eventId],
      queryFn: async () => {
        const response = await apiFetch(`/api/event/${eventId}`, { method: 'GET' });
        return response.data?.event || response.data || response;
      },
      staleTime: 10 * 60 * 1000,
    });
  };
};

export default useEventDetail;
