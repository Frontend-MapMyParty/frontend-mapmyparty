import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Edit2,
  Trash2,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader,
  Clock,
  Tag,
  Ticket,
  IndianRupee,
  Users,
  X,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { useOrganizerEvents } from "@/hooks/useOrganizerEvents";
import { apiFetch } from "@/config/api";
import { toast } from "sonner";

const MyEvents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4; // 2 cards per row, 2 rows per page
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();

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
      const createdOn = event.createdAt ? new Date(event.createdAt) : null;
      
      return {
        id: event.id,
        title: event.title,
        slug: event.slug,
        flyerImage: event.flyerImage || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
        category: event.category,
        subCategory: event.subCategory,
        description: event.description,
        eventStatus: event.eventStatus || event.status1,
        publishStatus: event.publishStatus || event.status2 || event.status,
        startDate: startDate,
        endDate: endDate,
        createdAt: createdOn,
        venues: event.venues || [],
        stats: event.stats || {},
        _count: event._count || {},
        organizer: event.organizer || event.event_organizer || {},
        // Formatted display values
        formattedDate: startDate ? startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'TBD',
        formattedTime: startDate ? startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'TBD',
        formattedEndTime: endDate ? endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : null,
        location: event.venues && event.venues.length > 0 
          ? `${event.venues[0].city || ''}${event.venues[0].city && event.venues[0].state ? ', ' : ''}${event.venues[0].state || ''}`.trim()
          : 'Location TBD',
        isPublished: (event.publishStatus || event.status2) === 'ACTIVE' || (event.publishStatus || event.status2) === 'PUBLISHED',
        attendees: event._count?.bookings || 0,
        revenue: event.stats?.totalRevenue || 0,
        ticketsSold: event.stats?.totalTicketsSold || 0,
      };
    });
  }, [rawEvents]);

  const formatNumber = (n) => new Intl.NumberFormat("en-IN").format(n || 0);
  const formatCurrency = (n) => `₹${new Intl.NumberFormat("en-IN").format(n || 0)}`;
  const formatDateRange = (start, end) => {
    if (!start) return "Date TBD";
    const startStr = start.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
    if (!end) return startStr;
    const sameDay = start.toDateString() === end.toDateString();
    const endStr = end.toLocaleDateString("en-US", { day: "numeric", month: "short", year: start.getFullYear() === end.getFullYear() ? undefined : "numeric" });
    return sameDay ? startStr : `${startStr} → ${endStr}`;
  };
  const formatTimeRange = (start, end) => {
    if (!start) return "Time TBD";
    const startStr = start.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    if (!end) return startStr;
    const endStr = end.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    return `${startStr} - ${endStr}`;
  };
  const formatCreated = (date) => {
    if (!date) return "Created date TBD";
    return date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  };

  const getPublishBadge = (publishStatus) => {
    const normalized = (publishStatus || "").toUpperCase();
    if (normalized === "PUBLISHED" || normalized === "ACTIVE") {
      return { text: "Published", className: "bg-emerald-400/15 text-emerald-100 border border-emerald-400/30" };
    }
    if (normalized === "DRAFT") {
      return { text: "Draft", className: "bg-amber-400/15 text-amber-100 border border-amber-400/30" };
    }
    if (normalized === "PENDING" || normalized === "REVIEW") {
      return { text: "Review", className: "bg-blue-400/15 text-blue-100 border border-blue-400/30" };
    }
    if (normalized === "ARCHIVED" || normalized === "CANCELLED") {
      return { text: normalized, className: "bg-red-500/15 text-red-100 border border-red-400/30" };
    }
    return { text: publishStatus || "Unknown", className: "bg-white/10 text-white border border-white/20" };
  };

  const getEventStateBadge = (eventStatus) => {
    const normalized = (eventStatus || "").toUpperCase();
    if (normalized === "UPCOMING") {
      return { text: "Upcoming", className: "bg-indigo-400/15 text-indigo-100 border border-indigo-400/30" };
    }
    if (normalized === "ONGOING" || normalized === "LIVE") {
      return { text: "Live", className: "bg-emerald-400/15 text-emerald-100 border border-emerald-400/30" };
    }
    if (normalized === "COMPLETED" || normalized === "ENDED" || normalized === "PAST") {
      return { text: "Completed", className: "bg-white/10 text-white border border-white/25" };
    }
    if (normalized === "CANCELLED") {
      return { text: "Cancelled", className: "bg-red-500/15 text-red-100 border border-red-400/30" };
    }
    return { text: eventStatus || "Status TBD", className: "bg-white/10 text-white border border-white/20" };
  };

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

  const summary = useMemo(() => {
    const published = events.filter((e) => getPublishBadge(e.publishStatus).text === "Published").length;
    const drafts = events.filter((e) => getPublishBadge(e.publishStatus).text === "Draft").length;
    const upcoming = events.filter((e) => getEventStateBadge(e.eventStatus).text === "Upcoming").length;
    return {
      total: events.length,
      published,
      drafts,
      upcoming,
    };
  }, [events]);

  const handleDelete = useCallback(
    async () => {
      if (!confirmDelete?.id) return;
      setDeleteLoading(true);
      try {
        const response = await apiFetch(`api/event/delete-event/${confirmDelete.id}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (!response || response.error || response.success === false) {
          throw new Error(response?.message || "Failed to delete event");
        }

        invalidateCache();
        refresh();
        toast.success("Event deleted successfully");

        if (startIndex >= filteredEvents.length - 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (err) {
        console.error("Error deleting event:", err);
        toast.error(err.message || "Failed to delete event. Please try again.");
      } finally {
        setDeleteLoading(false);
        setConfirmDelete(null);
      }
    },
    [confirmDelete, invalidateCache, refresh, startIndex, filteredEvents.length, currentPage]
  );

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
    <div className="space-y-8 text-white w-full max-w-7xl mx-auto relative">
      <div className="pointer-events-none absolute inset-0 opacity-40 blur-3xl bg-[radial-gradient(circle_at_20%_20%,rgba(148,163,255,0.15),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(248,113,113,0.18),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(16,185,129,0.12),transparent_30%)]" />
      <div className="relative space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.18em] text-white/50">Organizer Portal</p>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-extrabold">My Events</h2>
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <p className="text-sm text-white/60">Manage, edit, and track all your events</p>
        </div>
        <button
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow-lg shadow-red-500/20 hover:shadow-red-500/30"
          onClick={() => navigate("/organizer/select-event-type")}
        >
          + Create New Event
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center backdrop-blur shadow-lg shadow-black/20">
          <Loader className="w-8 h-8 text-red-400 animate-spin mx-auto mb-4" />
          <p className="text-white/70">Loading your events...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-red-100">
          <p className="font-semibold">Error loading events</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out; }
      `}</style>
      
      {!loading && (
        <>
          {/* Quick stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {[
              { label: "Total Events", value: summary.total, tone: "from-white/10 to-white/5", border: "border-white/10" },
              { label: "Published", value: summary.published, tone: "from-emerald-500/20 to-emerald-500/5", border: "border-emerald-400/25" },
              { label: "Drafts", value: summary.drafts, tone: "from-amber-500/20 to-amber-500/5", border: "border-amber-400/25" },
              { label: "Upcoming", value: summary.upcoming, tone: "from-indigo-500/20 to-indigo-500/5", border: "border-indigo-400/25" },
            ].map((card) => (
              <div
                key={card.label}
                className={`rounded-2xl px-4 py-3 bg-gradient-to-br ${card.tone} border ${card.border} shadow-lg shadow-black/10 backdrop-blur`}
              >
                <p className="text-xs uppercase tracking-[0.12em] text-white/60">{card.label}</p>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
              </div>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative bg-white/5 border border-white/10 rounded-2xl px-4 py-3 backdrop-blur shadow-lg shadow-black/10">
            <Search className="absolute left-6 top-3.5 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search events by title or location..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-12 pr-4 py-3 bg-transparent text-white placeholder:text-white/40 focus:outline-none focus:ring-0"
            />
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-8">
            {paginatedEvents.map((event, index) => {
              const publishBadge = getPublishBadge(event.publishStatus);
              const eventStateBadge = getEventStateBadge(event.eventStatus);
              
              return (
                <div
                  key={event.id}
                  className="bg-gradient-to-br from-white/10 via-white/5 to-white/0 rounded-3xl overflow-hidden border border-white/10 shadow-xl shadow-black/25 backdrop-blur opacity-0 animate-fadeInUp transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl"
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'forwards'
                  }}
                >
                  {/* Event Image */}
                  <div className="relative h-48 bg-black/30 overflow-hidden">
                    <img
                      src={event.flyerImage}
                      alt={event.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-semibold backdrop-blur border ${publishBadge.className}`}>
                        {publishBadge.text}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-[11px] font-semibold backdrop-blur border ${eventStateBadge.className}`}>
                        {eventStateBadge.text}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                      <div className="text-sm text-white font-semibold truncate">{event.title || "Untitled Event"}</div>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black/40 text-white border border-white/10 backdrop-blur">
                        {event.category || "Category"}
                      </span>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="p-6 space-y-6">
                    <div className="flex flex-wrap gap-2">
                      {event.subCategory && (
                        <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/5 text-white/70 border border-white/10">
                          {event.subCategory}
                        </span>
                      )}
                      <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-400/10 text-emerald-200 border border-emerald-300/20">
                        {event.location || "Location TBD"}
                      </span>
                    </div>

                    {/* Date & Time */}
                    <div className="flex items-center gap-2 text-sm text-white/70 flex-wrap">
                      <Calendar className="w-4 h-4 text-white/50 flex-shrink-0" />
                      <span className="font-semibold text-white">{formatDateRange(event.startDate, event.endDate)}</span>
                      <span className="text-white/30">•</span>
                      <Clock className="w-4 h-4 text-white/50 flex-shrink-0" />
                      <span>{formatTimeRange(event.startDate, event.endDate)}</span>
                    </div>

                    {/* Location & Category */}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-white/50" />
                        <span>{event.location || "Location TBD"}</span>
                      </div>
                      <span className="h-1 w-1 rounded-full bg-white/20" />
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-white/50" />
                        <span>{event.category || "Event"}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t border-white/10">
                      <button
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white text-gray-900 rounded-lg hover:bg-white/90 transition-colors text-sm font-semibold"
                        onClick={() => {
                          if (event.organizer?.slug && event.slug) {
                            navigate(`/events/${event.organizer.slug}/${event.slug}`);
                          } else {
                            console.error("Missing slug data:", {
                              organizerSlug: event.organizer?.slug,
                              eventSlug: event.slug,
                              eventId: event.id
                            });
                            toast.error("Unable to view event. Event URL data is missing.");
                          }
                        }}
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 border border-white/10 transition-colors text-sm font-semibold"
                        onClick={() =>
                          navigate(`/organizer/create-event?edit=${event.id}`, {
                            state: { event },
                          })
                        }
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmDelete(event)}
                        className="px-3 py-2 bg-red-500/15 text-red-200 rounded-lg hover:bg-red-500/25 border border-red-500/20 transition-colors text-sm font-semibold"
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
            <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center backdrop-blur shadow-lg shadow-black/20">
              <div className="mx-auto w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                <Search className="w-8 h-8 text-white/50" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">No Events Found</h3>
              <p className="text-white/60 mb-6">Try adjusting your search terms</p>
            </div>
          )}

          {/* Empty State */}
          {events.length === 0 && !searchTerm && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center backdrop-blur shadow-lg shadow-black/20">
              <div className="mx-auto w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                <Calendar className="w-8 h-8 text-white/60" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">No Events Yet</h3>
              <p className="text-white/60 mb-6">Create your first event to get started</p>
              <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow-lg shadow-red-500/20 hover:shadow-red-500/30">
                + Create Event
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          {filteredEvents.length > 0 && (
            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur shadow-lg shadow-black/20">
              <div className="text-sm text-white/70">
                Showing <span className="font-semibold text-white">{startIndex + 1}</span> to{" "}
                <span className="font-semibold text-white">{Math.min(endIndex, filteredEvents.length)}</span> of{" "}
                <span className="font-semibold text-white">{filteredEvents.length}</span> events
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-3 py-2 border border-white/15 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white text-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <div className="text-sm text-white/70">
                  Page <span className="font-semibold text-white">{currentPage}</span> of{" "}
                  <span className="font-semibold text-white">{totalPages || 1}</span>
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="flex items-center gap-2 px-3 py-2 border border-white/15 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white text-sm"
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

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-30 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !deleteLoading && setConfirmDelete(null)} />
          <div className="relative w-full max-w-md bg-[#0f172a] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-300" />
              <div>
                <h3 className="text-lg font-semibold">Delete this event?</h3>
                <p className="text-sm text-white/60">“{confirmDelete.title || "Untitled Event"}” will be removed permanently.</p>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white border border-white/15 hover:bg-white/15 transition"
                onClick={() => setConfirmDelete(null)}
                disabled={deleteLoading}
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-600 transition disabled:opacity-70"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MyEvents;
