import React, { useState } from "react";
import { ArrowLeft, Download, TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FinancialReporting = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");

  // Sample Financial Data
  const financialData = {
    totalRevenue: "₹5,24,000",
    totalExpenses: "₹1,45,000",
    netProfit: "₹3,79,000",
    profitMargin: "72.3%",
    monthlyGrowth: "+15.8%",
    previousMonthRevenue: "₹4,52,000",
  };

  // Revenue by Event Type
  const revenueByEvent = [
    { name: "Concerts", value: 156000, percentage: 29.8, color: "#ef4444" },
    { name: "Conferences", value: 142000, percentage: 27.1, color: "#3b82f6" },
    { name: "Weddings", value: 118000, percentage: 22.5, color: "#ec4899" },
    { name: "Workshops", value: 108000, percentage: 20.6, color: "#8b5cf6" },
  ];

  // Monthly Revenue Trend
  const monthlyTrend = [
    { month: "Jan", revenue: 280000, expenses: 95000 },
    { month: "Feb", revenue: 320000, expenses: 105000 },
    { month: "Mar", revenue: 380000, expenses: 120000 },
    { month: "Apr", revenue: 420000, expenses: 130000 },
    { month: "May", revenue: 452000, expenses: 140000 },
    { month: "Jun", revenue: 524000, expenses: 145000 },
  ];

  // Expense Breakdown
  const expenseBreakdown = [
    { category: "Platform Fees", amount: 52400, percentage: 36.1, color: "#f59e0b" },
    { category: "Payment Gateway", amount: 36100, percentage: 24.9, color: "#10b981" },
    { category: "Support Staff", amount: 29000, percentage: 20.0, color: "#6366f1" },
    { category: "Marketing", amount: 18200, percentage: 12.5, color: "#06b6d4" },
    { category: "Infrastructure", amount: 9300, percentage: 6.4, color: "#f97316" },
  ];

  // Transaction History
  const transactions = [
    { id: "TXN001", date: "28 Nov 2024", description: "Concert Event - Ticket Sales", amount: "+₹45,000", type: "credit" },
    { id: "TXN002", date: "27 Nov 2024", description: "Platform Commission", amount: "-₹8,500", type: "debit" },
    { id: "TXN003", date: "26 Nov 2024", description: "Conference Event - Ticket Sales", amount: "+₹32,000", type: "credit" },
    { id: "TXN004", date: "25 Nov 2024", description: "Payment Gateway Fee", amount: "-₹2,100", type: "debit" },
    { id: "TXN005", date: "24 Nov 2024", description: "Wedding Event - Ticket Sales", amount: "+₹28,500", type: "credit" },
  ];

  // Simple Pie Chart Component
  const SimplePieChart = ({ data, size = 200 }) => {
    let currentAngle = 0;
    const slices = data.map((item, index) => {
      const sliceAngle = (item.value / data.reduce((sum, d) => sum + d.value, 0)) * 360;
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

      return (
        <path key={index} d={pathData} fill={item.color} stroke="white" strokeWidth="2" />
      );
    });

    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices}
      </svg>
    );
  };

  // Simple Bar Chart Component
  const SimpleBarChart = ({ data, maxValue = 600000 }) => {
    const barWidth = 100 / data.length;
    return (
      <div className="flex items-end justify-around h-64 gap-2 px-4">
        {data.map((item, index) => {
          const revenueHeight = (item.revenue / maxValue) * 100;
          const expenseHeight = (item.expenses / maxValue) * 100;
          return (
            <div key={index} className="flex flex-col items-center gap-2">
              <div className="flex gap-1 h-48">
                <div
                  className="bg-green-500 rounded-t-lg"
                  style={{ width: "20px", height: `${revenueHeight}%` }}
                  title={`Revenue: ₹${item.revenue}`}
                />
                <div
                  className="bg-red-500 rounded-t-lg"
                  style={{ width: "20px", height: `${expenseHeight}%` }}
                  title={`Expense: ₹${item.expenses}`}
                />
              </div>
              <span className="text-xs font-medium text-gray-600">{item.month}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Financial Reporting</h1>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            <Download className="w-4 h-4" />
            Download Report
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Period Selector */}
        <div className="mb-6 flex gap-3">
          {["weekly", "monthly", "quarterly", "yearly"].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                selectedPeriod === period
                  ? "bg-red-600 text-white"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {period}
            </button>
          ))}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{financialData.totalRevenue}</p>
                <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  {financialData.monthlyGrowth} from last month
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-green-100" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Expenses</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{financialData.totalExpenses}</p>
                <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                  <TrendingDown className="w-4 h-4" />
                  8.2% from last month
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-red-100" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Net Profit</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{financialData.netProfit}</p>
                <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  {financialData.profitMargin} margin
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-blue-100" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Previous Month</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{financialData.previousMonthRevenue}</p>
                <p className="text-sm text-gray-600 mt-2">Revenue comparison</p>
              </div>
              <PieChartIcon className="w-12 h-12 text-purple-100" />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trend */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue vs Expenses Trend</h3>
            <div className="overflow-x-auto">
              <SimpleBarChart data={monthlyTrend} />
            </div>
            <div className="flex gap-6 mt-6 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-600">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm text-gray-600">Expenses</span>
              </div>
            </div>
          </div>

          {/* Revenue by Event Type */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue by Event Type</h3>
            <div className="flex flex-col items-center">
              <SimplePieChart data={revenueByEvent} size={200} />
              <div className="mt-6 w-full space-y-3">
                {revenueByEvent.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{item.percentage}%</p>
                      <p className="text-xs text-gray-500">₹{(item.value / 1000).toFixed(0)}K</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Expense Breakdown</h3>
          <div className="space-y-4">
            {expenseBreakdown.map((expense, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: expense.color }}></div>
                    <span className="text-sm font-medium text-gray-900">{expense.category}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">₹{(expense.amount / 1000).toFixed(1)}K</p>
                    <p className="text-xs text-gray-500">{expense.percentage}%</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{ width: `${expense.percentage}%`, backgroundColor: expense.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Transactions</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{txn.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{txn.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{txn.description}</td>
                    <td className={`px-6 py-4 text-sm font-medium text-right ${txn.type === "credit" ? "text-green-600" : "text-red-600"}`}>
                      {txn.amount}
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
