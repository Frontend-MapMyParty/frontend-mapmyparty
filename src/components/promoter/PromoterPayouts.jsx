import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet2, ShieldCheck, AlertTriangle } from "lucide-react";

const PromoterPayouts = () => {
  const { data, currency, statusBadge } = useOutletContext();
  const totals = data.payouts.reduce(
    (acc, p) => {
      acc.total += p.amount;
      if (p.status === "PENDING") acc.pending += p.amount;
      if (p.status === "ON-HOLD") acc.onHold += p.amount;
      return acc;
    },
    { total: 0, pending: 0, onHold: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Payouts</h2>
          <p className="text-white/70">Upcoming, processing, on-hold and last mile settlement.</p>
        </div>
        <Badge variant="outline" className="border-white/20 text-sm">{currency(totals.total)} total</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2"><CardTitle className="text-base">Pending</CardTitle><CardDescription>Awaiting release</CardDescription></CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{currency(totals.pending)}</p>
            <p className="text-sm text-white/70">Across {data.payouts.filter(p => p.status === "PENDING").length} organizers</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2"><CardTitle className="text-base">On-hold</CardTitle><CardDescription>KYC or compliance</CardDescription></CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-amber-300">{currency(totals.onHold)}</p>
            <p className="text-sm text-white/70">Resolve docs to release funds</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2"><CardTitle className="text-base">Total pipeline</CardTitle><CardDescription>All scheduled payouts</CardDescription></CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{currency(totals.total)}</p>
            <p className="text-sm text-white/70">Platform coverage healthy</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Wallet2 className="w-4 h-4" />
            <CardTitle className="text-base">Organizer payouts</CardTitle>
          </div>
          <CardDescription className="text-white/70">Amounts, ETA, bank destination</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.payouts.map((p) => (
            <div key={p.organizer} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm">
              <div>
                <p className="font-semibold">{p.organizer}</p>
                <p className="text-white/60 text-xs">{p.bank}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{currency(p.amount)}</p>
                <p className="text-white/60 text-xs">ETA {p.eta}</p>
                <Badge variant={statusBadge(p.status)} className="mt-1">{p.status}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <CardTitle className="text-base">Risk & compliance</CardTitle>
          </div>
          <CardDescription className="text-white/70">Refunds, chargebacks, KYC readiness</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-white/80 space-y-1">
          <p>Refund ratio: {data.analytics.risk.refundRatio}%</p>
          <p>Chargebacks: {data.analytics.risk.chargebacks}%</p>
          <p>KYC pending: {data.analytics.risk.kycPending} organizer</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PromoterPayouts;
