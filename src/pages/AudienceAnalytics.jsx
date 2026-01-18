import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Users,
  Activity,
  Clock,
  TrendingDown,
  Sparkles,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  MapPin,
  PieChart as PieChartIcon,
  Loader2,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { apiFetch } from "@/config/api";

const gradientCard =
  "relative rounded-2xl p-4 bg-white/5 border border-white/10 backdrop-blur overflow-hidden shadow-lg shadow-black/30";

const buildQuery = (path, params = {}) => {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  return qs ? `${path}?${qs}` : path;
};

const unwrap = (res) => res?.data ?? res?.result ?? res;

const formatNumber = (value, fallback = "—") => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return fallback;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return Number(value).toLocaleString();
};

const formatPercent = (value, fallback = "—") => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return fallback;
  return `${Number(value).toFixed(1)}%`;
};

const AudienceAnalytics = () => {
  const [timePeriod, setTimePeriod] = useState("month"); // day | week | month | year | all
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [includeDraft, setIncludeDraft] = useState(false);
  const [includeCancelled, setIncludeCancelled] = useState(false);

  const [statistics, setStatistics] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [trends, setTrends] = useState([]);
  const [topEvents, setTopEvents] = useState([]);
  const [breakdowns, setBreakdowns] = useState({ status: [], category: [], geography: [] });
  const [recentActivity, setRecentActivity] = useState([]);
  const [eventOptions, setEventOptions] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [eventTickets, setEventTickets] = useState([]);
  const [eventTimeline, setEventTimeline] = useState([]);
  const [eventOverview, setEventOverview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [eventLoading, setEventLoading] = useState(false);
  const [error, setError] = useState("");
  const [eventError, setEventError] = useState("");

  const computedPeriod = useMemo(() => {
    if (startDate && endDate) return "custom";
    return timePeriod;
  }, [timePeriod, startDate, endDate]);

  const periodLabel = useMemo(() => {
    if (startDate && endDate) return `${startDate} → ${endDate}`;
    switch (timePeriod) {
      case "day":
        return "Last 24h";
      case "week":
        return "Last 7 days";
      case "month":
        return "Last 30 days";
      case "year":
        return "Last 12 months";
      case "all":
        return "All time";
      default:
        return "Custom";
    }
  }, [timePeriod, startDate, endDate]);

  const loadOrganizerAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");
    const mainPeriod = computedPeriod;
    const periodForAnalytics = mainPeriod === "custom" ? "custom" : mainPeriod;
    const periodForOthers = mainPeriod === "custom" ? "month" : mainPeriod; // backend for trends/top/breakdowns needs day|week|month|year|all
    const common = { period: periodForOthers, startDate, endDate };
    const breakdownPeriod = periodForOthers;
    try {
      const results = await Promise.allSettled([
        apiFetch(buildQuery("organizer/me/statistics", { ...common, includeDraft, includeCancelled }), { method: "GET" }),
        apiFetch(buildQuery("organizer/me/analytics", { ...common, period: periodForAnalytics }), { method: "GET" }),
        apiFetch(buildQuery("organizer/me/analytics/trends", { ...common, metric: "revenue" }), { method: "GET" }),
        apiFetch(buildQuery("organizer/me/analytics/top-events", { ...common, sortBy: "revenue", limit: 5 }), {
          method: "GET",
        }),
        apiFetch(buildQuery("organizer/me/analytics/breakdown", { period: breakdownPeriod, startDate, endDate, type: "status" }), {
          method: "GET",
        }),
        apiFetch(
          buildQuery("organizer/me/analytics/breakdown", {
            period: breakdownPeriod,
            startDate,
            endDate,
            type: "category",
          }),
          { method: "GET" }
        ),
        apiFetch(
          buildQuery("organizer/me/analytics/breakdown", {
            period: breakdownPeriod,
            startDate,
            endDate,
            type: "geography",
          }),
          { method: "GET" }
        ),
      ]);

      const pick = (idx) => (results[idx].status === "fulfilled" ? results[idx].value : null);
      const failures = results
        .map((r, i) => ({ r, i }))
        .filter(({ r }) => r.status === "rejected")
        .map(({ i, r }) => ({ i, msg: r.reason?.message || r.reason?.errorMessage || "Request failed" }));

      const statisticsRes = pick(0);
      const analyticsRes = pick(1);
      const trendsRes = pick(2);
      const topEventsRes = pick(3);
      const statusBreakdownRes = pick(4);
      const categoryBreakdownRes = pick(5);
      const geoBreakdownRes = pick(6);

      const statsData = unwrap(statisticsRes);
      const analyticsData = unwrap(analyticsRes);
      const trendData = unwrap(trendsRes);
      const topEventsData = unwrap(topEventsRes);

      if (statsData) setStatistics(statsData || {});
      if (analyticsData) setAnalytics(analyticsData || {});
      if (trendData) setTrends(trendData?.trend || trendData?.timeline || trendData?.data || trendData || []);

      const normalizedTopEvents =
        topEventsData?.items || topEventsData?.events || topEventsData?.topEvents || topEventsData || [];
      setTopEvents(normalizedTopEvents);
      setEventOptions(normalizedTopEvents);
      if (!selectedEvent && normalizedTopEvents.length) {
        setSelectedEvent(normalizedTopEvents[0]?.eventId || normalizedTopEvents[0]?.id || "");
      }

      const toArray = (val) => (Array.isArray(val) ? val : val ? [val] : []);
      setBreakdowns({
        status: toArray(
          unwrap(statusBreakdownRes)?.items ||
            unwrap(statusBreakdownRes)?.breakdown ||
            unwrap(statusBreakdownRes)?.data ||
            []
        ),
        category: toArray(
          unwrap(categoryBreakdownRes)?.items ||
            unwrap(categoryBreakdownRes)?.breakdown ||
            unwrap(categoryBreakdownRes)?.data ||
            []
        ),
        geography: toArray(
          unwrap(geoBreakdownRes)?.items || unwrap(geoBreakdownRes)?.breakdown || unwrap(geoBreakdownRes)?.data || []
        ),
      });

      setRecentActivity(
        analyticsData?.recentActivity ||
          analyticsData?.activity ||
          (Array.isArray(analyticsData) ? analyticsData : []) ||
          []
      );

      if (failures.length) {
        const first = failures[0]?.msg;
        setError(failures.length === results.length ? first || "Failed to load analytics" : `Partial load: ${first}`);
      } else {
        setError("");
      }
    } catch (err) {
      console.error("Failed to load organizer analytics", err);
      setError(err?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [timePeriod, startDate, endDate, includeDraft, includeCancelled, selectedEvent]);

  const loadEventAnalytics = useCallback(
    async (eventId) => {
      if (!eventId) return;
      setEventLoading(true);
      setEventError("");
      const mainPeriod = computedPeriod;
      const periodForOthers = mainPeriod === "custom" ? "month" : mainPeriod;
      const common = { period: periodForOthers, startDate, endDate };
      try {
        const [ticketsRes, timelineRes, overviewRes] = await Promise.all([
          apiFetch(buildQuery(`organizer/events/${eventId}/analytics/tickets`, common), { method: "GET" }),
          apiFetch(buildQuery(`organizer/events/${eventId}/analytics/sales-timeline`, common), { method: "GET" }),
          apiFetch(buildQuery(`events/organizer/events/${eventId}/analytics/overview`, common), { method: "GET" }),
        ]);
        setEventTickets(unwrap(ticketsRes)?.tickets || unwrap(ticketsRes)?.data || unwrap(ticketsRes) || []);
        setEventTimeline(
          unwrap(timelineRes)?.timeline || unwrap(timelineRes)?.trend || unwrap(timelineRes)?.data || unwrap(timelineRes) || []
        );
        setEventOverview(unwrap(overviewRes) || {});
      } catch (err) {
        console.error("Failed to load event analytics", err);
        setEventError(err?.message || "Unable to load event analytics");
      } finally {
        setEventLoading(false);
      }
    },
    [timePeriod, startDate, endDate]
  );

  useEffect(() => {
    loadOrganizerAnalytics();
  }, [loadOrganizerAnalytics]);

  useEffect(() => {
    if (selectedEvent) {
      loadEventAnalytics(selectedEvent);
    }
  }, [selectedEvent, loadEventAnalytics]);

  const summaryCards = useMemo(() => {
    const base = analytics?.summary || analytics?.metrics || analytics || {};
    const stats = statistics || {};
    const change = (value) => (value > 0 ? `+${formatPercent(value)}` : formatPercent(value));
    return [
      {
        title: "Total Visitors",
        value: formatNumber(stats.totalVisitors ?? base.totalVisitors ?? base.visitors),
        change: change(base.visitorsDelta ?? base.visitorsChange ?? 0),
        tone: "from-red-500/80 via-rose-500/70 to-orange-400/70",
        icon: <Users className="w-8 h-8 text-white" />,
        isNegative: false,
      },
      {
        title: "Active Users",
        value: formatNumber(stats.activeUsers ?? base.activeUsers ?? base.engagedUsers),
        change: change(base.activeChange ?? base.engagedChange ?? 0),
        tone: "from-sky-500/70 via-blue-500/70 to-indigo-500/70",
        icon: <Activity className="w-8 h-8 text-white" />,
        isNegative: false,
      },
      {
        title: "Avg. Session",
        value: base.avgSession
          ? `${Math.floor(base.avgSession / 60)}m ${Math.floor(base.avgSession % 60)}s`
          : "—",
        change: change(base.sessionDelta ?? 0),
        tone: "from-emerald-400/70 via-teal-400/70 to-cyan-400/70",
        icon: <Clock className="w-8 h-8 text-white" />,
        isNegative: false,
      },
      {
        title: "Bounce Rate",
        value: formatPercent(base.bounceRate ?? statistics?.bounceRate),
        change: change(base.bounceRateDelta ?? 0),
        tone: "from-purple-500/70 via-fuchsia-500/70 to-pink-500/70",
        icon: <TrendingDown className="w-8 h-8 text-white" />,
        isNegative: true,
      },
    ];
  }, [analytics, statistics]);

  const ageGroups = useMemo(() => {
    const demo =
      analytics?.demographics?.age ||
      analytics?.audience?.ageGroups ||
      analytics?.ageGroups ||
      statistics?.ageGroups ||
      [];
    return demo.length
      ? demo.map((item, idx) => ({
          label: item.label || item.range || item.bucket || `Group ${idx + 1}`,
          value: item.value ?? item.percentage ?? 0,
        }))
      : [];
  }, [analytics, statistics]);

  const gender = useMemo(() => {
    const genderData =
      analytics?.demographics?.gender ||
      analytics?.audience?.gender ||
      analytics?.gender ||
      statistics?.genderBreakdown ||
      {};
    const female = genderData.female ?? genderData.FEMALE ?? genderData?.["female"];
    const male = genderData.male ?? genderData.MALE ?? genderData?.["male"];
    const total = (female || 0) + (male || 0);
    const femalePct = total ? Math.round((female / total) * 100) : null;
    return { female: femalePct, male: total ? 100 - femalePct : null };
  }, [analytics, statistics]);

  const renderBarList = (items, colorClass = "bg-gradient-to-r from-red-500 via-blue-500 to-cyan-400") => (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-white/70">{item.label}</span>
            <span className="font-semibold text-white">{formatPercent(item.value)}</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div className={`h-2 rounded-full ${colorClass}`} style={{ width: `${item.value}%` }} />
          </div>
        </div>
      ))}
    </div>
  );

  const timelinePoints = useMemo(() => {
    const data = Array.isArray(trends) ? trends : [];
    const maxValue = Math.max(...data.map((d) => d.value || d.revenue || d.amount || 0), 0);
    return { data, maxValue: maxValue || 1 };
  }, [trends]);

  const safeBreakdowns = useMemo(
    () => ({
      status: Array.isArray(breakdowns?.status) ? breakdowns.status : [],
      category: Array.isArray(breakdowns?.category) ? breakdowns.category : [],
      geography: Array.isArray(breakdowns?.geography) ? breakdowns.geography : [],
    }),
    [breakdowns]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#04060d] via-[#0a1020] to-[#04060d] text-white">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-white/50 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-red-400" />
              Audience Intelligence
            </p>
            <h2 className="text-3xl font-extrabold mt-1">Audience Analytics</h2>
            <p className="text-sm text-white/60 mt-1">Understand who’s engaging with your events.</p>
            <p className="text-xs text-white/50 mt-1">Period: {periodLabel}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {[
              { value: "day", label: "24h" },
              { value: "week", label: "7d" },
              { value: "month", label: "30d" },
              { value: "year", label: "1y" },
              { value: "all", label: "All" },
            ].map((period) => (
              <button
                key={period.value}
                onClick={() => setTimePeriod(period.value)}
                className={`px-3 py-2 rounded-xl border text-sm transition ${
                  timePeriod === period.value
                    ? "bg-gradient-to-r from-red-500 to-blue-500 text-white border-transparent shadow-lg shadow-red-500/20"
                    : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                }`}
              >
                {period.label}
              </button>
            ))}
            <div className="flex items-center gap-2 text-xs text-white/60">
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  className="accent-red-500"
                  checked={includeDraft}
                  onChange={(e) => setIncludeDraft(e.target.checked)}
                />
                Draft
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  className="accent-red-500"
                  checked={includeCancelled}
                  onChange={(e) => setIncludeCancelled(e.target.checked)}
                />
                Cancelled
              </label>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/70">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1"
              />
              <span>→</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1"
              />
            </div>
            <button
              onClick={loadOrganizerAnalytics}
              className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white/80 hover:bg-white/15 flex items-center gap-2 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-amber-200 text-sm bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((card, index) => (
            <div key={index} className={gradientCard}>
              <div className={`absolute inset-0 bg-gradient-to-br ${card.tone} opacity-20`} />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/60">{card.title}</p>
                  <p className="text-2xl font-bold mt-2">{card.value}</p>
                  <p
                    className={`text-[12px] mt-2 inline-flex items-center gap-1 ${
                      card.isNegative ? "text-amber-200" : "text-emerald-200"
                    }`}
                  >
                    {card.isNegative ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                    {card.change || "vs prev"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/10 border border-white/10">{card.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Timeline + Top events */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur shadow-lg shadow-black/30">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-sky-300" />
                  Engagement trends
                </h3>
                <p className="text-xs text-white/60">Revenue / bookings trend over time</p>
              </div>
              {loading && <Loader2 className="w-5 h-5 animate-spin text-white/60" />}
            </div>
            <div className="space-y-3">
              {timelinePoints.data.length === 0 && (
                <p className="text-sm text-white/60">No trend data for the selected period.</p>
              )}
              {timelinePoints.data.map((point, idx) => {
                const value = point.value ?? point.revenue ?? point.amount ?? 0;
                const pct = Math.max(4, Math.min(100, (value / timelinePoints.maxValue) * 100));
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs text-white/60">
                      <span>{point.label || point.date || `Point ${idx + 1}`}</span>
                      <span className="text-white font-semibold">{formatNumber(value, "0")}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-red-500 via-blue-500 to-cyan-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur shadow-lg shadow-black/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Top events</h3>
              <span className="text-xs text-white/60">{topEvents.length} items</span>
            </div>
            <div className="space-y-3">
              {topEvents.length === 0 && <p className="text-sm text-white/60">No events in this window.</p>}
              {topEvents.map((evt, idx) => (
                <div
                  key={evt.eventId || evt.id || idx}
                  className="flex items-start justify-between rounded-xl bg-white/5 border border-white/10 px-3 py-2"
                >
                  <div>
                    <p className="font-semibold">{evt.title || evt.name || "Event"}</p>
                    <p className="text-xs text-white/60 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {evt.city || evt.location || "—"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {formatNumber(evt.revenue ?? evt.net ?? evt.total ?? evt.amount ?? 0, "—")}
                    </p>
                    <p className="text-xs text-white/60">{formatNumber(evt.ticketsSold ?? evt.sold ?? 0, "0")} tickets</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Breakdown + Demographics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur shadow-lg shadow-black/30 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-sky-300" />
                Breakdown by status / category
              </h3>
              <span className="text-xs text-white/60">{periodLabel}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-white/60 mb-2">Status</p>
                {breakdowns.status.length === 0 ? (
                  <p className="text-xs text-white/50">No status data.</p>
                ) : (
                  renderBarList(
                    breakdowns.status.map((b) => ({
                      label: b.label || b.status || b.name,
                      value: b.value ?? b.percentage ?? 0,
                    }))
                  )
                )}
              </div>
              <div>
                <p className="text-sm text-white/60 mb-2">Category</p>
                {breakdowns.category.length === 0 ? (
                  <p className="text-xs text-white/50">No category data.</p>
                ) : (
                  renderBarList(
                    breakdowns.category.map((b) => ({
                      label: b.label || b.category || b.name,
                      value: b.value ?? b.percentage ?? 0,
                    })),
                    "bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400"
                  )
                )}
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur shadow-lg shadow-black/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Geography</h3>
              <span className="text-xs text-white/60">{breakdowns.geography.length} regions</span>
            </div>
            <div className="space-y-3">
              {breakdowns.geography.length === 0 && <p className="text-xs text-white/60">No geo data.</p>}
              {breakdowns.geography.slice(0, 5).map((geo, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gradient-to-r from-red-500 to-blue-500" />
                    <p className="text-sm">{geo.label || geo.region || geo.name}</p>
                  </div>
                  <p className="text-sm text-white/70">{formatPercent(geo.value ?? geo.percentage ?? 0)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Demographics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur shadow-lg shadow-black/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Audience Demographics</h3>
              <span className="text-xs text-white/60 flex items-center gap-2">
                <Flame className="w-4 h-4 text-red-300" />
                by age group
              </span>
            </div>
            {ageGroups.length ? renderBarList(ageGroups) : <p className="text-xs text-white/60">No demographic data.</p>}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur shadow-lg shadow-black/30">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Gender Distribution</h3>
              <span className="text-xs text-white/60">{periodLabel}</span>
            </div>
            <div className="h-48 flex items-center justify-center">
              <div className="relative w-40 h-40">
                <div className="absolute inset-0 rounded-full border-8 border-white/10"></div>
                <div className="absolute inset-1 rounded-full border-6 border-gradient-to-r from-red-500 to-blue-500"></div>
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#0b1224] via-[#0a0f1d] to-[#060910] flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold">
                    {gender.female !== null ? `${gender.female}%` : "—"}
                  </span>
                  <span className="text-xs text-white/60">Female</span>
                  <span className="text-xs text-white/50">{gender.male !== null ? `${gender.male}% Male` : ""}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Event drilldown */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur shadow-lg shadow-black/30">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div>
              <h3 className="text-lg font-semibold">Event drill-down</h3>
              <p className="text-xs text-white/60">Ticket performance & sales timeline</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm"
              >
                {!selectedEvent && <option value="">Select event</option>}
                {eventOptions.map((evt) => (
                  <option key={evt.eventId || evt.id} value={evt.eventId || evt.id}>
                    {evt.title || evt.name || "Event"}
                  </option>
                ))}
              </select>
              {eventLoading && <Loader2 className="w-4 h-4 animate-spin text-white/60" />}
            </div>
          </div>
          {eventError && (
            <div className="flex items-center gap-2 text-amber-200 text-xs bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 mb-3">
              <AlertTriangle className="w-4 h-4" />
              {eventError}
            </div>
          )}
          {!selectedEvent ? (
            <p className="text-sm text-white/60">Select a top event to view its analytics.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-3">
                <p className="text-sm text-white/70">Sales timeline</p>
                {eventTimeline.length === 0 && <p className="text-xs text-white/60">No timeline data.</p>}
                {eventTimeline.map((row, idx) => {
                  const value = row.revenue ?? row.amount ?? row.sales ?? 0;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs text-white/60">
                        <span>{row.label || row.date || `Day ${idx + 1}`}</span>
                        <span className="text-white font-semibold">{formatNumber(value, "0")}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-emerald-400 via-blue-500 to-cyan-400"
                          style={{ width: `${Math.min(100, Math.max(4, (value / (eventTimeline[0]?.revenue || value || 1)) * 100))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="space-y-3">
                <p className="text-sm text-white/70">Ticket performance</p>
                {eventTickets.length === 0 && <p className="text-xs text-white/60">No ticket data.</p>}
                {eventTickets.slice(0, 5).map((ticket, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-3 py-2"
                  >
                    <div>
                      <p className="font-semibold">{ticket.name || ticket.ticketName || "Ticket"}</p>
                      <p className="text-xs text-white/60">
                        {formatNumber(ticket.sold ?? ticket.quantity ?? ticket.count ?? 0, "0")} sold
                      </p>
                    </div>
                    <p className="text-sm font-semibold">
                      {formatNumber(ticket.revenue ?? ticket.total ?? ticket.amount ?? 0, "—")}
                    </p>
                  </div>
                ))}
                {eventOverview && (
                  <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-3">
                    <p className="text-xs uppercase tracking-wide text-white/60 mb-1">Event overview</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Revenue</span>
                      <span className="font-semibold">{formatNumber(eventOverview.revenue ?? eventOverview.total)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Tickets</span>
                      <span className="font-semibold">
                        {formatNumber(eventOverview.ticketsSold ?? eventOverview.sold ?? 0, "0")}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur shadow-lg shadow-black/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <span className="text-xs text-white/60">Live stream · updated now</span>
          </div>
          <div className="space-y-3">
            {recentActivity.length === 0 && (
              <p className="text-sm text-white/60">No recent actions recorded for this period.</p>
            )}
            {recentActivity.map((activity, idx) => (
              <div
                key={activity.id || idx}
                className="flex items-start space-x-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                  {(activity.user || activity.name || "U")
                    .toString()
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white leading-snug">
                    <span className="font-semibold">{activity.user || activity.name || "User"}</span>{" "}
                    {activity.action || activity.type || "did something"}{" "}
                    <span className="font-semibold text-blue-200">{activity.event || activity.context || ""}</span>
                  </p>
                  <p className="text-xs text-white/60">{activity.time || activity.timestamp || "just now"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudienceAnalytics;
