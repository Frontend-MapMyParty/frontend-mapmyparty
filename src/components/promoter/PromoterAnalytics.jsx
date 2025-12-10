import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { useState } from "react";
import { TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon, Activity } from "lucide-react";

// Beautiful color palette
const COLORS = {
  primary: "#3b82f6",      // Blue
  secondary: "#8b5cf6",    // Purple
  success: "#10b981",      // Green
  warning: "#f59e0b",       // Amber
  danger: "#ef4444",        // Red
  info: "#06b6d4",          // Cyan
  accent: "#ec4899",        // Pink
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.success,
  COLORS.warning,
  COLORS.danger,
  COLORS.info,
  COLORS.accent,
];

const PromoterAnalytics = () => {
  const [timeFrame, setTimeFrame] = useState("week");
  const [viewType, setViewType] = useState("overall"); // overall or individual
  const [selectedEvent, setSelectedEvent] = useState("all");

  // Overall Analytics Data
  const weeklyData = [
    { name: "Mon", sales: 12000, tickets: 45, views: 320 },
    { name: "Tue", sales: 19000, tickets: 68, views: 450 },
    { name: "Wed", sales: 15000, tickets: 52, views: 380 },
    { name: "Thu", sales: 25000, tickets: 89, views: 520 },
    { name: "Fri", sales: 32000, tickets: 112, views: 680 },
    { name: "Sat", sales: 48000, tickets: 165, views: 920 },
    { name: "Sun", sales: 41000, tickets: 142, views: 780 },
  ];

  const monthlyData = [
    { name: "Week 1", sales: 85000, tickets: 312, views: 2100 },
    { name: "Week 2", sales: 92000, tickets: 345, views: 2300 },
    { name: "Week 3", sales: 78000, tickets: 289, views: 1950 },
    { name: "Week 4", sales: 105000, tickets: 398, views: 2800 },
  ];

  const data = timeFrame === "week" ? weeklyData : monthlyData;

  // Category distribution for pie chart
  const categoryData = [
    { name: "Music", value: 35, revenue: 125000, events: 12 },
    { name: "Conference", value: 28, revenue: 95000, events: 8 },
    { name: "Food", value: 20, revenue: 68000, events: 5 },
    { name: "Arts", value: 12, revenue: 42000, events: 3 },
    { name: "Sports", value: 5, revenue: 18000, events: 2 },
  ];

  // Revenue by organizer
  const organizerRevenue = [
    { name: "ABC Events", revenue: 125000, events: 8 },
    { name: "TechCorp", revenue: 95000, events: 6 },
    { name: "Culinary Dreams", revenue: 68000, events: 4 },
    { name: "Elite Events", revenue: 42000, events: 3 },
    { name: "Sports Hub", revenue: 18000, events: 2 },
  ];

  // Ticket sales distribution
  const ticketDistribution = [
    { name: "Sold", value: 68, count: 4850 },
    { name: "Available", value: 32, count: 2280 },
  ];

  // Individual Event Analytics Data
  const individualEventData = {
    "1": {
      title: "Summer Music Festival 2024",
      dailySales: [
        { name: "Day 1", sales: 12000, tickets: 45 },
        { name: "Day 2", sales: 15000, tickets: 58 },
        { name: "Day 3", sales: 18000, tickets: 72 },
        { name: "Day 4", sales: 22000, tickets: 89 },
        { name: "Day 5", sales: 25000, tickets: 105 },
      ],
      categoryData: [
        { name: "VIP", value: 15, revenue: 45000 },
        { name: "Premium", value: 35, revenue: 87500 },
        { name: "Standard", value: 50, revenue: 75000 },
      ],
      ageGroup: [
        { name: "18-25", tickets: 1200 },
        { name: "26-35", tickets: 1850 },
        { name: "36-45", tickets: 980 },
        { name: "45+", tickets: 820 },
      ],
    },
    "2": {
      title: "Tech Innovation Conference",
      dailySales: [
        { name: "Day 1", sales: 8000, tickets: 32 },
        { name: "Day 2", sales: 12000, tickets: 48 },
        { name: "Day 3", sales: 15000, tickets: 60 },
        { name: "Day 4", sales: 18000, tickets: 72 },
        { name: "Day 5", sales: 20000, tickets: 80 },
      ],
      categoryData: [
        { name: "Early Bird", value: 25, revenue: 30000 },
        { name: "Regular", value: 50, revenue: 60000 },
        { name: "Last Minute", value: 25, revenue: 30000 },
      ],
      ageGroup: [
        { name: "18-25", tickets: 450 },
        { name: "26-35", tickets: 850 },
        { name: "36-45", tickets: 420 },
        { name: "45+", tickets: 130 },
      ],
    },
  };

  const currentEventData = individualEventData[selectedEvent] || individualEventData["1"];

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3 animate-in fade-in-0 zoom-in-95">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom label for pie chart
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-sm font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Comprehensive insights into your event performance
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={viewType} onValueChange={setViewType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overall">Overall Data</SelectItem>
              <SelectItem value="individual">Individual Event</SelectItem>
            </SelectContent>
          </Select>
          <Select value={timeFrame} onValueChange={setTimeFrame}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {viewType === "overall" ? (
        <>
          {/* Overall Analytics - Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-in fade-in-0 slide-in-from-left-4" style={{ animationDelay: "0ms" }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">₹3,60,000</p>
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      +24% from last month
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-in fade-in-0 slide-in-from-left-4" style={{ animationDelay: "100ms" }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Tickets Sold</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">1,344</p>
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      +18% from last month
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20">
                    <Activity className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-in fade-in-0 slide-in-from-left-4" style={{ animationDelay: "200ms" }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">28</p>
                    <p className="text-xs text-muted-foreground mt-1">Across all categories</p>
                  </div>
                  <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
                    <PieChartIcon className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-in fade-in-0 slide-in-from-left-4" style={{ animationDelay: "300ms" }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Conversion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">68%</p>
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                      <TrendingDown className="w-3 h-3" />
                      -3% from last month
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/20">
                    <TrendingUp className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue & Sales Over Time - Area Chart */}
            <Card className="hover:shadow-lg transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-4">
              <CardHeader>
                <CardTitle>Revenue & Sales Over Time</CardTitle>
                <CardDescription>Track your revenue and ticket sales performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.secondary} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.secondary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke={COLORS.primary}
                      fillOpacity={1}
                      fill="url(#colorSales)"
                      name="Revenue (₹)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="tickets"
                      stroke={COLORS.secondary}
                      fillOpacity={1}
                      fill="url(#colorTickets)"
                      name="Tickets Sold"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Distribution - Pie Chart */}
            <Card className="hover:shadow-lg transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-4">
              <CardHeader>
                <CardTitle>Events by Category</CardTitle>
                <CardDescription>Distribution of events across different categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomLabel}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={800}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-background border border-border rounded-lg shadow-lg p-3">
                              <p className="font-semibold mb-2">{data.name}</p>
                              <p className="text-sm text-blue-600">Events: {data.events}</p>
                              <p className="text-sm text-green-600">Revenue: ₹{data.revenue.toLocaleString()}</p>
                              <p className="text-sm text-purple-600">Share: {data.value}%</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value, entry) => (
                        <span style={{ color: entry.color }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue by Organizer - Bar Chart */}
            <Card className="hover:shadow-lg transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-4">
              <CardHeader>
                <CardTitle>Revenue by Organizer</CardTitle>
                <CardDescription>Top performing organizers by revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={organizerRevenue} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px' }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar 
                      dataKey="revenue" 
                      fill={COLORS.primary}
                      name="Revenue (₹)"
                      radius={[8, 8, 0, 0]}
                      animationBegin={0}
                      animationDuration={800}
                    />
                    <Bar 
                      dataKey="events" 
                      fill={COLORS.secondary}
                      name="Events"
                      radius={[8, 8, 0, 0]}
                      animationBegin={100}
                      animationDuration={800}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Ticket Sales Distribution - Pie Chart */}
            <Card className="hover:shadow-lg transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-4">
              <CardHeader>
                <CardTitle>Ticket Sales Distribution</CardTitle>
                <CardDescription>Sold vs available tickets overview</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={ticketDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomLabel}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={800}
                    >
                      {ticketDistribution.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={index === 0 ? COLORS.success : COLORS.warning} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-background border border-border rounded-lg shadow-lg p-3">
                              <p className="font-semibold mb-2">{data.name}</p>
                              <p className="text-sm">Tickets: {data.count.toLocaleString()}</p>
                              <p className="text-sm">Percentage: {data.value}%</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <>
          {/* Individual Event Analytics */}
          <div className="mb-6">
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Select an event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Summer Music Festival 2024</SelectItem>
                <SelectItem value="2">Tech Innovation Conference</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Event Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">₹2,07,500</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  On track
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tickets Sold</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">369 / 500</p>
                <p className="text-xs text-muted-foreground mt-1">73.8% capacity</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">68%</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  Above average
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Individual Event Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Sales Trend */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle>Daily Sales Trend</CardTitle>
                <CardDescription>Revenue and ticket sales progression</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={currentEventData.dailySales} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke={COLORS.primary}
                      strokeWidth={3}
                      name="Revenue (₹)"
                      dot={{ fill: COLORS.primary, r: 5 }}
                      animationDuration={800}
                    />
                    <Line
                      type="monotone"
                      dataKey="tickets"
                      stroke={COLORS.secondary}
                      strokeWidth={3}
                      name="Tickets Sold"
                      dot={{ fill: COLORS.secondary, r: 5 }}
                      animationDuration={800}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Ticket Category Distribution */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle>Ticket Category Distribution</CardTitle>
                <CardDescription>Revenue breakdown by ticket type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={currentEventData.categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomLabel}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={800}
                    >
                      {currentEventData.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-background border border-border rounded-lg shadow-lg p-3">
                              <p className="font-semibold mb-2">{data.name}</p>
                              <p className="text-sm text-green-600">Revenue: ₹{data.revenue.toLocaleString()}</p>
                              <p className="text-sm text-purple-600">Share: {data.value}%</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Age Group Distribution */}
            <Card className="hover:shadow-lg transition-all duration-300 lg:col-span-2">
              <CardHeader>
                <CardTitle>Audience Demographics</CardTitle>
                <CardDescription>Ticket sales by age group</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={currentEventData.ageGroup} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar 
                      dataKey="tickets" 
                      fill={COLORS.info}
                      name="Tickets Sold"
                      radius={[8, 8, 0, 0]}
                      animationBegin={0}
                      animationDuration={800}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default PromoterAnalytics;
