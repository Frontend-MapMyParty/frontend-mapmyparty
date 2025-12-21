import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, MapPin, Users, Ticket, Download, Mail, ChevronRight, Star, Zap, TrendingUp, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar as CalendarIcon } from "lucide-react";
import { apiFetch } from "@/config/api";

const Dashboard = () => {
  const [bookedEvents, setBookedEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loadingBooked, setLoadingBooked] = useState(true);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  const [errorBooked, setErrorBooked] = useState(null);
  const [errorUpcoming, setErrorUpcoming] = useState(null);

  const normalizeUpcomingEvent = (event) => {
    const startDate = event.startDate || event.date || event.start_time || event.start;
    const endDate = event.endDate || event.end_time || event.end;
    const parsedDate = startDate ? new Date(startDate) : null;
    const venue = Array.isArray(event.venues) ? event.venues[0] : event.venue;
    const location = venue
      ? [venue.name, venue.city, venue.state].filter(Boolean).join(", ")
      : event.location || "Venue TBA";

    const prices = Array.isArray(event.tickets)
      ? event.tickets
          .map((t) => Number(t.price || t.amount))
          .filter((n) => !isNaN(n) && n > 0)
      : [];
    const minPrice = prices.length > 0 ? Math.min(...prices) : Number(event.price) || 0;

    const formatTime = (dateString) => {
      if (!dateString) return "Time TBA";
      const d = new Date(dateString);
      if (isNaN(d)) return "Time TBA";
      return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    };

    return {
      id: event.id || event._id,
      title: event.title || event.eventTitle || "Event",
      date: startDate || endDate,
      endDate,
      time: formatTime(startDate),
      location,
      price: minPrice,
      image:
        event.flyerImage ||
        event.image ||
        event.coverImage ||
        event.thumbnail ||
        "https://via.placeholder.com/600x400?text=Event",
      category: event.category || event.mainCategory || event.subCategory || "Event",
      rating: event.rating || event.averageRating || 4.5,
      attendees: event.attendees || event.analytics?.attendees || event.analytics?.totalAttendees || 0,
    };
  };

  const normalizeBooking = (item) => {
    const evt = item.event || {};
    const amounts = item.analytics?.amounts || {};
    const tickets = Array.isArray(item.tickets) ? item.tickets : [];
    const totalTickets =
      item.analytics?.totalTickets ?? tickets.reduce((sum, t) => sum + (t?.quantity || 0), 0);
    const startDate = evt.startDate || evt.date || item.eventDate;
    const formatTime = (date) => {
      if (!date) return "Time TBA";
      const d = new Date(date);
      if (isNaN(d)) return "Time TBA";
      return d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
    };
    const venue = evt.venue || (Array.isArray(evt.venues) ? evt.venues[0] : null);
    const location = venue
      ? [venue.city, venue.state].filter(Boolean).join(", ")
      : evt.location || "Venue TBA";
    const fallbackTotal =
      tickets.reduce((sum, t) => sum + (t?.amount || 0), 0) ||
      tickets.reduce((sum, t) => sum + (t?.price || 0) * (t?.quantity || 0), 0);

    return {
      id: item.id || item._id,
      title: evt.title || "Event",
      date: startDate || evt.endDate,
      bookingDate: item.createdAt || item.bookingDate || startDate || evt.createdAt,
      time: formatTime(startDate),
      location,
      price: amounts.total || fallbackTotal || 0,
      image:
        evt.flyerImage ||
        evt.image ||
        evt.coverImage ||
        evt.thumbnail ||
        "https://via.placeholder.com/600x400?text=Event",
      category: evt.category || evt.subCategory || "Event",
      status: item.status || "confirmed",
      ticketCount: totalTickets || 0,
    };
  };

  // Fetch booked events
  const fetchBookedEvents = useCallback(async () => {
    try {
      setLoadingBooked(true);
      setErrorBooked(null);
      const response = await apiFetch("/api/user/bookings", {
        method: "GET",
      });

      const items =
        response?.data?.items ||
        response?.data ||
        response?.bookings ||
        [];

      const normalized = Array.isArray(items) ? items.map(normalizeBooking) : [];
      const sorted = normalized.sort((a, b) => {
        const da = new Date(a.bookingDate || a.date).getTime();
        const db = new Date(b.bookingDate || b.date).getTime();
        return isNaN(db) - isNaN(da) || db - da;
      });
      setBookedEvents(sorted.slice(0, 6));
    } catch (err) {
      console.error("❌ Error fetching booked events:", err);
      setErrorBooked(err?.message || "Failed to load booked events");
      setBookedEvents([]);
    } finally {
      setLoadingBooked(false);
    }
  }, []);

  // Fetch upcoming events (next 10 days)
  const fetchUpcomingEvents = useCallback(async () => {
    try {
      setLoadingUpcoming(true);
      setErrorUpcoming(null);
      const response = await apiFetch("/api/event", {
        method: "GET",
      });

      const rawEvents = response?.data?.events || response?.data || response || [];
      const nowTime = Date.now();
      const isPublished = (evt) => {
        const status =
          evt.publishStatus ||
          evt.publish_status ||
          evt.publishstatus ||
          evt.status;
        return typeof status === "string" && status.toUpperCase() === "PUBLISHED";
      };

      const normalized = Array.isArray(rawEvents)
        ? rawEvents
            .filter(isPublished)
            .map(normalizeUpcomingEvent)
            .filter((evt) => {
              if (!evt.date) return false;
              const d = new Date(evt.date).getTime();
              if (Number.isNaN(d)) return false;
              return d - nowTime >= 0; // keep only future events, no upper limit
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date))
        : [];

      setUpcomingEvents(normalized);
    } catch (err) {
      console.error("❌ Error fetching upcoming events:", err);
      setErrorUpcoming(err?.message || "Failed to load upcoming events");
      setUpcomingEvents([]);
    } finally {
      setLoadingUpcoming(false);
    }
  }, []);

  useEffect(() => {
    fetchBookedEvents();
    fetchUpcomingEvents();
  }, [fetchBookedEvents, fetchUpcomingEvents]);

  const now = new Date();
  const nextEvent = upcomingEvents
    .map((event) => {
      const parsedDate = event?.date ? new Date(event.date) : null;
      return { event, parsedDate };
    })
    .filter(({ parsedDate }) => parsedDate && !isNaN(parsedDate))
    .sort((a, b) => a.parsedDate - b.parsedDate)[0]?.event;

  const upcomingThisWeek = upcomingEvents.filter((event) => {
    const parsed = event?.date ? new Date(event.date) : null;
    if (!parsed || isNaN(parsed)) return false;
    const diffDays = (parsed - now) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 7;
  }).length;

  const totalBooked = bookedEvents.length;
  const totalUpcoming = upcomingEvents.length;

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const handleDownloadTicket = (event) => {
    // Generate PDF ticket
    const doc = new jsPDF();
    
    // Add ticket content
    doc.setFontSize(20);
    doc.text('EVENT TICKET', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Event: ${event.title}`, 20, 40);
    doc.text(`Date: ${formatDate(event.date)}`, 20, 50);
    doc.text(`Time: ${event.time}`, 20, 60);
    doc.text(`Location: ${event.location}`, 20, 70);
    
    // Generate QR code
    const qrData = `Event: ${event.title}\nDate: ${event.date}\nTime: ${event.time}\nLocation: ${event.location}`;
    
    QRCode.toDataURL(qrData, { width: 100 }, (err, url) => {
      if (err) return console.error(err);
      
      // Add QR code to PDF
      doc.addImage(url, 'PNG', 150, 40, 40, 40);
      
      // Save the PDF
      doc.save(`ticket-${event.id}.pdf`);
    });
    
    toast.success('Ticket downloaded successfully!');
  };

  const handleResendTicket = (event) => {
    // In a real app, this would send an email with the ticket
    toast.success(`Ticket for ${event.title} has been sent to your email!`);
  };

  return (
    <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 py-3 sm:py-4 md:py-6 lg:py-8 text-white bg-gradient-to-br from-[#000000] via-[#0a0a0a] to-[#050510] space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Enhanced Hero Section - Compact & Interactive */}
      <section className="relative overflow-hidden mt-6 sm:mt-10 md:mt-10 rounded-xl sm:rounded-2xl border border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[#1a0008] via-[#0a0a15] to-[#000510] p-4 sm:p-6 md:p-8 shadow-[0_20px_60px_-20px_rgba(100,180,255,0.15)]">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute -left-16 -top-16 h-40 sm:h-48 w-40 sm:w-48 rounded-full bg-[#D60024] blur-[80px] sm:blur-[100px]" />
          <div className="absolute right-0 bottom-0 h-44 sm:h-52 w-44 sm:w-52 rounded-full bg-[#60a5fa]/20 blur-[100px] sm:blur-[120px]" />
          <div className="absolute left-1/2 top-1/2 h-36 w-36 rounded-full bg-[#3b82f6]/15 blur-[90px]" />
        </div>
        
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start lg:items-center">
          <div className="space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[rgba(214,0,36,0.15)] to-[rgba(59,130,246,0.1)] border border-[#60a5fa]/30 text-xs text-[#93c5fd] font-medium hover:bg-gradient-to-r hover:from-[rgba(214,0,36,0.25)] hover:to-[rgba(59,130,246,0.15)] transition-all duration-300">
              <Zap className="h-3.5 w-3.5" />
              <span>Your next adventure awaits</span> 
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D60024] to-[#ff6b7a] animate-pulse">party seeker</span>
              </h1>
              <p className="text-[rgba(255,255,255,0.7)] max-w-lg text-xs sm:text-sm md:text-base leading-relaxed">
                Discover unforgettable events, manage tickets, and dive into experiences that match your vibe.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-1">
              <Link to="/dashboard/browse-events">
                <Button className="bg-gradient-to-r from-[#D60024] to-[#ff4d67] hover:shadow-[0_12px_30px_-8px_rgba(214,0,36,0.5)] text-white px-4 sm:px-5 py-2 font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 text-xs sm:text-sm">
                  Explore Events
                  <ChevronRight className="ml-1.5 h-3.5 sm:h-4 w-3.5 sm:w-4" />
                </Button>
              </Link>
            </div>
            
            {/* Compact Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              {[
                { label: "Booked", value: totalBooked, icon: Ticket },
                { label: "Upcoming", value: totalUpcoming, icon: Calendar },
                { label: "This Week", value: upcomingThisWeek, icon: TrendingUp },
                { label: "Saved", value: Math.max(totalBooked, totalUpcoming) || 0, icon: Heart },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="group rounded-lg border border-[rgba(100,200,255,0.15)] bg-gradient-to-br from-[rgba(255,255,255,0.05)] to-[rgba(59,130,246,0.05)] p-2.5 sm:p-3 hover:border-[#60a5fa]/50 hover:bg-gradient-to-br hover:from-[rgba(214,0,36,0.08)] hover:to-[rgba(59,130,246,0.1)] transition-all duration-300 cursor-pointer">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-[rgba(255,255,255,0.5)] font-medium line-clamp-1">{stat.label}</p>
                      <Icon className="h-3 sm:h-3.5 w-3 sm:w-3.5 text-[rgba(100,200,255,0.4)] group-hover:text-[#60a5fa] transition-colors duration-300 flex-shrink-0" />
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Next Event Card - Compact & Interactive */}
          <div className="relative mt-4 sm:mt-0">
            <div className="absolute inset-0 bg-gradient-to-br from-[#D60024]/5 to-transparent rounded-xl sm:rounded-2xl blur-xl pointer-events-none" />
            <div className="relative rounded-xl sm:rounded-2xl border border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(255,255,255,0.04)] to-[rgba(59,130,246,0.05)] backdrop-blur-sm p-4 sm:p-5 shadow-[0_15px_40px_-15px_rgba(59,130,246,0.2)] hover:border-[rgba(100,200,255,0.35)] transition-all duration-300">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#D60024]/15 to-[#3b82f6]/15 border border-[#60a5fa]/30">
                    <CalendarIcon className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-[#D60024]" />
                  </div>
                  <span className="text-xs font-semibold text-white">Next Event</span>
                </div>
                <Badge className="bg-gradient-to-r from-[#D60024]/20 to-[#3b82f6]/20 text-[#93c5fd] border border-[#60a5fa]/40 font-medium text-xs">
                  <Zap className="h-2.5 w-2.5 mr-1" />
                  Live
                </Badge>
              </div>
              
              {loadingUpcoming ? (
                <div className="py-6 sm:py-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[rgba(214,0,36,0.2)] border-t-[#D60024]"></div>
                  <p className="text-[rgba(255,255,255,0.6)] mt-2 text-xs">Loading...</p>
                </div>
              ) : nextEvent ? (
                <div className="space-y-2.5 sm:space-y-3">
                  <div className="relative overflow-hidden rounded-lg sm:rounded-xl h-28 sm:h-32 bg-gradient-to-br from-[rgba(255,255,255,0.05)] to-[rgba(59,130,246,0.08)] border border-[rgba(100,200,255,0.15)] group">
                    <img 
                      src={nextEvent.image} 
                      alt={nextEvent.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 will-change-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <Badge className="absolute top-2 left-2 bg-[#D60024] text-white font-semibold text-xs">
                      {nextEvent.category}
                    </Badge>
                  </div>
                  
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white line-clamp-2">{nextEvent.title}</h3>
                    <div className="space-y-1 mt-1.5 sm:mt-2">
                      <div className="flex items-center gap-2 text-xs text-[rgba(255,255,255,0.75)]">
                        <Clock className="h-3 sm:h-3.5 w-3 sm:w-3.5 text-[#60a5fa] flex-shrink-0" />
                        <span className="line-clamp-1">{formatDate(nextEvent.date)}</span>
                        <span className="text-[rgba(255,255,255,0.4)]">•</span>
                        <span className="flex-shrink-0">{nextEvent.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[rgba(255,255,255,0.75)]">
                        <MapPin className="h-3 sm:h-3.5 w-3 sm:w-3.5 text-[#60a5fa] flex-shrink-0" />
                        <span className="line-clamp-1">{nextEvent.location}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-1">
                    <Link to={`/events/${nextEvent.id}`} className="flex-1">
                      <Button size="sm" className="w-full bg-gradient-to-r from-[#D60024] to-[#ff4d67] hover:shadow-[0_8px_20px_-6px_rgba(214,0,36,0.4)] text-white font-semibold transition-all duration-300 text-xs">
                        View Details
                      </Button>
                    </Link>
                    <Button size="sm" variant="outline" className="border-[rgba(100,200,255,0.3)] text-[#93c5fd] hover:bg-[rgba(59,130,246,0.15)] hover:border-[#60a5fa] transition-all duration-300">
                      <Heart className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="py-4 sm:py-6 text-center space-y-2 sm:space-y-3">
                  <div className="inline-flex items-center justify-center h-10 sm:h-12 w-10 sm:w-12 rounded-full bg-gradient-to-br from-[rgba(214,0,36,0.1)] to-[rgba(59,130,246,0.1)] border border-[rgba(100,200,255,0.2)]">
                    <Calendar className="h-5 sm:h-6 w-5 sm:w-6 text-[rgba(214,0,36,0.4)]" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">No Events Yet</p>
                    <p className="text-[rgba(255,255,255,0.6)] text-xs mt-0.5">Book your first event!</p>
                  </div>
                  <Link to="/dashboard/browse-events">
                    <Button size="sm" className="bg-gradient-to-r from-[#D60024] to-[#ff4d67] text-white font-semibold text-xs">
                      Browse Events
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="space-y-8">
        {/* Trending Events Section - temporarily disabled per request */}
        {false && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Zap className="h-7 w-7 text-[#60a5fa]" />
                  🔥 Trending Now
                </h2>
                <p className="text-sm text-[rgba(255,255,255,0.65)] mt-2">Most popular events with highest ratings</p>
              </div>
              <Link to="/dashboard/browse-events">
                <Button className="bg-gradient-to-r from-[#D60024] to-[#ff4d67] text-white font-semibold hover:shadow-[0_10px_25px_-10px_rgba(214,0,36,0.4)] transition-all duration-300">
                  See All <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* All Upcoming Events - Horizontal Scrollable Single Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Calendar className="h-6 w-6 text-[#60a5fa]" />
                📅 Upcoming Events
              </h2>
              <p className="text-sm text-[rgba(255,255,255,0.65)] mt-1">Discover all events happening near you</p>
            </div>
            <Link to="/dashboard/browse-events">
              <Button className="bg-gradient-to-r from-[#D60024] to-[#ff4d67] text-white font-semibold hover:shadow-[0_10px_25px_-10px_rgba(214,0,36,0.4)] transition-all duration-300">
                Browse Events <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {loadingUpcoming ? (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex-shrink-0 w-80 h-[440px] rounded-xl bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(59,130,246,0.08)] border border-[rgba(100,200,255,0.2)] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth">
              {upcomingEvents.map((event) => (
                <Link key={event.id} to={`/events/${event.id}`} className="group flex-shrink-0 w-80">
                  <div className="relative h-[440px] rounded-xl overflow-hidden border border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(255,255,255,0.08)] via-[rgba(59,130,246,0.05)] to-[rgba(214,0,36,0.04)] hover:border-[#60a5fa]/70 transition-all duration-300 hover:shadow-[0_15px_40px_-10px_rgba(100,180,255,0.3)]">
                    {/* Image Section */}
                    <div className="relative h-52 overflow-hidden bg-[rgba(255,255,255,0.05)]">
                      <img 
                        src={event.image} 
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-120 transition-transform duration-500 will-change-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      
                      {/* Category Badge */}
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-[#D60024]/90 text-white font-semibold text-xs transition-all duration-300">
                          {event.category}
                        </Badge>
                      </div>

                      {/* Rating Badge */}
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-black/70 backdrop-blur-sm text-white font-bold text-xs border border-[#60a5fa]/40 transition-all duration-300 flex items-center gap-1">
                          <Star className="h-3 w-3 text-[#60a5fa] fill-[#60a5fa]" />
                          {event.rating}
                        </Badge>
                      </div>

                      {/* Attendees Count */}
                      <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md rounded-lg px-3 py-1.5 border border-[rgba(100,200,255,0.3)] hover:bg-black/90 transition-all">
                        <p className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-[#60a5fa]" />
                          <span>{(event.attendees / 1000).toFixed(1)}K attending</span>
                        </p>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5 space-y-3 flex flex-col flex-1 h-56">
                      <div>
                        <h3 className="font-bold text-white text-base line-clamp-2 group-hover:text-[#60a5fa] transition-colors duration-300">
                          {event.title}
                        </h3>
                      </div>

                      {/* Event Details */}
                      <div className="space-y-2 text-xs flex-1">
                        <div className="flex items-center gap-2 text-[rgba(255,255,255,0.8)] group-hover:text-[rgba(255,255,255,0.95)] transition-colors duration-300">
                          <Clock className="h-4 w-4 text-[#60a5fa] flex-shrink-0" />
                          <div className="flex flex-col">
                            <span className="font-medium">{formatDate(event.date)}</span>
                            <span className="text-[rgba(255,255,255,0.6)]">{event.time}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-[rgba(255,255,255,0.8)] group-hover:text-[rgba(255,255,255,0.95)] transition-colors duration-300">
                          <MapPin className="h-4 w-4 text-[#60a5fa] flex-shrink-0" />
                          <span className="line-clamp-1 font-medium">{event.location}</span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="pt-2 border-t border-[rgba(255,255,255,0.1)]">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-[rgba(255,255,255,0.65)] uppercase tracking-wide">Price</span>
                          <p className="text-xl font-bold text-[#D60024]">₹{(Number(event.price) || 0).toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Quick Book Button */}
                      <Button className="w-full bg-gradient-to-r from-[#D60024] to-[#ff4d67] hover:shadow-[0_8px_20px_-6px_rgba(214,0,36,0.4)] text-white font-bold transition-all duration-300 text-sm">
                        Book Now
                      </Button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* My Bookings Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Ticket className="h-6 w-6 text-[#60a5fa]" />
                My Bookings
              </h2>
              <p className="text-sm text-[rgba(255,255,255,0.65)] mt-1">Your confirmed event experiences</p>
            </div>
            {bookedEvents.length > 0 && (
              <Link to="/dashboard/bookings">
                <Button variant="outline" className="border-[rgba(255,255,255,0.18)] text-white hover:bg-[rgba(255,255,255,0.08)]">
                  View All <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>

          {loadingBooked ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-80 rounded-2xl bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(59,130,246,0.08)] border border-[rgba(100,200,255,0.2)] animate-pulse" />
              ))}
            </div>
          ) : bookedEvents.length === 0 ? (
            <Card className="border border-[rgba(100,200,255,0.25)] bg-gradient-to-br from-[rgba(255,255,255,0.08)] via-[rgba(59,130,246,0.08)] to-[rgba(214,0,36,0.05)]">
              <CardContent className="p-12 text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-[rgba(214,0,36,0.1)] to-[rgba(59,130,246,0.1)] border border-[rgba(100,200,255,0.3)] mb-4">
                  <Ticket className="h-8 w-8 text-[rgba(214,0,36,0.5)]" />
                </div>
                <p className="text-white font-semibold text-lg">No booked events yet</p>
                <p className="text-[rgba(255,255,255,0.65)] text-sm mt-2 mb-6">Start exploring and book your first event experience!</p>
                <Link to="/dashboard/browse-events">
                  <Button className="bg-gradient-to-r from-[#D60024] to-[#ff4d67] text-white font-semibold hover:shadow-[0_10px_25px_-10px_rgba(214,0,36,0.4)]">
                    Explore Events
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth">
              {bookedEvents.map((event) => (
                <Link key={event.id} to={`/events/${event.id}`} className="group flex-shrink-0 w-80">
                  <div className="relative h-[440px] rounded-xl overflow-hidden border border-[rgba(100,200,255,0.2)] bg-gradient-to-br from-[rgba(255,255,255,0.08)] via-[rgba(59,130,246,0.06)] to-[rgba(214,0,36,0.04)] hover:border-[rgba(100,200,255,0.4)] transition-all duration-300 hover:shadow-[0_20px_50px_-20px_rgba(100,180,255,0.35)]">
                    {/* Image Section */}
                    <div className="relative h-48 overflow-hidden bg-[rgba(255,255,255,0.05)]">
                      <img 
                        src={event.image} 
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 will-change-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      
                      {/* Status Badge */}
                      <div className="absolute top-3 right-3 flex gap-2">
                        <Badge className="bg-[#D60024] text-white font-semibold">
                          {event.category}
                        </Badge>
                        {event.status === "confirmed" && (
                          <Badge className="bg-green-500/20 text-green-300 border border-green-500/30">
                            ✓ Confirmed
                          </Badge>
                        )}
                      </div>

                      {/* Ticket Count */}
                      <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-[rgba(100,200,255,0.3)]">
                        <p className="text-sm font-semibold text-white">{event.ticketCount} {event.ticketCount > 1 ? 'Tickets' : 'Ticket'}</p>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5 space-y-3 flex flex-col flex-1 h-56">
                      <div>
                        <h3 className="font-bold text-white text-base line-clamp-2 group-hover:text-[#60a5fa] transition-colors">
                          {event.title}
                        </h3>
                      </div>

                      {/* Event Details */}
                      <div className="space-y-2 text-xs flex-1">
                        <div className="flex items-center gap-2 text-[rgba(255,255,255,0.8)]">
                          <Clock className="h-4 w-4 text-[#60a5fa] flex-shrink-0" />
                          <span className="font-medium">{formatDate(event.date)}</span>
                          <span className="text-[rgba(255,255,255,0.5)]">•</span>
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[rgba(255,255,255,0.8)]">
                          <MapPin className="h-4 w-4 text-[#60a5fa] flex-shrink-0" />
                          <span className="font-medium line-clamp-1">{event.location}</span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="pt-2 border-t border-[rgba(255,255,255,0.1)]">
                        <p className="text-[rgba(255,255,255,0.65)] text-xs uppercase tracking-wide mb-1">Total Paid</p>
                        <p className="text-xl font-bold text-[#D60024]">₹{(event.price * event.ticketCount || 0).toLocaleString()}</p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-gradient-to-r from-[#D60024] to-[#ff4d67] hover:shadow-[0_8px_20px_-6px_rgba(214,0,36,0.4)] text-white font-semibold transition-all text-xs"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDownloadTicket(event); }}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex-1 border-[rgba(100,200,255,0.3)] text-[#93c5fd] hover:bg-[rgba(59,130,246,0.15)] text-xs"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleResendTicket(event); }}
                        >
                          <Mail className="h-3 w-3 mr-1" />
                          Email
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions & Calendar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Quick Actions Card */}
          <Card className="border-2 border-[rgba(255,255,255,0.12)] shadow-[0_22px_60px_-25px_rgba(0,0,0,0.7)] hover:shadow-[0_30px_80px_-20px_rgba(214,0,36,0.4)] hover:border-[#D60024]/30 transition-all duration-300 bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(255,255,255,0.04)] rounded-2xl flex flex-col h-full">
            <CardHeader className="p-6 pb-4 border-b border-[rgba(255,255,255,0.12)]">
              <div>
                <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                  ⚡ Quick Actions
                </CardTitle>
                <p className="text-sm text-[rgba(255,255,255,0.65)] mt-1">Get started in seconds</p>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-4 flex-1 flex flex-col">
              <div className="grid grid-cols-2 gap-3 flex-1 auto-rows-fr">
                {[
                  { 
                    icon: <Ticket className="h-5 w-5" />, 
                    label: 'Browse Events',
                    path: '/dashboard/browse-events',
                    gradient: 'from-[rgba(59,130,246,0.15)] to-[rgba(59,130,246,0.05)]',
                    iconBg: 'from-[rgba(59,130,246,0.25)] to-[rgba(59,130,246,0.1)]',
                    iconColor: 'text-[#60a5fa]'
                  },
                  { 
                    icon: <Calendar className="h-5 w-5" />, 
                    label: 'My Bookings',
                    path: '/dashboard/bookings',
                    gradient: 'from-[rgba(168,85,247,0.15)] to-[rgba(168,85,247,0.05)]',
                    iconBg: 'from-[rgba(168,85,247,0.25)] to-[rgba(168,85,247,0.1)]',
                    iconColor: 'text-[#a855f7]'
                  },
                  { 
                    icon: <Download className="h-5 w-5" />, 
                    label: 'My Tickets',
                    path: '/dashboard/bookings',
                    gradient: 'from-[rgba(34,197,94,0.15)] to-[rgba(34,197,94,0.05)]',
                    iconBg: 'from-[rgba(34,197,94,0.25)] to-[rgba(34,197,94,0.1)]',
                    iconColor: 'text-[#22c55e]'
                  },
                  { 
                    icon: <MapPin className="h-5 w-5" />, 
                    label: 'Nearby',
                    path: '/dashboard/browse-events',
                    gradient: 'from-[rgba(249,115,22,0.15)] to-[rgba(249,115,22,0.05)]',
                    iconBg: 'from-[rgba(249,115,22,0.25)] to-[rgba(249,115,22,0.1)]',
                    iconColor: 'text-[#f97316]'
                  },
                ].map((action, index) => (
                  <Link key={index} to={action.path}>
                    <div className={`h-full flex flex-col items-center justify-center p-4 rounded-xl transition-all bg-gradient-to-br ${action.gradient} text-white hover:shadow-[0_10px_25px_-10px_rgba(100,180,255,0.3)] hover:scale-[1.03] border border-[rgba(100,200,255,0.2)] hover:border-[rgba(100,200,255,0.4)] group cursor-pointer`}>
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${action.iconBg} ${action.iconColor} mb-2.5 group-hover:scale-110 transition-all duration-300`}>
                        {action.icon}
                      </div>
                      <span className="text-xs font-semibold text-center text-white group-hover:text-white transition-colors leading-tight">{action.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Event Calendar Card */}
          <Card className="border-2 border-[rgba(100,200,255,0.2)] shadow-[0_22px_60px_-25px_rgba(0,0,0,0.7)] hover:shadow-[0_30px_80px_-20px_rgba(100,180,255,0.3)] hover:border-[#60a5fa]/50 transition-all duration-300 bg-gradient-to-br from-[rgba(255,255,255,0.08)] via-[rgba(59,130,246,0.06)] to-[rgba(214,0,36,0.04)] rounded-2xl overflow-hidden flex flex-col h-full">
            <CardHeader className="p-6 pb-4 border-b border-[rgba(100,200,255,0.15)]">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                    📅 Event Calendar
                  </CardTitle>
                  <p className="text-sm text-[rgba(255,255,255,0.65)] mt-1">Your upcoming schedule</p>
                </div>
                <div className="p-2.5 rounded-lg bg-gradient-to-br from-[rgba(214,0,36,0.2)] via-[rgba(59,130,246,0.2)] to-[rgba(59,130,246,0.15)] border border-[#60a5fa]/40">
                  <Calendar className="h-5 w-5 text-[#60a5fa]" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-4 flex-1 flex flex-col">
              {loadingUpcoming ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#D60024]"></div>
                    <p className="text-[rgba(255,255,255,0.65)] mt-2 text-sm">Loading events...</p>
                  </div>
                </div>
              ) : upcomingEvents.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Calendar className="h-10 w-10 text-[rgba(255,255,255,0.65)] mx-auto mb-2" />
                    <p className="text-white text-sm font-medium">No upcoming events</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col flex-1">
                  <div className="space-y-3 flex-1">
                    {upcomingEvents.slice(0, 4).map((event, idx) => (
                      <Link key={`cal-${event.id}`} to={`/events/${event.id}`} className="block group">
                        <div className="flex items-start p-3 bg-gradient-to-r from-[rgba(255,255,255,0.08)] via-[rgba(59,130,246,0.05)] to-[rgba(214,0,36,0.04)] rounded-lg hover:from-[rgba(59,130,246,0.15)] hover:to-[rgba(214,0,36,0.1)] transition-all border border-[rgba(100,200,255,0.15)] hover:border-[#60a5fa]/60 group-hover:shadow-[0_8px_20px_-8px_rgba(100,180,255,0.3)]">
                          <div className="bg-gradient-to-br from-[rgba(59,130,246,0.3)] via-[rgba(214,0,36,0.2)] to-[rgba(59,130,246,0.15)] p-2 rounded-lg mr-3 text-center min-w-[60px] border border-[#60a5fa]/40 group-hover:from-[rgba(59,130,246,0.5)] group-hover:to-[rgba(214,0,36,0.3)] transition-all">
                            <div className="text-[#60a5fa] text-xs font-bold uppercase">
                              {new Date(event.date).toLocaleString('default', { month: 'short' })}
                            </div>
                            <div className="text-2xl font-bold text-white group-hover:text-[#93c5fd] transition-colors">
                              {new Date(event.date).getDate()}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-white group-hover:text-[#60a5fa] transition-colors truncate text-sm">{event.title}</h4>
                            <div className="flex items-center text-xs text-[rgba(255,255,255,0.65)] mt-1 gap-2 group-hover:text-[rgba(255,255,255,0.8)] transition-colors">
                              <Clock className="h-3 w-3 text-[#60a5fa] flex-shrink-0" />
                              <span>{event.time}</span>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-[rgba(255,255,255,0.4)] group-hover:text-[#60a5fa] transition-all group-hover:translate-x-1 flex-shrink-0" />
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link to="/dashboard/browse-events" className="mt-4">
                    <Button className="w-full bg-gradient-to-r from-[#D60024] to-[#ff4d67] text-white font-bold hover:shadow-[0_10px_25px_-10px_rgba(214,0,36,0.4)] transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                      View All Events
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Activity Stats */}
          <Card className="border-2 border-[rgba(100,200,255,0.2)] shadow-[0_22px_60px_-25px_rgba(0,0,0,0.7)] hover:shadow-[0_30px_80px_-20px_rgba(100,180,255,0.3)] hover:border-[#60a5fa]/50 transition-all duration-300 bg-gradient-to-br from-[rgba(255,255,255,0.08)] via-[rgba(59,130,246,0.06)] to-[rgba(214,0,36,0.04)] rounded-2xl flex flex-col h-full">
            <CardHeader className="p-6 pb-4 border-b border-[rgba(100,200,255,0.15)]">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                    📊 Your Activity
                  </CardTitle>
                  <p className="text-sm text-[rgba(255,255,255,0.65)] mt-1">Track your event journey</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-4 flex-1 flex flex-col">
              <div className="space-y-5 flex-1 flex flex-col">
                {/* Stats Grid - API Ready: GET /api/user/stats */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Total Bookings Stat */}
                  <div className="p-5 rounded-xl bg-gradient-to-br from-[rgba(214,0,36,0.15)] to-[rgba(214,0,36,0.05)] border border-[rgba(214,0,36,0.3)] hover:border-[#D60024]/50 hover:shadow-[0_8px_20px_-8px_rgba(214,0,36,0.3)] transition-all group cursor-pointer">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-[rgba(214,0,36,0.25)] to-[rgba(214,0,36,0.1)]">
                        <Ticket className="h-5 w-5 text-[#D60024] group-hover:scale-110 transition-transform" />
                      </div>
                      <TrendingUp className="h-4 w-4 text-[rgba(255,255,255,0.4)]" />
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">{totalBooked}</p>
                    <p className="text-xs text-[rgba(255,255,255,0.65)] font-medium">Total Bookings</p>
                  </div>

                  {/* This Week Stat */}
                  <div className="p-5 rounded-xl bg-gradient-to-br from-[rgba(59,130,246,0.15)] to-[rgba(59,130,246,0.05)] border border-[rgba(100,200,255,0.3)] hover:border-[#60a5fa]/50 hover:shadow-[0_8px_20px_-8px_rgba(100,180,255,0.3)] transition-all group cursor-pointer">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-[rgba(59,130,246,0.25)] to-[rgba(59,130,246,0.1)]">
                        <Calendar className="h-5 w-5 text-[#60a5fa] group-hover:scale-110 transition-transform" />
                      </div>
                      <Zap className="h-4 w-4 text-[rgba(255,255,255,0.4)]" />
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">{upcomingThisWeek}</p>
                    <p className="text-xs text-[rgba(255,255,255,0.65)] font-medium">This Week</p>
                  </div>
                </div>

                {/* Progress Section - API Ready: GET /api/user/progress */}
                {/* <div className="p-5 rounded-xl bg-gradient-to-r from-[rgba(255,255,255,0.05)] to-[rgba(59,130,246,0.05)] border border-[rgba(100,200,255,0.2)] hover:border-[rgba(100,200,255,0.35)] transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-gradient-to-br from-[rgba(214,0,36,0.2)] to-[rgba(59,130,246,0.2)]">
                        <Heart className="h-4 w-4 text-[#D60024]" />
                      </div>
                      <span className="text-sm font-semibold text-white">Event Explorer</span>
                    </div>
                    <span className="text-sm text-[#60a5fa] font-bold">{Math.min(totalBooked * 10, 100)}%</span>
                  </div>
                  <Progress value={Math.min(totalBooked * 10, 100)} className="h-2.5 bg-[rgba(255,255,255,0.1)]" />
                  <p className="text-xs text-[rgba(255,255,255,0.5)] mt-2.5 leading-relaxed">
                    {totalBooked < 5 ? 'Almost there! Keep exploring!' : totalBooked < 10 ? 'Great progress! Keep going!' : 'Amazing! You\'re an event pro! 🎉'}
                  </p>
                </div> */}

                {/* User Preferences - API Ready: GET /api/user/preferences */}
                <div className="space-y-3">
                  {/* Favorite Category */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-[rgba(255,255,255,0.05)] to-transparent border border-[rgba(100,200,255,0.15)] hover:border-[rgba(100,200,255,0.35)] hover:bg-gradient-to-r hover:from-[rgba(59,130,246,0.08)] hover:to-transparent transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-gradient-to-br from-[rgba(214,0,36,0.2)] to-[rgba(59,130,246,0.2)] group-hover:from-[rgba(214,0,36,0.3)] group-hover:to-[rgba(59,130,246,0.3)] transition-all">
                        <Star className="h-4 w-4 text-[#60a5fa]" />
                      </div>
                      <span className="text-sm text-white font-medium">Favorite Category</span>
                    </div>
                    <span className="text-sm text-[#60a5fa] font-bold">Music</span>
                  </div>

                  {/* Top Location */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-[rgba(255,255,255,0.05)] to-transparent border border-[rgba(100,200,255,0.15)] hover:border-[rgba(100,200,255,0.35)] hover:bg-gradient-to-r hover:from-[rgba(59,130,246,0.08)] hover:to-transparent transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-gradient-to-br from-[rgba(214,0,36,0.2)] to-[rgba(59,130,246,0.2)] group-hover:from-[rgba(214,0,36,0.3)] group-hover:to-[rgba(59,130,246,0.3)] transition-all">
                        <MapPin className="h-4 w-4 text-[#D60024]" />
                      </div>
                      <span className="text-sm text-white font-medium">Top Location</span>
                    </div>
                    <span className="text-sm text-[#60a5fa] font-bold">Mumbai</span>
                  </div>
                </div>

                {/* CTA Button */}
                <Link to="/dashboard/browse-events" className="block">
                  <Button className="w-full bg-gradient-to-r from-[#D60024] to-[#ff4d67] text-white font-bold hover:shadow-[0_10px_25px_-10px_rgba(214,0,36,0.4)] transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                    Discover More Events
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

