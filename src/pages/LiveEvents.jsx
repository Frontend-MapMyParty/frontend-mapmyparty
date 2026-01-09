import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  MapPin,
  Radio,
  ScanLine,
  Sparkles,
  Ticket,
  Users,
} from "lucide-react";
import { getLiveEventSamples, formatDate, formatDateTime } from "@/data/liveEventsSample";

const LiveEvents = () => {
  const navigate = useNavigate();
  const { liveEvents, upcomingEvents } = useMemo(() => getLiveEventSamples(), []);

  const aggregateLive = useMemo(() => {
    const totals = liveEvents.reduce(
      (acc, event) => {
        const ticketTotals = event.ticketTypes.reduce(
          (tAcc, t) => {
            tAcc.total += t.totalQty;
            tAcc.sold += t.soldQty;
            tAcc.checkedIn += t.checkedIn;
            return tAcc;
          },
          { total: 0, sold: 0, checkedIn: 0 }
        );
        return {
          liveCount: acc.liveCount + 1,
          totalCapacity: acc.totalCapacity + ticketTotals.total,
          sold: acc.sold + ticketTotals.sold,
          checkedIn: acc.checkedIn + ticketTotals.checkedIn,
        };
      },
      { liveCount: 0, totalCapacity: 0, sold: 0, checkedIn: 0 }
    );
    const occupancy =
      totals.totalCapacity > 0
        ? Math.round((totals.sold / totals.totalCapacity) * 100)
        : 0;
    const checkInRate =
      totals.sold > 0 ? Math.round((totals.checkedIn / totals.sold) * 100) : 0;
    return { ...totals, occupancy, checkInRate };
  }, [liveEvents]);

  const getEventTicketTotals = (event) => {
    if (!event) return { total: 0, sold: 0, checkedIn: 0, remaining: 0 };
    const totals = event.ticketTypes.reduce(
      (acc, t) => {
        acc.total += t.totalQty;
        acc.sold += t.soldQty;
        acc.checkedIn += t.checkedIn;
        return acc;
      },
      { total: 0, sold: 0, checkedIn: 0 }
    );
    return { ...totals, remaining: Math.max(totals.total - totals.sold, 0) };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#05060c] via-[#0a0f1c] to-[#05060c] text-white">
      <div className="px-6 py-5 border-b border-white/10 bg-white/5 backdrop-blur">
        <div className="max-w-7xl mx-auto flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/50 flex items-center gap-2">
              <Radio className="w-4 h-4 text-red-400" /> Live Control
            </p>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold">Live Events</h1>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-red-500/30 to-blue-500/30 border border-white/10 text-white/80">
                Organizer View
              </span>
            </div>
            <p className="text-sm text-white/65">
              Monitor events happening today, guide check-ins, and prep for the coming week.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Live Pulse */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-red-600/25 via-purple-500/10 to-blue-600/20 border border-white/10 rounded-2xl p-5 shadow-lg shadow-black/40">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-white/70 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-300" /> Live Now
              </p>
              <span className="px-3 py-1 rounded-full text-[11px] bg-white/10 border border-white/10">
                {aggregateLive.occupancy}% fill
              </span>
            </div>
            <div className="mt-3 flex items-end gap-4">
              <p className="text-4xl font-extrabold">{aggregateLive.liveCount}</p>
              <p className="text-sm text-white/70 mb-1">events are in progress today</p>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs text-white/70">
                  <span>Tickets Sold</span>
                  <span>{aggregateLive.sold} / {aggregateLive.totalCapacity}</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-blue-500"
                    style={{ width: `${aggregateLive.occupancy}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs text-white/70">
                  <span>Checked-in</span>
                  <span>{aggregateLive.checkInRate}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-cyan-500"
                    style={{ width: `${aggregateLive.checkInRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg shadow-black/40">
            <p className="text-xs uppercase tracking-wide text-white/60 flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-300" /> On-site Attendees
            </p>
            <p className="text-3xl font-bold mt-2 text-cyan-100">{aggregateLive.checkedIn}</p>
            <p className="text-sm text-white/60 mt-1">{aggregateLive.sold} booked today</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg shadow-black/40">
            <p className="text-xs uppercase tracking-wide text-white/60 flex items-center gap-2">
              <Ticket className="w-4 h-4 text-amber-300" /> Open Capacity
            </p>
            <p className="text-3xl font-bold mt-2 text-amber-100">
              {Math.max(aggregateLive.totalCapacity - aggregateLive.sold, 0)}
            </p>
            <p className="text-sm text-white/60 mt-1">seats left to sell</p>
          </div>

          
        </div>

        {/* Live Events List */}
        <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur shadow-lg shadow-black/40">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-red-400" /> Live today
              </h2>
              <p className="text-sm text-white/60">Select a card to open the live board.</p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs text-white/60">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Auto-syncing with bookings and check-ins
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
            {liveEvents.length === 0 && (
              <div className="col-span-full text-center py-8 text-white/60">
                No live events today. Upcoming events are listed below.
              </div>
            )}
            {liveEvents.map((event) => {
              const totals = getEventTicketTotals(event);
              const occupancy =
                totals.total > 0 ? Math.round((totals.sold / totals.total) * 100) : 0;
              const checkInRate =
                totals.sold > 0 ? Math.round((totals.checkedIn / totals.sold) * 100) : 0;
              return (
                <button
                  key={event.id}
                  onClick={() => navigate(`/organizer/live/${event.id}`)}
                  className="text-left rounded-2xl border border-white/10 bg-white/5 hover:border-white/20 transition-all duration-200 p-4 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-red-500/20 text-red-100 border border-red-400/30">
                        Live
                      </span>
                      <p className="text-xs text-white/60">{event.id}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/70">
                      <Calendar className="w-4 h-4" /> {formatDateTime(event.startDate)}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{event.title}</h3>
                    <p className="text-sm text-white/70 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-white/60" />
                      {event.venue} • {event.city}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 text-xs rounded-full bg-white/5 border border-white/10 text-white/70"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-white/70">
                      <span>Occupancy</span>
                      <span>
                        {totals.sold} / {totals.total}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden border border-white/5">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 to-blue-500"
                        style={{ width: `${occupancy}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/70">
                      <span>Checked-in</span>
                      <span>{checkInRate}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden border border-white/5">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-cyan-500"
                        style={{ width: `${checkInRate}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <Users className="w-4 h-4 text-cyan-300" /> {event.checkIns.total} checked-in
                    </div>
                    <div className="text-sm text-red-200 flex items-center gap-1">
                      View live board <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur shadow-lg shadow-black/40">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-300" /> Upcoming (next 7 days)
            </h2>
            <span className="text-xs text-white/60">Based on events table (UPCOMING)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {upcomingEvents.length === 0 && (
              <div className="col-span-full text-center py-6 text-white/60">
                No upcoming events in the next week.
              </div>
            )}
            {upcomingEvents.map((event) => {
              const totals = getEventTicketTotals(event);
              const occupancy =
                totals.total > 0 ? Math.round((totals.sold / totals.total) * 100) : 0;
              return (
                <div
                  key={event.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col gap-3 shadow-md shadow-black/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-blue-500/15 text-blue-100 border border-blue-400/30">
                        Upcoming
                      </span>
                      <p className="text-xs text-white/60">{event.id}</p>
                    </div>
                    <span className="text-xs text-white/70 flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {formatDate(event.startDate)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{event.title}</h3>
                    <p className="text-sm text-white/70 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-white/60" />
                      {event.venue} • {event.city}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-white/70">
                    <span>
                      Capacity {totals.total} • Booked {totals.sold}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">
                      {occupancy}% sold
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden border border-white/5">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-blue-500"
                      style={{ width: `${occupancy}%` }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-white/70">
                    {event.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveEvents;
