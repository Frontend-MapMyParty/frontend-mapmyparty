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
  ShieldCheck,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const PromoterUserDetail = () => {
  const { id } = useParams();
  const { data, currency, statusBadge } = useOutletContext();

  const user = useMemo(() => {
    const dummyUsers = data.users || [];
    const bookings = Array.isArray(data.bookings) ? data.bookings : [];
    const userMap = {};
    dummyUsers.forEach((u) => {
      userMap[u.email] = {
        id: u.email,
        name: u.name,
        email: u.email,
        phone: "+91 XXXXX XXXXX",
        joinedDate: "Jan 2024",
        city: u.state || "Unknown",
        status: "active",
        totalTickets: u.bookings || 0,
        totalSpent: u.bookings * 850 || 0,
        bookings: [],
      };
    });
    bookings.forEach((booking) => {
      const uid = booking.userId || booking.userEmail;
      if (!userMap[uid]) {
        userMap[uid] = {
          id: uid,
          name: booking.userName || "Unknown",
          email: booking.userEmail,
          phone: booking.userPhone,
          joinedDate: booking.createdAt,
          city: booking.userCity || "Unknown",
          status: booking.userStatus || "active",
          totalTickets: 0,
          totalSpent: 0,
          bookings: [],
        };
      }
      userMap[uid].totalTickets += booking.tickets || 1;
      userMap[uid].totalSpent += booking.amount || booking.totalAmount || 0;
      userMap[uid].bookings.push(booking);
    });
    return userMap[id];
  }, [data.users, data.bookings, id]);

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
  const eventsMap = {};
  user.bookings.forEach((b) => {
    if (!eventsMap[b.eventId]) {
      eventsMap[b.eventId] = {
        id: b.eventId,
        title: b.eventTitle,
        date: b.eventDate,
        city: b.eventCity,
        organizer: b.eventOrganizer,
        tickets: 0,
        spent: 0,
        items: [],
      };
    }
    eventsMap[b.eventId].tickets += b.tickets || 1;
    eventsMap[b.eventId].spent += b.amount || b.totalAmount || 0;
    eventsMap[b.eventId].items.push(b);
  });
  const events = Object.values(eventsMap);

  return (
    <div className="space-y-6">
      <Link to="/promoter/users" className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowLeft className="w-4 h-4" /> Back to users
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card/70 border-border/60">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">{user.name}</CardTitle>
                  <CardDescription className="text-muted-foreground flex items-center gap-2">
                    <Badge variant={user.status === "active" ? "success" : "secondary"}>{user.status}</Badge>
                    <span className="text-muted-foreground/60">•</span>
                    Joined {user.joinedDate}
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
                  <Phone className="w-4 h-4" /> {user.phone}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" /> {user.city}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" /> Joined {user.joinedDate}
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
                <p className="text-2xl font-semibold">{events.length}</p>
                <p className="text-xs text-muted-foreground">Attended</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card/70 border-border/60">
            <CardHeader>
              <CardTitle>Events & Bookings</CardTitle>
              <CardDescription className="text-muted-foreground">
                All events this user has booked tickets for.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="rounded-xl border border-border/60 bg-card/80 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{event.title}</p>
                      <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-2">
                        <Users className="w-3 h-3" /> {event.organizer}
                        <span className="text-muted-foreground/60">•</span>
                        <Calendar className="w-3 h-3" /> {event.date}
                        <span className="text-muted-foreground/60">•</span>
                        <MapPin className="w-3 h-3" /> {event.city}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total spent</p>
                      <p className="font-semibold text-accent">{currency(event.spent)}</p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tickets booked</span>
                      <span className="font-semibold">{event.tickets}</span>
                    </div>
                    <div className="space-y-1">
                      {event.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs text-muted-foreground pl-2 border-l border-border/60">
                          <span>
                            {item.tickets || 1} × {item.ticketName || "Ticket"}
                          </span>
                          <span>{currency(item.amount || item.totalAmount || 0)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-card/70 border-border/60">
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription className="text-muted-foreground">User profile and verification.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="rounded-xl border border-border/60 bg-card/80 p-3">
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="font-semibold">{user.status}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-card/80 p-3">
                <p className="text-xs text-muted-foreground">Joined</p>
                <p className="font-semibold">{user.joinedDate}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-card/80 p-3">
                <p className="text-xs text-muted-foreground">City</p>
                <p className="font-semibold">{user.city}</p>
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
                <span className="font-semibold">{user.bookings.length}</span>
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
                <span className="font-semibold">{events.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/70 border-border/60">
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription className="text-muted-foreground">Recent booking transactions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {user.bookings.slice(0, 4).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{booking.eventTitle}</p>
                    <p className="text-xs text-muted-foreground">{booking.createdAt}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{currency(booking.amount || booking.totalAmount || 0)}</p>
                    <Badge variant={booking.status === "PAID" ? "success" : "secondary"} className="text-xs">
                      {booking.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PromoterUserDetail;
