import { useMemo } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  Globe,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Ticket,
  Users,
  Wallet2,
} from "lucide-react";

const PromoterOrganizerDetail = () => {
  const { slug } = useParams();
  const { data, currency, statusBadge } = useOutletContext();

  const organizer = useMemo(
    () => data.organizers.find((org) => org.slug === slug),
    [data.organizers, slug]
  );

  if (!organizer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Link to="/promoter/organizers" className="inline-flex items-center gap-2 text-accent">
            <ArrowLeft className="w-4 h-4" /> Back to organizers
          </Link>
        </div>
        <Card className="bg-card/70 border-border/60">
          <CardContent className="py-16 text-center">
            <p className="text-lg font-semibold">Organizer not found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try returning to the organizers list and selecting another profile.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalTickets = organizer.events.reduce((sum, ev) => sum + (ev.tickets || 0), 0);
  const totalEvents = organizer.events.length;
  const totalManagers = organizer.managers?.length || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Link
            to="/promoter/organizers"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to organizers
          </Link>
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback>{organizer.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold">{organizer.name}</h2>
                <Badge variant={organizer.isVerified ? "success" : "secondary"}>
                  {organizer.isVerified ? "Verified" : "Unverified"}
                </Badge>
                <Badge variant={statusBadge(organizer.bank.status)}>{organizer.bank.status}</Badge>
              </div>
              <p className="text-muted-foreground flex flex-wrap items-center gap-2">
                <Building2 className="w-4 h-4" />
                {organizer.state}
                <span className="text-muted-foreground/60">•</span>
                <MapPin className="w-4 h-4" />
                {organizer.address}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="rounded-xl border border-border/60 bg-card/80 px-4 py-2 text-sm">
            <p className="text-muted-foreground">Created</p>
            <p className="font-semibold">{organizer.createdAt}</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-card/80 px-4 py-2 text-sm">
            <p className="text-muted-foreground">Updated</p>
            <p className="font-semibold">{organizer.updatedAt}</p>
          </div>
        </div>
      </div>

      <Card className="bg-card/70 border-border/60">
        <CardHeader>
          <CardTitle>Organizer overview</CardTitle>
          <CardDescription className="text-muted-foreground">
            Core profile, performance, and revenue snapshots.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{organizer.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-border/60 bg-card/80 p-4">
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <CalendarClock className="w-4 h-4" /> Events
              </p>
              <p className="text-2xl font-semibold">{totalEvents}</p>
              <p className="text-xs text-muted-foreground">Active catalog</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/80 p-4">
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <Ticket className="w-4 h-4" /> Total Tickets
              </p>
              <p className="text-2xl font-semibold">{totalTickets.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Across live & upcoming</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/80 p-4">
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <Wallet2 className="w-4 h-4" /> Gross Revenue
              </p>
              <p className="text-2xl font-semibold text-accent">{currency(organizer.gross)}</p>
              <p className="text-xs text-muted-foreground">Platform fee {currency(organizer.platformFee)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-card/70 border-border/60">
          <CardHeader>
            <CardTitle>Owner & contacts</CardTitle>
            <CardDescription className="text-muted-foreground">Primary account for payouts and verification.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Owner</p>
              <p className="font-semibold">{organizer.owner.name}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" /> {organizer.owner.email}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" /> {organizer.owner.phone}
              </div>
            </div>
            <div className="pt-2 border-t border-border/60">
              <p className="text-xs text-muted-foreground">Organizer contact</p>
              <p className="text-sm">{organizer.email}</p>
              <p className="text-sm">{organizer.contact}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/60">
          <CardHeader>
            <CardTitle>Management team</CardTitle>
            <CardDescription className="text-muted-foreground">Active organizer managers on record.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {totalManagers === 0 ? (
              <p className="text-muted-foreground">No managers listed.</p>
            ) : (
              organizer.managers.map((manager) => (
                <div key={manager.email} className="rounded-xl border border-border/60 bg-card/80 p-3">
                  <p className="font-semibold">{manager.name}</p>
                  <p className="text-xs text-muted-foreground">{manager.email}</p>
                  <p className="text-xs text-muted-foreground">{manager.phone}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/60">
          <CardHeader>
            <CardTitle>Bank & compliance</CardTitle>
            <CardDescription className="text-muted-foreground">Verification and payout configuration.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-xl border border-border/60 bg-card/80 p-3">
              <p className="text-xs text-muted-foreground">Bank</p>
              <p className="font-semibold">{organizer.bank.bankName}</p>
              <p className="text-xs text-muted-foreground">A/C •••• {organizer.bank.accountNumber}</p>
              <p className="text-xs text-muted-foreground">IFSC {organizer.bank.ifsc}</p>
              <p className="text-xs text-muted-foreground">GST {organizer.bank.gstNumber}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card/80 p-3">
              <p className="text-xs text-muted-foreground">Payout status</p>
              <p className="font-semibold">Due {currency(organizer.payoutDue)}</p>
              <p className="text-xs text-muted-foreground">Last payout {organizer.lastPayout}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/70 border-border/60">
        <CardHeader>
          <CardTitle>Events & revenue</CardTitle>
          <CardDescription className="text-muted-foreground">
            Full event catalog with ticket and revenue breakdowns.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {organizer.events.map((event) => (
            <div
              key={event.title}
              className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card/80 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-semibold">{event.title}</p>
                <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
                  <CalendarClock className="w-3 h-3" /> {event.status}
                  <span className="text-muted-foreground/60">•</span>
                  {event.city}
                  <span className="text-muted-foreground/60">•</span>
                  {event.type}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Tickets</p>
                  <p className="font-semibold">{event.tickets.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Gross</p>
                  <p className="font-semibold text-accent">{currency(event.gross)}</p>
                </div>
                <Badge variant={statusBadge(event.status)}>{event.status}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card/70 border-border/60">
          <CardHeader>
            <CardTitle>Social presence</CardTitle>
            <CardDescription className="text-muted-foreground">Organizer social links from profile.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {organizer.socials ? (
              Object.entries(organizer.socials).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between rounded-lg border border-border/60 bg-card/80 px-3 py-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="w-4 h-4" /> {key}
                  </div>
                  <a href={value} target="_blank" rel="noreferrer" className="text-accent hover:text-accent/80">
                    {value.replace("https://", "")}
                  </a>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No social links available.</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/60">
          <CardHeader>
            <CardTitle>Compliance notes</CardTitle>
            <CardDescription className="text-muted-foreground">Governance and verification status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-accent" />
              {organizer.isVerified ? "Organizer verified" : "Verification pending"}
            </div>
            <div className="rounded-xl border border-border/60 bg-card/80 p-3">
              <p className="text-xs text-muted-foreground">GST Number</p>
              <p className="font-semibold">{organizer.bank.gstNumber}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card/80 p-3">
              <p className="text-xs text-muted-foreground">Managers on record</p>
              <p className="font-semibold">{totalManagers}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card/80 p-3">
              <p className="text-xs text-muted-foreground">Total bookings</p>
              <p className="font-semibold">{organizer.bookings.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PromoterOrganizerDetail;
