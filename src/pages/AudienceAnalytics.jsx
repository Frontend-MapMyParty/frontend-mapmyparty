import React, { useState } from "react";
import { Users, Activity, Clock, TrendingDown, Sparkles, Flame, ArrowUpRight, ArrowDownRight } from "lucide-react";

const AudienceAnalytics = () => {
  const [timePeriod, setTimePeriod] = useState("30days");

  // Analytics Cards Data
  const analyticsCards = [
    {
      title: "Total Visitors",
      value: "12,458",
      change: "+12.3% from last month",
      tone: "from-red-500/80 via-rose-500/70 to-orange-400/70",
      icon: <Users className="w-8 h-8 text-white" />,
    },
    {
      title: "Active Users",
      value: "3,245",
      change: "+8.5% from last week",
      tone: "from-sky-500/70 via-blue-500/70 to-indigo-500/70",
      icon: <Activity className="w-8 h-8 text-white" />,
    },
    {
      title: "Avg. Session",
      value: "4m 32s",
      change: "+2.1% from last month",
      tone: "from-emerald-400/70 via-teal-400/70 to-cyan-400/70",
      icon: <Clock className="w-8 h-8 text-white" />,
    },
    {
      title: "Bounce Rate",
      value: "24.8%",
      change: "-3.2% from last month",
      tone: "from-purple-500/70 via-fuchsia-500/70 to-pink-500/70",
      icon: <TrendingDown className="w-8 h-8 text-white" />,
      isNegative: true,
    },
  ];

  // Age Groups Data
  const ageGroups = [
    { label: "18-24", value: 35, color: "bg-blue-500" },
    { label: "25-34", value: 45, color: "bg-green-500" },
    { label: "35-44", value: 12, color: "bg-yellow-500" },
    { label: "45-54", value: 6, color: "bg-red-500" },
    { label: "55+", value: 2, color: "bg-purple-500" },
  ];

  // Recent Activity Data
  const recentActivity = [
    {
      id: 1,
      user: "John Doe",
      action: "purchased a ticket",
      event: "Summer Music Festival",
      time: "2 hours ago",
    },
    {
      id: 2,
      user: "Sarah Smith",
      action: "viewed your event",
      event: "Tech Conference 2023",
      time: "5 hours ago",
    },
    {
      id: 3,
      user: "Mike Johnson",
      action: "shared your event",
      event: "Food & Wine Tasting",
      time: "1 day ago",
    },
    {
      id: 4,
      user: "Emily Chen",
      action: "bookmarked",
      event: "Yoga Retreat",
      time: "2 days ago",
    },
  ];

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
          </div>
          <div className="flex items-center gap-3">
            {["24hours", "7days", "30days"].map((period) => (
              <button
                key={period}
                onClick={() => setTimePeriod(period)}
                className={`px-3 py-2 rounded-xl border text-sm transition ${
                  timePeriod === period
                    ? "bg-gradient-to-r from-red-500 to-blue-500 text-white border-transparent shadow-lg shadow-red-500/20"
                    : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                }`}
              >
                {period === "24hours" ? "24h" : period === "7days" ? "7d" : "30d"}
              </button>
            ))}
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {analyticsCards.map((card, index) => (
            <div
              key={index}
              className="relative rounded-2xl p-4 bg-white/5 border border-white/10 backdrop-blur overflow-hidden shadow-lg shadow-black/30"
            >
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
                    {card.change}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/10 border border-white/10">{card.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Audience Demographics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur shadow-lg shadow-black/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Audience Demographics</h3>
              <span className="text-xs text-white/60 flex items-center gap-2">
                <Flame className="w-4 h-4 text-red-300" />
                by age group
              </span>
            </div>
            <div className="space-y-3">
              {ageGroups.map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">{item.label}</span>
                    <span className="font-semibold text-white">{item.value}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-red-500 via-blue-500 to-cyan-400"
                      style={{ width: `${item.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur shadow-lg shadow-black/30">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Gender Distribution</h3>
              <span className="text-xs text-white/60">Last {timePeriod === "24hours" ? "24 hours" : timePeriod === "7days" ? "7 days" : "30 days"}</span>
            </div>
            <div className="h-48 flex items-center justify-center">
              <div className="relative w-40 h-40">
                <div className="absolute inset-0 rounded-full border-8 border-white/10"></div>
                <div className="absolute inset-1 rounded-full border-6 border-gradient-to-r from-red-500 to-blue-500"></div>
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#0b1224] via-[#0a0f1d] to-[#060910] flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold">65%</span>
                  <span className="text-xs text-white/60">Female</span>
                  <span className="text-xs text-white/50">35% Male</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur shadow-lg shadow-black/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <span className="text-xs text-white/60">Live stream · updated now</span>
          </div>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                  {activity.user
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white leading-snug">
                    <span className="font-semibold">{activity.user}</span> {activity.action}{" "}
                    <span className="font-semibold text-blue-200">{activity.event}</span>
                  </p>
                  <p className="text-xs text-white/60">{activity.time}</p>
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
