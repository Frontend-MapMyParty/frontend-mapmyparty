import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Users,
  Search,
  Mail,
  Phone,
  Ticket,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
  Loader,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Calendar,
  TrendingUp,
  Download,
  Filter,
} from "lucide-react";
import { apiFetch } from "@/config/api";
import { toast } from "sonner";

const EventAttendees = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [attendees, setAttendees] = useState([]);
  const [event, setEvent] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const limit = 20;

  // Load Google Fonts
  useEffect(() => {
    const link1 = document.createElement("link");
    link1.href = "https://fonts.googleapis.com/css2?family=League+Gothic&display=swap";
    link1.rel = "stylesheet";
    document.head.appendChild(link1);

    const link2 = document.createElement("link");
    link2.href = "https://fonts.googleapis.com/css2?family=League+Spartan:wght@300;400;500;600;700&display=swap";
    link2.rel = "stylesheet";
    document.head.appendChild(link2);

    return () => {
      document.head.removeChild(link1);
      document.head.removeChild(link2);
    };
  }, []);

  useEffect(() => {
    fetchAttendees();
  }, [eventId, currentPage, searchTerm]);

  const fetchAttendees = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(
        `api/booking/event/${eventId}/attendees?page=${currentPage}&limit=${limit}&search=${encodeURIComponent(searchTerm)}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (response && response.success) {
        setAttendees(response.data.attendees || []);
        setEvent(response.data.event || null);
        setStatistics(response.data.statistics || null);
        setPagination(response.data.pagination || null);
      } else {
        toast.error(response?.message || "Failed to fetch attendees");
      }
    } catch (error) {
      console.error("Error fetching attendees:", error);
      toast.error("Failed to load attendees. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTotalTickets = (booking) => {
    return booking.booking_items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
  };

  const getTicketBreakdown = (booking) => {
    if (!booking.booking_items || booking.booking_items.length === 0) {
      return "No tickets";
    }
    return booking.booking_items
      .map((item) => `${item.ticket?.name || "Ticket"} x${item.quantity}`)
      .join(", ");
  };

  return (
    <div
      className="min-h-screen"
      style={{
        fontFamily: "'League Spartan', sans-serif",
        background: "linear-gradient(135deg, #0a0015 0%, #1a0b2e 50%, #0f051d 100%)",
        color: "#ffffff",
      }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-20 backdrop-blur-xl border-b"
        style={{
          backgroundColor: "rgba(72, 40, 93, 0.3)",
          borderColor: "#ffffff",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/organizer/myevents")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: "rgba(119, 34, 86, 0.2)",
                border: "1px solid #ffffff",
                color: "#ffffff",
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span style={{ fontWeight: 500 }}>Back to My Events</span>
            </button>
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6" style={{ color: "#ffffff" }} />
              <h1
                className="text-2xl tracking-wide"
                style={{
                  fontFamily: "'League Gothic', sans-serif",
                  color: "#ffffff",
                  letterSpacing: "0.05em",
                }}
              >
                EVENT ATTENDEES
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Event Info */}
        {event && (
          <div
            className="rounded-2xl p-6 backdrop-blur-sm border"
            style={{
              backgroundColor: "rgba(72, 40, 93, 0.2)",
              borderColor: "rgba(255, 255, 255, 0.3)",
            }}
          >
            <h2
              className="text-3xl mb-2"
              style={{
                fontFamily: "'League Gothic', sans-serif",
                color: "#ffffff",
                letterSpacing: "0.05em",
              }}
            >
              {event.title}
            </h2>
            <div className="flex items-center gap-4 text-sm" style={{ color: "#ffffff" }}>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(event.startDate)}</span>
              </div>
              {event.endDate && (
                <>
                  <span>→</span>
                  <span>{formatDate(event.endDate)}</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                label: "Total Bookings",
                value: statistics.totalBookings,
                icon: Ticket,
                color: "#772256",
              },
              {
                label: "Total Revenue",
                value: formatCurrency(statistics.totalRevenue),
                icon: IndianRupee,
                color: "#ffffff",
              },
              {
                label: "Total Tickets",
                value: statistics.totalTickets,
                icon: Users,
                color: "#772256",
              },
              {
                label: "Checked In",
                value: statistics.checkedInTickets,
                icon: CheckCircle2,
                color: "#10b981",
              },
              {
                label: "Check-in Rate",
                value: `${statistics.checkInRate}%`,
                icon: TrendingUp,
                color: "#ffffff",
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="rounded-xl p-5 backdrop-blur-sm border transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: "rgba(119, 34, 86, 0.1)",
                  borderColor: "rgba(255, 255, 255, 0.3)",
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <div
                  className="text-2xl font-bold mb-1"
                  style={{ color: stat.color, fontFamily: "'League Gothic', sans-serif" }}
                >
                  {stat.value}
                </div>
                <div className="text-xs" style={{ color: "#ffffff", opacity: 0.7 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search Bar */}
        <div
          className="rounded-xl p-1 backdrop-blur-sm border"
          style={{
            backgroundColor: "rgba(72, 40, 93, 0.2)",
            borderColor: "rgba(255, 255, 255, 0.3)",
          }}
        >
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5"
              style={{ color: "#ffffff", opacity: 0.5 }}
            />
            <input
              type="text"
              placeholder="Search attendees by name, email, or phone..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-12 pr-4 py-3 bg-transparent rounded-lg focus:outline-none"
              style={{ color: "#ffffff", fontWeight: 400 }}
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div
            className="rounded-2xl p-12 text-center backdrop-blur-sm border"
            style={{
              backgroundColor: "rgba(72, 40, 93, 0.2)",
              borderColor: "rgba(255, 255, 255, 0.3)",
            }}
          >
            <Loader className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: "#ffffff" }} />
            <p style={{ color: "#ffffff", opacity: 0.7 }}>Loading attendees...</p>
          </div>
        )}

        {/* Attendees Table */}
        {!loading && attendees.length > 0 && (
          <div
            className="rounded-2xl overflow-hidden backdrop-blur-sm border"
            style={{
              backgroundColor: "rgba(72, 40, 93, 0.2)",
              borderColor: "rgba(255, 255, 255, 0.3)",
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    style={{
                      backgroundColor: "rgba(119, 34, 86, 0.3)",
                      borderBottom: "2px solid #ffffff",
                    }}
                  >
                    <th
                      className="px-6 py-4 text-left text-xs uppercase tracking-wider"
                      style={{ color: "#ffffff", fontWeight: 700 }}
                    >
                      Attendee
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs uppercase tracking-wider"
                      style={{ color: "#ffffff", fontWeight: 700 }}
                    >
                      Contact
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs uppercase tracking-wider"
                      style={{ color: "#ffffff", fontWeight: 700 }}
                    >
                      Tickets
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs uppercase tracking-wider"
                      style={{ color: "#ffffff", fontWeight: 700 }}
                    >
                      Amount Paid
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs uppercase tracking-wider"
                      style={{ color: "#ffffff", fontWeight: 700 }}
                    >
                      Booked On
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs uppercase tracking-wider"
                      style={{ color: "#ffffff", fontWeight: 700 }}
                    >
                      Payment Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attendees.map((booking, index) => (
                    <tr
                      key={booking.id}
                      className="transition-colors duration-200"
                      style={{
                        borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
                        backgroundColor:
                          index % 2 === 0 ? "rgba(119, 34, 86, 0.05)" : "transparent",
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{
                              backgroundColor: "rgba(255, 255, 255, 0.2)",
                              border: "1px solid #ffffff",
                            }}
                          >
                            <span
                              className="text-sm font-bold"
                              style={{ color: "#ffffff" }}
                            >
                              {booking.user?.name?.charAt(0)?.toUpperCase() || "?"}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold" style={{ color: "#ffffff" }}>
                              {booking.user?.name || "N/A"}
                            </div>
                            <div className="text-xs" style={{ color: "#ffffff", opacity: 0.7 }}>
                              ID: {booking.id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-3 h-3" style={{ color: "#ffffff" }} />
                            <span style={{ color: "#ffffff" }}>
                              {booking.user?.email || "N/A"}
                            </span>
                          </div>
                          {booking.user?.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-3 h-3" style={{ color: "#ffffff" }} />
                              <span style={{ color: "#ffffff" }}>{booking.user.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold" style={{ color: "#ffffff" }}>
                            {getTotalTickets(booking)} Ticket(s)
                          </div>
                          <div className="text-xs mt-1" style={{ color: "#ffffff", opacity: 0.6 }}>
                            {getTicketBreakdown(booking)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold" style={{ color: "#ffffff" }}>
                          {formatCurrency(booking.totalAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-3 h-3" style={{ color: "#ffffff" }} />
                          <span style={{ color: "#ffffff" }}>
                            {formatDateTime(booking.createdAt)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor:
                              booking.payment?.status === "COMPLETED"
                                ? "rgba(16, 185, 129, 0.2)"
                                : "rgba(245, 158, 11, 0.2)",
                            color:
                              booking.payment?.status === "COMPLETED" ? "#10b981" : "#f59e0b",
                            border:
                              booking.payment?.status === "COMPLETED"
                                ? "1px solid #10b981"
                                : "1px solid #f59e0b",
                          }}
                        >
                          {booking.payment?.status || "PENDING"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && attendees.length === 0 && (
          <div
            className="rounded-2xl p-12 text-center backdrop-blur-sm border"
            style={{
              backgroundColor: "rgba(72, 40, 93, 0.2)",
              borderColor: "rgba(255, 255, 255, 0.3)",
            }}
          >
            <Users className="w-16 h-16 mx-auto mb-4" style={{ color: "#ffffff", opacity: 0.5 }} />
            <h3
              className="text-xl mb-2"
              style={{ fontFamily: "'League Gothic', sans-serif", color: "#ffffff" }}
            >
              No Attendees Found
            </h3>
            <p style={{ color: "#ffffff", opacity: 0.7 }}>
              {searchTerm
                ? "Try adjusting your search terms"
                : "No confirmed bookings for this event yet"}
            </p>
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination && pagination.totalPages > 1 && (
          <div
            className="flex items-center justify-between rounded-xl p-6 backdrop-blur-sm border"
            style={{
              backgroundColor: "rgba(72, 40, 93, 0.2)",
              borderColor: "rgba(255, 255, 255, 0.3)",
            }}
          >
            <div className="text-sm" style={{ color: "#ffffff" }}>
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}{" "}
              attendees
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                style={{
                  backgroundColor: "rgba(119, 34, 86, 0.3)",
                  border: "1px solid #ffffff",
                  color: "#ffffff",
                }}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <span className="text-sm" style={{ color: "#ffffff" }}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                style={{
                  backgroundColor: "rgba(119, 34, 86, 0.3)",
                  border: "1px solid #ffffff",
                  color: "#ffffff",
                }}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventAttendees;
