import { useMemo } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Users,
  Wallet2,
  Ticket,
  Loader,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { usePromoterUserDetail } from "@/hooks/usePromoterUserDetail";

const statusVariant = (status) => {
  if (status === "CONFIRMED") return "success";
  if (status === "PENDING") return "secondary";
  if (status === "CANCELLED" || status === "REFUNDED") return "destructive";
  return "outline";
};

const formatDate = (value) => {
  if (!value) return "-";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return String(value);
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const PromoterUserDetail = () => {
  const { id } = useParams();
  const { currency } = useOutletContext();
  const { user, bookings, pagination, loading, isFetching, error, changePage } = usePromoterUserDetail(id);

  const events = useMemo(() => {
    const eventMap = new Map();
    bookings.forEach((booking) => {
      if (!booking.eventId) return;

      const existing = eventMap.get(booking.eventId) || {
        id: booking.eventId,
        title: booking.eventTitle,
        date: booking.eventDate,
        city: booking.eventCity,
        organizer: booking.eventOrganizer,
        tickets: 0,
        spent: 0,
      };

      existing.tickets += booking.tickets || 0;
      existing.spent += booking.totalAmount || 0;
      eventMap.set(booking.eventId, existing);
    });
    return Array.from(eventMap.values());
  }, [bookings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Link to="/promoter/users" className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to users
        </Link>
        <Card className="bg-destructive/10 border-destructive/30">
          <CardContent className="pt-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-destructive">Error loading user details</p>
              <p className="text-sm text-destructive/80">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <Link to="/promoter/users" className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to users
        </Link>
        <Card className="bg-card/70 border-border/60">
          <CardContent className="py-16 text-center">
            <p className="text-lg font-semibold">User not found</p>
            <p className="text-sm text-muted-foreground mt-2">Select another user from the list.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const avgTicketPrice = user.totalTickets ? Math.round(user.totalSpent / user.totalTickets) : 0;

  return (
    <div className="space-y-6">
      <Link to="/promoter/users" className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowLeft className="w-4 h-4" /> Back to users
      </Link>

      {isFetching && (
        <div className="h-0.5 w-full bg-muted overflow-hidden rounded-full">
          <div className="h-full w-1/3 bg-primary rounded-full animate-pulse" />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card/70 border-border/60">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">{user.name}</CardTitle>
                  <CardDescription className="text-muted-foreground flex items-center gap-2">
                    <Badge variant={user.status === "active" ? "success" : "secondary"}>{user.status}</Badge>
                    <span className="text-muted-foreground/60">|</span>
                    Joined {formatDate(user.joinedAt)}
                  </CardDescription>
                </div>
                <div className="rounded-xl border border-border/60 bg-card/80 px-4 py-2">
                  <p className="text-xs text-muted-foreground">User ID</p>
                  <p className="text-sm font-mono">{user.id.slice(0, 8)}...</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" /> {user.email}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" /> {user.phone || "-"}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" /> Joined {formatDate(user.joinedAt)}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-4 gap-4">
            <Card className="bg-card/70 border-border/60">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <Ticket className="w-4 h-4" /> Tickets
                </p>
                <p className="text-2xl font-semibold">{user.totalTickets}</p>
                <p className="text-xs text-muted-foreground">Total purchased</p>
              </CardContent>
            </Card>
            <Card className="bg-card/70 border-border/60">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <Wallet2 className="w-4 h-4" /> Spent
                </p>
                <p className="text-2xl font-semibold text-accent">{currency(user.totalSpent)}</p>
                <p className="text-xs text-muted-foreground">Lifetime spend</p>
              </CardContent>
            </Card>
            <Card className="bg-card/70 border-border/60">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Avg/Ticket
                </p>
                <p className="text-2xl font-semibold">{currency(avgTicketPrice)}</p>
                <p className="text-xs text-muted-foreground">Average price</p>
              </CardContent>
            </Card>
            <Card className="bg-card/70 border-border/60">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4" /> Events
                </p>
                <p className="text-2xl font-semibold">{user.eventsAttended || 0}</p>
                <p className="text-xs text-muted-foreground">Attended</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card/70 border-border/60">
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription className="text-muted-foreground">
                Booking history for this attendee.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {bookings.length === 0 && (
                <p className="text-sm text-muted-foreground">No bookings found for this user.</p>
              )}

              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-xl border border-border/60 bg-card/80 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{booking.eventTitle}</p>
                      <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-2">
                        <Calendar className="w-3 h-3" /> {formatDate(booking.eventDate)}
                        <span className="text-muted-foreground/60">|</span>
                        <MapPin className="w-3 h-3" /> {booking.eventCity || "-"}
                        <span className="text-muted-foreground/60">|</span>
                        <Users className="w-3 h-3" /> {booking.eventOrganizer}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-accent">{currency(booking.totalAmount)}</p>
                      <Badge variant={statusVariant(booking.status)} className="text-xs">
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tickets</span>
                    <span className="font-semibold">{booking.tickets}</span>
                  </div>
                </div>
              ))}

              {pagination.totalPages > 1 && (
                <div className="flex justify-center pt-2">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => changePage(pagination.page - 1)}
                          className={!pagination.hasPrevPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink isActive>{pagination.page}</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => changePage(pagination.page + 1)}
                          className={!pagination.hasNextPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-card/70 border-border/60">
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription className="text-muted-foreground">User profile and account summary.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="rounded-xl border border-border/60 bg-card/80 p-3">
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="font-semibold">{user.status}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-card/80 p-3">
                <p className="text-xs text-muted-foreground">Joined</p>
                <p className="font-semibold">{formatDate(user.joinedAt)}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-card/80 p-3">
                <p className="text-xs text-muted-foreground">Last booking</p>
                <p className="font-semibold">{formatDate(user.lastBookingAt)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/70 border-border/60">
            <CardHeader>
              <CardTitle>Booking Stats</CardTitle>
              <CardDescription className="text-muted-foreground">Lifetime activity summary.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total bookings</span>
                <span className="font-semibold">{user.totalBookings}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total tickets</span>
                <span className="font-semibold">{user.totalTickets}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total spent</span>
                <span className="font-semibold text-accent">{currency(user.totalSpent)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Avg per ticket</span>
                <span className="font-semibold">{currency(avgTicketPrice)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Events attended</span>
                <span className="font-semibold">{user.eventsAttended || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PromoterUserDetail;
