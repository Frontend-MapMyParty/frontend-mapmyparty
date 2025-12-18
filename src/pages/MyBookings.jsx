import { useState, useEffect, useMemo, useCallback } from "react";
import { Ticket, Calendar, MapPin, Loader2, AlertCircle, Receipt, CreditCard, User, Download, Hash, Clock, CheckCircle2, XCircle, Search, Filter, ChevronRight, Star, TrendingUp, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import TicketModal from "@/components/TicketModal";
import { apiFetch } from "@/config/api";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";

// Comprehensive dummy data for My Bookings
const DUMMY_BOOKINGS = [
  {
    id: "BK001",
    orderId: "ORD-2024-001",
    eventTitle: "Coldplay Live Concert 2024",
    eventDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    eventTime: "7:00 PM",
    location: "DY Patil Stadium, Mumbai, India",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&h=300&fit=crop",
    category: "Music",
    ticketType: "VIP Premium",
    quantity: 2,
    unitPrice: 2500,
    totalPrice: 5000,
    status: "confirmed",
    paymentStatus: "completed",
    paymentMethod: "Credit Card",
    bookingDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    organizerName: "Live Nation India",
    organizerEmail: "contact@livenation.in",
    qrCode: "QR-BK001-COLDPLAY"
  },
  {
    id: "BK002",
    orderId: "ORD-2024-002",
    eventTitle: "Tech Summit 2024",
    eventDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    eventTime: "9:00 AM",
    location: "Bangalore International Exhibition Centre, Bangalore, India",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop",
    category: "Business",
    ticketType: "Conference Pass",
    quantity: 1,
    unitPrice: 1500,
    totalPrice: 1500,
    status: "confirmed",
    paymentStatus: "completed",
    paymentMethod: "UPI",
    bookingDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    organizerName: "TechEvents India",
    organizerEmail: "info@techevents.in",
    qrCode: "QR-BK002-TECHSUMMIT"
  },
  {
    id: "BK003",
    orderId: "ORD-2024-003",
    eventTitle: "Food & Wine Festival",
    eventDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString(),
    eventTime: "6:00 PM",
    location: "Jawaharlal Nehru Stadium, Delhi, India",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561404?w=500&h=300&fit=crop",
    category: "Food",
    ticketType: "General Admission",
    quantity: 3,
    unitPrice: 1200,
    totalPrice: 3600,
    status: "confirmed",
    paymentStatus: "completed",
    paymentMethod: "Debit Card",
    bookingDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    organizerName: "Culinary Events Co.",
    organizerEmail: "hello@culinaryevents.com",
    qrCode: "QR-BK003-FOODFEST"
  },
  {
    id: "BK004",
    orderId: "ORD-2024-004",
    eventTitle: "EDM Festival Night",
    eventDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    eventTime: "10:00 PM",
    location: "Vagator Beach, Goa, India",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=300&fit=crop",
    category: "Music",
    ticketType: "Early Bird",
    quantity: 2,
    unitPrice: 1800,
    totalPrice: 3600,
    status: "confirmed",
    paymentStatus: "completed",
    paymentMethod: "Net Banking",
    bookingDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    organizerName: "Sunburn Events",
    organizerEmail: "tickets@sunburn.in",
    qrCode: "QR-BK004-EDMFEST"
  },
  {
    id: "BK005",
    orderId: "ORD-2024-005",
    eventTitle: "Stand-up Comedy Night",
    eventDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    eventTime: "8:00 PM",
    location: "Phoenix Marketcity, Pune, India",
    image: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=500&h=300&fit=crop",
    category: "Entertainment",
    ticketType: "Premium Seating",
    quantity: 2,
    unitPrice: 800,
    totalPrice: 1600,
    status: "confirmed",
    paymentStatus: "completed",
    paymentMethod: "Wallet",
    bookingDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    organizerName: "Comedy Central India",
    organizerEmail: "bookings@comedycentral.in",
    qrCode: "QR-BK005-COMEDY"
  },
  {
    id: "BK006",
    orderId: "ORD-2024-006",
    eventTitle: "Marathon 2024",
    eventDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    eventTime: "6:00 AM",
    location: "Necklace Road, Hyderabad, India",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&h=300&fit=crop",
    category: "Sports",
    ticketType: "10K Run",
    quantity: 1,
    unitPrice: 500,
    totalPrice: 500,
    status: "confirmed",
    paymentStatus: "completed",
    paymentMethod: "UPI",
    bookingDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    organizerName: "Hyderabad Runners",
    organizerEmail: "register@hydrunners.com",
    qrCode: "QR-BK006-MARATHON"
  }
];

const MyBookings = () => {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [bookings, setBookings] = useState(DUMMY_BOOKINGS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFetch("/api/user/bookings", { method: "GET" });
      if (response?.success && Array.isArray(response?.data?.items)) {
        setBookings(response.data.items);
      } else {
        setBookings(DUMMY_BOOKINGS);
      }
    } catch (err) {
      console.error("Failed to load bookings", err);
      setError(err?.message || "Failed to load your bookings.");
      setBookings(DUMMY_BOOKINGS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Comment out API call to use dummy data
    // fetchBookings();
  }, [fetchBookings]);

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatBookingDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
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

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const matchesSearch = booking.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           booking.orderId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || booking.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [bookings, searchQuery, filterStatus]);

  const stats = useMemo(() => {
    const total = bookings.length;
    const totalSpent = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const upcoming = bookings.filter(b => new Date(b.eventDate) > new Date()).length;
    return { total, totalSpent, upcoming };
  }, [bookings]);

  const handleRetry = () => {
    fetchBookings();
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
              onClick={() => setFilterStatus('all')}
              className="text-sm"
            >
              All
            </Button>
            <Button
              variant={filterStatus === 'confirmed' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('confirmed')}
              className="text-sm"
            >
              Confirmed
            </Button>
          </div>
        </div>
      </div>

      {/* Upcoming Events Section */}
      {filteredBookings.filter(b => new Date(b.eventDate) > new Date()).length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Star className="h-6 w-6 text-[#D60024]" />
              Upcoming Events
            </h2>
            <Badge className="bg-[#D60024]/20 text-[#D60024] border border-[#D60024]/30 px-3 py-1">
              {filteredBookings.filter(b => new Date(b.eventDate) > new Date()).length} Events
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBookings
              .filter(b => new Date(b.eventDate) > new Date())
              .slice(0, 3)
              .map((booking) => (
                <Card
                  key={booking.id}
                  className="border-2 border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(59,130,246,0.05)] rounded-xl hover:border-[rgba(100,200,255,0.4)] hover:shadow-[0_20px_50px_-20px_rgba(100,180,255,0.3)] transition-all duration-300 overflow-hidden group cursor-pointer"
                  onClick={() => setSelectedTicket(booking)}
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
                    
                    <Button
                      size="sm"
                      className="w-full bg-gradient-to-r from-[#D60024] to-[#ff4d67] text-white font-semibold hover:shadow-[0_10px_25px_-10px_rgba(214,0,36,0.4)] transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadTicket(booking);
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Ticket
                    </Button>
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
        <Card className="border-2 border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(59,130,246,0.05)] rounded-xl">
          <CardContent className="p-12 text-center">
            <Loader2 className="w-10 h-10 mx-auto animate-spin text-[#D60024] mb-4" />
            <p className="text-[rgba(255,255,255,0.65)]">Loading your bookings...</p>
          </CardContent>
        </Card>
      ) : filteredBookings.length === 0 ? (
        <Card className="border-2 border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(59,130,246,0.05)] rounded-xl">
          <CardContent className="p-12 text-center">
            <Ticket className="w-16 h-16 text-[rgba(255,255,255,0.4)] mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-white">No bookings found</h3>
            <p className="text-[rgba(255,255,255,0.65)] mb-6">
              {searchQuery ? 'Try adjusting your search' : 'Start exploring events and book your first ticket!'}
            </p>
            <Link to="/dashboard/browse-events">
              <Button className="bg-gradient-to-r from-[#D60024] to-[#ff4d67] text-white font-semibold">
                Browse Events
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
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
                    <Badge className="bg-green-500/20 text-green-300 border border-green-500/30 text-xs px-2 py-0.5">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {booking.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                    </Badge>
                    <Badge className="bg-[#60a5fa]/20 text-[#93c5fd] border border-[#60a5fa]/30 text-xs px-2 py-0.5">
                      <CreditCard className="h-3 w-3 mr-1" />
                      Paid
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
                      onClick={() => setSelectedTicket(booking)}
                    >
                      <Ticket className="h-3.5 w-3.5 mr-1.5" />
                      Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedTicket && (
        <TicketModal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          ticket={selectedTicket}
        />
      )}
    </div>
  );
};

export default MyBookings;

