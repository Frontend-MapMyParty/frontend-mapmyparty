import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  Filter,
  Ticket,
  Users,
  Wallet2,
  XCircle,
} from "lucide-react";

const PromoterBookings = () => {
  const { data, currency, statusBadge } = useOutletContext();
  const { bookings, events } = data;
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const bookingList = bookings.list || [];

  const filteredBookings = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return bookingList.filter((item) => {
      const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
      const matchesQuery =
        item.eventTitle.toLowerCase().includes(query) ||
        item.userName.toLowerCase().includes(query) ||
        item.userEmail.toLowerCase().includes(query);
      return matchesStatus && matchesQuery;
    });
  }, [bookingList, searchQuery, statusFilter]);

  const [selectedId, setSelectedId] = useState(bookingList[0]?.id || "");
  const selectedBooking = filteredBookings.find((item) => item.id === selectedId) || filteredBookings[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Bookings</h2>
          <p className="text-muted-foreground">Ticket movement, refunds, disputes, and transaction health.</p>
        </div>
        <Badge variant="outline" className="text-sm py-1 px-3 border-border/70">Live feed</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="bg-card/70 border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Today</CardTitle>
            <CardDescription>Live ticketing pulse</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{bookings.today.count}</p>
            <p className="text-sm text-muted-foreground">{currency(bookings.today.value)} • platform {currency(bookings.today.platformFee)}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/70 border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">This Week</CardTitle>
            <CardDescription>Across all events</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{bookings.week.count}</p>
            <p className="text-sm text-muted-foreground">{currency(bookings.week.value)} • platform {currency(bookings.week.platformFee)}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/70 border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Refunds & Disputes</CardTitle>
            <CardDescription>Customer issues in queue</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> {bookings.refunds.count} refunds
            </p>
            <p className="text-sm text-muted-foreground">Value {currency(bookings.refunds.value)} • {bookings.disputes} disputes</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by user or event..."
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          {["ALL", "PAID", "REFUND_PENDING"].map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setSelectedId("");
              }}
              className={`px-3 py-2 rounded-lg border border-border/60 transition ${
                statusFilter === status
                  ? "bg-primary text-primary-foreground"
                  : "bg-card/70 text-muted-foreground hover:bg-card"
              }`}
            >
              {status === "ALL" ? "All" : status.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-4">
        <Card className="bg-card/70 border-border/60">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4" />
              <CardTitle className="text-base">Booking ledger</CardTitle>
            </div>
            <CardDescription>Detailed transaction timeline</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {filteredBookings.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedId(b.id)}
                className={`w-full text-left rounded-lg border px-3 py-3 text-sm transition ${
                  selectedBooking?.id === b.id
                    ? "border-primary/60 bg-card"
                    : "border-border/60 bg-card/80 hover:bg-card"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{b.id} • {b.eventTitle}</p>
                    <p className="text-xs text-muted-foreground">{b.userName} • {b.eventOrganizer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-accent">{currency(b.amount)}</p>
                    <Badge variant={statusBadge(b.status)} className="mt-1">{b.status}</Badge>
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/60">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wallet2 className="w-4 h-4" />
              <CardTitle className="text-base">Booking detail</CardTitle>
            </div>
            <CardDescription>Full ticket, payment, and user metadata.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {selectedBooking ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Booking ID</p>
                    <p className="font-semibold">{selectedBooking.id}</p>
                  </div>
                  <Badge variant={statusBadge(selectedBooking.status)}>{selectedBooking.status}</Badge>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground">Event</p>
                  <p className="font-semibold">{selectedBooking.eventTitle}</p>
                  <p className="text-xs text-muted-foreground">{selectedBooking.eventOrganizer} • {selectedBooking.eventCity}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Customer</p>
                  <p className="font-semibold">{selectedBooking.userName}</p>
                  <p className="text-xs text-muted-foreground">{selectedBooking.userEmail}</p>
                  <p className="text-xs text-muted-foreground">{selectedBooking.userPhone}</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-border/60 bg-card/80 p-3">
                    <p className="text-xs text-muted-foreground">Tickets</p>
                    <p className="font-semibold">{selectedBooking.tickets}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-card/80 p-3">
                    <p className="text-xs text-muted-foreground">Platform fee</p>
                    <p className="font-semibold">{currency(selectedBooking.platformFee)}</p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-card/80 p-3">
                    <p className="text-xs text-muted-foreground">GST</p>
                    <p className="font-semibold">{currency(selectedBooking.gstAmount)}</p>
                  </div>
                </div>
                <div className="rounded-lg border border-border/60 bg-card/80 p-3">
                  <p className="text-xs text-muted-foreground">Payment status</p>
                  <p className="font-semibold flex items-center gap-2">
                    {selectedBooking.paymentStatus === "CAPTURED" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-amber-400" />
                    )}
                    {selectedBooking.paymentStatus}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tickets breakdown</p>
                  <div className="space-y-2 mt-2">
                    {selectedBooking.bookingItems.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{item.quantity} × {item.name}</span>
                        <span>{currency(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">No booking selected.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/70 border-border/60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            <CardTitle className="text-base">Event fill highlights</CardTitle>
          </div>
          <CardDescription>Live vs capacity snapshot</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {events.slice(0, 3).map((ev) => {
            const total = ev.ticketsSold || 0;
            return (
              <div key={ev.title} className="rounded-lg border border-border/60 bg-card/80 p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{ev.title}</p>
                  <Badge variant={statusBadge(ev.status)}>{ev.status}</Badge>
                </div>
                <p className="text-muted-foreground text-xs">{ev.organizer}</p>
                <p className="text-muted-foreground">Tickets sold: {total.toLocaleString()}</p>
                <p className="text-muted-foreground text-xs">Gross {currency(ev.gross)}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default PromoterBookings;
