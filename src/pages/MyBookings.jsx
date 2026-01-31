import { useState, useMemo, useCallback } from "react";
import { Ticket, Calendar, MapPin, Loader2, AlertCircle, Receipt, CreditCard, User, Download, Hash, Clock, CheckCircle2, XCircle, Search, Filter, ChevronRight, ChevronLeft, Star, TrendingUp, Mail, Eye } from "lucide-react";
import { useBookings } from "@/hooks/useBookings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "@/config/api";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import StarRating from "@/components/StarRating";

// Skeleton component for loading state
const BookingSkeleton = () => (
  <Card className="border-2 border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(255,255,255,0.08)] via-[rgba(59,130,246,0.05)] to-[rgba(214,0,36,0.04)] rounded-xl overflow-hidden animate-pulse">
    <CardHeader className="p-3 sm:p-4 border-b border-[rgba(100,200,255,0.15)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 bg-[rgba(255,255,255,0.2)] rounded" />
          <div className="h-3 w-20 bg-[rgba(255,255,255,0.2)] rounded" />
          <div className="h-3 w-32 bg-[rgba(255,255,255,0.2)] rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-5 w-20 bg-[rgba(255,255,255,0.2)] rounded-full" />
          <div className="h-5 w-16 bg-[rgba(255,255,255,0.2)] rounded-full" />
        </div>
      </div>
    </CardHeader>
    <CardContent className="p-3 sm:p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex gap-3 flex-1">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-[rgba(255,255,255,0.15)]" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-16 bg-[rgba(255,255,255,0.2)] rounded" />
            <div className="h-5 w-48 bg-[rgba(255,255,255,0.2)] rounded" />
            <div className="h-3 w-32 bg-[rgba(255,255,255,0.15)] rounded" />
            <div className="h-3 w-24 bg-[rgba(255,255,255,0.15)] rounded" />
          </div>
        </div>
        <div className="flex items-center gap-4 px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.05)]">
          <div className="h-8 w-16 bg-[rgba(255,255,255,0.15)] rounded" />
          <div className="h-8 w-20 bg-[rgba(255,255,255,0.15)] rounded" />
          <div className="h-8 w-16 bg-[rgba(255,255,255,0.15)] rounded" />
        </div>
        <div className="flex lg:flex-col gap-2 lg:w-24">
          <div className="h-8 flex-1 bg-[rgba(255,255,255,0.15)] rounded" />
          <div className="h-8 flex-1 bg-[rgba(255,255,255,0.15)] rounded" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const MyBookings = () => {
  const navigate = useNavigate();
  const feedbackSuggestions = [
    "Loved every minute of the performances!",
    "Great crowd energy and smooth entry experience.",
    "Sound and lighting were on point, would attend again.",
    "Felt the schedule ran late; could improve timing.",
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Use the new React Query hook for bookings with pagination
  const {
    bookings: rawBookings,
    pagination,
    isLoading: loading,
    isFetching,
    isError,
    error,
    refetch: fetchBookings,
    hasNextPage,
    hasPrevPage,
    prefetchNextPage,
    invalidateBookings,
  } = useBookings({
    page: currentPage,
    limit: 10,
    status: filterStatus,
  });

  // Normalize bookings data for display
  const bookings = useMemo(() => {
    if (!Array.isArray(rawBookings)) return [];

    return rawBookings.map((item) => {
      const evt = item.event || {};
      const amounts = item.analytics?.amounts || {};
      const tickets = Array.isArray(item.tickets) ? item.tickets : [];
      const totalTickets =
        item.analytics?.totalTickets ??
        tickets.reduce((sum, t) => sum + (t?.quantity || 0), 0);

      const primaryTicket = tickets[0];
      const startDate = evt.startDate || null;
      const endDate = evt.endDate || null;
      const statusNormalized = (item.status || "").toLowerCase();
      const paymentStatus = (item.payment?.status || "").toLowerCase();

      const location = evt.venue
        ? [evt.venue.city, evt.venue.state].filter(Boolean).join(", ")
        : "Venue TBA";

      const formatTime = (date) => {
        if (!date) return "Time TBA";
        const d = new Date(date);
        if (isNaN(d)) return "Time TBA";
        return d.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        });
      };

      const fallbackTotal =
        tickets.reduce((sum, t) => sum + (t?.amount || 0), 0) ||
        tickets.reduce((sum, t) => sum + (t?.price || 0) * (t?.quantity || 0), 0);

      return {
        id: item.id,
        orderId: item.payment?.transactionId || item.id,
        bookingDate: item.createdAt || evt.createdAt,
        status: statusNormalized,
        paymentStatus,
        eventId: evt.id,
        eventTitle: evt.title || "Event",
        eventDate: startDate || endDate,
        eventEndDate: endDate,
        eventTime: formatTime(startDate),
        image:
          evt.flyerImage ||
          evt.image ||
          "https://via.placeholder.com/600x400?text=Event",
        category: evt.category || evt.subCategory || "Event",
        location,
        ticketType: primaryTicket?.name || "Ticket",
        quantity: totalTickets || 0,
        totalPrice: amounts.total || fallbackTotal || 0,
        tickets,
        analytics: item.analytics,
        payment: item.payment,
        review: item.review || null,
        status1: evt.status1,
        status2: evt.status2,
      };
    });
  }, [rawBookings]);

  // Prefetch next page when hovering pagination
  const handlePrefetchNext = useCallback(() => {
    prefetchNextPage();
  }, [prefetchNextPage]);

  // Reset to first page when filter changes
  const handleFilterChange = useCallback((newStatus) => {
    setFilterStatus(newStatus);
    setCurrentPage(1);
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "Date TBA";
    const d = new Date(dateString);
    if (isNaN(d)) return "Date TBA";
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return d.toLocaleDateString('en-US', options);
  };

  const formatBookingDate = (dateString) => {
    if (!dateString) return "Date TBA";
    const d = new Date(dateString);
    if (isNaN(d)) return "Date TBA";
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return d.toLocaleDateString('en-US', options);
  };

  const handleDownloadTicket = (booking) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('EVENT TICKET', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Event: ${booking.eventTitle}`, 20, 40);
    doc.text(`Date: ${formatDate(booking.eventDate)}`, 20, 50);
    doc.text(`Time: ${booking.eventTime}`, 20, 60);
    doc.text(`Location: ${booking.location}`, 20, 70);
    doc.text(`Order ID: ${booking.orderId}`, 20, 80);
    
    const qrData = `Order: ${booking.orderId}\nEvent: ${booking.eventTitle}\nDate: ${booking.eventDate}\nQR: ${booking.qrCode}`;
    
    QRCode.toDataURL(qrData, { width: 100 }, (err, url) => {
      if (err) return console.error(err);
      doc.addImage(url, 'PNG', 150, 40, 40, 40);
      doc.save(`ticket-${booking.orderId}.pdf`);
    });
    
    toast.success('Ticket downloaded successfully!');
  };

  const handleResendTicket = (booking) => {
    toast.success(`Ticket for ${booking.eventTitle} has been sent to your email!`);
  };

  // Client-side search filtering (pagination handles status filter server-side)
  const filteredBookings = useMemo(() => {
    if (!searchQuery.trim()) return bookings;

    return bookings.filter(booking => {
      const matchesSearch =
        (booking.eventTitle || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (booking.orderId || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [bookings, searchQuery]);

  const stats = useMemo(() => {
    const total = bookings.length;
    const totalSpent = bookings.reduce((sum, b) => sum + (b?.totalPrice || 0), 0);
    const upcoming = bookings.filter(b => b?.eventDate && new Date(b.eventDate) > new Date()).length;
    return { total, totalSpent, upcoming };
  }, [bookings]);

  const isEventPast = (booking) => {
    const endDate = booking?.eventEndDate || booking?.eventDate;
    if (!endDate) return false;
    const end = new Date(endDate);
    if (isNaN(end)) return false;
    return end < new Date();
  };

  const fetchUserReview = useCallback(async (eventId) => {
    try {
      const response = await apiFetch(`/api/event/${eventId}/reviews/me`, {
        method: "GET",
      });

      if (response?.success && response?.data) {
        return response.data;
      }
      return null;
    } catch (err) {
      if (err?.status === 404) return null;
      console.error("Failed to fetch review", err);
      return null;
    }
  }, []);

  const handleOpenReview = async (booking) => {
    if (!booking?.eventId) {
      toast.error("Event details missing for this booking.");
      return;
    }

    setReviewRating(0);
    setReviewComment("");
    setSelectedBookingForReview(booking);
    setReviewDialogOpen(true);
  };

  const handleCloseReview = () => {
    setReviewDialogOpen(false);
    setSelectedBookingForReview(null);
    setReviewRating(0);
    setReviewComment("");
  };

  const handleReviewDialogChange = (open) => {
    if (!open) {
      handleCloseReview();
    } else {
      // Fresh slate every open to avoid auto-filled stars/comments
      setReviewRating(0);
      setReviewComment("");
      setReviewDialogOpen(true);
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedBookingForReview?.eventId) {
      toast.error("Event details missing for this booking.");
      return;
    }

    if (reviewRating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const payload = {
        rating: reviewRating,
        comment: reviewComment.trim(),
      };

      const response = await apiFetch(`/api/event/${selectedBookingForReview.eventId}/reviews`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (response?.success || response?.code === 201) {
        toast.success("Thanks for your feedback!");
        // Invalidate bookings cache to refetch with updated review data
        invalidateBookings();
        handleCloseReview();
      } else {
        throw new Error(response?.message || "Failed to submit review");
      }
    } catch (err) {
      console.error("Failed to submit review", err);
      toast.error(err?.message || "Could not submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const hasBookings = bookings.length > 0;
  const hasFilteredBookings = filteredBookings.length > 0;
  const showEmptyState = !loading && !hasBookings && currentPage === 1;

  const handleRetry = () => {
    fetchBookings();
  };

  // Pagination handlers
  const goToNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (hasPrevPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 md:py-10 text-white bg-gradient-to-br from-[#000000] via-[#0a0a0a] to-[#050510] min-h-screen">
      {/* Header Section with top spacing */}
      <div className="mb-8 sm:mb-10 mt-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white flex items-center gap-3">
              <Ticket className="h-8 w-8 text-[#D60024]" />
              My Bookings
            </h1>
            <p className="text-[rgba(255,255,255,0.65)] mt-2 text-sm sm:text-base">
              View and manage all your event bookings
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="border-2 border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(214,0,36,0.15)] to-[rgba(214,0,36,0.05)] rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <Receipt className="h-5 w-5 text-[#D60024]" />
                <TrendingUp className="h-4 w-4 text-[rgba(255,255,255,0.4)]" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">{stats.total}</p>
              <p className="text-xs text-[rgba(255,255,255,0.65)] font-medium">Total Bookings</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(59,130,246,0.15)] to-[rgba(59,130,246,0.05)] rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="h-5 w-5 text-[#60a5fa]" />
                <Star className="h-4 w-4 text-[rgba(255,255,255,0.4)]" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">{stats.upcoming}</p>
              <p className="text-xs text-[rgba(255,255,255,0.65)] font-medium">Upcoming Events</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(34,197,94,0.15)] to-[rgba(34,197,94,0.05)] rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <CreditCard className="h-5 w-5 text-[#22c55e]" />
                <TrendingUp className="h-4 w-4 text-[rgba(255,255,255,0.4)]" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">₹{stats.totalSpent.toLocaleString()}</p>
              <p className="text-xs text-[rgba(255,255,255,0.65)] font-medium">Total Spent</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[rgba(100,200,255,0.7)]" />
            <Input
              type="search"
              placeholder="Search by event name or order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[rgba(255,255,255,0.08)] border border-[rgba(100,200,255,0.2)] text-white placeholder:text-[rgba(255,255,255,0.6)] focus:ring-2 focus:ring-[#60a5fa] focus:border-[#60a5fa] rounded-lg"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              onClick={() => handleFilterChange('all')}
              className="text-sm"
            >
              All
            </Button>
            <Button
              variant={filterStatus === 'confirmed' ? 'default' : 'outline'}
              onClick={() => handleFilterChange('confirmed')}
              className="text-sm"
            >
              Confirmed
            </Button>
          </div>
        </div>
      </div>

      {/* Upcoming Events Section */}
      {filteredBookings.filter(b => b?.eventDate && new Date(b.eventDate) > new Date()).length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Star className="h-6 w-6 text-[#D60024]" />
              Upcoming Events
            </h2>
            <Badge className="bg-[#D60024]/20 text-[#D60024] border border-[#D60024]/30 px-3 py-1">
              {filteredBookings.filter(b => b?.eventDate && new Date(b.eventDate) > new Date()).length} Events
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBookings
              .filter(b => b?.eventDate && new Date(b.eventDate) > new Date())
              .slice(0, 3)
              .map((booking) => (
                <Card
                  key={booking.id}
                  className="border-2 border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(59,130,246,0.05)] rounded-xl hover:border-[rgba(100,200,255,0.4)] hover:shadow-[0_20px_50px_-20px_rgba(100,180,255,0.3)] transition-all duration-300 overflow-hidden group cursor-pointer"
                  onClick={() => navigate(`/dashboard/bookings/${booking.id}/tickets`)}
                >
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={booking.image}
                      alt={booking.eventTitle}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    <Badge className="absolute top-3 left-3 bg-[#D60024] text-white text-xs px-2 py-1">
                      {booking.category}
                    </Badge>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white font-bold text-base line-clamp-2 mb-1">{booking.eventTitle}</h3>
                    </div>
                  </div>
                  
                  <CardContent className="p-4 space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-[rgba(255,255,255,0.75)]">
                        <Calendar className="h-4 w-4 text-[#60a5fa] flex-shrink-0" />
                        <span className="line-clamp-1">{formatDate(booking.eventDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[rgba(255,255,255,0.75)]">
                        <Clock className="h-4 w-4 text-[#60a5fa] flex-shrink-0" />
                        <span>{booking.eventTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[rgba(255,255,255,0.75)]">
                        <MapPin className="h-4 w-4 text-[#60a5fa] flex-shrink-0" />
                        <span className="line-clamp-1">{booking.location}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-[rgba(100,200,255,0.15)]">
                      <div>
                        <p className="text-xs text-[rgba(255,255,255,0.65)]">{booking.quantity} {booking.quantity > 1 ? 'Tickets' : 'Ticket'}</p>
                        <p className="text-sm font-bold text-white">{booking.ticketType}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[rgba(255,255,255,0.65)]">Total</p>
                        <p className="text-lg font-bold text-[#D60024]">₹{booking.totalPrice.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-[#D60024] to-[#ff4d67] text-white font-semibold hover:shadow-[0_10px_25px_-10px_rgba(214,0,36,0.4)] transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/dashboard/bookings/${booking.id}/tickets`);
                        }}
                      >
                        <Ticket className="h-4 w-4 mr-2" />
                        View Tickets
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadTicket(booking);
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* All Bookings Section */}
      <div className="mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 mb-4">
          <Receipt className="h-6 w-6 text-[#60a5fa]" />
          All Bookings
        </h2>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <BookingSkeleton key={i} />
          ))}
        </div>
      ) : showEmptyState ? (
        <Card className="border-2 border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(59,130,246,0.05)] rounded-xl">
          <CardContent className="p-12 text-center">
            <Ticket className="w-16 h-16 text-[rgba(255,255,255,0.4)] mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-white">You don’t have any bookings yet</h3>
            <p className="text-[rgba(255,255,255,0.65)] mb-6">
              Start exploring events and book your first ticket.
            </p>
            <Link to="/dashboard/browse-events">
              <Button className="bg-gradient-to-r from-[#D60024] to-[#ff4d67] text-white font-semibold">
                Browse Events
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : !hasFilteredBookings ? (
        <Card className="border-2 border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(59,130,246,0.05)] rounded-xl">
          <CardContent className="p-12 text-center">
            <Search className="w-16 h-16 text-[rgba(255,255,255,0.4)] mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-white">No matching bookings</h3>
            <p className="text-[rgba(255,255,255,0.65)]">
              Try adjusting your search or filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Show loading overlay when fetching new page */}
          {isFetching && !loading && (
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl">
              <Loader2 className="w-6 h-6 animate-spin text-[#D60024]" />
            </div>
          )}
          {filteredBookings.map((booking) => (
            <Card
              key={booking.id}
              className="border-2 border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(255,255,255,0.08)] via-[rgba(59,130,246,0.05)] to-[rgba(214,0,36,0.04)] rounded-xl hover:border-[rgba(100,200,255,0.4)] hover:shadow-[0_20px_50px_-20px_rgba(100,180,255,0.3)] transition-all duration-300 overflow-hidden"
            >
              <CardHeader className="p-3 sm:p-4 border-b border-[rgba(100,200,255,0.15)]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <Hash className="h-4 w-4 text-[rgba(255,255,255,0.65)]" />
                    <span className="text-xs text-[rgba(255,255,255,0.65)]">Order ID:</span>
                    <span className="text-xs font-mono font-semibold text-white">{booking.orderId}</span>
                    <span className="text-xs text-[rgba(255,255,255,0.5)]">•</span>
                    <span className="text-xs text-[rgba(255,255,255,0.65)]">
                      Booked on {formatBookingDate(booking.bookingDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${booking.status === 'confirmed' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-amber-500/20 text-amber-200 border border-amber-500/30'} text-xs px-2 py-0.5`}>
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {booking.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                    </Badge>
                    <Badge className={`${booking.paymentStatus === 'success' ? 'bg-[#60a5fa]/20 text-[#bfdbfe] border border-[#60a5fa]/30' : 'bg-amber-500/20 text-amber-200 border border-amber-500/30'} text-xs px-2 py-0.5`}>
                      <CreditCard className="h-3 w-3 mr-1" />
                      {booking.paymentStatus ? booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1) : 'Payment'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Event Info - Compact */}
                  <div className="flex gap-3 flex-1">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex-shrink-0 border border-[rgba(100,200,255,0.2)]">
                      <img
                        src={booking.image}
                        alt={booking.eventTitle}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Badge className="bg-[#D60024] text-white text-xs mb-1.5 px-2 py-0.5">{booking.category}</Badge>
                      <h3 className="text-base sm:text-lg font-bold text-white mb-1.5 line-clamp-1">{booking.eventTitle}</h3>
                      <div className="space-y-1 text-xs text-[rgba(255,255,255,0.75)]">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-[#60a5fa] flex-shrink-0" />
                          <span className="line-clamp-1">{formatDate(booking.eventDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-[#60a5fa] flex-shrink-0" />
                          <span>{booking.eventTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-[#60a5fa] flex-shrink-0" />
                          <span className="line-clamp-1">{booking.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ticket Details - Inline */}
                  <div className="flex items-center gap-4 px-3 py-2 rounded-lg bg-gradient-to-r from-[rgba(255,255,255,0.05)] to-[rgba(59,130,246,0.05)] border border-[rgba(100,200,255,0.15)]">
                    <div className="text-center">
                      <p className="text-[rgba(255,255,255,0.65)] text-xs mb-0.5">Tickets</p>
                      <p className="font-semibold text-white text-sm">{booking.quantity}</p>
                    </div>
                    <div className="h-8 w-px bg-[rgba(100,200,255,0.2)]"></div>
                    <div className="text-center">
                      <p className="text-[rgba(255,255,255,0.65)] text-xs mb-0.5">Type</p>
                      <p className="font-semibold text-white text-sm line-clamp-1">{booking.ticketType}</p>
                    </div>
                    <div className="h-8 w-px bg-[rgba(100,200,255,0.2)]"></div>
                    <div className="text-center">
                      <p className="text-[rgba(255,255,255,0.65)] text-xs mb-0.5">Total</p>
                      <p className="font-bold text-[#D60024] text-base">₹{booking.totalPrice.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Actions - Compact */}
                  <div className="flex lg:flex-col gap-2 lg:w-auto">
                    <Button
                      size="sm"
                      className="flex-1 lg:flex-none bg-gradient-to-r from-[#D60024] to-[#ff4d67] text-white font-semibold hover:shadow-[0_10px_25px_-10px_rgba(214,0,36,0.4)] transition-all text-xs px-3 py-2"
                      onClick={() => handleDownloadTicket(booking)}
                    >
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 lg:flex-none border-[rgba(100,200,255,0.3)] text-white hover:bg-[rgba(59,130,246,0.15)] hover:border-[#60a5fa] text-xs px-3 py-2"
                      onClick={() => navigate(`/dashboard/bookings/${booking.id}/tickets`)}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1.5" />
                      View Tickets
                    </Button>
                    {isEventPast(booking) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="flex-1 lg:flex-none border border-dashed border-[rgba(214,0,36,0.4)] text-[#ff6b81] hover:border-[#ff6b81] hover:bg-[rgba(214,0,36,0.08)] text-xs px-3 py-2"
                        onClick={() => handleOpenReview(booking)}
                      >
                        <Star className="h-3.5 w-3.5 mr-1.5 fill-current text-[#ffb347]" />
                        {booking.review ? "Edit Feedback" : "Leave Feedback"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-[rgba(100,200,255,0.15)]">
              <p className="text-sm text-[rgba(255,255,255,0.65)]">
                Showing {((currentPage - 1) * pagination.limit) + 1} - {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} bookings
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPrevPage}
                  disabled={!hasPrevPage || isFetching}
                  className="border-[rgba(100,200,255,0.3)] text-white hover:bg-[rgba(59,130,246,0.15)] disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, pagination.totalPages))].map((_, idx) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = idx + 1;
                    } else if (currentPage <= 3) {
                      pageNum = idx + 1;
                    } else if (currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + idx;
                    } else {
                      pageNum = currentPage - 2 + idx;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(pageNum)}
                        disabled={isFetching}
                        className={`min-w-[36px] ${
                          currentPage === pageNum
                            ? "bg-[#D60024] text-white"
                            : "border-[rgba(100,200,255,0.3)] text-white hover:bg-[rgba(59,130,246,0.15)]"
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  onMouseEnter={handlePrefetchNext}
                  disabled={!hasNextPage || isFetching}
                  className="border-[rgba(100,200,255,0.3)] text-white hover:bg-[rgba(59,130,246,0.15)] disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Feedback Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={handleReviewDialogChange}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto bg-[#0f111a] text-white border border-[rgba(100,200,255,0.25)] shadow-[0_20px_60px_rgba(0,0,0,0.45)] rounded-2xl custom-scroll pr-2">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Star className="h-5 w-5 text-[#ffb347]" />
              {selectedBookingForReview?.review ? "Edit your feedback" : "Share your experience"}
            </DialogTitle>
            <p className="text-sm text-[rgba(255,255,255,0.7)]">
              Rate the event you attended and help others discover great experiences.
            </p>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label className="text-[rgba(255,255,255,0.9)] text-sm">Rating *</Label>
              <StarRating
                rating={reviewRating}
                onRatingChange={setReviewRating}
                readonly={false}
                size="lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="review-comment" className="text-[rgba(255,255,255,0.9)] text-sm">Your feedback (optional)</Label>
              <div className="flex flex-wrap gap-2">
                {feedbackSuggestions.map((tip) => (
                  <button
                    key={tip}
                    type="button"
                    onClick={() => setReviewComment(tip.slice(0, 1000))}
                    className="text-xs px-3 py-1 rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.04)] hover:border-[#60a5fa] hover:text-white hover:bg-[rgba(96,165,250,0.08)] transition-colors"
                  >
                    {tip}
                  </button>
                ))}
              </div>
              <Textarea
                id="review-comment"
                placeholder="Share highlights, energy, organization, performances, crowd, or anything you'd like others to know (optional)."
                value={reviewComment}
                onChange={(e) => {
                  const value = e.target.value.slice(0, 1000);
                  setReviewComment(value);
                }}
                rows={5}
                className="bg-[rgba(255,255,255,0.05)] border border-[rgba(100,200,255,0.2)] focus-visible:ring-[#60a5fa]"
              />
              <div className="flex justify-between text-xs text-[rgba(255,255,255,0.6)]">
                <span>Minimally 1–2 lines appreciated</span>
                <span>{reviewComment.length}/1000</span>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button
              variant="outline"
              className="border-[rgba(100,200,255,0.3)] text-white"
              onClick={handleCloseReview}
              disabled={isSubmittingReview}
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-[#D60024] to-[#ff4d67] text-white"
              onClick={handleSubmitReview}
              disabled={isSubmittingReview || reviewRating === 0}
            >
              {isSubmittingReview ? "Submitting..." : selectedBookingForReview?.review ? "Update Feedback" : "Submit Feedback"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyBookings;

