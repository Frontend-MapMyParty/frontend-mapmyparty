import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Calendar,
  Ticket,
  MapPin,
  IndianRupee,
  Sparkles,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useOrganizerEvents } from "@/hooks/useOrganizerEvents";

const OrganizerDash = ({ user, handleLogout, setActiveTab, activeTab }) => {
  // Real data via hook (falls back to local data if API not available)
  const { events, loading, error, statistics, refresh } = useOrganizerEvents();
  const useSample = useMemo(() => !!error || (!loading && events.length === 0), [error, loading, events]);

  const totals = useMemo(
    () => ({
      totalEvents: useSample ? 0 : (statistics.totalEvents || 0),
      totalAttendees: useSample ? 15420 : (statistics.totalAttendees || 0),
      totalRevenue: useSample ? 48560 : (statistics.totalRevenue || 0),
      totalTickets: useSample ? 8234 : (statistics.totalTicketsSold || 0),
      published: useSample ? 2 : (statistics.publishedEvents || 0),
      drafts: useSample ? 0 : (statistics.draftEvents || 0),
    }),
    [useSample, statistics]
  );

  const formatNumber = (n) => new Intl.NumberFormat("en-IN").format(n || 0);
  const formatCurrency = (n) => `₹${new Intl.NumberFormat("en-IN").format(n || 0)}`;

  const bookings = [
    { id: "6289", customer: "John Smith", dateTime: "2025-06-15T19:00:00", tickets: 2, price: "₹5,400", status: "Confirmed" },
    { id: "3261", customer: "Sarah Johnson", dateTime: "2025-06-04T21:30:00", tickets: 2, price: "₹7,200", status: "Pending" },
    { id: "4678", customer: "Mike Brown", dateTime: "2025-06-03T19:00:00", tickets: 1, price: "₹3,200", status: "Confirmed" },
    { id: "4692", customer: "Emily Chen", dateTime: "2025-06-03T20:00:00", tickets: 4, price: "₹12,000", status: "Cancelled" },
  ];

  // Dummy insight series for charts
  const revenueSeries = [120, 90, 150, 180, 210, 160, 240];
  const ticketSeries = [420, 360, 520, 610, 700, 540, 760];
  const weekdayBookings = [
    { day: "Mon", value: 38 },
    { day: "Tue", value: 44 },
    { day: "Wed", value: 52 },
    { day: "Thu", value: 61 },
    { day: "Fri", value: 88 },
    { day: "Sat", value: 97 },
    { day: "Sun", value: 72 },
  ];

  const sampleEvents = [
    { id: "sunset", title: "Sunset Beats Fest", date: "2025-06-28T19:00:00", city: "Mumbai", tickets: 420, revenue: 240000, status: "Live" },
    { id: "fusion", title: "Culture Fusion Night", date: "2025-07-05T18:30:00", city: "Bengaluru", tickets: 310, revenue: 182000, status: "Live" },
    { id: "summit", title: "Creator Growth Summit", date: "2025-07-12T10:00:00", city: "Delhi", tickets: 190, revenue: 154000, status: "Draft" },
  ];

  const liveEvents = useMemo(() => {
    if (!useSample && events.length) {
      return events.slice(0, 3).map((e) => ({
        id: e.id || e.eventId,
        title: e.title || e.eventTitle || "Untitled Event",
        date: e.startDate || e.date || e.goLiveAt,
        city: e.city || e.location || e.venue || "TBA",
        tickets: e.stats?.totalTicketsSold || e.ticketsSold || 0,
        revenue: e.stats?.totalRevenue || e.revenue || 0,
        status: (e.status2 || e.status || "Live").toUpperCase(),
      }));
    }
    return sampleEvents;
  }, [events, useSample]);

  const kpis = [
    { label: "Live Events", value: formatNumber(totals.published), hint: "+2 vs last week", icon: Sparkles },
    { label: "Attendees", value: formatNumber(useSample ? 15240 : totals.totalAttendees), hint: "+8% MoM", icon: Users },
    { label: "Revenue", value: formatCurrency(totals.totalRevenue), hint: "₹12.4k pending", icon: IndianRupee },
    { label: "Tickets Sold", value: formatNumber(totals.totalTickets), hint: "3.4% conversion ↑", icon: Ticket },
  ];

  const eventHealth = [
    { label: "Check-ins", value: 92, tone: "from-emerald-400 to-emerald-500" },
    { label: "Refund rate", value: 3, tone: "from-amber-300 to-amber-500" },
    { label: "No-show risk", value: 8, tone: "from-sky-400 to-blue-500" },
  ];

  const getStatusBadge = (status) => {
    const base = "px-2 py-1 rounded-full text-[11px] font-semibold";
    const value = (status || "").toLowerCase();
    if (value === "confirmed" || value === "live") return <span className={`${base} bg-emerald-400/15 text-emerald-200 border border-emerald-300/30`}>{status}</span>;
    if (value === "pending" || value === "draft") return <span className={`${base} bg-amber-400/15 text-amber-200 border border-amber-300/30`}>{status}</span>;
    if (value === "cancelled") return <span className={`${base} bg-red-400/15 text-red-200 border border-red-300/30`}>{status}</span>;
    return <span className={`${base} bg-white/10 text-white border border-white/20`}>{status || "Unknown"}</span>;
  };

  const formatDate = (iso) => {
    if (!iso) return "TBA";
    try {
      const parsed = new Date(iso);
      if (Number.isNaN(parsed.getTime())) return "TBA";
      return parsed.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "TBA";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">Organizer Portal</p>
            <h2 className="text-3xl font-extrabold mt-1">Dashboard</h2>
            <p className="text-sm text-white/60 mt-1">Essential control center for events, revenue, and ops.</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              to="/organizer/select-event-type"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-sm font-semibold shadow-lg shadow-red-500/20 hover:shadow-red-500/30"
            >
              + Create Event
            </Link>
            <button
              onClick={() => setActiveTab?.("myevents")}
              className="px-3 py-2 rounded-xl bg-white/8 border border-white/10 text-sm hover:bg-white/12 backdrop-blur transition text-white"
            >
              Manage Events
            </button>
          </div>
        </header>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((item) => (
            <div key={item.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 shadow-lg shadow-black/20 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/50">{item.label}</p>
                  <p className="text-2xl font-semibold mt-2">{item.value}</p>
                  <p className="text-[11px] text-white/50 mt-1">{item.hint}</p>
                </div>
                <div className="p-2 rounded-xl bg-white/10 border border-white/10">
                  <item.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Live events + insights */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur shadow-lg shadow-black/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/50">Live pipeline</p>
                  <h3 className="text-xl font-semibold">Events in motion</h3>
                </div>
                <button
                  onClick={() => setActiveTab?.("myevents")}
                  className="text-xs font-semibold text-red-300 hover:text-red-200"
                >
                  View all
                </button>
              </div>
              <div className="space-y-3">
                {liveEvents.map((ev) => (
                  <div key={ev.id} className="flex items-center justify-between bg-black/20 border border-white/10 rounded-xl p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{ev.title}</h4>
                        {getStatusBadge(ev.status)}
                      </div>
                      <p className="text-xs text-white/60 mt-1 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(ev.date)}
                        <span className="h-1 w-1 rounded-full bg-white/30" />
                        <MapPin className="w-4 h-4" />
                        {ev.city}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm text-white/60">Tickets</p>
                      <p className="text-lg font-semibold">{formatNumber(ev.tickets)}</p>
                      <p className="text-xs text-white/60">Revenue {formatCurrency(ev.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>

          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur shadow-lg shadow-black/20">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-300" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/50">Health</p>
                  <h4 className="text-base font-semibold">Ops radar</h4>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {eventHealth.map((metric) => (
                  <div key={metric.label}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">{metric.label}</span>
                      <span className="font-semibold">{metric.value}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${metric.tone}`}
                        style={{ width: `${metric.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur shadow-lg shadow-black/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/50">Payouts</p>
                  <h4 className="text-base font-semibold">This week</h4>
                </div>
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Cleared</span>
                  <span className="font-semibold">{formatCurrency(124000)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Pending</span>
                  <span className="font-semibold">{formatCurrency(14500)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Next drop</span>
                  <span className="font-semibold">Thu • 6:00 PM</span>
                </div>
              </div>
              <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full w-[76%] bg-gradient-to-r from-red-400 to-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Bookings table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur shadow-lg shadow-black/20">
          <div className="px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-white/50">Recent bookings</p>
              <h3 className="text-lg font-semibold">Latest ticket actions</h3>
            </div>
            <button className="text-xs font-semibold text-red-300 hover:text-red-200">View all</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-white/5 text-white/60">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Booking ID</th>
                  <th className="px-5 py-3 text-left font-medium">Customer</th>
                  <th className="px-5 py-3 text-left font-medium">Date & Time</th>
                  <th className="px-5 py-3 text-right font-medium">Tickets</th>
                  <th className="px-5 py-3 text-right font-medium">Amount</th>
                  <th className="px-5 py-3 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-white/5 transition">
                    <td className="px-5 py-3 font-semibold">{b.id}</td>
                    <td className="px-5 py-3">{b.customer}</td>
                    <td className="px-5 py-3 text-white/70">{formatDate(b.dateTime)}</td>
                    <td className="px-5 py-3 text-right">{b.tickets}</td>
                    <td className="px-5 py-3 text-right">{b.price}</td>
                    <td className="px-5 py-3 text-right">{getStatusBadge(b.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrganizerDash;
