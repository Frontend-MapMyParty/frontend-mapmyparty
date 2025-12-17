import { useState, useEffect, useMemo, useCallback } from "react";
import { Ticket, Calendar, MapPin, Loader2, AlertCircle, Receipt, CreditCard, User, Mail, Phone, Hash, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import TicketModal from "@/components/TicketModal";
import eventPlaceholder from "@/assets/event-music.jpg";
import { apiFetch } from "@/config/api";

const MyBookings = () => {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFetch("/api/user/bookings", { method: "GET" });
      if (response?.success && Array.isArray(response?.data?.items)) {
        setBookings(response.data.items);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error("Failed to load bookings", err);
      setError(err?.message || "Failed to load your bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const tickets = useMemo(() => {
    const formatDate = (iso) => {
      if (!iso) return { date: "Date TBD", time: "" };
      const date = new Date(iso);
      return {
        date: date.toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        time: date.toLocaleTimeString(undefined, {
          hour: "numeric",
          minute: "2-digit",
        }),
      };
    };

    return bookings.map((booking) => {
      const event = booking.event || {};
      const venue =
        event.venues?.find((v) => v.isPrimary) || event.venues?.[0] || {};
      const ticketInfo = booking.ticket || {};
      const paymentInfo = booking.payment || {};
      const { date, time } = formatDate(event.startDate || booking.createdAt);
      const bookingDate = new Date(booking.createdAt || Date.now());
      const bookingDateFormatted = bookingDate.toLocaleDateString(
        undefined,
        { year: "numeric", month: "long", day: "numeric" }
      );
      const bookingTimeFormatted = bookingDate.toLocaleTimeString(
        undefined,
        { hour: "numeric", minute: "2-digit" }
      );

      const unitPrice = ticketInfo.price || 0;
      const quantity = booking.quantity || 1;
      const subtotal = unitPrice * quantity;
      const tax = 0; // Add tax if available
      const totalPrice = paymentInfo.amount ?? booking.totalAmount ?? subtotal;

      return {
        id: booking.id,
        orderId: booking.orderId || booking.id,
        eventId: event.id,
        eventLink: event.id ? `/events/${event.id}` : "/events",
        eventTitle: event.title || "Untitled Event",
        eventDate: date,
        eventTime: time,
        location:
          venue.fullAddress ||
          [venue.name, venue.city, venue.state].filter(Boolean).join(", ") ||
          "Location TBA",
        image: event.flyerImage || eventPlaceholder,
        ticketType: ticketInfo.name || ticketInfo.type || "General Admission",
        unitPrice,
        quantity,
        subtotal,
        tax,
        totalPrice,
        bookingDate: bookingDateFormatted,
        bookingTime: bookingTimeFormatted,
        status: (booking.status || "").toLowerCase(),
        paymentStatus: paymentInfo.status || booking.paymentStatus || "completed",
        paymentMethod: paymentInfo.method || "Online",
        organizerName: event.organizer?.name || "Event Organizer",
        raw: booking,
      };
    });
  }, [bookings]);

  const handleRetry = () => {
    fetchBookings();
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      <main className="py-6">
        <div className="container">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Receipt className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold">My Orders</h1>
            </div>
            <p className="text-[rgba(255,255,255,0.65)] text-lg">
              View and manage all your event orders and bookings
            </p>
          </div>

          {loading ? (
            <Card className="bg-[#000000] border border-[rgba(255,255,255,0.18)] text-white">
              <CardContent className="p-12 text-center space-y-4">
                <Loader2 className="w-10 h-10 mx-auto animate-spin text-primary" />
                <p className="text-[rgba(255,255,255,0.65)]">Loading your bookings...</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="bg-[#000000] border border-[rgba(255,255,255,0.18)] text-white">
              <CardContent className="p-12 text-center space-y-4">
                <AlertCircle className="w-12 h-12 mx-auto text-destructive" />
                <h3 className="text-xl font-semibold">Unable to load bookings</h3>
                <p className="text-[rgba(255,255,255,0.65)]">{error}</p>
                <Button variant="accent" onClick={handleRetry}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : tickets.length === 0 ? (
            <Card className="bg-[#000000] border border-[rgba(255,255,255,0.18)] text-white">
              <CardContent className="p-12 text-center">
                <Receipt className="w-16 h-16 text-[rgba(255,255,255,0.65)] mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                <p className="text-[rgba(255,255,255,0.65)] mb-6">
                  Start exploring events and place your first order!
                </p>
                <Button variant="accent" asChild>
                  <Link to="/events">Browse Events</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {tickets.map((order) => (
                <Card
                  key={order.id}
                  className="overflow-hidden border border-[rgba(255,255,255,0.18)] bg-[#000000] text-white hover:shadow-[0_18px_50px_-20px_rgba(0,0,0,0.65)] transition-all"
                >
                  {/* Order Header */}
                  <CardHeader className="bg-[#000000] border-b border-[rgba(255,255,255,0.18)]">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Hash className="w-4 h-4 text-[rgba(255,255,255,0.65)]" />
                          <span className="text-sm text-[rgba(255,255,255,0.65)]">Order ID:</span>
                          <span className="text-sm font-mono font-semibold">{order.orderId}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[rgba(255,255,255,0.65)]" />
                          <span className="text-sm text-[rgba(255,255,255,0.65)]">
                            Ordered on {order.bookingDate} at {order.bookingTime}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={order.status === "confirmed" ? "default" : "secondary"}
                          className="text-sm px-3 py-1"
                        >
                          {order.status === "confirmed" ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Confirmed
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 mr-1" />
                              Pending
                            </>
                          )}
                        </Badge>
                        <Badge
                          variant={order.paymentStatus === "completed" ? "default" : "outline"}
                          className="text-sm px-3 py-1"
                        >
                          <CreditCard className="w-3 h-3 mr-1" />
                          {order.paymentStatus === "completed" ? "Paid" : "Pending"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    <div className="grid lg:grid-cols-3 gap-6">
                      {/* Event Image & Info */}
                      <div className="lg:col-span-2 space-y-4">
                        <div className="flex gap-4">
                          <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={order.image}
                              alt={order.eventTitle}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold mb-2">{order.eventTitle}</h3>
                            <div className="space-y-2 text-sm text-[rgba(255,255,255,0.65)]">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{order.eventDate} at {order.eventTime}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{order.location}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span>Organizer: {order.organizerName}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Order Details Section */}
                        <div className="border-t border-[rgba(255,255,255,0.18)] pt-4">
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Ticket className="w-4 h-4" />
                            Order Details
                          </h4>
                          <div className="bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.18)] rounded-lg p-4 space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-[rgba(255,255,255,0.65)]">Ticket Type:</span>
                              <span className="text-sm font-medium">{order.ticketType}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-[rgba(255,255,255,0.65)]">Quantity:</span>
                              <span className="text-sm font-medium">{order.quantity} {order.quantity > 1 ? "tickets" : "ticket"}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-[rgba(255,255,255,0.65)]">Unit Price:</span>
                              <span className="text-sm font-medium">₹{order.unitPrice}</span>
                            </div>
                            {order.tax > 0 && (
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-[rgba(255,255,255,0.65)]">Tax:</span>
                                <span className="text-sm font-medium">₹{order.tax}</span>
                              </div>
                            )}
                            <div className="border-t pt-3 flex justify-between items-center">
                              <span className="font-semibold">Total Amount:</span>
                              <span className="text-xl font-bold text-primary">₹{order.totalPrice}</span>
                            </div>
                          </div>
                        </div>

                        {/* Payment Info */}
                        <div className="border-t border-[rgba(255,255,255,0.18)] pt-4">
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            Payment Information
                          </h4>
                          <div className="grid sm:grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-[rgba(255,255,255,0.65)]">Payment Method:</span>
                              <span className="ml-2 font-medium">{order.paymentMethod}</span>
                            </div>
                            <div>
                              <span className="text-[rgba(255,255,255,0.65)]">Payment Status:</span>
                              <Badge
                                variant={order.paymentStatus === "completed" ? "default" : "secondary"}
                                className="ml-2"
                              >
                                {order.paymentStatus === "completed" ? "Completed" : "Pending"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Sidebar */}
                      <div className="lg:col-span-1 space-y-4">
                        <div className="bg-[rgba(255,255,255,0.08)] rounded-lg p-4 border border-[rgba(255,255,255,0.18)]">
                          <h4 className="font-semibold mb-3">Order Summary</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-[rgba(255,255,255,0.65)]">Subtotal:</span>
                              <span>₹{order.subtotal}</span>
                            </div>
                            {order.tax > 0 && (
                              <div className="flex justify-between">
                                <span className="text-[rgba(255,255,255,0.65)]">Tax:</span>
                                <span>₹{order.tax}</span>
                              </div>
                            )}
                            <div className="border-t pt-2 flex justify-between font-bold">
                              <span>Total:</span>
                              <span className="text-primary">₹{order.totalPrice}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Button
                            variant="default"
                            className="w-full"
                            onClick={() => setSelectedTicket(order)}
                          >
                            <Ticket className="w-4 h-4 mr-2" />
                            View Ticket
                          </Button>
                          <Button variant="outline" className="w-full" asChild>
                            <Link to={order.eventLink}>
                              <Calendar className="w-4 h-4 mr-2" />
                              Event Details
                            </Link>
                          </Button>
                        </div>
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
      </main>

      <Footer />
    </div>
  );
};

export default MyBookings;

