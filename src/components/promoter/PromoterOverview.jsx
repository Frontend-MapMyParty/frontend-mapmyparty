 import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, Building2, CalendarClock, Wallet2, Users, Ticket, Activity, BarChart3 } from "lucide-react";

const PromoterOverview = () => {
  const { data, currency, statusBadge } = useOutletContext();

  return (
    <div className="space-y-6">
      {/* Hero / summary */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold">Dashboard Overview</CardTitle>
          <CardDescription className="text-white/70">
            High-level summary of organizers, events, bookings, payouts, live status, and risk.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {data.stats.map((item) => (
              <Card key={item.title} className="bg-white/5 border-white/10">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60">{item.title}</p>
                    <p className="text-2xl font-semibold mt-1">{item.value}</p>
                    <p className="text-xs text-emerald-400 mt-1">{item.delta}</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-white/80" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section briefs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <CardTitle className="text-base">Organizers snapshot</CardTitle>
            </div>
            <CardDescription className="text-white/70">Ownership, bank status, payouts, top events.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-white/80">
            <p>{data.organizers.length} organizers • {currency(data.organizers.reduce((s, o) => s + o.gross, 0))} gross</p>
            <p>Verified banks: {data.organizers.filter(o => o.bank.status === "VERIFIED").length}</p>
            <p>On-hold payouts: {data.payouts.filter(p => p.status === "ON-HOLD").length}</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-4 h-4" />
              <CardTitle className="text-base">Events & bookings</CardTitle>
            </div>
            <CardDescription className="text-white/70">Live vs upcoming, tickets sold, revenue.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-white/80">
            <p>Live events: {data.events.filter(e => e.status === "LIVE").length}</p>
            <p>Tickets sold (sample): {data.events.reduce((s, e) => s + e.ticketsSold, 0).toLocaleString()}</p>
            <p>Today bookings: {data.bookings.today.count} • {currency(data.bookings.today.value)}</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Wallet2 className="w-4 h-4" />
              <CardTitle className="text-base">Payouts & risk</CardTitle>
            </div>
            <CardDescription className="text-white/70">Payout pipeline and financial health.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-white/80">
            <p>Pending payouts: {currency(data.payouts.reduce((s, p) => s + p.amount, 0))}</p>
            <p>Refund ratio: {data.analytics.risk.refundRatio}% • Chargebacks: {data.analytics.risk.chargebacks}%</p>
            <p>KYC pending: {data.analytics.risk.kycPending} organizer</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PromoterOverview;
