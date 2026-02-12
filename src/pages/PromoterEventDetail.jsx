 import { useMemo } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Ticket,
  Wallet2,
  ShieldCheck,
  Building2,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const PromoterEventDetail = () => {
  const { id } = useParams();
  const { data, currency, statusBadge } = useOutletContext();

  const event = useMemo(() => data.events.find((item) => item.id === id), [data.events, id]);
  const organizer = event
    ? data.organizers.find((org) => org.name === event.organizer)
    : null;

  if (!event) {
    return (
      <div className="space-y-6">
        <Link to="/promoter/events" className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to events
        </Link>
        <Card className="bg-card/70 border-border/60">
          <CardContent className="py-16 text-center">
            <p className="text-lg font-semibold">Event not found</p>
            <p className="text-sm text-muted-foreground mt-2">Select another event from the list.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const enrolledPercentage = event.totalTickets
    ? Math.round((event.ticketsSold / event.totalTickets) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <Link to="/promoter/events" className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowLeft className="w-4 h-4" /> Back to events
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card/70 border-border/60">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">{event.title}</CardTitle>
                  <CardDescription className="text-muted-foreground flex flex-wrap items-center gap-2">
                    <Badge variant={statusBadge(event.status)}>{event.status}</Badge>
                    <Badge variant="outline">{event.category}</Badge>
                    <span className="text-muted-foreground/60">•</span>
                    {event.subCategory}
                  </CardDescription>
                </div>
                <div className="rounded-xl border border-border/60 bg-card/80 px-4 py-2">
                  <p className="text-xs text-muted-foreground">Publish status</p>
                  <p className="text-sm font-semibold">{event.publishStatus}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{event.description}</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {event.startDate} {event.endDate ? `• ${event.endDate}` : ""}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" /> {event.eventStatus || event.status}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" /> {event.venue}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="w-4 h-4" /> {event.location}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-card/70 border-border/60">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <Ticket className="w-4 h-4" /> Tickets Sold
                </p>
                <p className="text-2xl font-semibold">{event.ticketsSold.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">of {event.totalTickets.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="bg-card/70 border-border/60">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4" /> Bookings
                </p>
                <p className="text-2xl font-semibold">{event.bookings.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Capacity {event.capacity}</p>
              </CardContent>
            </Card>
            <Card className="bg-card/70 border-border/60">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <Wallet2 className="w-4 h-4" /> Gross Revenue
                </p>
                <p className="text-2xl font-semibold text-accent">{currency(event.gross)}</p>
                <p className="text-xs text-muted-foreground">Platform fee {currency(event.platformFee)}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card/70 border-border/60">
            <CardHeader>
              <CardTitle>Organizer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{organizer?.name || event.organizer}</p>
                  <p className="text-muted-foreground">{organizer?.address || event.location}</p>
                </div>
                {organizer?.isVerified && (
                  <Badge variant="success">
                    <ShieldCheck className="w-4 h-4 mr-1" /> Verified
                  </Badge>
                )}
              </div>
              {organizer && (
                <div className="grid sm:grid-cols-2 gap-3 text-muted-foreground">
                  <div>Owner: {organizer.owner.name}</div>
                  <div>Contact: {organizer.contact}</div>
                  <div>Email: {organizer.email}</div>
                  <div>Managers: {organizer.managers?.length || 0}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-card/70 border-border/60">
            <CardHeader>
              <CardTitle>Performance</CardTitle>
              <CardDescription className="text-muted-foreground">Live ticketing and revenue health.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-muted-foreground">Capacity used</span>
                  <span className="font-semibold">{enrolledPercentage}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${enrolledPercentage}%` }}
                  />
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total payout</span>
                <span className="font-semibold">{currency(event.payout)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Platform fee</span>
                <span className="font-semibold">{currency(event.platformFee)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Gross revenue</span>
                <span className="font-semibold text-accent">{currency(event.gross)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Event type</span>
                <span className="font-semibold">{event.type}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/70 border-border/60">
            <CardHeader>
              <CardTitle>Compliance</CardTitle>
              <CardDescription className="text-muted-foreground">Status and publishing controls.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="rounded-xl border border-border/60 bg-card/80 p-3">
                <p className="text-xs text-muted-foreground">Publish status</p>
                <p className="font-semibold">{event.publishStatus}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-card/80 p-3">
                <p className="text-xs text-muted-foreground">Event status</p>
                <p className="font-semibold">{event.status}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PromoterEventDetail;
