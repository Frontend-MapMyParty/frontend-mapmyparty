import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Calendar, MapPin, Edit2, Trash2, Eye, Search, ChevronLeft, ChevronRight, Loader, Clock, Tag } from "lucide-react";
import { useOrganizerEvents } from "@/hooks/useOrganizerEvents";
import { apiFetch } from "@/config/api";
import { toast } from "sonner";

const MyEvents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4; // 2 cards per row, 2 rows per page

  // Use the shared hook instead of direct API call
  const {
    events: rawEvents,
    loading,
    error,
    updateFilters,
    invalidateCache,
    refresh,
  } = useOrganizerEvents();

  // Log component mount and state
  useEffect(() => {
    console.log("📄 MyEvents component mounted");
    console.log("📊 Hook state - Loading:", loading, "Error:", error, "Events count:", rawEvents?.length || 0);
  }, [loading, error, rawEvents]);

  // Use raw events directly with all the API fields
  const events = useMemo(() => {
    if (!Array.isArray(rawEvents)) {
      return [];
    }
    return rawEvents.map((event) => {
      const startDate = event.startDate ? new Date(event.startDate) : null;
      const endDate = event.endDate ? new Date(event.endDate) : null;
      
      return {
        id: event.id,
        title: event.title,
        slug: event.slug,
        flyerImage: event.flyerImage || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
        category: event.category,
        subCategory: event.subCategory,
        status1: event.status1,
        status2: event.status2,
        startDate: startDate,
        endDate: endDate,
        createdAt: event.createdAt ? new Date(event.createdAt) : null,
        venues: event.venues || [],
        stats: event.stats || {},
        _count: event._count || {},
        // Formatted display values
        formattedDate: startDate ? startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'TBD',
        formattedTime: startDate ? startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'TBD',
        formattedEndTime: endDate ? endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : null,
        location: event.venues && event.venues.length > 0 
          ? `${event.venues[0].city || ''}${event.venues[0].city && event.venues[0].state ? ', ' : ''}${event.venues[0].state || ''}`.trim()
          : 'Location TBD',
        isPublished: event.status2 === 'ACTIVE' || event.status2 === 'PUBLISHED',
        attendees: event._count?.bookings || 0,
        revenue: event.stats?.totalRevenue || 0,
        ticketsSold: event.stats?.totalTicketsSold || 0,
      };
    });
  }, [rawEvents]);

  // Filter events based on search term (client-side for this component's UI)
  const filteredEvents = useMemo(() => {
    if (!Array.isArray(events)) {
      return [];
    }
    if (!searchTerm.trim()) {
      return events;
    }
    const searchLower = searchTerm.toLowerCase();
    return events.filter((event) =>
      event.title?.toLowerCase().includes(searchLower) ||
      event.location?.toLowerCase().includes(searchLower) ||
      event.category?.toLowerCase().includes(searchLower) ||
      event.subCategory?.toLowerCase().includes(searchLower)
    );
  }, [events, searchTerm]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

  const getStatusBadge = (status2, status1) => {
    if (status2 === 'PUBLISHED' || status2 === 'ACTIVE') {
      return {
        text: 'Published',
        className: 'bg-green-100 text-green-700 border border-green-200',
      };
    } else if (status2 === 'DRAFT') {
      return {
        text: 'Draft',
        className: 'bg-amber-100 text-amber-700 border border-amber-200',
      };
    } else if (status2 === 'PENDING') {
      return {
        text: 'Pending',
        className: 'bg-blue-100 text-blue-700 border border-blue-200',
      };
    }
    return {
      text: status2 || 'Unknown',
      className: 'bg-gray-100 text-gray-700 border border-gray-200',
    };
  };

  const getCategoryColor = (category) => {
    return 'bg-gray-100 text-gray-700 border border-gray-200';
  };

  const handleDelete = useCallback(async (id) => {
    try {
      const response = await apiFetch(`delete-event/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response || response.error) {
        throw new Error(response?.message || "Failed to delete event");
      }

      // Invalidate cache to force refetch
      invalidateCache();
      
      // Update search filter to trigger refetch
      updateFilters({ search: searchTerm || null });

      toast.success("Event deleted successfully");
      
      // Reset to first page if current page is now empty
      if (startIndex >= filteredEvents.length - 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err) {
      console.error("Error deleting event:", err);
      toast.error(err.message || "Failed to delete event. Please try again.");
    }
  }, [invalidateCache, updateFilters, searchTerm, startIndex, filteredEvents.length, currentPage]);

  const handleSearch = useCallback((e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on search
    
    // Update hook filters for server-side search (optional, can keep client-side only)
    // updateFilters({ search: value || null });
  }, []);

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">My Events</h2>
          <p className="text-sm text-gray-500 mt-1">Manage and track all your events</p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium">
          + Create New Event
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Loader className="w-8 h-8 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your events...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <p className="text-red-800 font-medium">Error loading events</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }
      `}</style>
      
      {!loading && (
        <>
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search events by title or location..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {paginatedEvents.map((event, index) => {
              const statusBadge = getStatusBadge(event.status2, event.status1);
              
              return (
                <div
                  key={event.id}
                  className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md border border-gray-200 transition-shadow duration-200 opacity-0 animate-fadeInUp"
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'forwards'
                  }}
                >
                  {/* Event Image */}
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    <img
                      src={event.flyerImage}
                      alt={event.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Event Details */}
                  <div className="p-5 space-y-4">
                    {/* Header with Status and Category */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                          {event.title}
                        </h3>
                        {event.subCategory && (
                          <p className="text-sm text-gray-500">{event.subCategory}</p>
                        )}
                      </div>
                      <span className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap ${statusBadge.className}`}>
                        {statusBadge.text}
                      </span>
                    </div>

                    {/* Date & Time */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="font-medium">{event.formattedDate}</span>
                      <span className="text-gray-400">•</span>
                      <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>{event.formattedTime}</span>
                      {event.formattedEndTime && (
                        <>
                          <span className="text-gray-400">-</span>
                          <span>{event.formattedEndTime}</span>
                        </>
                      )}
                    </div>

                    {/* Location */}
                    {event.location !== 'Location TBD' && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span>{event.location}</span>
                      </div>
                    )}

                    {/* Category */}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Tag className="w-3.5 h-3.5 text-gray-400" />
                      <span>{event.category || 'Event'}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium">
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* No Results State */}
          {filteredEvents.length === 0 && searchTerm && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No Events Found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search terms</p>
            </div>
          )}

          {/* Empty State */}
          {events.length === 0 && !searchTerm && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No Events Yet</h3>
              <p className="text-gray-500 mb-6">Create your first event to get started</p>
              <button className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium">
                + Create Event
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          {filteredEvents.length > 0 && (
            <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 p-6">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold">{startIndex + 1}</span> to{" "}
                <span className="font-semibold">{Math.min(endIndex, filteredEvents.length)}</span> of{" "}
                <span className="font-semibold">{filteredEvents.length}</span> events
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                        currentPage === page
                          ? "bg-red-600 text-white"
                          : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyEvents;
