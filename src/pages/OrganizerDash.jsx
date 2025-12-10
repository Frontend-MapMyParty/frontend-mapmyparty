import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Home,
  Users,
  Menu,
  ChevronLeft,
  BarChart2,
  Download,
  LogOut,
  Calendar,
  Ticket,
  Clock3,
  X,
  ChevronRight,
  Clock,
  TrendingDown,
  Activity,
  MapPin,
  User,
  IndianRupee,
  Mail,
  Phone,
  Edit2,
  Save,
  CreditCard,
  DollarSign,
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
    { id: "6289", customer: "John Smith", dateTime: "2025-06-15T19:00:00", tickets: 2, price: "₹100", status: "Confirmed" },
    { id: "3261", customer: "Sarah Johnson", dateTime: "2025-06-04T21:30:00", tickets: 2, price: "₹200", status: "Pending" },
    { id: "4678", customer: "Mike Brown", dateTime: "2025-06-03T19:00:00", tickets: 1, price: "₹200", status: "Confirmed" },
    { id: "4692", customer: "Emily Chen", dateTime: "2025-06-03T20:00:00", tickets: 4, price: "₹420", status: "Cancelled" },
  ];

  const timeSlots = ["5:00 PM", "6:30 PM", "7:45 PM"];

  // Reservations: use sample if backend data not available
  const reservationData = useSample
    ? [121, 80, 47]
    : [totals.drafts, totals.published, 0];

  const getStatusBadge = (status) => {
    const base = "px-2 py-1 rounded-full text-xs font-medium";
    switch ((status || "").toLowerCase()) {
      case "confirmed":
        return <span className={`${base} bg-green-100 text-green-800`}>{status}</span>;
      case "pending":
        return <span className={`${base} bg-yellow-100 text-yellow-800`}>{status}</span>;
      case "cancelled":
        return <span className={`${base} bg-red-100 text-red-800`}>{status}</span>;
      default:
        return <span className={`${base} bg-gray-100 text-gray-800`}>{status}</span>;
    }
  };

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <header className="px-2 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">Organizer Dashboard</h2>
            <p className="text-sm text-gray-500 mt-1">Manage your events and track performance</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={refresh}
              className="px-3 py-2 rounded-lg border text-sm text-gray-700 hover:bg-gray-50"
            >
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-lg border text-sm text-gray-700 hover:bg-gray-50"
            >
              Logout
            </button>
            <Link
              to="/organizer/select-event-type"
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-medium"
            >
              + Create Event
            </Link>
          </div>
        </div>
      </header>

      <div className="px-8 pb-10 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total Events</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{formatNumber(totals.totalEvents)}</p>
                <p className="mt-1 text-xs text-gray-500">+2 this month</p>
              </div>
              <Calendar className="w-6 h-6 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total Attendees</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{formatNumber(totals.totalAttendees)}</p>
                <p className="mt-1 text-xs text-gray-500">+12% from last month</p>
              </div>
              <Users className="w-6 h-6 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Revenue</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{formatCurrency(totals.totalRevenue)}</p>
                <p className="mt-1 text-xs text-gray-500">+18% from last month</p>
              </div>
              <IndianRupee className="w-6 h-6 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Ticket Sales</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{formatNumber(totals.totalTickets)}</p>
                <p className="mt-1 text-xs text-gray-500">+23% from last month</p>
              </div>
              <Ticket className="w-6 h-6 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Row: Reservations + Donut */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Reservations</h3>
              <div className="flex items-center gap-2 text-xs">
                <button className="px-2 py-1 rounded-md border hover:bg-gray-50">This month</button>
              </div>
            </div>

            {/* Horizontal bars like screenshot */}
            <div className="mt-6 space-y-5">
              {[0, 1, 2].map((i) => (
                <div key={i}>
                  <div className="h-4 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                    <div
                      className={
                        i === 0
                          ? "h-full bg-gray-900"
                          : i === 1
                          ? "h-full bg-[repeating-linear-gradient(45deg,_white,_white_6px,_#e5e7eb_6px,_#e5e7eb_12px)]"
                          : "h-full bg-red-500"
                      }
                      style={{ width: `${(reservationData[i] / 200) * 100}%` }}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-gray-600">
                    <span>{i === 0 ? "Total" : i === 1 ? "Confirmed" : "Cancelled"}</span>
                    <span>{reservationData[i]}</span>
                  </div>
                </div>
              ))}

              {/* X-axis ticks */}
              <div className="mt-4 flex items-center justify-between text-[10px] text-gray-400">
                {[0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200].map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>
          </section>

          {/* Donut summary */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Ticket sold </h3>
              <button className="px-2 py-1 rounded-md border hover:bg-gray-50 text-xs">This month</button>
            </div>
            <div className="mt-6 flex items-center justify-center">
              <div className="relative w-40 h-40">
                {/* donut */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-red-400 via-red-500 to-red-600 mask-[radial-gradient(circle_60%_at_50%_50%,_transparent_60%,_black_61%)]" />
                <div className="absolute inset-0 rounded-full bg-white mask-[radial-gradient(circle_55%_at_50%_50%,_black_55%,_transparent_56%)]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-extrabold text-gray-900">{formatNumber(totals.totalTickets || 122)}</div>
                    <div className="text-xs text-gray-500">Tickets Sold</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Row: Popular time slots + Recent bookings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="bg-gray-900 text-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Popular Time Slots</h3>
              <Clock3 className="w-5 h-5 opacity-70" />
            </div>
            <div className="flex gap-3">
              {timeSlots.map((t) => (
                <button key={t} className="px-3 py-2 bg-black/40 rounded-lg border border-white/10 text-sm flex items-center gap-2 hover:bg-black/30">
                  <Clock3 className="w-4 h-4" />
                  {t}
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-gray-100 p-0 shadow-sm lg:col-span-2 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Recent Bookings</h3>
              <button className="text-xs font-medium text-red-600 hover:text-red-700">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 text-xs text-gray-500">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">Booking ID</th>
                    <th className="px-6 py-3 text-left font-medium">Customer Name</th>
                    <th className="px-6 py-3 text-left font-medium">Show Date & Time</th>
                    <th className="px-6 py-3 text-right font-medium">Number of Tickets</th>
                    <th className="px-6 py-3 text-right font-medium">Total Price</th>
                    <th className="px-6 py-3 text-right font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 text-sm">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{b.id}</td>
                      <td className="px-6 py-4 text-gray-900">{b.customer}</td>
                      <td className="px-6 py-4 text-gray-500">{formatDate(b.dateTime)}</td>
                      <td className="px-6 py-4 text-right text-gray-900">{b.tickets}</td>
                      <td className="px-6 py-4 text-right text-gray-900">{b.price}</td>
                      <td className="px-6 py-4 text-right">{getStatusBadge(b.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
              <span>Page 1 of 10</span>
              <div className="space-x-2">
                <button className="px-3 py-1.5 border rounded-lg hover:bg-gray-50">Previous</button>
                <button className="px-3 py-1.5 border rounded-lg hover:bg-gray-50">Next</button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default OrganizerDash;
