import React, { useState } from "react";
import { ArrowLeft, Download, Search, Filter, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
    const baseClass = "px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1";
    switch (status) {
      case "confirmed":
        return (
          <span className={`${baseClass} bg-green-100 text-green-800`}>
            <CheckCircle className="w-3 h-3" />
            Confirmed
          </span>
        );
      case "pending":
        return (
          <span className={`${baseClass} bg-yellow-100 text-yellow-800`}>
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case "cancelled":
        return (
          <span className={`${baseClass} bg-red-100 text-red-800`}>
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className={`${baseClass} bg-gray-100 text-gray-800`}>
            <AlertCircle className="w-3 h-3" />
            {status}
          </span>
        );
    }
  };

  // Get check-in status badge
  const getCheckInBadge = (status) => {
    const baseClass = "px-2 py-1 rounded text-xs font-medium inline-flex items-center gap-1";
    switch (status) {
      case "checked-in":
        return (
          <span className={`${baseClass} bg-blue-100 text-blue-800`}>
            <CheckCircle className="w-3 h-3" />
            Checked In
          </span>
        );
      case "pending":
        return (
          <span className={`${baseClass} bg-gray-100 text-gray-800`}>
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case "cancelled":
        return (
          <span className={`${baseClass} bg-red-100 text-red-800`}>
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
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
            <h1 className="text-2xl font-bold text-gray-900">Tickets & Reservations</h1>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            <Download className="w-4 h-4" />
            Export Data
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <p className="text-sm text-gray-500">Total Tickets</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{statistics.totalTickets}</p>
            <p className="text-sm text-gray-600 mt-2">{statistics.confirmedTickets} confirmed</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <p className="text-sm text-gray-500">Checked In</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{statistics.checkedIn}</p>
            <p className="text-sm text-gray-600 mt-2">
              {Math.round((statistics.checkedIn / statistics.totalTickets) * 100)}% check-in rate
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{statistics.pendingTickets}</p>
            <p className="text-sm text-gray-600 mt-2">Awaiting confirmation</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <p className="text-sm text-gray-500">Total Reservations</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{statistics.totalReservations}</p>
            <p className="text-sm text-gray-600 mt-2">{statistics.confirmedReservations} confirmed</p>
          </div>
        </div>

        {/* Tickets Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Tickets</h2>
          </div>

          {/* Search and Filter */}
          <div className="px-6 py-4 border-b border-gray-200 flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ticket ID, customer name, or event..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="flex gap-2">
              {["all", "confirmed", "pending", "cancelled"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                    selectedFilter === filter
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Tickets Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-in</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{ticket.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{ticket.eventName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>{ticket.customerName}</div>
                      <div className="text-xs text-gray-500">{ticket.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{ticket.ticketType}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{ticket.quantity}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{ticket.totalAmount}</td>
                    <td className="px-6 py-4 text-sm">{getStatusBadge(ticket.status)}</td>
                    <td className="px-6 py-4 text-sm">{getCheckInBadge(ticket.checkInStatus)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reservations Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Reservations</h2>
          </div>

          {/* Reservations Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reservation ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seats</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reservationsData.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{reservation.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{reservation.eventName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>{reservation.customerName}</div>
                      <div className="text-xs text-gray-500">{reservation.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{reservation.reservationType}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{reservation.seats}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{reservation.eventDate}</td>
                    <td className="px-6 py-4 text-sm">{getStatusBadge(reservation.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={reservation.notes}>
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
