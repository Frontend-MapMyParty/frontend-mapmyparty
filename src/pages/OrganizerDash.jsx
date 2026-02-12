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
  // Real data via hook
  const { events, loading, error, statistics, refresh } = useOrganizerEvents();

  const totals = useMemo(
    () => ({
      totalEvents: statistics.totalEvents || 0,
      totalAttendees: statistics.totalAttendees || 0,
      totalRevenue: statistics.totalRevenue || 0,
      totalTickets: statistics.totalTicketsSold || 0,
      published: statistics.publishedEvents || 0,
      drafts: statistics.draftEvents || 0,
    }),
    [statistics]
  );

  const formatNumber = (n) => new Intl.NumberFormat("en-IN").format(n || 0);
  const formatCurrency = (n) => `₹${new Intl.NumberFormat("en-IN").format(n || 0)}`;

  const liveEvents = useMemo(() => {
    if (events.length) {
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
    return [];
  }, [events]);

  const kpis = [
    { label: "Live Events", value: formatNumber(totals.published), hint: `${totals.drafts} drafts`, icon: Sparkles },
    { label: "Attendees", value: formatNumber(totals.totalAttendees), hint: "Total attendees", icon: Users },
    { label: "Revenue", value: formatCurrency(totals.totalRevenue), hint: "Total revenue", icon: IndianRupee },
    { label: "Tickets Sold", value: formatNumber(totals.totalTickets), hint: "All time", icon: Ticket },
  ];

  const eventHealth = [
    { label: "Check-ins", value: 92 },
    { label: "Refund rate", value: 3 },
    { label: "No-show risk", value: 8 },
  ];

  const getStatusBadge = (status) => {
    const base = "px-2 py-1 rounded-full text-[11px] font-semibold";
    const value = (status || "").toLowerCase();
    if (value === "confirmed" || value === "live") return <span className={`${base} bg-gray-700 text-gray-200 border border-gray-600`}>{status}</span>;
    if (value === "pending" || value === "draft") return <span className={`${base} bg-gray-800 text-gray-300 border border-gray-700`}>{status}</span>;
    if (value === "cancelled") return <span className={`${base} bg-gray-950 text-gray-400 border border-gray-800`}>{status}</span>;
    return <span className={`${base} bg-gray-800 text-gray-300 border border-gray-700`}>{status || "Unknown"}</span>;
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
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Organizer Portal</p>
            <h2 className="text-3xl font-bold mt-1">Dashboard</h2>
            <p className="text-sm text-gray-400 mt-1">Essential control center for events, revenue, and ops.</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              to="/organizer/select-event-type"
              className="px-4 py-2 rounded-lg bg-white text-gray-950 text-sm font-semibold hover:bg-gray-100 transition"
            >
              + Create Event
            </Link>
            <button
              onClick={() => setActiveTab?.("myevents")}
              className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-sm hover:bg-gray-800 transition text-white"
            >
              Manage Events
            </button>
          </div>
        </header>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((item) => (
            <div key={item.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">{item.label}</p>
                  <p className="text-2xl font-semibold mt-2">{item.value}</p>
                  <p className="text-[11px] text-gray-500 mt-1">{item.hint}</p>
                </div>
                <div className="p-2 rounded-lg bg-gray-800">
                  <item.icon className="w-5 h-5 text-gray-300" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Live events + insights */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Live pipeline</p>
                  <h3 className="text-xl font-semibold">Events in motion</h3>
                </div>
                <button
                  onClick={() => setActiveTab?.("myevents")}
                  className="text-xs font-semibold text-gray-300 hover:text-white"
                >
                  View all
                </button>
              </div>
              <div className="space-y-3">
                {loading ? (
                  <div className="text-center py-8 text-gray-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    <p className="text-sm">Loading events...</p>
                  </div>
                ) : liveEvents.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No events yet</p>
                    <p className="text-xs mt-1">Create your first event to get started</p>
                  </div>
                ) : (
                  liveEvents.map((ev) => (
                    <div key={ev.id} className="flex items-center justify-between bg-gray-950 border border-gray-800 rounded-lg p-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{ev.title}</h4>
                          {getStatusBadge(ev.status)}
                        </div>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {formatDate(ev.date)}
                          <span className="h-1 w-1 rounded-full bg-gray-600" />
                          <MapPin className="w-4 h-4" />
                          {ev.city}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm text-gray-400">Tickets</p>
                        <p className="text-lg font-semibold">{formatNumber(ev.tickets)}</p>
                        <p className="text-xs text-gray-500">Revenue {formatCurrency(ev.revenue)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-gray-300" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Health</p>
                  <h4 className="text-base font-semibold">Ops radar</h4>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {eventHealth.map((metric) => (
                  <div key={metric.label}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{metric.label}</span>
                      <span className="font-semibold">{metric.value}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                      <div
                        className={`h-full bg-gray-600`}
                        style={{ width: `${metric.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Payouts</p>
                  <h4 className="text-base font-semibold">This week</h4>
                </div>
                <Sparkles className="w-5 h-5 text-gray-300" />
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Cleared</span>
                  <span className="font-semibold">{formatCurrency(124000)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Pending</span>
                  <span className="font-semibold">{formatCurrency(14500)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Next drop</span>
                  <span className="font-semibold">Thu • 6:00 PM</span>
                </div>
              </div>
              <div className="mt-4 h-2 rounded-full bg-gray-800 overflow-hidden">
                <div className="h-full w-[76%] bg-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Bookings table - empty state */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Recent bookings</p>
              <h3 className="text-lg font-semibold">Latest ticket actions</h3>
            </div>
            <button className="text-xs font-semibold text-gray-300 hover:text-white">View all</button>
          </div>
          <div className="px-5 py-12 text-center text-gray-400">
            <Ticket className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No recent bookings</p>
            <p className="text-xs mt-1">Bookings will appear here when customers purchase tickets</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrganizerDash;
