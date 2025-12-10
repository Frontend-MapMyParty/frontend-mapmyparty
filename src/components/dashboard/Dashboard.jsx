import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, MapPin, Users, Ticket, Download, Mail, ChevronRight } from "lucide-react";
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

  // Fetch booked events
  const fetchBookedEvents = useCallback(async () => {
    try {
      setLoadingBooked(true);
      setErrorBooked(null);
      const response = await apiFetch("/api/bookings/my-bookings", {
        method: "GET",
      });

      if (response?.success && response?.data) {
        setBookedEvents(Array.isArray(response.data) ? response.data : []);
      } else {
        setBookedEvents([]);
      }
    } catch (err) {
      console.error("❌ Error fetching booked events:", err);
      setErrorBooked(err?.message || "Failed to load booked events");
      setBookedEvents([]);
    } finally {
      setLoadingBooked(false);
    }
  }, []);

  // Fetch upcoming events
  const fetchUpcomingEvents = useCallback(async () => {
    try {
      setLoadingUpcoming(true);
      setErrorUpcoming(null);
      const response = await apiFetch("/api/events/upcoming", {
        method: "GET",
      });

      if (response?.success && response?.data) {
        setUpcomingEvents(Array.isArray(response.data) ? response.data : []);
      } else {
        setUpcomingEvents([]);
      }
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
    <div className="w-full h-full p-4 md:p-6 lg:p-8">
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Events - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Events Card */}
          <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white rounded-2xl">
            <CardHeader className="bg-black p-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-white">My Booked Events</CardTitle>
                  <p className="text-sm text-white/70">Your upcoming event experiences</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-white/10 rounded-full px-3 h-8"
                >
                  View All <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 bg-white/80 backdrop-blur-sm">
              {loadingBooked ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                  <p className="text-gray-500 mt-2">Loading your booked events...</p>
                </div>
              ) : bookedEvents.length === 0 ? (
                <div className="p-8 text-center">
                  <Ticket className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No booked events yet</p>
                  <p className="text-gray-400 text-sm mt-1">Browse events and book your first ticket!</p>
                  <Link to="/dashboard/browse-events">
                    <Button className="mt-4 bg-red-600 hover:bg-red-700">
                      Browse Events
                    </Button>
                  </Link>
                </div>
              ) : (
                bookedEvents.map((event, index) => (
                  <Link key={event.id} to={`/events/${event.id}`} className="block">
                  <div 
                    className={`p-5 ${index !== bookedEvents.length - 1 ? 'border-b border-gray-100' : ''} hover:bg-gray-50/50 transition-colors duration-150`}
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-shrink-0 w-full sm:w-32 h-32 rounded-lg overflow-hidden group bg-gray-200">
                        {event.image ? (
                          <img 
                            src={event.image} 
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-300">
                            <Calendar className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        {event.category && (
                          <Badge className="absolute top-2 left-2 bg-white/90 text-slate-800 hover:bg-white border border-gray-200 backdrop-blur-sm">
                            {event.category}
                          </Badge>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                              {event.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-600">
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                                {formatDate(event.date)}
                              </span>
                              <span className="text-gray-300">•</span>
                              <span className="flex items-center">
                                <Clock className="h-4 w-4 mr-1 text-gray-400" />
                                {event.time}
                              </span>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-600">
                              <MapPin className="h-4 w-4 mr-1.5 text-gray-400 flex-shrink-0" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-gray-900">₹{(event.price || 0).toFixed(2)}</div>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex flex-col sm:flex-row gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 border-gray-300 hover:bg-gray-50"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDownloadTicket(event); }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download Ticket
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleResendTicket(event); }}
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Resend Ticket
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
          
          {/* Quick Actions Card */}
          <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white rounded-2xl">
            <CardHeader className="bg-red-600 p-6 pb-4 rounded-t-2xl">
              <div>
                <CardTitle className="text-xl font-bold text-white">Quick Actions</CardTitle>
                <p className="text-sm text-white/80">Manage your events and tickets</p>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { 
                    icon: <Ticket className="h-6 w-6" />, 
                    label: 'Buy Tickets', 
                      bg: 'bg-blue-100', 
                      text: 'text-blue-600',
                      hover: 'hover:bg-blue-50'
                    },
                    { 
                      icon: <Calendar className="h-6 w-6" />, 
                      label: 'My Events', 
                      bg: 'bg-purple-100', 
                      text: 'text-purple-600',
                      hover: 'hover:bg-purple-50'
                    },
                    { 
                      icon: <Users className="h-6 w-6" />, 
                      label: 'Invite', 
                      bg: 'bg-green-100', 
                      text: 'text-green-600',
                      hover: 'hover:bg-green-50'
                    },
                    { 
                      icon: <MapPin className="h-6 w-6" />, 
                      label: 'Nearby', 
                      bg: 'bg-amber-100', 
                      text: 'text-amber-600',
                      hover: 'hover:bg-amber-50'
                    },
                  ].map((action, index) => (
                    <button 
                      key={index}
                      className={`flex items-center justify-start p-3 rounded-xl ${action.hover} transition-all`}
                    >
                      <div className={`p-2 rounded-lg ${action.bg} ${action.text} mr-3`}>
                        {action.icon}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{action.label}</span>
                    </button>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Event Calendar Card */}
          <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-red-600 to-red-800 p-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-white">Event Calendar</CardTitle>
                  <p className="text-sm text-red-100">Upcoming events at a glance</p>
                </div>
                <Calendar className="h-6 w-6 text-white/80" />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {loadingUpcoming ? (
                <div className="p-6 text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                  <p className="text-gray-500 mt-2 text-sm">Loading events...</p>
                </div>
              ) : upcomingEvents.length === 0 ? (
                <div className="p-6 text-center">
                  <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm font-medium">No upcoming events</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {upcomingEvents.slice(0, 4).map((event) => (
                      <div key={`cal-${event.id}`} className="flex items-start p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="bg-red-50 p-2 rounded-lg mr-3 text-center min-w-[60px]">
                          <div className="text-red-600 text-sm font-medium">
                            {new Date(event.date).toLocaleString('default', { month: 'short' })}
                          </div>
                          <div className="text-2xl font-bold text-gray-900">
                            {new Date(event.date).getDate()}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 truncate">{event.title}</h4>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <Clock className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                            {event.time}
                            <MapPin className="h-3.5 w-3.5 ml-3 mr-1.5 text-gray-400" />
                            <span className="truncate max-w-[100px]">{event.location?.split(',')?.[0] || 'Location'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4 border-red-200 text-red-600 hover:bg-red-50">
                    View All Events
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
          
          {/* Upcoming Events List */}
          <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white rounded-2xl">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-lg font-semibold">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              {loadingUpcoming ? (
                <div className="p-6 text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                  <p className="text-gray-500 mt-2 text-sm">Loading events...</p>
                </div>
              ) : upcomingEvents.length === 0 ? (
                <div className="p-6 text-center">
                  <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm font-medium">No upcoming events</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <Link key={`upcoming-${event.id}`} to={`/events/${event.id}`} className="block group">
                        <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-gray-200">
                            {event.image ? (
                              <img 
                                src={event.image} 
                                alt={event.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-300">
                                <Calendar className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 group-hover:text-red-600 transition-colors">
                              {event.title}
                            </h4>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {event.time}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Button variant="ghost" className="w-full mt-3 text-red-600 hover:bg-red-50">
                    View All Events
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

