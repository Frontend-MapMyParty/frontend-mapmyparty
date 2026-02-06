 import { Link, useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Building2, CalendarClock, ChevronRight, MapPin, Wallet2 } from "lucide-react";

const PromoterOrganizers = () => {
  const { data, currency, statusBadge } = useOutletContext();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Organizers</h2>
          <p className="text-muted-foreground">Ownership snapshot, recent performance, and status.</p>
        </div>
        <Badge variant="outline" className="text-sm py-1 px-3 border-border/70">
          {data.organizers.length} Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {data.organizers.map((org) => (
          <Card key={org.id} className="bg-card/70 border-border/60">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>{org.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{org.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="w-4 h-4" />
                      {org.state}
                      <span className="text-muted-foreground/70">•</span>
                      <MapPin className="w-4 h-4" />
                      {org.city || org.address?.split(",")[0] || "Head Office"}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={statusBadge(org.bank.status)}>{org.bank.status}</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">{org.description}</p>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-border/60 bg-card/80 p-3">
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <CalendarClock className="w-4 h-4" /> Events
                  </p>
                  <p className="text-lg font-semibold">{org.events.length}</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-card/80 p-3">
                  <p className="text-xs text-muted-foreground">Bookings</p>
                  <p className="text-lg font-semibold">{org.bookings.toLocaleString()}</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-card/80 p-3">
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <Wallet2 className="w-4 h-4" /> Gross
                  </p>
                  <p className="text-lg font-semibold text-accent">{currency(org.gross)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-muted-foreground">Owner</p>
                  <p className="font-medium">{org.owner.name}</p>
                </div>
                <Link
                  to={`/promoter/organizers/${org.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent/80 transition"
                >
                  View more <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PromoterOrganizers;
