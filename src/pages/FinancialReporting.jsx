import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
  Wallet,
  Banknote,
  Receipt,
  ShieldCheck,
  Ticket,
  Percent,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const formatINR = (value) =>
  `₹${(value ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const glassCard =
  "bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md shadow-lg shadow-black/20";

const FinancialReporting = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");

  const periodData = {
    weekly: {
      label: "This week",
      grossSales: 312000,
      platformFees: 21400,
      gstCollected: 56800,
      refunds: 8200,
      payoutsCompleted: 186000,
      payoutsPending: 42000,
      ticketsSold: 420,
      avgTicketPrice: 745,
      successRate: 0.92,
      revenueTrend: [
        { label: "Mon", gross: 52000, payouts: 32000, refunds: 1200 },
        { label: "Tue", gross: 61000, payouts: 38000, refunds: 900 },
        { label: "Wed", gross: 48200, payouts: 29000, refunds: 700 },
        { label: "Thu", gross: 54000, payouts: 33000, refunds: 1800 },
        { label: "Fri", gross: 96500, payouts: 54000, refunds: 2600 },
      ],
    },
    monthly: {
      label: "Dec 2024",
      grossSales: 1245000,
      platformFees: 86500,
      gstCollected: 224000,
      refunds: 42000,
      payoutsCompleted: 740000,
      payoutsPending: 110000,
      ticketsSold: 1675,
      avgTicketPrice: 744,
      successRate: 0.93,
      revenueTrend: [
        { label: "Week 1", gross: 280000, payouts: 165000, refunds: 8000 },
        { label: "Week 2", gross: 312000, payouts: 186000, refunds: 9500 },
        { label: "Week 3", gross: 346000, payouts: 212000, refunds: 11000 },
        { label: "Week 4", gross: 306000, payouts: 177000, refunds: 13500 },
      ],
      eventTypeMix: [
        { name: "Concerts", value: 410000, color: "#ef4444" },
        { name: "Conferences", value: 352000, color: "#22c55e" },
        { name: "Weddings", value: 286000, color: "#3b82f6" },
        { name: "Workshops", value: 196000, color: "#a855f7" },
      ],
      topEvents: [
        { title: "NYE Sundowner", type: "EXCLUSIVE", city: "Bengaluru", net: 182000, sold: 460 },
        { title: "Tech Leap 2024", type: "CONFERENCE", city: "Hyderabad", net: 148500, sold: 380 },
        { title: "Symphony Nights", type: "EXCLUSIVE", city: "Mumbai", net: 132400, sold: 295 },
      ],
      payouts: [
        { id: "PAYOUT-1187", status: "COMPLETED", amount: 240000, date: "02 Dec" },
        { id: "PAYOUT-1195", status: "PROCESSING", amount: 185000, date: "11 Dec" },
        { id: "PAYOUT-1202", status: "PENDING", amount: 110000, date: "20 Dec" },
      ],
      transactions: [
        { id: "BOOK-8421", date: "28 Dec", description: "Concert ticket sales", amount: 52000, type: "credit" },
        { id: "BOOK-8388", date: "27 Dec", description: "Conference ticket sales", amount: 48000, type: "credit" },
        { id: "REF-2203", date: "26 Dec", description: "Refund (CANCELLED booking)", amount: -2500, type: "debit" },
        { id: "PAY-1195", date: "25 Dec", description: "Organizer payout (processing)", amount: -185000, type: "debit" },
        { id: "GST-DEC", date: "25 Dec", description: "GST collected", amount: 224000, type: "credit" },
      ],
      gstSplit: [
        { label: "CGST/SGST", value: 168000, color: "#22c55e" },
        { label: "IGST", value: 56000, color: "#06b6d4" },
      ],
    },
    quarterly: {
      label: "Q4 FY24",
      grossSales: 3428000,
      platformFees: 238400,
      gstCollected: 612000,
      refunds: 128000,
      payoutsCompleted: 2215000,
      payoutsPending: 215000,
      ticketsSold: 4680,
      avgTicketPrice: 732,
      successRate: 0.915,
      revenueTrend: [
        { label: "Oct", gross: 1120000, payouts: 695000, refunds: 42000 },
        { label: "Nov", gross: 1063000, payouts: 680000, refunds: 38000 },
        { label: "Dec", gross: 1245000, payouts: 840000, refunds: 48000 },
      ],
    },
    yearly: {
      label: "FY24",
      grossSales: 11742000,
      platformFees: 828000,
      gstCollected: 2106000,
      refunds: 422000,
      payoutsCompleted: 8215000,
      payoutsPending: 368000,
      ticketsSold: 15120,
      avgTicketPrice: 777,
      successRate: 0.905,
      revenueTrend: [
        { label: "Q1", gross: 2610000, payouts: 1865000, refunds: 95000 },
        { label: "Q2", gross: 2820000, payouts: 1980000, refunds: 110000 },
        { label: "Q3", gross: 2862000, payouts: 2155000, refunds: 119000 },
        { label: "Q4", gross: 3428000, payouts: 2215000, refunds: 128000 },
      ],
    },
  };

  const selected = useMemo(() => periodData[selectedPeriod], [periodData, selectedPeriod]);
  const netRevenue = useMemo(
    () => Math.max(0, (selected?.grossSales || 0) - (selected?.platformFees || 0) - (selected?.refunds || 0)),
    [selected]
  );
  const profitMargin = useMemo(
    () => (selected?.grossSales ? ((netRevenue / selected.grossSales) * 100).toFixed(1) : "0.0"),
    [netRevenue, selected]
  );

  const SimplePieChart = ({ data, size = 200 }) => {
    if (!data?.length) return null;
    let currentAngle = 0;
    const total = data.reduce((sum, d) => sum + d.value, 0);
    const slices = data.map((item, index) => {
      const sliceAngle = (item.value / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;
      currentAngle = endAngle;

      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;
      const radius = size / 2;

      const x1 = radius + radius * Math.cos(startRad);
      const y1 = radius + radius * Math.sin(startRad);
      const x2 = radius + radius * Math.cos(endRad);
      const y2 = radius + radius * Math.sin(endRad);

      const largeArc = sliceAngle > 180 ? 1 : 0;
      const pathData = [
        `M ${radius} ${radius}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
        "Z",
      ].join(" ");

      return <path key={index} d={pathData} fill={item.color} stroke="white" strokeWidth="2" />;
    });

    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg">
        {slices}
      </svg>
    );
  };

  const StackedBars = ({ data }) => {
    if (!data?.length) return null;
    const max = Math.max(...data.map((d) => d.gross));
    return (
      <div className="flex items-end gap-4 h-56">
        {data.map((item) => {
          const grossH = (item.gross / max) * 100;
          const payoutH = (item.payouts / max) * 100;
          const refundH = (item.refunds / max) * 100;
          return (
            <div key={item.label} className="flex flex-col items-center gap-2">
              <div className="flex gap-1 items-end h-48">
                <div
                  className="w-6 rounded-t-lg bg-gradient-to-t from-red-500 to-red-400"
                  style={{ height: `${grossH}%` }}
                  title={`Gross: ${formatINR(item.gross)}`}
                />
                <div
                  className="w-6 rounded-t-lg bg-gradient-to-t from-green-500 to-emerald-400"
                  style={{ height: `${payoutH}%` }}
                  title={`Payouts: ${formatINR(item.payouts)}`}
                />
                <div
                  className="w-6 rounded-t-lg bg-gradient-to-t from-sky-500 to-cyan-400"
                  style={{ height: `${refundH}%` }}
                  title={`Refunds: ${formatINR(item.refunds)}`}
                />
              </div>
              <span className="text-xs text-white/60">{item.label}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const StatChip = ({ icon, label, value, accent }) => (
    <div className={`${glassCard} p-4 flex items-center gap-3`}>
      <div className={`p-2 rounded-xl ${accent} bg-opacity-20 text-white`}>{icon}</div>
      <div>
        <p className="text-xs uppercase tracking-wide text-white/60">{label}</p>
        <p className="text-lg font-semibold text-white">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen text-white">
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <p className="text-sm text-white/60">{selected?.label}</p>
              <h1 className="text-2xl font-bold">Financial Reporting</h1>
            </div>
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 hover:from-red-600 hover:to-red-700 transition">
            <Download className="w-4 h-4" />
            Download report
          </button>
        </div>

        {/* Period Selector */}
        <div className="flex flex-wrap gap-2">
          {["weekly", "monthly", "quarterly", "yearly"].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition border ${
                selectedPeriod === period
                  ? "bg-white text-gray-900 border-white/80 shadow-lg"
                  : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
              }`}
            >
              {period}
            </button>
          ))}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className={`${glassCard} p-5`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-white/60">Gross sales (bookings.totalAmount)</p>
                <p className="text-3xl font-extrabold mt-2">{formatINR(selected?.grossSales)}</p>
              </div>
              <DollarSign className="w-10 h-10 text-emerald-200/70" />
            </div>
            <div className="mt-3 flex items-center gap-2 text-emerald-300">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">+15.2% vs previous period</span>
            </div>
          </div>

          <div className={`${glassCard} p-5`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-white/60">Net revenue after fees & refunds</p>
                <p className="text-3xl font-extrabold mt-2">{formatINR(netRevenue)}</p>
              </div>
              <Wallet className="w-10 h-10 text-indigo-200/80" />
            </div>
            <div className="mt-3 flex items-center gap-2 text-indigo-200">
              <PieChartIcon className="w-4 h-4" />
              <span className="text-sm">{profitMargin}% margin</span>
            </div>
          </div>

          <div className={`${glassCard} p-5`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-white/60">GST collected (bookings.gstTotal)</p>
                <p className="text-3xl font-extrabold mt-2">{formatINR(selected?.gstCollected)}</p>
              </div>
              <Receipt className="w-10 h-10 text-sky-200/80" />
            </div>
            <div className="mt-3 flex items-center gap-2 text-sky-200">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Filed monthly</span>
            </div>
          </div>

          <div className={`${glassCard} p-5`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-white/60">Platform fees (booking_items.platformFee)</p>
                <p className="text-3xl font-extrabold mt-2">{formatINR(selected?.platformFees)}</p>
              </div>
              <Banknote className="w-10 h-10 text-amber-200/80" />
            </div>
            <div className="mt-3 flex items-center gap-2 text-amber-200">
              <TrendingDown className="w-4 h-4" />
              <span className="text-sm">5.8% of gross</span>
            </div>
          </div>
        </div>

        {/* Mid stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatChip
            icon={<Ticket className="w-5 h-5" />}
            label="Tickets sold"
            value={`${selected?.ticketsSold || 0} • avg ₹${(selected?.avgTicketPrice || 0).toFixed(0)}`}
            accent="bg-emerald-500/30"
          />
          <StatChip
            icon={<ShieldCheck className="w-5 h-5" />}
            label="Booking success"
            value={`${Math.round((selected?.successRate || 0) * 100)}% confirmed`}
            accent="bg-indigo-500/30"
          />
          <StatChip
            icon={<Percent className="w-5 h-5" />}
            label="Refund impact (refunds.status)"
            value={`${((selected?.refunds || 0) / (selected?.grossSales || 1) * 100).toFixed(1)}%`}
            accent="bg-rose-500/30"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className={`${glassCard} p-6`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-white/60">Cashflow across bookings / payouts / refunds</p>
                <h3 className="text-lg font-semibold">Revenue vs Payouts</h3>
              </div>
              <BarChart3 className="w-6 h-6 text-white/70" />
            </div>
            <StackedBars data={selected?.revenueTrend} />
            <div className="flex gap-4 mt-6 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-red-400" />
                Gross (bookings.totalAmount)
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-400" />
                Payouts (payouts.status)
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-cyan-400" />
                Refunds (refunds.amountCents)
              </div>
            </div>
          </div>

          <div className={`${glassCard} p-6`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-white/60">Revenue contribution by event types</p>
                <h3 className="text-lg font-semibold">Event type mix</h3>
              </div>
              <PieChartIcon className="w-6 h-6 text-white/70" />
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="mx-auto">
                <SimplePieChart data={selected?.eventTypeMix} size={200} />
              </div>
              <div className="flex-1 space-y-3">
                {(selected?.eventTypeMix || []).map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <p className="text-sm">{item.name}</p>
                    </div>
                    <p className="text-sm text-white/70">{((item.value / selected.grossSales) * 100).toFixed(1)}%</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* GST + payout status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className={`${glassCard} p-6`}>
            <h3 className="text-lg font-semibold mb-4">GST & Compliance</h3>
            <div className="space-y-3">
              {(selected?.gstSplit || []).map((row) => (
                <div key={row.label}>
                  <div className="flex items-center justify-between text-sm text-white/70 mb-1">
                    <span>{row.label}</span>
                    <span>{formatINR(row.value)}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${(row.value / (selected?.gstCollected || 1)) * 100}%`,
                        backgroundColor: row.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-white/60">
              Based on bookings.gstType and gstTotal captured per ticket purchase.
            </div>
          </div>

          <div className={`${glassCard} p-6`}>
            <h3 className="text-lg font-semibold mb-4">Payout status</h3>
            <div className="space-y-3">
              {(selected?.payouts || []).map((payout) => (
                <div
                  key={payout.id}
                  className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-semibold">{payout.id}</p>
                    <p className="text-xs text-white/60">{payout.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatINR(payout.amount)}</p>
                    <p
                      className={`text-xs ${
                        payout.status === "COMPLETED"
                          ? "text-emerald-300"
                          : payout.status === "PROCESSING"
                          ? "text-amber-300"
                          : "text-rose-300"
                      }`}
                    >
                      {payout.status}
                    </p>
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <StatChip
                  icon={<Wallet className="w-4 h-4" />}
                  label="Completed"
                  value={formatINR(selected?.payoutsCompleted)}
                  accent="bg-emerald-500/30"
                />
                <StatChip
                  icon={<Clock className="w-4 h-4" />}
                  label="Pending"
                  value={formatINR(selected?.payoutsPending)}
                  accent="bg-amber-500/30"
                />
              </div>
            </div>
          </div>

          <div className={`${glassCard} p-6`}>
            <h3 className="text-lg font-semibold mb-4">Top performing events</h3>
            <div className="space-y-3">
              {(selected?.topEvents || []).map((evt) => (
                <div key={evt.title} className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{evt.title}</p>
                    <p className="text-xs text-white/60">
                      {evt.city} • {evt.type}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatINR(evt.net)}</p>
                    <p className="text-xs text-white/60">{evt.sold} tickets</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions table */}
        <div className={`${glassCard} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-white/60">Bookings, payouts, refunds</p>
              <h3 className="text-lg font-semibold">Recent activity</h3>
            </div>
            <ShieldCheck className="w-5 h-5 text-white/70" />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-white/60 border-b border-white/10">
                <tr>
                  <th className="py-3 pr-4">Ref</th>
                  <th className="py-3 pr-4">Date</th>
                  <th className="py-3 pr-4">Description</th>
                  <th className="py-3 pr-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {(selected?.transactions || []).map((txn) => (
                  <tr key={txn.id} className="border-b border-white/5">
                    <td className="py-3 pr-4 font-semibold">{txn.id}</td>
                    <td className="py-3 pr-4 text-white/70">{txn.date}</td>
                    <td className="py-3 pr-4 text-white/80">{txn.description}</td>
                    <td
                      className={`py-3 pr-4 text-right font-semibold ${
                        txn.type === "credit" ? "text-emerald-300" : "text-rose-300"
                      }`}
                    >
                      {`${txn.amount < 0 ? "-" : "+"}${formatINR(Math.abs(txn.amount))}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialReporting;
