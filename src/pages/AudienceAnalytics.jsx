import React, { useState } from "react";
import { Users, Activity, Clock, TrendingDown } from "lucide-react";

const AudienceAnalytics = () => {
  const [timePeriod, setTimePeriod] = useState("30days");

  // Analytics Cards Data
  const analyticsCards = [
    {
      title: "Total Visitors",
      value: "12,458",
      change: "+12.3% from last month",
      bgColor: "bg-indigo-50",
      icon: <Users className="w-8 h-8 text-indigo-600" />,
    },
    {
      title: "Active Users",
      value: "3,245",
      change: "+8.5% from last week",
      bgColor: "bg-blue-50",
      icon: <Activity className="w-8 h-8 text-blue-600" />,
    },
    {
      title: "Avg. Session",
      value: "4m 32s",
      change: "+2.1% from last month",
      bgColor: "bg-green-50",
      icon: <Clock className="w-8 h-8 text-green-600" />,
    },
    {
      title: "Bounce Rate",
      value: "24.8%",
      change: "-3.2% from last month",
      bgColor: "bg-purple-50",
      icon: <TrendingDown className="w-8 h-8 text-purple-600" />,
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
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Audience Analytics</h2>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {analyticsCards.map((card, index) => (
          <div key={index} className={`${card.bgColor} p-4 rounded-xl`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
                <p className={`text-xs mt-2 ${card.isNegative ? "text-red-600" : "text-green-600"}`}>
                  {card.change}
                </p>
              </div>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Audience Demographics */}
      <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">Audience Demographics</h3>
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1.5"
          >
            <option value="30days">Last 30 days</option>
            <option value="7days">Last 7 days</option>
            <option value="24hours">Last 24 hours</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Age Groups */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">Age Groups</h4>
            <div className="space-y-3">
              {ageGroups.map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-medium">{item.value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${item.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gender Distribution */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">Gender Distribution</h4>
            <div className="h-48 flex items-center justify-center">
              <div className="relative w-40 h-40">
                <div className="absolute inset-0 rounded-full border-8 border-blue-200"></div>
                <div
                  className="absolute inset-0 rounded-full border-8 border-blue-500"
                  style={{
                    clipPath: "polygon(0 0, 50% 0, 50% 100%, 0% 100%)",
                    transform: "rotate(90deg)",
                    transformOrigin: "center",
                    borderColor: "#3B82F6",
                  }}
                ></div>
                <div
                  className="absolute inset-0 rounded-full border-8 border-pink-500"
                  style={{
                    clipPath: "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)",
                    transform: "rotate(90deg)",
                    transformOrigin: "center",
                    borderColor: "#EC4899",
                    opacity: 0.7,
                  }}
                ></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">65%</span>
                  <span className="text-xs text-gray-500">Female</span>
                  <span className="text-xs text-gray-500">35% Male</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                {activity.user
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{activity.user}</span> {activity.action}{" "}
                  <span className="font-medium">{activity.event}</span>
                </p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AudienceAnalytics;
