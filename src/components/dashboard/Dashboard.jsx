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
      slug: event.slug || event.eventSlug || event.eventId || event.id || event._id,
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
      slug: evt.slug || evt.eventSlug || evt.eventId || evt.id || evt._id,
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
    <div className="w-full px-6 lg:px-12 py-8 text-white bg-[#0a0a0a] space-y-8">
      {/* Clean Hero Section */}
      <section className="rounded-2xl border border-[#1a1a1a] bg-[#111111] p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-xs text-gray-400">
              <Zap className="h-3.5 w-3.5 text-[#D60024]" />
              <span>Your next adventure awaits</span> 
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl lg:text-4xl font-bold text-white">
                Welcome back, <span className="text-[#D60024]">party seeker</span>
              </h1>
              <p className="text-gray-400 max-w-lg text-sm leading-relaxed">
                Discover unforgettable events, manage tickets, and dive into experiences that match your vibe.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/dashboard/browse-events">
                <Button className="bg-[#D60024] hover:bg-[#b8001f] text-white px-5 py-2 font-medium transition-colors text-sm">
                  Explore Events
                  <ChevronRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            {/* Clean Stats Grid */}
            <div className="grid grid-cols-4 gap-3 pt-4">
              {[
                { label: "Booked", value: totalBooked, icon: Ticket },
                { label: "Upcoming", value: totalUpcoming, icon: Calendar },
                { label: "This Week", value: upcomingThisWeek, icon: TrendingUp },
                { label: "Saved", value: Math.max(totalBooked, totalUpcoming) || 0, icon: Heart },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] p-3 hover:border-[#D60024]/30 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                      <Icon className="h-3.5 w-3.5 text-gray-600" />
                    </div>
                    <p className="text-xl font-bold text-white">{stat.value}</p>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Next Event Card - Clean Design */}
          <div className="rounded-2xl border border-[#1a1a1a] bg-[#111111] p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#1a1a1a]">
                  <CalendarIcon className="h-4 w-4 text-[#D60024]" />
                </div>
                <span className="text-sm font-medium text-white">Next Event</span>
              </div>
              <Badge className="bg-[#D60024]/10 text-[#D60024] border border-[#D60024]/20 font-medium text-xs">
                Live
              </Badge>
            </div>
            
            {loadingUpcoming ? (
              <div className="py-8 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-[#1a1a1a] border-t-[#D60024]"></div>
                <p className="text-gray-500 mt-2 text-xs">Loading...</p>
              </div>
            ) : nextEvent ? (
              <div className="space-y-3">
                <div className="relative overflow-hidden rounded-xl h-32 bg-[#1a1a1a]">
                  <img 
                    src={nextEvent.image} 
                    alt={nextEvent.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <Badge className="absolute top-3 left-3 bg-[#D60024] text-white font-medium text-xs">
                    {nextEvent.category}
                  </Badge>
                </div>
                
                <div>
                  <h3 className="text-base font-semibold text-white line-clamp-1">{nextEvent.title}</h3>
                  <div className="space-y-1 mt-2">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                      <span className="line-clamp-1">{formatDate(nextEvent.date)} • {nextEvent.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <MapPin className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                      <span className="line-clamp-1">{nextEvent.location}</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-1">
                  {nextEvent.organizer?.slug && nextEvent.slug ? (
                    <Link to={`/events/${nextEvent.organizer.slug}/${nextEvent.slug}`} className="flex-1">
                      <Button size="sm" className="w-full bg-[#D60024] hover:bg-[#b8001f] text-white font-medium text-xs">
                        View Details
                      </Button>
                    </Link>
                  ) : (
                    <Button size="sm" className="w-full bg-gray-700 text-white text-xs" disabled>
                      View Details
                    </Button>
                  )}
                </div>
              </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Calendar className="h-10 w-10 text-gray-600 mb-3" />
              <p className="text-sm text-gray-500">No upcoming events</p>
            </div>
          )}
        </div>

        </div>
      </section>

      {/* Popular Events Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Popular Events</h2>
          <Link to="/dashboard/browse-events">
            <Button variant="outline" className="border-[#2a2a2a] text-gray-400 hover:text-white hover:bg-[#1a1a1a] text-xs">
              View All
              <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
        
        {upcomingEvents.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {upcomingEvents.slice(0, 5).map((event) => (
              event.organizer?.slug && event.slug ? (
                <Link 
                  key={event.id} 
                  to={`/events/${event.organizer.slug}/${event.slug}`}
                  className="group flex-shrink-0 w-72"
                >
                  <div className="rounded-xl border border-[#1a1a1a] bg-[#111111] overflow-hidden hover:border-[#2a2a2a] transition-colors">
                    <div className="relative h-40 overflow-hidden">
                      <img 
                        src={event.image} 
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <Badge className="absolute top-3 left-3 bg-[#D60024] text-white font-medium text-xs">
                        {event.category}
                      </Badge>
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="font-semibold text-white text-sm line-clamp-1">{event.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-gray-500">From</span>
                        <span className="text-lg font-bold text-[#D60024]">₹{(Number(event.price) || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ) : null
            ))}
          </div>
        ) : (
          <div className="py-8 text-center border border-[#1a1a1a] rounded-xl bg-[#111111]">
            <Calendar className="h-10 w-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No events available</p>
          </div>
        )}
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

      {/* Upcoming Events Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Upcoming Events</h2>
          <Link to="/dashboard/browse-events">
            <Button variant="outline" className="border-[#2a2a2a] text-gray-400 hover:text-white hover:bg-[#1a1a1a] text-xs">
              Browse All
              <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {loadingUpcoming ? (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-shrink-0 w-72 h-96 rounded-xl bg-[#111111] border border-[#1a1a1a] animate-pulse" />
            ))}
          </div>
        ) : upcomingEvents.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {upcomingEvents.map((event) => (
              event.organizer?.slug && event.slug ? (
                <Link 
                  key={event.id} 
                  to={`/events/${event.organizer.slug}/${event.slug}`}
                  className="group flex-shrink-0 w-72"
                >
                  <div className="h-96 rounded-xl overflow-hidden border border-[#1a1a1a] bg-[#111111] hover:border-[#2a2a2a] transition-colors">
                    <div className="relative h-44 overflow-hidden">
                      <img 
                        src={event.image} 
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <Badge className="absolute top-3 left-3 bg-[#D60024] text-white font-medium text-xs">
                        {event.category}
                      </Badge>
                      <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white text-xs">
                        <Star className="h-3 w-3 fill-[#D60024] text-[#D60024]" />
                        <span>{event.rating}</span>
                      </div>
                    </div>
                    <div className="p-4 space-y-3 flex flex-col h-52">
                      <h3 className="font-semibold text-white text-sm line-clamp-2">{event.title}</h3>
                      <div className="space-y-2 text-xs text-gray-500 flex-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{formatDate(event.date)} • {event.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5" />
                          <span>{(event.attendees / 1000).toFixed(1)}K attending</span>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-[#1a1a1a] flex items-center justify-between">
                        <span className="text-xs text-gray-500">From</span>
                        <span className="text-lg font-bold text-[#D60024]">₹{(Number(event.price) || 0).toLocaleString()}</span>
                      </div>
                      <Button className="w-full bg-[#D60024] hover:bg-[#b8001f] text-white font-medium text-xs">
                        View Details
                      </Button>
                    </div>
                  </div>
                </Link>
              ) : null
            ))}
          </div>
        ) : (
          <div className="py-8 text-center border border-[#1a1a1a] rounded-xl bg-[#111111]">
            <Calendar className="h-10 w-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No upcoming events</p>
          </div>
        )}
      </section>

        {/* My Bookings Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">My Bookings</h2>
            {bookedEvents.length > 0 && (
              <Link to="/dashboard/bookings">
                <Button variant="outline" className="border-[#2a2a2a] text-gray-400 hover:text-white hover:bg-[#1a1a1a] text-xs">
                  View All
                  <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </Link>
            )}
          </div>

          {loadingBooked ? (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-shrink-0 w-72 h-80 rounded-xl bg-[#111111] border border-[#1a1a1a] animate-pulse" />
              ))}
            </div>
          ) : bookedEvents.length === 0 ? (
            <Card className="border border-[#1a1a1a] bg-[#111111]">
              <CardContent className="p-12 text-center">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] mb-4">
                  <Ticket className="h-6 w-6 text-[#D60024]" />
                </div>
                <p className="text-white font-medium text-lg">No booked events yet</p>
                <p className="text-gray-500 text-sm mt-2 mb-6">Start exploring and book your first event experience!</p>
                <Link to="/dashboard/browse-events">
                  <Button className="bg-[#D60024] hover:bg-[#b8001f] text-white font-medium">
                    Explore Events
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {bookedEvents.map((event) => (
                event.organizer?.slug && event.slug ? (
                  <Link key={event.id} to={`/events/${event.organizer.slug}/${event.slug}`} className="group flex-shrink-0 w-72">
                    <div className="h-80 rounded-xl overflow-hidden border border-[#1a1a1a] bg-[#111111] hover:border-[#2a2a2a] transition-colors">
                      <div className="relative h-40 overflow-hidden">
                        <img 
                          src={event.image} 
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <Badge className="absolute top-3 left-3 bg-[#D60024] text-white font-medium text-xs">
                          {event.category}
                        </Badge>
                        {event.status === "confirmed" && (
                          <Badge className="absolute top-3 right-3 bg-green-500/20 text-green-400 border border-green-500/30 font-medium text-xs">
                            Confirmed
                          </Badge>
                        )}
                        <div className="absolute bottom-3 left-3 bg-black/60 rounded-lg px-2.5 py-1">
                          <p className="text-xs font-medium text-white">{event.ticketCount} {event.ticketCount > 1 ? 'Tickets' : 'Ticket'}</p>
                        </div>
                      </div>
                      <div className="p-4 space-y-3 flex flex-col h-40">
                        <h3 className="font-semibold text-white text-sm line-clamp-1">{event.title}</h3>
                        <div className="space-y-1.5 text-xs text-gray-500 flex-1">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{formatDate(event.date)} • {event.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="line-clamp-1">{event.location}</span>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-[#1a1a1a]">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500">Total Paid</span>
                            <span className="text-lg font-bold text-[#D60024]">₹{(event.price * event.ticketCount || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="flex-1 bg-[#D60024] hover:bg-[#b8001f] text-white font-medium text-xs"
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDownloadTicket(event); }}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Ticket
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="flex-1 border-[#2a2a2a] text-gray-400 hover:text-white hover:bg-[#1a1a1a] text-xs"
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleResendTicket(event); }}
                            >
                              <Mail className="h-3 w-3 mr-1" />
                              Email
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : null
              ))}
            </div>
          )}
        </section>

        {/* Quick Actions & Calendar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Quick Actions Card */}
          <Card className="border border-[#1a1a1a] bg-[#111111] rounded-xl flex flex-col h-full">
            <CardHeader className="p-5 pb-3 border-b border-[#1a1a1a]">
              <CardTitle className="text-lg font-semibold text-white">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-3 flex-1 flex flex-col">
              <div className="grid grid-cols-2 gap-3 flex-1 auto-rows-fr">
                {[
                  { 
                    icon: <Ticket className="h-4 w-4" />, 
                    label: 'Browse Events',
                    path: '/dashboard/browse-events'
                  },
                  { 
                    icon: <Calendar className="h-4 w-4" />, 
                    label: 'My Bookings',
                    path: '/dashboard/bookings'
                  },
                  { 
                    icon: <Download className="h-4 w-4" />, 
                    label: 'My Tickets',
                    path: '/dashboard/bookings'
                  },
                  { 
                    icon: <MapPin className="h-4 w-4" />, 
                    label: 'Nearby',
                    path: '/dashboard/browse-events'
                  },
                ].map((action, index) => (
                  <Link key={index} to={action.path}>
                    <div className="h-full flex flex-col items-center justify-center p-4 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#D60024]/30 text-white transition-all group cursor-pointer">
                      <div className="p-2.5 rounded-lg bg-[#2a2a2a] text-gray-400 mb-2 group-hover:text-[#D60024] transition-colors">
                        {action.icon}
                      </div>
                      <span className="text-xs font-medium text-center text-gray-400 group-hover:text-white transition-colors">{action.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Event Calendar Card */}
          <Card className="border border-[#1a1a1a] bg-[#111111] rounded-xl overflow-hidden flex flex-col h-full">
            <CardHeader className="p-5 pb-3 border-b border-[#1a1a1a]">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-white">
                  Event Calendar
                </CardTitle>
                <div className="p-1.5 rounded-lg bg-[#1a1a1a]">
                  <Calendar className="h-4 w-4 text-[#D60024]" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-3 flex-1 flex flex-col">
              {loadingUpcoming ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-[#1a1a1a] border-t-[#D60024]"></div>
                    <p className="text-gray-500 mt-2 text-sm">Loading events...</p>
                  </div>
                </div>
              ) : upcomingEvents.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Calendar className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm font-medium">No upcoming events</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col flex-1">
                  <div className="space-y-2 flex-1">
                    {upcomingEvents.slice(0, 4).map((event, idx) => (
                      event.organizer?.slug && event.slug ? (
                        <Link key={`cal-${event.id}`} to={`/events/${event.organizer.slug}/${event.slug}`} className="block group">
                          <div className="flex items-center p-2.5 bg-[#1a1a1a] rounded-lg hover:bg-[#2a2a2a] transition-colors border border-transparent hover:border-[#D60024]/20">
                            <div className="bg-[#2a2a2a] p-2 rounded-lg mr-3 text-center min-w-[50px]">
                              <div className="text-gray-500 text-[10px] font-medium uppercase">
                                {new Date(event.date).toLocaleString('default', { month: 'short' })}
                              </div>
                              <div className="text-lg font-bold text-white">
                                {new Date(event.date).getDate()}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-white group-hover:text-[#D60024] transition-colors truncate text-sm">{event.title}</h4>
                              <div className="flex items-center text-xs text-gray-500 mt-0.5 gap-1.5">
                                <Clock className="h-3 w-3" />
                                <span>{event.time}</span>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-[#D60024] transition-all group-hover:translate-x-1 flex-shrink-0" />
                          </div>
                        </Link>
                      ) : null
                    ))}
                  </div>
                  <Link to="/dashboard/browse-events" className="mt-3">
                    <Button className="w-full bg-[#D60024] hover:bg-[#b8001f] text-white font-medium text-xs">
                      View All Events
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Activity Stats */}
          <Card className="border border-[#1a1a1a] bg-[#111111] rounded-xl flex flex-col h-full">
            <CardHeader className="p-5 pb-3 border-b border-[#1a1a1a]">
              <CardTitle className="text-lg font-semibold text-white">
                Your Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-3 flex-1 flex flex-col">
              <div className="space-y-4 flex-1 flex flex-col">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#D60024]/30 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-1.5 rounded-lg bg-[#2a2a2a]">
                        <Ticket className="h-4 w-4 text-[#D60024]" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-white mb-0.5">{totalBooked}</p>
                    <p className="text-xs text-gray-500">Total Bookings</p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#D60024]/30 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-1.5 rounded-lg bg-[#2a2a2a]">
                        <Calendar className="h-4 w-4 text-[#D60024]" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-white mb-0.5">{upcomingThisWeek}</p>
                    <p className="text-xs text-gray-500">This Week</p>
                  </div>
                </div>

                {/* User Preferences */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a]">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-[#2a2a2a]">
                        <Star className="h-3.5 w-3.5 text-[#D60024]" />
                      </div>
                      <span className="text-sm text-gray-400">Favorite Category</span>
                    </div>
                    <span className="text-sm text-white font-medium">Music</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a]">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-[#2a2a2a]">
                        <MapPin className="h-3.5 w-3.5 text-[#D60024]" />
                      </div>
                      <span className="text-sm text-gray-400">Top Location</span>
                    </div>
                    <span className="text-sm text-white font-medium">Mumbai</span>
                  </div>
                </div>

                {/* CTA Button */}
                <Link to="/dashboard/browse-events" className="block">
                  <Button className="w-full bg-[#D60024] hover:bg-[#b8001f] text-white font-medium text-xs">
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

