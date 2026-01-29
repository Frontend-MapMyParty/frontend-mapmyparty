 import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Phone, Building2, Users, Wallet2, Ticket } from "lucide-react";

const PromoterOrganizers = () => {
  const { data, currency, statusBadge } = useOutletContext();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Organizers</h2>
          <p className="text-white/70">Ownership, bank details, events, bookings, payouts.</p>
        </div>
        <Badge variant="outline" className="text-sm py-1 px-3 border-white/20">
          {data.organizers.length} Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.organizers.map((org) => (
          <Card key={org.name} className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11">
                    <AvatarFallback>{org.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{org.name}</CardTitle>
                    <CardDescription className="text-white/70 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      {org.state}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={statusBadge(org.bank.status)}>{org.bank.status}</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-white/60 text-xs">Owner</p>
                  <p className="font-semibold">{org.owner.name}</p>
                  <p className="text-white/60 flex items-center gap-2 text-xs mt-1"><Mail className="w-3 h-3" />{org.owner.email}</p>
                  <p className="text-white/60 flex items-center gap-2 text-xs"><Phone className="w-3 h-3" />{org.owner.phone}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1 text-sm">
                  <p className="text-white/60 text-xs">Bank</p>
                  <p className="font-semibold">{org.bank.bankName}</p>
                  <p className="text-white/70 text-xs">A/C •••• {org.bank.accountNumber}</p>
                  <p className="text-white/70 text-xs">IFSC {org.bank.ifsc}</p>
                  <p className="text-white/70 text-xs">GST {org.bank.gstNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2 text-white/60 text-xs">
                    <Users className="w-4 h-4" /> Events
                  </div>
                  <p className="text-lg font-semibold">{org.events.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2 text-white/60 text-xs">
                    <Ticket className="w-4 h-4" /> Bookings
                  </div>
                  <p className="text-lg font-semibold">{org.bookings.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2 text-white/60 text-xs">
                    <Wallet2 className="w-4 h-4" /> Gross
                  </div>
                  <p className="text-lg font-semibold">{currency(org.gross)}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2 text-white/60 text-xs">
                    <Wallet2 className="w-4 h-4" /> Platform fee
                  </div>
                  <p className="text-lg font-semibold text-emerald-400">{currency(org.platformFee)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Payout due</span>
                <Badge variant="outline" className="border-white/20">{currency(org.payoutDue)}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>Last payout</span>
                <span>{org.lastPayout}</span>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-white/60 uppercase tracking-wide">Events</p>
                <div className="space-y-2">
                  {org.events.map((ev) => (
                    <div key={ev.title} className="flex items-center justify-between rounded-lg bg-white/5 border border-white/5 px-3 py-2 text-sm">
                      <div>
                        <p className="font-semibold">{ev.title}</p>
                        <p className="text-white/60 text-xs">Tickets {ev.tickets.toLocaleString()} • Gross {currency(ev.gross)}</p>
                      </div>
                      <Badge variant={statusBadge(ev.status)}>{ev.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PromoterOrganizers;
