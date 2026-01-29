import { useMemo } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  CalendarClock,
  Activity,
  Wallet2,
  Ticket,
  BarChart3,
  Building2,
  ShieldCheck,
  Sparkles,
  Bell,
  Search,
} from "lucide-react";

const navItems = [
  { label: "Overview", to: "/promoter/overview", icon: LayoutDashboard },
  { label: "Organizers", to: "/promoter/organizers", icon: Building2 },
  { label: "Events", to: "/promoter/events", icon: CalendarClock },
  { label: "Users", to: "/promoter/users", icon: Users },
  { label: "Bookings", to: "/promoter/bookings", icon: Ticket },
  { label: "Payouts", to: "/promoter/payouts", icon: Wallet2 },
  { label: "Live", to: "/promoter/live", icon: Activity },
  { label: "Analytics", to: "/promoter/analytics", icon: BarChart3 },
];

const PromoterDashboard = () => {
  // Dummy data inspired by schema entities (organizers, events, bookings, payouts, users)
  const data = useMemo(() => ({
    stats: [
      { title: "Total Events", value: 42, delta: "+9 this month", icon: CalendarClock },
      { title: "Total Organizers", value: 18, delta: "+3 onboarded", icon: Users },
      { title: "Gross Revenue", value: "₹12.4M", delta: "+18% MoM", icon: Wallet2 },
      { title: "Platform Earnings", value: "₹1.6M", delta: "13% of GMV", icon: BarChart3 },
      { title: "Live Events", value: 7, delta: "Running now", icon: Activity },
      { title: "Pending Payouts", value: "₹4.2L", delta: "Across 5 orgs", icon: ShieldCheck },
    ],
    organizers: [
      {
        name: "ABC Events",
        state: "MH",
        owner: { name: "Amit Kulkarni", email: "amit@abc.events", phone: "+91 98200 12345" },
        bank: { bankName: "ICICI Bank", accountNumber: "2021", ifsc: "ICIC0002021", status: "VERIFIED", gstNumber: "27ABCDE1234F1Z5" },
        events: [
          { title: "Summer Music Festival 2024", status: "LIVE", gross: 1250000, tickets: 4850 },
          { title: "Arena EDM Night", status: "DRAFT", gross: 360000, tickets: 1200 },
        ],
        bookings: 8450,
        gross: 3200000,
        platformFee: 265000,
        payoutDue: 82000,
        lastPayout: "Mar 2",
      },
      {
        name: "TechCorp",
        state: "KA",
        owner: { name: "Shreya Rao", email: "shreya@techcorp.in", phone: "+91 98450 11223" },
        bank: { bankName: "HDFC Bank", accountNumber: "9981", ifsc: "HDFC0009981", status: "PENDING", gstNumber: "29ABCDE9981F1Z6" },
        events: [
          { title: "Tech Innovation Summit", status: "UPCOMING", gross: 940000, tickets: 3120 },
        ],
        bookings: 4120,
        gross: 2140000,
        platformFee: 174000,
        payoutDue: 45000,
        lastPayout: "Mar 1",
      },
      {
        name: "Culinary Dreams",
        state: "DL",
        owner: { name: "Ritika Sharma", email: "ritika@culinarydreams.in", phone: "+91 98111 44220" },
        bank: { bankName: "SBI", accountNumber: "4410", ifsc: "SBIN0004410", status: "ON-HOLD", gstNumber: "07ABCDE4410F1Z7" },
        events: [
          { title: "Food & Wine Festival", status: "LIVE", gross: 820000, tickets: 2875 },
        ],
        bookings: 2890,
        gross: 1560000,
        platformFee: 126000,
        payoutDue: 38000,
        lastPayout: "Feb 27",
      },
      {
        name: "Elite Nights",
        state: "TG",
        owner: { name: "Karthik Reddy", email: "karthik@elitenights.com", phone: "+91 98850 99881" },
        bank: { bankName: "Kotak", accountNumber: "8331", ifsc: "KKBK0008331", status: "VERIFIED", gstNumber: "36ABCDE8331F1Z4" },
        events: [
          { title: "Arena EDM Night", status: "DRAFT", gross: 360000, tickets: 1200 },
        ],
        bookings: 2330,
        gross: 980000,
        platformFee: 82000,
        payoutDue: 21000,
        lastPayout: "Feb 25",
      },
    ],
    events: [
      { title: "Summer Music Festival 2024", organizer: "ABC Events", city: "Mumbai", status: "LIVE", ticketsSold: 4850, gross: 1250000, platformFee: 112500, payout: 320000, type: "EXCLUSIVE" },
      { title: "Tech Innovation Summit", organizer: "TechCorp", city: "Bengaluru", status: "UPCOMING", ticketsSold: 3120, gross: 940000, platformFee: 75200, payout: 180000, type: "CONFERENCE" },
      { title: "Food & Wine Festival", organizer: "Culinary Dreams", city: "Delhi", status: "LIVE", ticketsSold: 2875, gross: 820000, platformFee: 65600, payout: 150000, type: "EXPERIENCE" },
      { title: "Arena EDM Night", organizer: "Elite Nights", city: "Hyderabad", status: "DRAFT", ticketsSold: 1200, gross: 360000, platformFee: 28800, payout: 0, type: "EXCLUSIVE" },
    ],
    bookings: {
      today: { count: 182, value: 420000, platformFee: 33600 },
      week: { count: 1420, value: 3280000, platformFee: 262400 },
      refunds: { count: 18, value: 52000 },
      disputes: 2,
      recent: [
        { id: "BK-9821", event: "Summer Music Festival 2024", organizer: "ABC Events", amount: 12500, status: "PAID", createdAt: "10:22 AM" },
        { id: "BK-9820", event: "Tech Innovation Summit", organizer: "TechCorp", amount: 8200, status: "PAID", createdAt: "10:10 AM" },
        { id: "BK-9819", event: "Food & Wine Festival", organizer: "Culinary Dreams", amount: 5600, status: "REFUND_PENDING", createdAt: "9:55 AM" },
      ],
    },
    payouts: [
      { organizer: "ABC Events", amount: 82000, status: "PENDING", eta: "Mar 4", bank: "ICICI • 2021" },
      { organizer: "TechCorp", amount: 45000, status: "PROCESSING", eta: "Mar 2", bank: "HDFC • 9981" },
      { organizer: "Culinary Dreams", amount: 38000, status: "ON-HOLD", eta: "KYC", bank: "SBI • 4410" },
      { organizer: "Elite Nights", amount: 21000, status: "PENDING", eta: "Mar 6", bank: "Kotak • 8331" },
    ],
    liveEvents: [
      { title: "Summer Music Festival 2024", checkIns: 3120, capacity: 5200, city: "Mumbai", status: "LIVE" },
      { title: "Food & Wine Festival", checkIns: 1450, capacity: 3400, city: "Delhi", status: "LIVE" },
      { title: "Tech Innovation Summit", checkIns: 0, capacity: 4800, city: "Bengaluru", status: "UPCOMING" },
    ],
    users: [
      { name: "Arjun Mehta", email: "arjun@gmail.com", role: "ATTENDEE", state: "MH", bookings: 24, lastActive: "Today" },
      { name: "Sara Khan", email: "sara.khan@gmail.com", role: "ORGANIZER_MANAGER", state: "KA", bookings: 8, lastActive: "Yesterday" },
      { name: "Rohit Patil", email: "rohit@abc.events", role: "ORGANIZER_OWNER", state: "MH", bookings: 42, lastActive: "2 days ago" },
      { name: "Ananya Rao", email: "ananya@techcorp.in", role: "ORGANIZER_OWNER", state: "KA", bookings: 15, lastActive: "3 days ago" },
    ],
    analytics: {
      categoryMix: { music: 35, conference: 28, food: 20, arts: 12, sports: 5 },
      risk: { refundRatio: 1.4, chargebacks: 0.08, kycPending: 1 },
    },
  }), []);

  const statusBadge = (status) => {
    const map = {
      Live: "success",
      LIVE: "success",
      Upcoming: "default",
      UPCOMING: "default",
      Draft: "secondary",
      DRAFT: "secondary",
      PENDING: "default",
      PROCESSING: "success",
      "ON-HOLD": "destructive",
      PAID: "success",
      REFUND_PENDING: "destructive",
      VERIFIED: "success",
    };
    return map[status] || "outline";
  };

  const currency = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

  return (
    <div className="min-h-screen bg-[#060810] text-white flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col gap-4 bg-black/40 border-r border-white/5 px-4 py-6 sticky top-0 h-screen">
        <div className="rounded-2xl border border-white/5 bg-gradient-to-b from-white/5 to-white/0 p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-400 flex items-center justify-center font-black text-lg">
              M
            </div>
            <div>
              <p className="text-sm text-white/60">MapMyParty</p>
              <p className="font-semibold">Promoter HQ</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="mt-4 w-full border-white/10">
            <Sparkles className="w-4 h-4 mr-2" /> Command Center
          </Button>
        </div>

        <nav className="rounded-2xl border border-white/5 bg-white/5 p-3 space-y-1 shadow-lg">
          {navItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl transition ${
                  isActive ? "bg-white/15 text-white" : "hover:bg-white/10 text-white/80"
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>

       
      </aside>

      {/* Main content */}
      <div className="flex-1 min-h-screen">
        <div className="border-b border-white/5 bg-black/40 backdrop-blur sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">Promoter Super Admin</p>
              <h1 className="text-2xl font-bold">Control Center</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="border-white/10">
                <Search className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="border-white/10 relative">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-500" />
              </Button>
              <Button className="bg-gradient-to-r from-rose-500 to-orange-400 border-none shadow-lg">
                New Broadcast
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <Outlet context={{ data, currency, statusBadge }} />
        </div>
      </div>
    </div>
  );
};

export default PromoterDashboard;
