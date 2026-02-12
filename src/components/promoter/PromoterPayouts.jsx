import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  AlertTriangle,
  Banknote,
  ClipboardCheck,
  ShieldCheck,
  Wallet2,
} from "lucide-react";

const PromoterPayouts = () => {
  const { data, currency, statusBadge } = useOutletContext();
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const totals = data.payouts.reduce(
    (acc, p) => {
      acc.total += p.amount;
      if (p.status === "PENDING") acc.pending += p.amount;
      if (p.status === "ON-HOLD") acc.onHold += p.amount;
      return acc;
    },
    { total: 0, pending: 0, onHold: 0 }
  );

  const filteredPayouts = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return data.payouts.filter((p) => {
      const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
      const matchesQuery = p.organizer.toLowerCase().includes(query);
      return matchesStatus && matchesQuery;
    });
  }, [data.payouts, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Payouts</h2>
          <p className="text-muted-foreground">Upcoming, processing, on-hold and settlement clarity.</p>
        </div>
        <Badge variant="outline" className="text-sm py-1 px-3 border-border/70">{currency(totals.total)} total</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="bg-card/70 border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Pending</CardTitle>
            <CardDescription>Awaiting release</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{currency(totals.pending)}</p>
            <p className="text-sm text-muted-foreground">Across {data.payouts.filter(p => p.status === "PENDING").length} organizers</p>
          </CardContent>
        </Card>
        <Card className="bg-card/70 border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">On-hold</CardTitle>
            <CardDescription>KYC or compliance</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-amber-300">{currency(totals.onHold)}</p>
            <p className="text-sm text-muted-foreground">Resolve docs to release funds</p>
          </CardContent>
        </Card>
        <Card className="bg-card/70 border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total pipeline</CardTitle>
            <CardDescription>All scheduled payouts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{currency(totals.total)}</p>
            <p className="text-sm text-muted-foreground">Platform coverage healthy</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search organizer..."
          />
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          {["ALL", "PENDING", "PROCESSING", "ON-HOLD"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-lg border border-border/60 transition ${
                statusFilter === status
                  ? "bg-primary text-primary-foreground"
                  : "bg-card/70 text-muted-foreground hover:bg-card"
              }`}
            >
              {status === "ALL" ? "All" : status.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-4">
        <Card className="bg-card/70 border-border/60">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wallet2 className="w-4 h-4" />
              <CardTitle className="text-base">Organizer payouts</CardTitle>
            </div>
            <CardDescription>Amounts, ETA, bank destination, compliance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredPayouts.map((p) => (
              <div key={p.organizer} className="rounded-xl border border-border/60 bg-card/80 p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-lg">{p.organizer}</p>
                    <p className="text-sm text-muted-foreground">{p.accountHolder}</p>
                    <p className="text-xs text-muted-foreground">{p.bank} • IFSC {p.ifsc}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="text-lg font-semibold text-accent">{currency(p.amount)}</p>
                    <Badge variant={statusBadge(p.status)} className="mt-1">{p.status}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">ETA</p>
                    <p className="font-semibold">{p.eta}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">KYC</p>
                    <p className="font-semibold">{p.kycStatus}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Last payout</p>
                    <p className="font-semibold">{p.lastPayout}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Method</p>
                    <p className="font-semibold">{p.payoutMethod}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <p className="text-muted-foreground">GST {p.gstNumber}</p>
                  <p className="text-muted-foreground">Bank {p.bank}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="bg-card/70 border-border/60">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4" />
                <CardTitle className="text-base">Compliance</CardTitle>
              </div>
              <CardDescription>Risk, chargebacks, and KYC readiness.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>Refund ratio: {data.analytics.risk.refundRatio}%</p>
              <p>Chargebacks: {data.analytics.risk.chargebacks}%</p>
              <p>KYC pending: {data.analytics.risk.kycPending} organizer</p>
              <div className="rounded-lg border border-border/60 bg-card/80 p-3">
                <p className="text-xs text-muted-foreground">Escalations</p>
                <p className="font-semibold text-amber-400">{data.analytics.risk.kycPending} require documents</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/70 border-border/60">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Banknote className="w-4 h-4" />
                <CardTitle className="text-base">Settlement health</CardTitle>
              </div>
              <CardDescription>Release readiness and funding pipeline.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Pending amount</span>
                <span className="font-semibold">{currency(totals.pending)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">On-hold amount</span>
                <span className="font-semibold">{currency(totals.onHold)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total pipeline</span>
                <span className="font-semibold text-accent">{currency(totals.total)}</span>
              </div>
              <div className="rounded-lg border border-border/60 bg-card/80 p-3">
                <p className="text-xs text-muted-foreground">Next release window</p>
                <p className="font-semibold">Mar 02 - Mar 06</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PromoterPayouts;
