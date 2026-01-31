import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Ticket,
  Download,
  Calendar,
  MapPin,
  Clock,
  Users,
  CreditCard,
  CheckCircle2,
  RefreshCw,
  Share2,
  Mail,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import TicketCard from "@/components/TicketCard";
import { apiFetch, buildUrl } from "@/config/api";
import { toast } from "sonner";

const MyTickets = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingAll, setDownloadingAll] = useState(false);

  const fetchBookingDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiFetch(
        `/api/booking/${bookingId}?includeQRCodes=true`,
        { method: "GET" }
      );

      if (response?.success && response?.data) {
        setBooking(response.data);
      } else {
        throw new Error("Failed to load booking details");
      }
    } catch (err) {
      console.error("Error fetching booking:", err);
      setError(err?.message || "Failed to load your tickets");
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId, fetchBookingDetails]);

  const formatDate = (dateString) => {
    if (!dateString) return "Date TBA";
    const d = new Date(dateString);
    if (isNaN(d)) return "Date TBA";
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "Time TBA";
    const d = new Date(dateString);
    if (isNaN(d)) return "Time TBA";
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleDownloadTicket = async (ticket) => {
    try {
      const response = await fetch(
        buildUrl(`/api/booking/${bookingId}/tickets/${ticket.id}/download`),
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to download ticket");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ticket-${ticket.id.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Failed to download ticket");
    }
  };

  const handleDownloadAll = async () => {
    if (downloadingAll) return;
    setDownloadingAll(true);

    try {
      const response = await fetch(
        buildUrl(`/api/booking/${bookingId}/ticket/download`),
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to download tickets");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tickets-${bookingId.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("All tickets downloaded!");
    } catch (err) {
      console.error("Download all error:", err);
      toast.error("Failed to download tickets");
    } finally {
      setDownloadingAll(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "CONFIRMED":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "PENDING":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "CANCELLED":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "REFUNDED":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const totalTickets =
    booking?.tickets?.reduce((sum, t) => sum + (t.quantity || 1), 0) || 0;
  const checkedInTickets =
    booking?.tickets?.filter((t) => t.checkedIn).length || 0;

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-[#000000] via-[#0a0a0a] to-[#050510] px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card className="border-2 border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(59,130,246,0.05)] rounded-xl">
            <CardContent className="p-12 text-center">
              <Loader2 className="w-12 h-12 mx-auto animate-spin text-[#D60024] mb-4" />
              <p className="text-white/70 text-lg">Loading your tickets...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-[#000000] via-[#0a0a0a] to-[#050510] px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card className="border-2 border-red-500/30 bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(214,0,36,0.05)] rounded-xl">
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-16 h-16 mx-auto text-red-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Unable to Load Tickets
              </h3>
              <p className="text-white/60 mb-6">{error}</p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  className="border-white/20 text-white"
                  onClick={() => navigate(-1)}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
                <Button
                  className="bg-[#D60024] text-white"
                  onClick={fetchBookingDetails}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-[#000000] via-[#0a0a0a] to-[#050510] px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card className="border-2 border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(59,130,246,0.05)] rounded-xl">
            <CardContent className="p-12 text-center">
              <Ticket className="w-16 h-16 mx-auto text-white/40 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Booking Not Found
              </h3>
              <p className="text-white/60 mb-6">
                We couldn't find this booking in your account.
              </p>
              <Button
                className="bg-[#D60024] text-white"
                onClick={() => navigate("/dashboard/bookings")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to My Bookings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#000000] via-[#0a0a0a] to-[#050510] text-white">
      {/* Hero Section with Event Image */}
      <div className="relative">
        {/* Background Image */}
        {booking.event?.flyerImage && (
          <div className="absolute inset-0 h-80">
            <img
              src={booking.event.flyerImage}
              alt={booking.event.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-[#000000]" />
          </div>
        )}

        <div className="relative px-4 sm:px-6 lg:px-8 pt-6 pb-8">
          <div className="max-w-6xl mx-auto">
            {/* Back Button */}
            <Button
              variant="ghost"
              className="text-white/70 hover:text-white hover:bg-white/10 mb-6"
              onClick={() => navigate("/dashboard/bookings")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Bookings
            </Button>

            {/* Event Header */}
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge
                  className={`${getStatusColor(booking.booking?.status)} border`}
                >
                  {booking.booking?.status === "CONFIRMED" && (
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                  )}
                  {booking.booking?.status || "Unknown"}
                </Badge>
                <Badge className="bg-[#D60024]/20 text-[#D60024] border border-[#D60024]/30">
                  <Ticket className="w-3 h-3 mr-1" />
                  {totalTickets} {totalTickets === 1 ? "Ticket" : "Tickets"}
                </Badge>
                {checkedInTickets > 0 && (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {checkedInTickets} Checked In
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                {booking.event?.name || "Event"}
              </h1>

              {/* Event Quick Info */}
              <div className="flex flex-wrap gap-6 text-white/80">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#D60024]" />
                  <span>{formatDate(booking.event?.startDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#60a5fa]" />
                  <span>{formatTime(booking.event?.startDate)}</span>
                </div>
                {booking.event?.venue && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#22c55e]" />
                    <span>
                      {[booking.event.venue.city, booking.event.venue.state]
                        .filter(Boolean)
                        .join(", ") || "Venue TBA"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                className="bg-gradient-to-r from-[#D60024] to-[#ff4d67] text-white font-semibold hover:shadow-[0_10px_25px_-10px_rgba(214,0,36,0.4)]"
                onClick={handleDownloadAll}
                disabled={downloadingAll}
              >
                {downloadingAll ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Download All Tickets
              </Button>
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Mail className="w-4 h-4 mr-2" />
                Resend to Email
              </Button>
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <Card className="border border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(214,0,36,0.1)] to-transparent">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm mb-1">Total Tickets</p>
                    <p className="text-2xl font-bold text-white">
                      {totalTickets}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#D60024]/20 flex items-center justify-center">
                    <Ticket className="w-6 h-6 text-[#D60024]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(34,197,94,0.1)] to-transparent">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm mb-1">Checked In</p>
                    <p className="text-2xl font-bold text-white">
                      {checkedInTickets}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(59,130,246,0.1)] to-transparent">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm mb-1">Attendee</p>
                    <p className="text-lg font-bold text-white truncate max-w-[120px]">
                      {booking.user?.name || "Guest"}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(168,85,247,0.1)] to-transparent">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm mb-1">Total Paid</p>
                    <p className="text-2xl font-bold text-white">
                      {booking.booking?.totalAmount
                        ? `₹${booking.booking.totalAmount.toLocaleString()}`
                        : "Free"}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D60024] to-[#ff4d67] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Your Tickets</h2>
              <p className="text-white/60 text-sm">
                Tap on a ticket to see more details
              </p>
            </div>
          </div>

          {/* Tickets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {booking.tickets?.map((ticket, index) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                event={booking.event}
                booking={booking.booking}
                user={booking.user}
                index={index}
                onDownload={handleDownloadTicket}
              />
            ))}
          </div>

          {/* Additional Info */}
          <div className="mt-12">
            <Card className="border border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(255,255,255,0.05)] to-transparent">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-[#60a5fa]" />
                  Important Information
                </h3>
                <div className="space-y-3 text-white/70 text-sm">
                  <p>
                    Please arrive at least 30 minutes before the event start
                    time for smooth entry.
                  </p>
                  <p>
                    Each ticket has a unique QR code that will be scanned at the
                    venue. You can also use the manual check-in code if needed.
                  </p>
                  <p>
                    For any issues or queries, please contact the event
                    organizer or our support team.
                  </p>
                </div>

                <Separator className="my-5 bg-white/10" />

                <div className="flex flex-wrap gap-4 text-sm">
                  <div>
                    <span className="text-white/50">Booking ID:</span>
                    <span className="ml-2 text-white font-mono">
                      {booking.booking?.id?.slice(0, 8) || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/50">Booked on:</span>
                    <span className="ml-2 text-white">
                      {booking.booking?.createdAt
                        ? new Date(booking.booking.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )
                        : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/50">Organizer:</span>
                    <span className="ml-2 text-white">
                      {booking.event?.organizer || "N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTickets;
