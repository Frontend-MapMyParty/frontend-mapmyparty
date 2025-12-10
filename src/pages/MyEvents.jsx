import React, { useState, useMemo, useEffect } from "react";
import { Calendar, MapPin, Users, DollarSign, Edit2, Trash2, Eye, Search, ChevronLeft, ChevronRight, Loader } from "lucide-react";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const MyEvents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4; // 2 cards per row, 2 rows per page
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [events, setEvents] = useState([]);

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${baseURL}api/event/my-events`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch events: ${response.statusText}`);
        }

        const data = await response.json();
        // Handle different response formats
        let eventsArray = [];
        if (Array.isArray(data)) {
          eventsArray = data;
        } else if (Array.isArray(data.data)) {
          eventsArray = data.data;
        } else if (data.data && Array.isArray(data.data.events)) {
          eventsArray = data.data.events;
        } else if (Array.isArray(data.events)) {
          eventsArray = data.events;
        }
        
        // Map API response to card format
        const mappedEvents = eventsArray.map((event) => ({
          id: event.id,
          title: event.title,
          date: event.startDate ? new Date(event.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'TBD',
          time: event.startDate ? new Date(event.startDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'TBD',
          location: event.venues && event.venues.length > 0 ? `${event.venues[0].city}, ${event.venues[0].state}` : 'Location TBD',
          attendees: event._count?.bookings || 0,
          revenue: `₹${event.stats?.totalRevenue || 0}`,
          image: event.flyerImage || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=300&fit=crop',
          status: event.status2 === 'PUBLISHED' ? 'Published' : 'Draft',
          ticketsSold: event.stats?.totalTicketsSold || 0,
        }));
        
        setEvents(mappedEvents);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError(err.message || "Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Filter events based on search term
  const filteredEvents = useMemo(() => {
    if (!Array.isArray(events)) {
      return [];
    }
    return events.filter((event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [events, searchTerm]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

  const getStatusColor = (status) => {
    return status === "Published"
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800";
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${baseURL}delete-event/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete event: ${response.statusText}`);
      }

      // Remove event from local state
      setEvents(events.filter((event) => event.id !== id));
      
      // Reset to first page if current page is now empty
      if (startIndex >= filteredEvents.length - 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("Failed to delete event. Please try again.");
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

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
            {paginatedEvents.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Event Image */}
            <div className="relative h-48 bg-gray-200 overflow-hidden">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                    event.status
                  )}`}
                >
                  {event.status}
                </span>
              </div>
            </div>

            {/* Event Details */}
            <div className="p-6 space-y-4">
              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                {event.title}
              </h3>

              {/* Date, Time, Location */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-red-600" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-red-600" />
                  <span>{event.location}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Attendees</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Users className="w-4 h-4 text-gray-600" />
                    <p className="text-sm font-semibold text-gray-900">{event.attendees}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Revenue</p>
                  <div className="flex items-center gap-1 mt-1">
                    <DollarSign className="w-4 h-4 text-gray-600" />
                    <p className="text-sm font-semibold text-gray-900">{event.revenue}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(event.id)}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
            ))}
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
