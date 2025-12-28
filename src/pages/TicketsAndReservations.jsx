import React, { useState } from "react";
import { ArrowLeft, Download, Search, Filter, CheckCircle, Clock, XCircle, AlertCircle, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const badgeTones = {
  confirmed: "from-emerald-400 to-emerald-500 text-emerald-50 border-emerald-400/30",
  pending: "from-amber-300 to-amber-500 text-amber-900 border-amber-400/50",
  cancelled: "from-red-400 to-red-500 text-red-50 border-red-400/30",
  default: "from-slate-600 to-slate-700 text-slate-50 border-slate-500/40",
};

const TicketsAndReservations = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Sample Tickets Data
  const ticketsData = [
    {
      id: "TKT001",
      eventName: "Summer Music Festival 2024",
      ticketType: "VIP Pass",
      quantity: 2,
      price: "₹5,000",
      totalAmount: "₹10,000",
      customerName: "John Smith",
      email: "john@example.com",
      phone: "+91 9876543210",
      purchaseDate: "28 Nov 2024",
      status: "confirmed",
      checkInStatus: "checked-in",
    },
    {
      id: "TKT002",
      eventName: "Tech Conference 2024",
      ticketType: "Standard Pass",
      quantity: 1,
      price: "₹2,500",
      totalAmount: "₹2,500",
      customerName: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "+91 9876543211",
      purchaseDate: "27 Nov 2024",
      status: "confirmed",
      checkInStatus: "pending",
    },
    {
      id: "TKT003",
      eventName: "Food & Wine Tasting",
      ticketType: "Premium Ticket",
      quantity: 4,
      price: "₹3,000",
      totalAmount: "₹12,000",
      customerName: "Mike Brown",
      email: "mike@example.com",
      phone: "+91 9876543212",
      purchaseDate: "26 Nov 2024",
      status: "confirmed",
      checkInStatus: "checked-in",
    },
    {
      id: "TKT004",
      eventName: "Yoga Retreat Weekend",
      ticketType: "Early Bird",
      quantity: 1,
      price: "₹1,500",
      totalAmount: "₹1,500",
      customerName: "Emily Chen",
      email: "emily@example.com",
      phone: "+91 9876543213",
      purchaseDate: "25 Nov 2024",
      status: "pending",
      checkInStatus: "pending",
    },
    {
      id: "TKT005",
      eventName: "Summer Music Festival 2024",
      ticketType: "General Admission",
      quantity: 3,
      price: "₹2,000",
      totalAmount: "₹6,000",
      customerName: "David Wilson",
      email: "david@example.com",
      phone: "+91 9876543214",
      purchaseDate: "24 Nov 2024",
      status: "cancelled",
      checkInStatus: "cancelled",
    },
    {
      id: "TKT006",
      eventName: "Corporate Gala Dinner",
      ticketType: "VIP Table",
      quantity: 8,
      price: "₹8,000",
      totalAmount: "₹64,000",
      customerName: "Lisa Anderson",
      email: "lisa@example.com",
      phone: "+91 9876543215",
      purchaseDate: "23 Nov 2024",
      status: "confirmed",
      checkInStatus: "checked-in",
    },
  ];

  // Sample Reservations Data
  const reservationsData = [
    {
      id: "RES001",
      eventName: "Summer Music Festival 2024",
      reservationType: "VIP Seating",
      seats: "A1, A2, A3",
      customerName: "Robert Taylor",
      email: "robert@example.com",
      phone: "+91 9876543216",
      reservationDate: "28 Nov 2024",
      eventDate: "15 Dec 2024",
      status: "confirmed",
      notes: "Window seating preferred",
    },
    {
      id: "RES002",
      eventName: "Tech Conference 2024",
      reservationType: "Front Row",
      seats: "B5, B6",
      customerName: "Jennifer Lee",
      email: "jennifer@example.com",
      phone: "+91 9876543217",
      reservationDate: "27 Nov 2024",
      eventDate: "10 Dec 2024",
      status: "confirmed",
      notes: "Wheelchair accessible seat",
    },
    {
      id: "RES003",
      eventName: "Food & Wine Tasting",
      reservationType: "Table for 4",
      seats: "Table 12",
      customerName: "James Martinez",
      email: "james@example.com",
      phone: "+91 9876543218",
      reservationDate: "26 Nov 2024",
      eventDate: "08 Dec 2024",
      status: "pending",
      notes: "Vegetarian menu requested",
    },
    {
      id: "RES004",
      eventName: "Yoga Retreat Weekend",
      reservationType: "Premium Mat",
      seats: "P1",
      customerName: "Amanda White",
      email: "amanda@example.com",
      phone: "+91 9876543219",
      reservationDate: "25 Nov 2024",
      eventDate: "05 Dec 2024",
      status: "confirmed",
      notes: "Beginner level preferred",
    },
    {
      id: "RES005",
      eventName: "Corporate Gala Dinner",
      reservationType: "Table for 10",
      seats: "Table 5",
      customerName: "Christopher Davis",
      email: "chris@example.com",
      phone: "+91 9876543220",
      reservationDate: "24 Nov 2024",
      eventDate: "20 Dec 2024",
      status: "cancelled",
      notes: "Cancelled due to scheduling conflict",
    },
  ];

  // Statistics
  const statistics = {
    totalTickets: ticketsData.length,
    confirmedTickets: ticketsData.filter((t) => t.status === "confirmed").length,
    pendingTickets: ticketsData.filter((t) => t.status === "pending").length,
    cancelledTickets: ticketsData.filter((t) => t.status === "cancelled").length,
    checkedIn: ticketsData.filter((t) => t.checkInStatus === "checked-in").length,
    totalReservations: reservationsData.length,
    confirmedReservations: reservationsData.filter((r) => r.status === "confirmed").length,
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const baseClass = "px-3 py-1 rounded-full text-[11px] font-semibold inline-flex items-center gap-1 border bg-gradient-to-r";
    const tone = badgeTones[status] || badgeTones.default;
    const Icon = status === "confirmed" ? CheckCircle : status === "pending" ? Clock : status === "cancelled" ? XCircle : AlertCircle;
    const label = status === "confirmed" ? "Confirmed" : status === "pending" ? "Pending" : status === "cancelled" ? "Cancelled" : status;
    return (
      <span className={`${baseClass} ${tone}`}>
        <Icon className="w-3 h-3" />
        {label}
      </span>
    );
  };

  // Get check-in status badge
  const getCheckInBadge = (status) => {
    const baseClass = "px-2 py-1 rounded text-[11px] font-semibold inline-flex items-center gap-1 border bg-gradient-to-r";
    if (status === "checked-in")
      return (
        <span className={`${baseClass} from-cyan-400 to-blue-500 text-white border-blue-400/30`}>
          <CheckCircle className="w-3 h-3" />
          Checked In
        </span>
      );
    if (status === "pending")
      return (
        <span className={`${baseClass} from-slate-500 to-slate-600 text-white border-slate-400/40`}>
          <Clock className="w-3 h-3" />
          Pending
        </span>
      );
    if (status === "cancelled")
      return (
        <span className={`${baseClass} from-red-500 to-rose-500 text-white border-red-400/40`}>
          <XCircle className="w-3 h-3" />
          Cancelled
        </span>
      );
    return null;
  };

  // Filter tickets
  const filteredTickets = ticketsData.filter((ticket) => {
    const matchesFilter = selectedFilter === "all" || ticket.status === selectedFilter;
    const matchesSearch =
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.eventName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#05060c] via-[#090f1c] to-[#05060c] text-white">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/10 bg-white/5 backdrop-blur">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
            >
              <ArrowLeft className="w-5 h-5 text-white/80" />
            </button>
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-white/50 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-red-400" /> Operations
              </p>
              <h1 className="text-2xl font-extrabold">Tickets & Reservations</h1>
              <p className="text-sm text-white/60">Keep a pulse on ticket flow and reservation health.</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-blue-500 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition">
            <Download className="w-4 h-4" />
            Export Data
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur shadow-lg shadow-black/30">
            <p className="text-xs uppercase tracking-wide text-white/60">Total Tickets</p>
            <p className="text-3xl font-bold mt-2">{statistics.totalTickets}</p>
            <p className="text-sm text-white/60 mt-1">{statistics.confirmedTickets} confirmed</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur shadow-lg shadow-black/30">
            <p className="text-xs uppercase tracking-wide text-white/60">Checked In</p>
            <p className="text-3xl font-bold mt-2 text-cyan-200">{statistics.checkedIn}</p>
            <p className="text-sm text-white/60 mt-1">
              {Math.round((statistics.checkedIn / statistics.totalTickets) * 100)}% check-in rate
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur shadow-lg shadow-black/30">
            <p className="text-xs uppercase tracking-wide text-white/60">Pending</p>
            <p className="text-3xl font-bold mt-2 text-amber-200">{statistics.pendingTickets}</p>
            <p className="text-sm text-white/60 mt-1">Awaiting confirmation</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur shadow-lg shadow-black/30">
            <p className="text-xs uppercase tracking-wide text-white/60">Total Reservations</p>
            <p className="text-3xl font-bold mt-2 text-emerald-200">{statistics.totalReservations}</p>
            <p className="text-sm text-white/60 mt-1">{statistics.confirmedReservations} confirmed</p>
          </div>
        </div>

        {/* Tickets Section */}
        <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur shadow-lg shadow-black/30 mb-4">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-xl font-semibold">Tickets</h2>
            <div className="flex gap-2 items-center">
              <span className="text-xs text-white/50 flex items-center gap-1">
                <Filter className="w-4 h-4" /> Filter by status
              </span>
              <div className="flex gap-2">
                {["all", "confirmed", "pending", "cancelled"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold capitalize transition ${
                      selectedFilter === filter
                        ? "bg-gradient-to-r from-red-500 to-blue-500 text-white shadow-md shadow-red-500/20"
                        : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="px-5 py-4 border-b border-white/10 flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-white/50" />
              <input
                type="text"
                placeholder="Search by ticket ID, customer name, or event..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-red-500/60"
              />
            </div>
          </div>

          {/* Tickets Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-white/5 border-b border-white/10 text-white/60 uppercase text-[11px]">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">Ticket ID</th>
                  <th className="px-5 py-3 text-left font-semibold">Event</th>
                  <th className="px-5 py-3 text-left font-semibold">Customer</th>
                  <th className="px-5 py-3 text-left font-semibold">Type</th>
                  <th className="px-5 py-3 text-left font-semibold">Qty</th>
                  <th className="px-5 py-3 text-left font-semibold">Amount</th>
                  <th className="px-5 py-3 text-left font-semibold">Status</th>
                  <th className="px-5 py-3 text-left font-semibold">Check-in</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-white/5 transition">
                    <td className="px-5 py-4 font-semibold text-white">{ticket.id}</td>
                    <td className="px-5 py-4 text-white/80">{ticket.eventName}</td>
                    <td className="px-5 py-4 text-white/80">
                      <div>{ticket.customerName}</div>
                      <div className="text-xs text-white/50">{ticket.email}</div>
                    </td>
                    <td className="px-5 py-4 text-white/80">{ticket.ticketType}</td>
                    <td className="px-5 py-4 text-white/80">{ticket.quantity}</td>
                    <td className="px-5 py-4 font-semibold text-white">{ticket.totalAmount}</td>
                    <td className="px-5 py-4">{getStatusBadge(ticket.status)}</td>
                    <td className="px-5 py-4">{getCheckInBadge(ticket.checkInStatus)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reservations Section */}
        <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur shadow-lg shadow-black/30">
          <div className="px-5 py-4 border-b border-white/10">
            <h2 className="text-xl font-semibold">Reservations</h2>
          </div>

          {/* Reservations Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-white/5 border-b border-white/10 text-white/60 uppercase text-[11px]">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">Reservation ID</th>
                  <th className="px-5 py-3 text-left font-semibold">Event</th>
                  <th className="px-5 py-3 text-left font-semibold">Customer</th>
                  <th className="px-5 py-3 text-left font-semibold">Type</th>
                  <th className="px-5 py-3 text-left font-semibold">Seats</th>
                  <th className="px-5 py-3 text-left font-semibold">Event Date</th>
                  <th className="px-5 py-3 text-left font-semibold">Status</th>
                  <th className="px-5 py-3 text-left font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {reservationsData.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-white/5 transition">
                    <td className="px-5 py-4 font-semibold text-white">{reservation.id}</td>
                    <td className="px-5 py-4 text-white/80">{reservation.eventName}</td>
                    <td className="px-5 py-4 text-white/80">
                      <div>{reservation.customerName}</div>
                      <div className="text-xs text-white/50">{reservation.email}</div>
                    </td>
                    <td className="px-5 py-4 text-white/80">{reservation.reservationType}</td>
                    <td className="px-5 py-4 text-white/80">{reservation.seats}</td>
                    <td className="px-5 py-4 text-white/80">{reservation.eventDate}</td>
                    <td className="px-5 py-4">{getStatusBadge(reservation.status)}</td>
                    <td className="px-5 py-4 text-white/80 max-w-xs truncate" title={reservation.notes}>
                      {reservation.notes}
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

export default TicketsAndReservations;
