import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Filter,
  Search,
  Building2,
} from "lucide-react";

const PromoterReports = () => {
  const [dateRange, setDateRange] = useState("30d");
  const [reportType, setReportType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Dummy data inspired by Prisma schema for reports
  const reportsData = useMemo(() => ({
    summary: {
      totalRevenue: 28400000,
      totalBookings: 15420,
      totalEvents: 89,
      activeOrganizers: 24,
      platformFees: 2272000,
      refundsProcessed: 384000,
      pendingDisputes: 3,
      avgTicketPrice: 1842,
      topGrowthEvent: "Summer Music Festival 2024",
      growthRate: 18.4,
    },
    revenueBreakdown: [
      { category: "Music Events", revenue: 12400000, bookings: 6850, percentage: 43.7, growth: 22.1 },
      { category: "Conferences", revenue: 8200000, bookings: 4120, percentage: 28.9, growth: 15.3 },
      { category: "Food & Wine", revenue: 4800000, bookings: 2890, percentage: 16.9, growth: 8.7 },
      { category: "Sports Events", revenue: 1800000, bookings: 980, percentage: 6.3, growth: -5.2 },
      { category: "Arts & Culture", revenue: 1200000, bookings: 580, percentage: 4.2, growth: 12.4 },
    ],
    organizerPerformance: [
      {
        id: "org-abc",
        name: "ABC Events",
        events: 12,
        revenue: 8200000,
        bookings: 4850,
        avgRating: 4.6,
        completionRate: 98.2,
        refundRate: 1.2,
        status: "VERIFIED",
        trend: "up",
      },
      {
        id: "org-techcorp",
        name: "TechCorp",
        events: 8,
        revenue: 5400000,
        bookings: 3120,
        avgRating: 4.4,
        completionRate: 96.8,
        refundRate: 2.1,
        status: "VERIFIED",
        trend: "up",
      },
      {
        id: "org-culinary",
        name: "Culinary Dreams",
        events: 6,
        revenue: 3200000,
        bookings: 1870,
        avgRating: 4.7,
        completionRate: 99.1,
        refundRate: 0.8,
        status: "ON-HOLD",
        trend: "down",
      },
      {
        id: "org-elite",
        name: "Elite Nights",
        events: 4,
        revenue: 1600000,
        bookings: 980,
        avgRating: 4.3,
        completionRate: 94.5,
        refundRate: 3.2,
        status: "VERIFIED",
        trend: "stable",
      },
    ],
    eventAnalytics: [
      {
        id: "evt-summer-music",
        title: "Summer Music Festival 2024",
        organizer: "ABC Events",
        revenue: 3200000,
        bookings: 4850,
        capacity: 5200,
        occupancy: 93.3,
        avgTicketPrice: 660,
        checkInRate: 87.2,
        rating: 4.6,
        status: "COMPLETED",
      },
      {
        id: "evt-tech-summit",
        title: "Tech Innovation Summit",
        organizer: "TechCorp",
        revenue: 2400000,
        bookings: 3120,
        capacity: 4500,
        occupancy: 69.3,
        avgTicketPrice: 769,
        checkInRate: 91.5,
        rating: 4.4,
        status: "COMPLETED",
      },
      {
        id: "evt-food-wine",
        title: "Food & Wine Festival",
        organizer: "Culinary Dreams",
        revenue: 1800000,
        bookings: 1870,
        capacity: 3500,
        occupancy: 53.4,
        avgTicketPrice: 963,
        checkInRate: 89.1,
        rating: 4.7,
        status: "LIVE",
      },
    ],
    financialHealth: [
      {
        metric: "Revenue Growth",
        current: 28400000,
        previous: 23980000,
        change: 18.4,
        status: "positive",
        icon: TrendingUp,
      },
      {
        metric: "Platform Fees",
        current: 2272000,
        previous: 1918000,
        change: 18.4,
        status: "positive",
        icon: DollarSign,
      },
      {
        metric: "Refund Rate",
        current: 1.35,
        previous: 1.82,
        change: -25.8,
        status: "positive",
        icon: TrendingDown,
      },
      {
        metric: "Dispute Ratio",
        current: 0.019,
        previous: 0.028,
        change: -32.1,
        status: "positive",
        icon: AlertTriangle,
      },
    ],
  }), []);

  const currency = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;
  const percentage = (v) => `${Number(v || 0).toFixed(1)}%`;

  const statusBadge = (status) => {
    const map = {
      VERIFIED: "success",
      "ON-HOLD": "destructive",
      PENDING: "default",
      COMPLETED: "success",
      LIVE: "success",
      positive: "success",
      negative: "destructive",
    };
    return map[status] || "outline";
  };

  const filteredOrganizers = reportsData.organizerPerformance.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reports & Analytics</h2>
          <p className="text-muted-foreground">Comprehensive insights into platform performance</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search organizers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60 bg-card/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currency(reportsData.summary.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              +{percentage(reportsData.summary.growthRate)} from last period
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportsData.summary.totalBookings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across {reportsData.summary.totalEvents} events
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currency(reportsData.summary.platformFees)}</div>
            <p className="text-xs text-muted-foreground">
              {percentage((reportsData.summary.platformFees / reportsData.summary.totalRevenue) * 100)} of GMV
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Organizers</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportsData.summary.activeOrganizers}</div>
            <p className="text-xs text-muted-foreground">
              {reportsData.summary.pendingDisputes} pending disputes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <Card className="border-border/60 bg-card/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Revenue by Category
          </CardTitle>
          <CardDescription>Performance breakdown across event categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportsData.revenueBreakdown.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border/40">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{category.category}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant={category.growth > 0 ? "success" : "destructive"}>
                        {category.growth > 0 ? "+" : ""}{percentage(category.growth)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{percentage(category.percentage)}</span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {currency(category.revenue)} • {category.bookings.toLocaleString()} bookings
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Organizer Performance */}
      <Card className="border-border/60 bg-card/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Organizer Performance
          </CardTitle>
          <CardDescription>Key metrics for top organizers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOrganizers.map((organizer, index) => (
              <div key={index} className="p-4 rounded-lg border border-border/40">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{organizer.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={statusBadge(organizer.status)}>
                        {organizer.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {organizer.events} events • {organizer.bookings.toLocaleString()} bookings
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{currency(organizer.revenue)}</div>
                    <div className="flex items-center justify-end gap-1 text-sm">
                      {organizer.trend === "up" && <TrendingUp className="w-4 h-4 text-green-600" />}
                      {organizer.trend === "down" && <TrendingDown className="w-4 h-4 text-red-600" />}
                      {organizer.trend === "stable" && <div className="w-4 h-4" />}
                      <span className="text-muted-foreground">{organizer.trend}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Rating</span>
                    <div className="font-medium">⭐ {organizer.avgRating}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Completion</span>
                    <div className="font-medium">{percentage(organizer.completionRate)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Refund Rate</span>
                    <div className="font-medium">{percentage(organizer.refundRate)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Avg Ticket</span>
                    <div className="font-medium">{currency(organizer.revenue / organizer.bookings)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Financial Health */}
      <Card className="border-border/60 bg-card/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Financial Health Metrics
          </CardTitle>
          <CardDescription>Key performance indicators and trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportsData.financialHealth.map((metric, index) => (
              <div key={index} className="p-4 rounded-lg border border-border/40">
                <div className="flex items-center justify-between mb-2">
                  <metric.icon className="w-5 h-5 text-muted-foreground" />
                  <Badge variant={statusBadge(metric.status)}>
                    {metric.change > 0 ? "+" : ""}{percentage(metric.change)}
                  </Badge>
                </div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">{metric.metric}</h4>
                <div className="text-xl font-bold">
                  {metric.metric.includes("Rate") || metric.metric.includes("Ratio") 
                    ? percentage(metric.current)
                    : currency(metric.current)
                  }
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Prev: {metric.metric.includes("Rate") || metric.metric.includes("Ratio")
                    ? percentage(metric.previous)
                    : currency(metric.previous)
                  }
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PromoterReports;
