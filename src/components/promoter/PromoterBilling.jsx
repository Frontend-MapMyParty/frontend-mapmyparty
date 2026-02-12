import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Download,
  Filter,
  Search,
  Building2,
  Banknote,
  Shield,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Edit,
  MoreVertical,
} from "lucide-react";

const PromoterBilling = () => {
  const [billingPeriod, setBillingPeriod] = useState("current");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Dummy data inspired by Prisma schema for billing
  const billingData = useMemo(() => ({
    overview: {
      totalRevenue: 28400000,
      platformFees: 2272000,
      pendingPayouts: 4200000,
      processingPayouts: 1850000,
      completedPayouts: 19850000,
      failedPayouts: 280000,
      totalOrganizers: 24,
      verifiedOrganizers: 18,
      pendingKyc: 3,
      avgProcessingTime: 2.3,
      nextPayoutDate: "2024-03-15",
    },
    organizerBilling: [
      {
        id: "org-abc",
        name: "ABC Events",
        email: "accounts@abcevents.in",
        totalRevenue: 8200000,
        platformFees: 656000,
        netPayout: 7544000,
        currentBalance: 82000,
        status: "VERIFIED",
        kycStatus: "VERIFIED",
        bankDetails: {
          bankName: "ICICI Bank",
          accountNumber: "2021",
          ifsc: "ICIC0002021",
          accountHolder: "ABC Events Pvt Ltd",
        },
        lastPayout: {
          amount: 320000,
          date: "2024-02-18",
          status: "COMPLETED",
          method: "IMPS",
        },
        nextPayout: {
          amount: 82000,
          eta: "2024-03-04",
          status: "PENDING",
        },
        billingHistory: [
          { date: "2024-02-18", amount: 320000, status: "COMPLETED", method: "IMPS" },
          { date: "2024-02-01", amount: 285000, status: "COMPLETED", method: "NEFT" },
          { date: "2024-01-15", amount: 412000, status: "COMPLETED", method: "IMPS" },
        ],
      },
      {
        id: "org-techcorp",
        name: "TechCorp",
        email: "billing@techcorp.in",
        totalRevenue: 5400000,
        platformFees: 432000,
        netPayout: 4968000,
        currentBalance: 45000,
        status: "VERIFIED",
        kycStatus: "VERIFIED",
        bankDetails: {
          bankName: "HDFC Bank",
          accountNumber: "9981",
          ifsc: "HDFC0009981",
          accountHolder: "TechCorp India Pvt Ltd",
        },
        lastPayout: {
          amount: 185000,
          date: "2024-02-22",
          status: "COMPLETED",
          method: "NEFT",
        },
        nextPayout: {
          amount: 45000,
          eta: "2024-03-02",
          status: "PROCESSING",
        },
        billingHistory: [
          { date: "2024-02-22", amount: 185000, status: "COMPLETED", method: "NEFT" },
          { date: "2024-02-08", amount: 220000, status: "COMPLETED", method: "NEFT" },
          { date: "2024-01-25", amount: 195000, status: "FAILED", method: "IMPS" },
        ],
      },
      {
        id: "org-culinary",
        name: "Culinary Dreams",
        email: "finance@culinarydreams.in",
        totalRevenue: 3200000,
        platformFees: 256000,
        netPayout: 2944000,
        currentBalance: 38000,
        status: "ON-HOLD",
        kycStatus: "PENDING",
        bankDetails: {
          bankName: "SBI",
          accountNumber: "4410",
          ifsc: "SBIN0004410",
          accountHolder: "Culinary Dreams LLP",
        },
        lastPayout: {
          amount: 150000,
          date: "2024-02-15",
          status: "COMPLETED",
          method: "NEFT",
        },
        nextPayout: {
          amount: 38000,
          eta: "KYC Pending",
          status: "ON-HOLD",
        },
        billingHistory: [
          { date: "2024-02-15", amount: 150000, status: "COMPLETED", method: "NEFT" },
          { date: "2024-02-01", amount: 125000, status: "COMPLETED", method: "NEFT" },
          { date: "2024-01-18", amount: 98000, status: "COMPLETED", method: "NEFT" },
        ],
      },
      {
        id: "org-elite",
        name: "Elite Nights",
        email: "accounts@elitenights.com",
        totalRevenue: 1600000,
        platformFees: 128000,
        netPayout: 1472000,
        currentBalance: 21000,
        status: "VERIFIED",
        kycStatus: "VERIFIED",
        bankDetails: {
          bankName: "Kotak Bank",
          accountNumber: "8331",
          ifsc: "KKBK0008331",
          accountHolder: "Elite Nights",
        },
        lastPayout: {
          amount: 95000,
          date: "2024-02-10",
          status: "COMPLETED",
          method: "IMPS",
        },
        nextPayout: {
          amount: 21000,
          eta: "2024-03-06",
          status: "PENDING",
        },
        billingHistory: [
          { date: "2024-02-10", amount: 95000, status: "COMPLETED", method: "IMPS" },
          { date: "2024-01-28", amount: 78000, status: "COMPLETED", method: "IMPS" },
          { date: "2024-01-14", amount: 82000, status: "COMPLETED", method: "NEFT" },
        ],
      },
    ],
    transactions: [
      {
        id: "txn-001",
        organizerId: "org-abc",
        organizerName: "ABC Events",
        type: "PAYOUT",
        amount: 320000,
        status: "COMPLETED",
        method: "IMPS",
        date: "2024-02-18",
        referenceId: "IMPS20240218001",
        utr: "123456789012",
        processingTime: "2.1 hours",
      },
      {
        id: "txn-002",
        organizerId: "org-techcorp",
        organizerName: "TechCorp",
        type: "PAYOUT",
        amount: 185000,
        status: "COMPLETED",
        method: "NEFT",
        date: "2024-02-22",
        referenceId: "NEFT20240222001",
        utr: "987654321098",
        processingTime: "4.3 hours",
      },
      {
        id: "txn-003",
        organizerId: "org-culinary",
        organizerName: "Culinary Dreams",
        type: "PAYOUT",
        amount: 38000,
        status: "ON-HOLD",
        method: "NEFT",
        date: "2024-02-28",
        referenceId: "NEFT20240228001",
        utr: null,
        processingTime: null,
        reason: "KYC verification pending",
      },
      {
        id: "txn-004",
        organizerId: "org-elite",
        organizerName: "Elite Nights",
        type: "PAYOUT",
        amount: 21000,
        status: "PENDING",
        method: "IMPS",
        date: "2024-03-01",
        referenceId: null,
        utr: null,
        processingTime: null,
      },
    ],
    billingMetrics: [
      {
        metric: "Platform Revenue",
        current: 2272000,
        previous: 1918000,
        change: 18.4,
        status: "positive",
        icon: DollarSign,
      },
      {
        metric: "Payout Volume",
        current: 25935000,
        previous: 21890000,
        change: 18.5,
        status: "positive",
        icon: CreditCard,
      },
      {
        metric: "Failed Transactions",
        current: 280000,
        previous: 420000,
        change: -33.3,
        status: "positive",
        icon: TrendingDown,
      },
      {
        metric: "KYC Completion",
        current: 75.0,
        previous: 68.2,
        change: 10.0,
        status: "positive",
        icon: Shield,
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
      PROCESSING: "success",
      COMPLETED: "success",
      FAILED: "destructive",
      positive: "success",
      negative: "destructive",
    };
    return map[status] || "outline";
  };

  const filteredOrganizers = billingData.organizerBilling.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || org.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredTransactions = billingData.transactions.filter(txn => {
    const matchesSearch = txn.organizerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || txn.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Billing & Payouts</h2>
          <p className="text-muted-foreground">Manage organizer billing and payment processing</p>
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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="VERIFIED">Verified</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="ON-HOLD">On Hold</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60 bg-card/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currency(billingData.overview.platformFees)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              +18.4% from last period
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currency(billingData.overview.pendingPayouts)}</div>
            <p className="text-xs text-muted-foreground">
              Next payout: {billingData.overview.nextPayoutDate}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Organizers</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billingData.overview.verifiedOrganizers}/{billingData.overview.totalOrganizers}</div>
            <p className="text-xs text-muted-foreground">
              {billingData.overview.pendingKyc} pending KYC
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Transactions</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currency(billingData.overview.failedPayouts)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="w-3 h-3 inline mr-1" />
              -33.3% improvement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Billing Metrics */}
      <Card className="border-border/60 bg-card/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Billing Performance Metrics
          </CardTitle>
          <CardDescription>Key billing indicators and trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {billingData.billingMetrics.map((metric, index) => (
              <div key={index} className="p-4 rounded-lg border border-border/40">
                <div className="flex items-center justify-between mb-2">
                  <metric.icon className="w-5 h-5 text-muted-foreground" />
                  <Badge variant={statusBadge(metric.status)}>
                    {metric.change > 0 ? "+" : ""}{percentage(metric.change)}
                  </Badge>
                </div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">{metric.metric}</h4>
                <div className="text-xl font-bold">
                  {metric.metric.includes("Completion") 
                    ? percentage(metric.current)
                    : currency(metric.current)
                  }
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Prev: {metric.metric.includes("Completion")
                    ? percentage(metric.previous)
                    : currency(metric.previous)
                  }
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Organizer Billing */}
      <Card className="border-border/60 bg-card/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Organizer Billing Overview
          </CardTitle>
          <CardDescription>Detailed billing information for all organizers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOrganizers.map((organizer, index) => (
              <div key={index} className="p-4 rounded-lg border border-border/40">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold">{organizer.name}</h4>
                      <Badge variant={statusBadge(organizer.status)}>
                        {organizer.status}
                      </Badge>
                      <Badge variant={statusBadge(organizer.kycStatus)}>
                        KYC: {organizer.kycStatus}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{organizer.email}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>🏦 {organizer.bankDetails.bankName}</span>
                      <span>•••• {organizer.bankDetails.accountNumber}</span>
                      <span>{organizer.bankDetails.ifsc}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">{currency(organizer.currentBalance)}</div>
                    <div className="text-sm text-muted-foreground">Current Balance</div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="text-xs text-muted-foreground">Total Revenue</span>
                    <div className="font-semibold">{currency(organizer.totalRevenue)}</div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Platform Fees</span>
                    <div className="font-semibold">{currency(organizer.platformFees)}</div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Net Payout</span>
                    <div className="font-semibold">{currency(organizer.netPayout)}</div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Next Payout</span>
                    <div className="font-semibold">{currency(organizer.nextPayout.amount)}</div>
                    <div className="text-xs text-muted-foreground">{organizer.nextPayout.eta}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Last payout:</span>
                    <span className="text-sm font-medium">{currency(organizer.lastPayout.amount)}</span>
                    <Badge variant="success">{organizer.lastPayout.status}</Badge>
                    <span className="text-sm text-muted-foreground">via {organizer.lastPayout.method}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/promoter/billing/${organizer.slug}`)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-1" />
                      Invoice
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="border-border/60 bg-card/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Recent Transactions
          </CardTitle>
          <CardDescription>Latest payout transactions and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredTransactions.map((transaction, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border/40">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{transaction.organizerName}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{transaction.type}</span>
                      <span>•</span>
                      <span>{transaction.date}</span>
                      <span>•</span>
                      <span>{transaction.method}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{currency(transaction.amount)}</div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusBadge(transaction.status)}>
                      {transaction.status}
                    </Badge>
                    {transaction.referenceId && (
                      <span className="text-xs text-muted-foreground">
                        Ref: {transaction.referenceId}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PromoterBilling;
