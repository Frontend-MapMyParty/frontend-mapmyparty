 import { useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Calendar, MapPin, Search, Ticket, Users, Wallet2, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const PromoterEvents = () => {
  const { data, currency, statusBadge } = useOutletContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const events = useMemo(() => {
    return data.events.map((event) => {
      const organizer = data.organizers.find((org) => org.name === event.organizer);
      return {
        ...event,
        organizer,
      };
    });
  }, [data.events, data.organizers]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesStatus = statusFilter === "all" || event.status === statusFilter;
      const matchesSearch =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.organizer?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [events, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Events</h2>
          <p className="text-muted-foreground">All events across organizers with live status and revenue.</p>
        </div>
        <Badge variant="outline" className="text-sm py-1 px-3 border-border/70">
          {filteredEvents.length} Events
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search events or organizers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          {["all", "LIVE", "UPCOMING", "COMPLETED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-lg border border-border/60 transition ${
                statusFilter === status
                  ? "bg-primary text-primary-foreground"
                  : "bg-card/70 text-muted-foreground hover:bg-card"
              }`}
            >
              {status === "all" ? "All" : status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="bg-card/70 border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <CardDescription className="text-muted-foreground flex flex-wrap items-center gap-2">
                    <Users className="w-4 h-4" />
                    {event.organizer?.name || event.organizer}
                    <span className="text-muted-foreground/60">•</span>
                    <Calendar className="w-4 h-4" />
                    {event.date || event.startDate}
                    <span className="text-muted-foreground/60">•</span>
                    <MapPin className="w-4 h-4" />
                    {event.city || event.location}
                  </CardDescription>
                </div>
                <Badge variant={statusBadge(event.status)}>{event.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-border/60 bg-card/80 p-3">
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <Ticket className="w-4 h-4" /> Tickets
                  </p>
                  <p className="text-lg font-semibold">{event.ticketsSold?.toLocaleString() || 0}</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-card/80 p-3">
                  <p className="text-xs text-muted-foreground">Bookings</p>
                  <p className="text-lg font-semibold">{event.bookings?.toLocaleString() || 0}</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-card/80 p-3">
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <Wallet2 className="w-4 h-4" /> Gross
                  </p>
                  <p className="text-lg font-semibold text-accent">{currency(event.gross || 0)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-muted-foreground">Category</p>
                  <p className="font-medium">{event.category}</p>
                </div>
                <Link
                  to={`/promoter/events/${event.id}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent/80 transition"
                >
                  View details <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PromoterEvents;
