import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ticket, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";

const PromoterBookings = () => {
  const { data, currency, statusBadge } = useOutletContext();
  const { bookings, events } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bookings</h2>
          <p className="text-white/70">Ticket movement, refunds, disputes, and recent transactions.</p>
        </div>
        <Badge variant="outline" className="border-white/20 text-sm">Live feed</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2"><CardTitle className="text-base">Today</CardTitle><CardDescription>Live ticketing pulse</CardDescription></CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{bookings.today.count}</p>
            <p className="text-sm text-white/70">{currency(bookings.today.value)} • platform {currency(bookings.today.platformFee)}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2"><CardTitle className="text-base">This Week</CardTitle><CardDescription>Across all events</CardDescription></CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{bookings.week.count}</p>
            <p className="text-sm text-white/70">{currency(bookings.week.value)} • platform {currency(bookings.week.platformFee)}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2"><CardTitle className="text-base">Refunds & Disputes</CardTitle><CardDescription>Customer issues in queue</CardDescription></CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-400" /> {bookings.refunds.count} refunds</p>
            <p className="text-sm text-white/70">Value {currency(bookings.refunds.value)} • {bookings.disputes} disputes</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4" />
            <CardTitle className="text-base">Recent bookings</CardTitle>
          </div>
          <CardDescription className="text-white/70">Latest transactions across events</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {bookings.recent.map((b) => (
            <div key={b.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm">
              <div>
                <p className="font-semibold">{b.id} • {b.event}</p>
                <p className="text-white/60 text-xs">{b.organizer}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{currency(b.amount)}</p>
                <Badge variant={statusBadge(b.status)} className="mt-1">{b.status}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            <CardTitle className="text-base">Event fill highlights</CardTitle>
          </div>
          <CardDescription className="text-white/70">Live vs capacity snapshot</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {events.slice(0, 3).map((ev) => {
            const total = ev.ticketsSold || 0;
            return (
              <div key={ev.title} className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{ev.title}</p>
                  <Badge variant={statusBadge(ev.status)}>{ev.status}</Badge>
                </div>
                <p className="text-white/60 text-xs">{ev.organizer}</p>
                <p className="text-white/80">Tickets sold: {total.toLocaleString()}</p>
                <p className="text-white/60 text-xs">Gross {currency(ev.gross)}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default PromoterBookings;
